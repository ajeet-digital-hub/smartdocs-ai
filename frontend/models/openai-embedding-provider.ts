import { EmbeddingProvider } from "./embedding-provider";

export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly apiUrl: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || "";
    this.model = "text-embedding-ada-002"; // Default OpenAI embedding model
    this.apiUrl = "https://api.openai.com/v1/embeddings";

    if (!this.apiKey) {
      throw new Error("OPENAI_API_KEY is not configured for embedding provider.");
    }
  }

  async getEmbeddings(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) {
      return [];
    }

    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        input: texts,
        model: this.model,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to get embeddings from OpenAI: ${response.status} - ${errorData.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    return data.data.map((item: any) => item.embedding);
  }
}