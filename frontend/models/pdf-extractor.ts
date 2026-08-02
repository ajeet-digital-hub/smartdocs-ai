import { BackblazeProvider } from "@/lib/storage/backblaze-provider";
import pdf from "pdf-parse";

export interface ExtractedPage {
  pageNumber: number;
  text: string;
}

export class PdfExtractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PdfExtractionError";
  }
}

export class PdfExtractor {
  private backblazeProvider: BackblazeProvider;

  constructor() {
    this.backblazeProvider = new BackblazeProvider();
  }

  /**
   * Retrieves a PDF from B2 and extracts its text content page by page.
   * @param storageKey The storage key of the PDF in Backblaze B2.
   * @returns An array of ExtractedPage objects.
   * @throws PdfExtractionError if the PDF cannot be parsed or retrieved.
   */
  async extractTextFromPdf(storageKey: string): Promise<ExtractedPage[]> {
    try {
      // Retrieve the PDF object from B2
      const response = await this.backblazeProvider.download(storageKey);
      if (!response.ok) {
        throw new PdfExtractionError(`Failed to retrieve PDF from B2: ${response.statusText}`);
      }

      const buffer = await response.arrayBuffer();
      const data = await pdf(Buffer.from(buffer));

      return data.text.split("\n\n").reduce((acc: ExtractedPage[], paragraph: string, index: number) => {
        // Simple heuristic to split by page. pdf-parse often concatenates pages.
        // A more robust solution might involve parsing data.pages directly if available or using a more advanced PDF library.
        acc.push({ pageNumber: index + 1, text: paragraph.trim() });
        return acc;
      }, []);
    } catch (error: any) {
      console.error(`Error extracting text from PDF (storageKey: ${storageKey}):`, error);
      throw new PdfExtractionError(`Failed to extract text from PDF: ${error.message || "Unknown error"}`);
    }
  }
}