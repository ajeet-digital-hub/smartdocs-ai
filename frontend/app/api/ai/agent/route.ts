import { NextRequest, NextResponse } from "next/server";
import { AIProviderConfigurationError, AIProviderResponse } from "@/lib/ai-provider";
import { runOrchestrator } from "@/app/api/ai/chat/orchestrator";
import { getFamilyGuardianSession } from "@/lib/family-guardian-auth";
import dbConnect from "@/lib/dbConnect";
import Subscription from "@/models/Subscription";
import { PlanId } from "@/lib/plan-config";
import { deductCredits, InsufficientCreditsError } from "@/lib/credit-service";

/**
 * POST /api/ai/actions/execute
 *
 * Securely executes a confirmed action from the SmartDocs Assistant UI. 
 * This endpoint is session-authenticated and re-validates all inputs.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getFamilyGuardianSession();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

// 2. Safely parse request body
    const body = await req.json();
    const { message, requestId } = body; // Expect a requestId from the client

    if (!message || typeof message !== "string" || message.trim().length === 0 || !requestId) {
      return NextResponse.json(
        { success: false, error: "Request body must contain a non-empty 'message' and a 'requestId'.", code: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    await dbConnect();
    let planId: PlanId = "free";
    if (session?.user?.id) {
      const subscription = await Subscription.findOne({ userId: session.user.id, status: "ACTIVE" }).sort({ updatedAt: -1 });
      if (subscription) {
        planId = subscription.planId;
      }
    }

    // Idempotency Check: In a real implementation, you would check if `requestId` has been processed.
    // const existingRequest = await IdempotencyRequest.findById(requestId);
    // if (existingRequest) {
    //   return NextResponse.json(existingRequest.response);
    // }

    // 3. Run the full orchestration pipeline
    const result = await runOrchestrator({
      message,
      documentId: body?.documentId,
      userId: session?.user?.id || "anonymous",
      planId: planId,
      chatSession: { messages: [], pendingPlan: null }, // Note: Chat history context is not fully implemented here yet
    });

    // 4. Deduct credits AFTER successful AI operation
    if (result.creditsToCharge > 0) {
      try {
        await deductCredits(session.user.id, result.creditsToCharge, result.usedTool ? "TOOL_USAGE" : "AI_CHAT");
      } catch (creditError) {
        if (creditError instanceof InsufficientCreditsError) {
          // If credit deduction fails, the user still gets the response this one time,
          // but we return a specific error code so the UI can prompt for recharge.
          return NextResponse.json({
            success: true, // The AI part succeeded
            message: result.finalResponse,
            route: result.route,
            code: "INSUFFICIENT_CREDITS_POST_ACTION",
            error: "Your response was generated, but you have insufficient credits for future requests."
          });
        }
        // For other deduction errors, log it but still return the response
        console.error("Credit deduction failed post-AI call:", creditError);
      }
    }

    return NextResponse.json({
      success: true,
      message: result.finalResponse,
      route: result.route,
      confirmation: result.confirmation,
      sources: result.citations.length > 0 ? result.citations : undefined,
    });
  } catch (error: unknown) {
    if (error instanceof AIProviderConfigurationError) {
      console.error(`[AI AGENT DEBUG] Caught AIProviderConfigurationError. Code: ${error.code}`);
      const status = error.code === "AI_RATE_LIMIT_EXCEEDED" ? 429 : 503;
      return NextResponse.json({ success: false, error: error.message, code: error.code }, { status });
    }
    if (error instanceof InsufficientCreditsError) {
      return NextResponse.json({
        ok: false,
        error: "INSUFFICIENT_CREDITS",
        message: error.message,
      }, { status: 402 }); // 402 Payment Required
    }

    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error("[/api/ai/agent] Error:", errorMessage);

    const status = errorMessage.includes("credit limit") ? 429 : 500;
    return NextResponse.json({ success: false, error: errorMessage, code: "AI_AGENT_ERROR" }, { status });
  }
}
