import { generateAIResponseWithSystem, generateAIResponseWithUsage, type AIProviderMessage } from "@/lib/ai-provider";
import { NOVA_SYSTEM_PROMPT } from "@/lib/nova-system-prompt";
import { toolRegistry } from "./tool-registry";
import { hasFeatureAccess } from "@/lib/feature-access";
import { PlanId, FeatureId } from "@/lib/plan-config";
import crypto from "crypto";
import ActionConfirmation from "@/components/ActionConfirmation";
import { detectLanguage } from "./language-detector";

// --- Type Definitions ---
interface OrchestratorParams {
  message: string;
  documentId?: string;
  userId: string;
  planId: PlanId;
  chatSession: any;
}

interface ExecutionStep {
  toolId: string;
  purpose: string;
  params?: Record<string, any>;
}

interface ExecutionPlan {
  intent: string;
  requiresDocument: boolean;
  tools: ExecutionStep[];
  outputLanguage: string;
  clarificationQuestion?: string;
  missingParameters?: string[];
}

interface OrchestrationResult {
  finalResponse: string;
  citations: any[];
  usedTool: boolean;
  confirmation?: {
    messageId: string;
  };
  creditsToCharge: number;
  pendingPlan?: ExecutionPlan;
}

/**
 * Nova's intent detection system.
 * Analyzes the user's message and determines:
 * 1. Is this general conversation, writing, coding, or explanation?
 * 2. Does it require a SmartDocs tool (document, file, image, family guardian)?
 *
 * Returns structured JSON with the intent classification and tool selection.
 */
async function detectIntent(
  message: string,
  documentId?: string,
  conversationHistory?: string
): Promise<ExecutionPlan> {
  const toolDescriptions = toolRegistry.getToolDescriptions();
  const detectedLanguage = detectLanguage(message);

  const intentDetectorPrompt = `
You are Nova's intent detection system. Analyze the user's message and determine the intent category.

The user's message: "${message}"
The user's language: "${detectedLanguage}"
${documentId ? `The user has a document with ID: "${documentId}"` : "The user has no document uploaded."}
${conversationHistory ? `Previous conversation context: "${conversationHistory}"` : ""}

Available SmartDocs tools:
${toolDescriptions.trim()}

Respond with ONLY a JSON object in this exact format. No extra text, no markdown:
{
  "intent": "conversation",
  "requiresDocument": false,
  "tools": [],
  "outputLanguage": "English",
  "clarificationQuestion": null
}

Intent categories:
- "conversation": General chat, greetings, small talk, opinions, advice
- "information": Questions about facts, concepts, definitions (e.g., "What is AI?", "Explain quantum computing")
- "writing": Creating content (email, letter, report, proposal, social post, story)
- "coding": Programming questions, code examples, debugging
- "explanation": Explaining concepts at various levels
- "document_task": Working with documents (summarize, analyze, Q&A, translate, convert)
- "image_task": Working with images (OCR, extract text, analyze)
- "presentation": Creating presentations/PPTs
- "family_guardian": App blocking, screen time, parental controls
- "automation": Multi-step workflows combining multiple tools

Rules:
- For conversation, information, writing, coding, explanation: set tools to empty array []
- For document_task: include appropriate tool IDs (document_qa, document_summarization, etc.)
- For image_task: include document_ocr if available
- For presentation: set tools to empty (presentation tool not yet available)
- For family_guardian: set tools to empty (routes to Family Guardian UI)
- For automation: include the sequence of tools needed
- If the user asks about a document (e.g., "summarize this PDF"): set requiresDocument=true
- If the user asks to create/write something (email, letter, code): set intent to "writing" or "coding"
- outputLanguage must be the detected language name
- Never fabricate tool IDs - only use tools from the Available list
- If the user's intent is unclear, default to "conversation" with empty tools
`;

  const { response: planJson } = await generateAIResponseWithUsage(intentDetectorPrompt);
  try {
    const cleanedJson = planJson.replace(/```json\n|```/g, "").trim();
    const plan: ExecutionPlan = JSON.parse(cleanedJson);

    // Validate that tools exist in our registry
    for (const step of plan.tools) {
      if (!toolRegistry.getTool(step.toolId)) {
        throw new Error(`Planner hallucinated unknown tool: ${step.toolId}`);
      }
    }
    return plan;
  } catch (e) {
    console.error("Failed to parse intent detection:", e);
    // Fallback: treat as general conversation
    return {
      intent: "conversation",
      requiresDocument: false,
      tools: [],
      outputLanguage: "English",
    };
  }
}

/**
 * Runs the full Nova orchestration pipeline.
 *
 * 1. Detect intent (general AI vs. tool task)
 * 2. For general AI: answer directly with Nova personality + conversation context
 * 3. For tool tasks: route through the tool registry
 * 4. Maintain conversation context across messages
 */
export async function runOrchestrator(
  params: OrchestratorParams
): Promise<OrchestrationResult> {
  const { message, documentId, userId, planId, chatSession } = params;
  let plan: ExecutionPlan;

  // Build conversation context from recent chat history (last 3 exchanges)
  const recentMessages = chatSession.messages?.slice(-6) || [];
  const conversationContext = recentMessages
    .map((m: any) => `${m.role === "user" ? "User" : "Nova"}: ${m.content}`)
    .join("\n");

  // --- Handle Pending Plan (previous clarification question) ---
  if (chatSession.pendingPlan && chatSession.pendingPlan.intent) {
    const pendingPlan = chatSession.pendingPlan as ExecutionPlan;
    const contextMessage = `Previous question: "${pendingPlan.clarificationQuestion}". User response: "${message}". Does this answer the question? If so, create a new plan for the original intent '${pendingPlan.intent}'. If not, treat as a new request.`;
    plan = await detectIntent(contextMessage, documentId, conversationContext);
  } else {
    plan = await detectIntent(message, documentId, conversationContext);
  }

  // --- Handle Clarification ---
  if (plan.clarificationQuestion) {
    return {
      finalResponse: plan.clarificationQuestion,
      citations: [],
      usedTool: false,
      creditsToCharge: 0,
      pendingPlan: plan,
    };
  }

  if (plan.requiresDocument && !documentId) {
    return {
      finalResponse:
        "I'd be happy to help with that! Could you please upload the document first? Once you share it, I'll process it right away.",
      citations: [],
      usedTool: false,
      creditsToCharge: 0,
    };
  }

  // --- General AI Tasks (conversation, writing, coding, explanation, info) ---
  if (plan.tools.length === 0) {
    // Build messages with Nova system prompt + conversation context
    const messages: AIProviderMessage[] = [
      { role: "system", content: NOVA_SYSTEM_PROMPT },
    ];

    // Add conversation context for continuity across turns
    if (conversationContext) {
      messages.push({
        role: "system",
        content: `Previous conversation context:\n${conversationContext}\n\nUse this context to understand references like "it", "this", "that". If the user says "make it professional", "it" refers to the last thing discussed.`,
      });
    }

    // Add document context if available
    if (documentId) {
      messages.push({
        role: "system",
        content:
          "The user has an uploaded document available. If they ask to analyze, summarize, translate, or work with it, indicate that you can process it. If they ask about the document type, explain what you can do with it.",
      });
    }

    messages.push({ role: "user", content: message });

    const { response, tokensUsed } = await generateAIResponseWithSystem(messages);
    const creditsToCharge = Math.max(1, Math.ceil(tokensUsed / 2000));
    return {
      finalResponse: response,
      citations: [],
      usedTool: false,
      creditsToCharge,
    };
  }

  // --- Tool Execution ---
  let lastStepResult: any = { query: message, documentId, userId };
  let citations: any[] = [];

  for (let i = 0; i < plan.tools.length; i++) {
    const step = plan.tools[i];
    const tool = toolRegistry.getTool(step.toolId);

    if (!tool) {
      throw new Error(`The tool "${step.toolId}" is not available.`);
    }

    if (
      !tool.requiredFeatures.every((feature: string) =>
        hasFeatureAccess(planId, feature as FeatureId)
      )
    ) {
      throw new Error(
        `Your current plan does not support the "${tool.name}" feature.`
      );
    }

    const toolParams = {
      ...lastStepResult,
      textToSummarize: lastStepResult.context || lastStepResult.summary || message,
      outputLanguage: plan.outputLanguage,
      userPlanId: planId,
      query: message,
    };

    lastStepResult = await tool.execute(toolParams);

    if (lastStepResult.retrievedChunks) {
      citations = lastStepResult.retrievedChunks.map((c: any) => ({
        pageNumber: c.pageNumber,
        documentId: c.documentId,
        chunkId: c._id.toString(),
      }));
    }

    if (step.toolId === "service_discovery") {
      return {
        finalResponse: lastStepResult.response,
        citations: [],
        usedTool: true,
        creditsToCharge: 0,
      };
    }
  }

  // --- Handle Action Confirmation ---
  if (lastStepResult.requiresConfirmation) {
    // Create a single-use confirmation token in the database
    const confirmation = await ActionConfirmation.create({
      userId,
      action: lastStepResult.actionPayload.action,
      payload: lastStepResult.actionPayload.payload,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // Expires in 5 minutes
    });

    return {
      finalResponse: lastStepResult.confirmationPrompt,
      citations: [],
      usedTool: true,
      creditsToCharge: 0,
      confirmation: {
        messageId: confirmation._id.toString(),
      },
    };
  }

  // Format tool results into a natural Nova response
  let finalResponse = "I've processed your request. Here's what I found:";
  if (lastStepResult.extractedText) {
    finalResponse = `I've extracted the text from your document. Here's what I found:\n\n${lastStepResult.extractedText}`;
  } else if (lastStepResult.translatedPages && lastStepResult.translatedPages.length > 0) {
    finalResponse = lastStepResult.translatedPages
      .map((p: any) => `--- Page ${p.pageNumber} ---\n${p.text}`)
      .join("\n\n");
  } else if (lastStepResult.summary) {
    finalResponse = lastStepResult.summary;
  } else if (lastStepResult.context) {
    finalResponse = lastStepResult.context;
  }

  const creditsToCharge = lastStepResult.totalTokensUsed
    ? Math.max(1, Math.ceil(lastStepResult.totalTokensUsed / 2000))
    : 1;

  return {
    finalResponse,
    citations,
    usedTool: true,
    creditsToCharge,
    pendingPlan: undefined,
  };
}
