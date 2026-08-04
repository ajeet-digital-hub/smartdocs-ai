/**
 * Interface for an embedding provider.
 * This abstraction allows swapping out different embedding models/services.
 */
export interface EmbeddingProvider {
  /**
   * Generates embeddings for a given array of text inputs.
   * @param texts An array of strings to embed.
   * @returns A Promise that resolves to an array of embedding vectors.
   */
  getEmbeddings(texts: string[]): Promise<number[][]>;
}