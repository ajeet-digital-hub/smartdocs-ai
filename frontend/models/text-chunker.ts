import { ExtractedPage } from "./pdf-extractor";

export interface DocumentChunkData {
  pageNumber: number;
  chunkIndex: number;
  text: string;
}

export class TextChunker {
  private readonly MAX_CHUNK_SIZE = 500; // Max characters per chunk
  private readonly OVERLAP_SIZE = 50;    // Overlap characters between chunks

  /**
   * Chunks the extracted text from a PDF into smaller, overlapping segments.
   * @param pages An array of ExtractedPage objects.
   * @returns An array of DocumentChunkData.
   */
  chunkPages(pages: ExtractedPage[]): DocumentChunkData[] {
    const chunks: DocumentChunkData[] = [];
    pages.forEach((page) => {
      const words = page.text.split(/\s+/); // Split by whitespace
      let currentChunkText = "";
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if ((currentChunkText + " " + word).length > this.MAX_CHUNK_SIZE && currentChunkText.length > 0) {
          chunks.push({ pageNumber: page.pageNumber, chunkIndex: chunks.length, text: currentChunkText.trim() });
          currentChunkText = words.slice(Math.max(0, i - Math.floor(this.OVERLAP_SIZE / (word.length + 1)))).join(" "); // Start new chunk with overlap
        } else {
          currentChunkText += (currentChunkText.length > 0 ? " " : "") + word;
        }
      }
      if (currentChunkText.length > 0) {
        chunks.push({ pageNumber: page.pageNumber, chunkIndex: chunks.length, text: currentChunkText.trim() });
      }
    });
    return chunks;
  }
}