type OpenAIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type OpenAIResponse = {
  choices: { message: { content: string } }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type AIProviderErrorCode =
  | "AI_CONFIG_MISSING"   // OPENAI_API_KEY not set
  | "AI_CONFIG_INVALID"   // OPENAI_API_KEY rejected by provider (401/403)
  | "AI_CONFIG_NO_ACCESS" // key lacks access to the requested model
  | "AI_PROVIDER_TIMEOUT" // request exceeded AI_REQUEST_TIMEOUT_MS
  | "AI_PROVIDER_UNAVAILABLE" // provider 5xx / network failure
  | "AI_RATE_LIMIT_EXCEEDED"; // provider 429

export class AIProviderConfigurationError extends Error {
  code: AIProviderErrorCode;
  constructor(message: string, code: AIProviderErrorCode = "AI_CONFIG_MISSING") {
    super(message);
    this.name = "AIProviderConfigurationError";
    this.code = code;
  }
}

export interface AIProviderResponse {
  response: string;
  tokensUsed: number;
}

export interface AIProviderMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Generates an AI response using a system prompt and conversation history.
 * This is the primary function for Nova's intelligent conversations.
 *
 * @param messages - Array of messages forming the conversation history + system prompt
 * @returns The AI response and token usage
 */
export async function generateAIResponseWithSystem(messages: AIProviderMessage[]): Promise<AIProviderResponse> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new AIProviderConfigurationError("AI is not configured. Set OPENAI_API_KEY to enable SmartDocs AI.", "AI_CONFIG_MISSING");
  const openAIMessages: OpenAIMessage[] = messages.map(m => ({
    role: m.role,
    content: m.content,
  }));

  const baseUrl = (process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com").replace(/\/+$/, "");
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o";
  const timeoutMs = Number(process.env.AI_REQUEST_TIMEOUT_MS) || 60000;

  // OpenRouter recommends sending a referrer and title for identification.
  const isUsingOpenRouter = baseUrl.includes("openrouter.ai");
  const customHeaders: Record<string, string> = {};
  if (isUsingOpenRouter) {
    customHeaders["HTTP-Referer"] = process.env.NEXTAUTH_URL || "http://localhost:3000";
    customHeaders["X-Title"] = "SmartDocs AI";
  }

  // --- Start Definitive Runtime Diagnosis ---
  console.log("[AI DEBUG] AI Provider invoked.");
  console.log("[AI DEBUG] Using model:", model);
  console.log("[AI DEBUG] Using baseUrl:", baseUrl);
  console.log("[AI DEBUG] API key present:", !!apiKey);
  console.log("[AI DEBUG] API key length:", apiKey?.length ?? 0);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", ...customHeaders },
      body: JSON.stringify({
        model,
        messages: openAIMessages,
      }),
      signal: controller.signal,
    });
  } catch (error: unknown) {
    const aborted = error instanceof Error && error.name === "AbortError";
    if (aborted) {
      const err = new AIProviderConfigurationError(
        `AI provider request timed out after ${timeoutMs}ms. Please try again.`,
        "AI_PROVIDER_TIMEOUT"
      );
      throw err;
    }
    console.error("[AI Provider] Network error:", (error instanceof Error ? error.message : String(error)).substring(0, 200));
    const err = new AIProviderConfigurationError(
      "The AI provider could not be reached. Check your network connection.",
      "AI_PROVIDER_UNAVAILABLE"
    );
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  // --- Log AI Provider Response ---
  console.log("[AI DEBUG] AI Provider response status:", response.status);
  console.log("[AI DEBUG] AI Provider response statusText:", response.statusText);

  // Enhanced error diagnostics
  if (response.status === 401) {
    const err = new AIProviderConfigurationError(
      "AI provider authentication failed. The configured OPENAI_API_KEY is invalid. Check your API key.",
      "AI_CONFIG_INVALID"
    );
    throw err;
  }
  if (response.status === 403) {
    const err = new AIProviderConfigurationError(
      "AI provider rejected the request. The configured key does not have access to this model or region.",
      "AI_CONFIG_NO_ACCESS"
    );
    throw err;
  }
  if (response.status === 404) {
    const err = new AIProviderConfigurationError(
      `AI provider model "${model}" was not found. Check OPENAI_MODEL.`,
      "AI_CONFIG_NO_ACCESS"
    );
    throw err;
  }
  if (response.status === 429) {
    const err = new AIProviderConfigurationError(
      "AI provider rate limit exceeded. Please check your plan and billing details.",
      "AI_RATE_LIMIT_EXCEEDED"
    );
    throw err;
  }
  if (!response.ok) {
    const errorBody = await response.text().catch(() => "Unknown error");
    console.error("[AI DEBUG] AI Provider error response body:", errorBody.substring(0, 500));
    console.error(`[AI Provider] Status ${response.status}: ${errorBody.substring(0, 500)}`);
    throw new AIProviderConfigurationError(
      "The AI provider could not complete this request.",
      "AI_PROVIDER_UNAVAILABLE"
    );
  }

  const payload = (await response.json()) as OpenAIResponse;
  const content = payload.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) throw new Error("The AI provider returned no response.");

  return {
    response: content,
    tokensUsed: payload.usage?.total_tokens ?? Math.ceil(content.length / 4),
  };
}

/**
 * Generates an AI response with just a user message string.
 * Maintained for backward compatibility.
 */
export async function generateAIResponseWithUsage(message: string): Promise<AIProviderResponse> {
  return generateAIResponseWithSystem([{ role: "user", content: message }]);
}

/**
 * Generates an AI response without returning token usage.
 * @deprecated Use generateAIResponseWithUsage for better credit accounting.
 */
export async function generateAIResponse(message: string): Promise<string> {
  const { response } = await generateAIResponseWithUsage(message);
  return response;
}
