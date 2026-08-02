import { generateAIResponseWithUsage } from "@/lib/ai-provider";
import { ITool } from "./tool-registry";
import { SMARTDOCS_SERVICES } from "./service-knowledge";
import { PdfExtractor, ExtractedPage, PdfExtractionError } from "@/models/pdf-extractor";
import StoredDocument from "@/models/Document";
import ExtractedText from "@/models/ExtractedText";
import mongoose from "mongoose";

export interface IDocumentTranslationToolParams {
  documentId: string;
  userId: string;
  outputLanguage: string;
}

export interface IDocumentTranslationToolResult {
  translatedPages: { pageNumber: number; text: string }[];
  totalTokensUsed: number;
  sourceLanguage?: string; // Future enhancement
}

export class DocumentTranslationTool implements ITool {
  public readonly id = "document_translation";
  public readonly name = "Document Translation";
  public readonly description = "Translates the entire text content of an uploaded document to a specified target language. Use this when the user asks to translate a document.";
  public readonly requiredFeatures = ["DOCUMENT_TRANSLATION"];
  public readonly category = "Translation";
  public readonly supportedFileTypes = ["PDF"];
  public readonly supportedLanguages = SMARTDOCS_SERVICES.find(s => s.name === "Document Translation")?.supportedLanguages || [];
  public readonly requiredPlan = SMARTDOCS_SERVICES.find(s => s.name === "Document Translation")?.requiredPlan;
  // Credit usage will be calculated per page/chunk by the orchestrator or a dedicated service
  public readonly creditCost = "Varies by document size and AI model tokens.";

  async execute(params: IDocumentTranslationToolParams): Promise<IDocumentTranslationToolResult> {
    const { documentId, userId, outputLanguage } = params;

    const document = await StoredDocument.findById(documentId).lean(); // Use lean for faster reads
    if (!document || document.userId.toString() !== userId) {
      throw new Error("Document not found or you do not have permission to access it.");
    }
    if (document.status !== "PROCESSED") {
      throw new Error("This document is still being processed. Please try again later.");
    }
    if (document.mimeType !== "application/pdf") {
      throw new Error("Document translation currently only supports PDF files.");
    }

    let extractedPages: ExtractedPage[] = [];

    // 1. Reuse already extracted text if available
    if (document.extractedTextAvailable && document.extractedTextId) {
      const storedExtractedText = await ExtractedText.findById(document.extractedTextId).lean();
      if (storedExtractedText) {
        extractedPages = storedExtractedText.pages.map(p => ({ pageNumber: p.pageNumber, text: p.text }));
      }
    }

    // 2. If not found in ExtractedText, extract from B2
    if (extractedPages.length === 0) {
      const pdfExtractor = new PdfExtractor();
      extractedPages = await pdfExtractor.extractTextFromPdf(document.storageKey);
      if (extractedPages.length === 0) {
        throw new PdfExtractionError("No text extracted from PDF. Cannot translate an empty document.");
      }
    }

    const translatedPages: { pageNumber: number; text: string }[] = [];

    // 3. Translate page by page
    let totalTokensUsed = 0;
    for (const page of extractedPages) {
      const prompt = `Translate the following text into ${outputLanguage}. Preserve the original formatting, line breaks, and structure as much as possible. Return only the translated text.\n\nTEXT (Page ${page.pageNumber}):\n${page.text}`;
      const { response, tokensUsed } = await generateAIResponseWithUsage(prompt);
      translatedPages.push({ pageNumber: page.pageNumber, text: response });
      totalTokensUsed += tokensUsed;
    }

    return { translatedPages, totalTokensUsed };
  }
}