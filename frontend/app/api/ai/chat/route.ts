import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { AIProviderConfigurationError, generateAIResponse } from "@/lib/ai-provider";
import dbConnect from "@/lib/dbConnect";
import { hasFeatureAccess } from "@/lib/feature-access";
import { getPlan, type PlanId } from "@/lib/plan-config";
import AICreditUsage from "@/models/AICreditUsage";
import AiChatSession from "@/models/AiChatSession";
import Subscription from "@/models/Subscription";
import mongoose from "mongoose";
import { runOrchestrator } from "@/app/api/ai/chat/orchestrator";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const conversationId = req.nextUrl.searchParams.get("conversationId");
  if (conversationId) {
    const conversation = await AiChatSession.findOne({ _id: conversationId, userId: session.user.id });
    if (!conversation) return NextResponse.json({ ok: false, error: "Conversation not found" }, { status: 404 });
    return NextResponse.json({ ok: true, conversation });
  }

  const conversations = await AiChatSession.find({ userId: session.user.id })
    .select("title createdAt updatedAt")
    .sort({ updatedAt: -1 });
  return NextResponse.json({ ok: true, conversations });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const body: unknown = await req.json();
  if (!isRenameRequest(body)) return NextResponse.json({ ok: false, error: "Conversation ID and title are required" }, { status: 400 });

  await dbConnect();
  const conversation = await AiChatSession.findOneAndUpdate(
    { _id: body.conversationId, userId: session.user.id },
    { title: body.title.trim() },
    { new: true }
  );
  if (!conversation) return NextResponse.json({ ok: false, error: "Conversation not found" }, { status: 404 });
  return NextResponse.json({ ok: true, conversation });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const conversationId = req.nextUrl.searchParams.get("conversationId");
  if (!conversationId) return NextResponse.json({ ok: false, error: "Conversation ID is required" }, { status: 400 });

  await dbConnect();
  const conversation = await AiChatSession.findOneAndDelete({ _id: conversationId, userId: session.user.id });
  if (!conversation) return NextResponse.json({ ok: false, error: "Conversation not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const body: { message: string; conversationId?: string; documentId?: string } = await req.json();
    if (!isChatRequest(body)) return NextResponse.json({ ok: false, error: "A valid message is required." }, { status: 400 });

    await dbConnect();
    const subscription = await Subscription.findOne({ userId: session.user.id, status: "ACTIVE" }).sort({ updatedAt: -1 });
    const planId = (subscription?.planId ?? "free") as PlanId;
const plan = getPlan(planId);
    if (!plan) return NextResponse.json({ ok: false, error: "Invalid subscription plan." }, { status: 400 });

    // This initial check is a fast path to reject requests without a DB transaction.
    // A second, transaction-protected check is performed below.
    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);
    const usage = await AICreditUsage.aggregate([{ $match: { userId: session.user.id, createdAt: { $gte: monthStart } } }, { $group: { _id: null, credits: { $sum: "$creditsUsed" } } }]);
    if (plan.limits.aiCreditsMonthly > 0 && (usage[0]?.credits ?? 0) >= plan.limits.aiCreditsMonthly) {
      return NextResponse.json({ ok: false, error: "You've reached your monthly AI credit limit.", upgradeUrl: "/pricing" }, { status: 429 });
    }

    const chatSession = body.conversationId
      ? await AiChatSession.findOne({ _id: body.conversationId, userId: session.user.id })
      : await AiChatSession.create({ userId: session.user.id, title: body.message.slice(0, 80), documentIds: body.documentId ? [body.documentId] : [], messages: [] });
    if (!chatSession) return NextResponse.json({ ok: false, error: "Conversation not found" }, { status: 404 });

    // Run the orchestrator to decide the plan and get the final prompt
    const { finalResponse, citations, usedTool, creditsToCharge, pendingPlan } = await runOrchestrator({
      message: body.message,
      documentId: body.documentId,
      userId: session.user.id,
      planId,
      chatSession,
    });

    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    try {
      // Concurrency-safe credit check inside the transaction
      const currentUsage = await AICreditUsage.aggregate([{ $match: { userId: session.user.id, createdAt: { $gte: monthStart } } }, { $group: { _id: null, credits: { $sum: "$creditsUsed" } } }], { session: dbSession });
      const usedCredits = currentUsage[0]?.credits ?? 0;

      if (plan.limits.aiCreditsMonthly > 0 && usedCredits + creditsToCharge > plan.limits.aiCreditsMonthly) {
        throw new Error("This action exceeds your remaining AI credit limit for the month.");
      }


      chatSession.messages.push({ role: "user", content: body.message, createdAt: new Date() });
      chatSession.messages.push({
        role: "assistant",
        content: finalResponse,
        citations: citations.map((c: any) => ({
          pageNumber: c.pageNumber,
          documentId: c.documentId,
          chunkId: c.chunkId || "",
          documentName: c.documentName || "Referenced Document",
        })),
        createdAt: new Date(),
      });

      // Update or clear the pending plan
      chatSession.pendingPlan = pendingPlan;

      await chatSession.save({ session: dbSession });

      // Determine feature for credit usage and record it
      const requiredFeature = usedTool ? "DOCUMENT_AI" : "AI_CHAT";
      if (creditsToCharge > 0) {
        await AICreditUsage.create([{ userId: session.user.id, feature: requiredFeature, creditsUsed: creditsToCharge }], { session: dbSession });
      }

      await dbSession.commitTransaction();

      return NextResponse.json({
        ok: true,
        response: finalResponse,
        conversationId: chatSession._id.toString(),
        sources: citations.map((c: any) => ({ pageNumber: c.pageNumber, documentId: c.documentId })),
      });
    } catch (error: unknown) {
      await dbSession.abortTransaction();
      if (error instanceof AIProviderConfigurationError) {
        return NextResponse.json({ ok: false, error: error.message, code: error.code || "AI_CONFIG_ERROR" }, { status: 503 });
      }
      console.error("AI chat error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      const status = errorMessage.includes("credit limit") ? 429 : 500;
      const upgradeUrl = status === 429 ? "/pricing" : undefined;
      return NextResponse.json({
        ok: false,
        error: errorMessage,
        upgradeUrl,
        code: "AI_CHAT_TRANSACTION_ERROR"
      }, { status });
    } finally {
      dbSession.endSession();
    }
  } catch (error: unknown) {
    if (error instanceof AIProviderConfigurationError) {
      return NextResponse.json({ ok: false, error: error.message, code: error.code || "AI_CONFIG_ERROR" }, { status: 503 });
    }
    console.error("AI chat error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    const status = errorMessage.includes("credit limit") ? 429 : 500;
    const upgradeUrl = status === 429 ? "/pricing" : undefined; 
    return NextResponse.json({
      ok: false,
      error: errorMessage,
      upgradeUrl,
      code: "AI_CHAT_ERROR"
    }, { status });
  }
}

function isChatRequest(body: unknown): body is { message: string; conversationId?: string; documentId?: string } {
  if (!body || typeof body !== "object") return false;
  const value = body as Record<string, unknown>;
  return typeof value.message === "string" && value.message.trim().length > 0 && (value.conversationId === undefined || typeof value.conversationId === "string");
}

function isRenameRequest(body: unknown): body is { conversationId: string; title: string } {
  if (!body || typeof body !== "object") return false;
  const value = body as Record<string, unknown>;
  return typeof value.conversationId === "string" && typeof value.title === "string" && value.title.trim().length > 0;
}
