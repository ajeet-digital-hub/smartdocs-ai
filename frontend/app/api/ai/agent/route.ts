import { NextRequest, NextResponse } from "next/server";
import { AIProviderConfigurationError } from "@/lib/ai-provider";
import { runOrchestrator } from "@/app/api/ai/chat/orchestrator";
import { getFamilyGuardianSession } from "@/lib/family-guardian-auth";
import dbConnect from "@/lib/dbConnect";
import Subscription from "@/models/Subscription";
import { PlanId } from "@/lib/plan-config";

/**
 * POST /api/ai/actions/execute
 *
 * Securely executes a confirmed action from the Nova UI.
 * This endpoint is session-authenticated and re-validates all inputs.
 */
export async function POST(req: NextRequest) {
  try {
    // 2. Safely parse request body
    const session = await getFamilyGuardianSession();
    const body = await req.json();
    const message = body?.message;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Request body must contain a non-empty 'message' string.", code: "INVALID_REQUEST" },
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

    // 3. Run the full orchestration pipeline
    const result = await runOrchestrator({
      message,
      documentId: body?.documentId,
      userId: session?.user?.id || "anonymous",
      planId: planId,
      chatSession: { messages: [], pendingPlan: null }, // Note: Chat history context is not fully implemented here yet
    });

    return NextResponse.json({
      success: true,
      message: result.finalResponse,
      confirmation: result.confirmation,
      sources: result.citations.length > 0 ? result.citations : undefined,
    });
  } catch (error: unknown) {
    if (error instanceof AIProviderConfigurationError) {
      console.error(`[AI AGENT DEBUG] Caught AIProviderConfigurationError. Code: ${error.code}`);
      console.error(`[AI AGENT DEBUG] Caught AIProviderConfigurationError. Code: ${error.code}`);
      return NextResponse.json({ success: false, error: error.message, code: error.code }, { status: 503 });
    }

    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error("[/api/ai/actions/execute] Error:", errorMessage);

    const status = errorMessage.includes("credit limit") ? 429 : 500;
    return NextResponse.json({ success: false, error: errorMessage, code: "AI_AGENT_ERROR" }, { status });
  }
}