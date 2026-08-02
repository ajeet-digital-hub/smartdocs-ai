/**
 * DocumentOCRTool
 *
 * Extracts text from images (PNG, JPG, JPEG, WEBP) and scanned PDFs using
 * the configured OCRProvider.
 *
 * This tool depends on the OCRProvider interface rather than directly on
 * Tesseract.  The runtime provider is determined by the deployment
 * environment (see lib/ocr).
 *
 * Multi-page scanned PDF page separation:
 *   This environment does NOT have a reliable PDF page rendering library
 *   (pdfjs-dist, etc.).  Therefore multi-page scanned PDFs are treated as
 *   a single page.  Page-level OCR is explicitly marked as unsupported.
 */

import { ITool } from "./tool-registry";
import { SMARTDOCS_SERVICES } from "./service-knowledge";
import { BackblazeProvider } from "@/lib/storage/backblaze-provider";
import StoredDocument from "@/models/Document";
import ExtractedText from "@/models/ExtractedText";
import DocumentChunk from "@/models/DocumentChunk";
import { TextChunker } from "@/models/text-chunker";
import { OpenAIEmbeddingProvider } from "@/models/openai-embedding-provider";
import { TesseractOCRProvider, TesseractNotAvailableError } from "@/lib/ocr/tesseract-ocr-provider";
import type { OCRProvider } from "@/lib/ocr/ocr-provider";

export interface IDocumentOCRToolParams {
  documentId: string;
  userId: string;
  outputLanguage?: string;
}

export interface IDocumentOCRToolResult {
  extractedText: string;
  totalTokensUsed: number;
  pageCount: number;
}

export class DocumentOCRTool implements ITool {
  public readonly id = "document_ocr";
  public readonly name = "Document OCR";
  public readonly description =
    "Extracts text from images (PNG, JPG, WEBP) and scanned PDFs. " +
    "Use this when the user asks to extract text from an image or scanned document. " +
    "Multi-page scanned PDF page-level OCR is NOT supported in this deployment.";
  public readonly requiredFeatures = ["OCR"];
  public readonly category = "OCR & Images";
  public readonly supportedFileTypes = ["PNG", "JPG", "JPEG", "WEBP", "PDF"];
  public readonly supportedLanguages =
    SMARTDOCS_SERVICES.find((s) => s.name === "Image OCR (Optical Character Recognition)")
      ?.supportedLanguages || [];
  public readonly requiredPlan =
    SMARTDOCS_SERVICES.find((s) => s.name === "Image OCR (Optical Character Recognition)")
      ?.requiredPlan;
  public readonly creditCost =
    "Varies by image/document size and text extracted.";

  private readonly ocrProvider: OCRProvider;

  constructor() {
    this.ocrProvider = new TesseractOCRProvider();
  }

  async execute(params: IDocumentOCRToolParams): Promise<IDocumentOCRToolResult> {
    const { documentId, userId, outputLanguage } = params;

    // ---- Verify document ownership ----
    const document = await StoredDocument.findById(documentId).lean();
    if (!document || document.userId.toString() !== userId) {
      throw new Error("Document not found or you do not have permission to access it.");
    }

    // Reuse previously extracted text if available
    if (document.status === "PROCESSED" && document.extractedTextAvailable && document.extractedTextId) {
      const storedExtractedText = await ExtractedText.findById(document.extractedTextId).lean();
      if (storedExtractedText) {
        const fullText = storedExtractedText.pages.map((p) => p.text).join("\n\n");
        const totalTokensUsed = Math.max(1, Math.ceil(fullText.length / 4));
        return {
          extractedText: fullText,
          totalTokensUsed,
          pageCount: storedExtractedText.pages.length,
        };
      }
    }

    // ---- Check OCR provider availability ----
    if (!this.ocrProvider.isAvailable) {
      throw new TesseractNotAvailableError();
    }

    // ---- Download from B2 ----
    const backblazeProvider = new BackblazeProvider();
    const response = await backblazeProvider.download(document.storageKey);
    if (!response.ok) {
      throw new Error(`Failed to download document from B2: ${response.statusText}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());

    // ---- Determine OCR language ----
    const language = outputLanguage
      ? this.mapLanguageToTesseract(outputLanguage)
      : "eng";

    // ---- Run OCR ----
    let result;
    if (document.mimeType.startsWith("image/")) {
      result = await this.ocrProvider.recognize(buffer, { language });
    } else if (document.mimeType === "application/pdf") {
      // Multi-page scanned PDF page separation is unsupported.
      // We treat the entire PDF as a single image-based page.
      result = await this.ocrProvider.recognize(buffer, { language });
    } else {
      throw new Error(`Unsupported file type for OCR: ${document.mimeType}`);
    }

    // ---- Store extracted text ----
    const extractedTextDoc = await ExtractedText.create({
      documentId: document._id,
      pages: result.pages,
    });

    // ---- Generate embeddings and chunks ----
    const textChunker = new TextChunker();
    const chunksData = textChunker.chunkPages(result.pages);
    const embeddingProvider = new OpenAIEmbeddingProvider();
    const textsToEmbed = chunksData.map((chunk) => chunk.text);
    const embeddings = await embeddingProvider.getEmbeddings(textsToEmbed);

    const documentChunks = chunksData.map((chunk, index) => ({
      documentId: document._id,
      pageNumber: chunk.pageNumber,
      chunkIndex: chunk.chunkIndex,
      text: chunk.text,
      embedding: embeddings[index],
    }));
    await DocumentChunk.insertMany(documentChunks);

    // ---- Update document status ----
    await StoredDocument.findByIdAndUpdate(document._id, {
      status: "PROCESSED",
      pageCount: result.pages.length,
      extractedTextAvailable: true,
      extractedTextId: extractedTextDoc._id,
      processedAt: new Date(),
    });

    const totalTokensUsed = Math.max(1, Math.ceil(result.text.length / 4));
    return {
      extractedText: result.text,
      totalTokensUsed,
      pageCount: result.pages.length,
    };
  }

  private mapLanguageToTesseract(lang: string): string {
    switch (lang.toLowerCase()) {
      case "english": return "eng";
      case "hindi": return "hin";
      case "spanish": return "spa";
      case "french": return "fra";
      case "german": return "deu";
      default: return "eng";
    }
  }
}
