/**
 * DocumentConversionTool
 *
 * Converts stored PDF documents into TXT, DOCX, or XLSX formats.
 *
 * Flow:
 *   StoredDocument
 *     → verify authenticated user
 *     → verify document ownership
 *     → verify subscription feature (DOCUMENT_CONVERSION)
 *     → read source document from B2
 *     → convert
 *     → upload generated file to B2
 *     → create GeneratedDocument metadata (MongoDB)
 *     → return signed download URL
 *
 * Non-AI conversion operations (PDF→TXT, PDF→DOCX, PDF→XLSX) consume
 * 0 AI credits.  Only the AI provider calls (OCR, translation,
 * summarisation) go through the existing credit accounting.
 */

import { ITool } from "@/app/api/ai/chat/tool-registry";
import { SMARTDOCS_SERVICES } from "@/app/api/ai/chat/service-knowledge";
import { BackblazeProvider } from "@/lib/storage/backblaze-provider";
import { PdfExtractor } from "@/models/pdf-extractor";
import StoredDocument from "@/models/Document";
import GeneratedDocument from "@/models/GeneratedDocument";
import crypto from "crypto";

export interface IDocumentConversionToolParams {
  documentId: string;
  userId: string;
  /** One of "txt", "docx", "xlsx" */
  targetFormat: "txt" | "docx" | "xlsx";
}

export interface IDocumentConversionToolResult {
  convertedText: string;
  signedUrl: string;
  generatedDocumentId: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export class DocumentConversionTool implements ITool {
  public readonly id = "document_conversion";
  public readonly name = "Document Conversion";
  public readonly description =
    "Converts uploaded PDF documents into TXT, DOCX, or XLSX format. " +
    "Use this when the user asks to convert a document to another format " +
    '(e.g., "Convert this PDF to Word", "Convert to text", "Make an Excel file").';
  public readonly requiredFeatures = ["DOCUMENT_CONVERSION"];
  public readonly category = "Conversion";
  public readonly supportedFileTypes = ["PDF"];
  public readonly supportedLanguages =
    SMARTDOCS_SERVICES.find((s) => s.name === "Document Conversion")?.supportedLanguages || [];
  public readonly requiredPlan =
    SMARTDOCS_SERVICES.find((s) => s.name === "Document Conversion")?.requiredPlan;
  public readonly creditCost = "0 credits (non-AI operation)";

  async execute(params: IDocumentConversionToolParams): Promise<IDocumentConversionToolResult> {
    const { documentId, userId, targetFormat } = params;

    // ---- Verify document ownership ----
    const document = await StoredDocument.findById(documentId).lean();
    if (!document || document.userId.toString() !== userId) {
      throw new Error("Document not found or you do not have permission to access it.");
    }
    if (document.mimeType !== "application/pdf") {
      throw new Error("Document conversion currently only supports PDF files.");
    }

    // ---- Extract text from PDF ----
    const pdfExtractor = new PdfExtractor();
    const extractedPages = await pdfExtractor.extractTextFromPdf(document.storageKey);
    if (extractedPages.length === 0) {
      throw new Error("No text could be extracted from the PDF. The document may be empty or image-based.");
    }

    const fullText = extractedPages.map((p) => p.text).join("\n\n");
    const backblazeProvider = new BackblazeProvider();

    let convertedContent: Buffer;
    let mimeType: string;
    let extension: string;

    switch (targetFormat) {
      case "txt": {
        // PDF → TXT – plain text output
        convertedContent = Buffer.from(fullText, "utf-8");
        mimeType = "text/plain";
        extension = "txt";
        break;
      }

      case "docx": {
        // PDF → DOCX – generate a real DOCX using the docx library
        mimeType =
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        extension = "docx";
        convertedContent = await this.generateDocx(extractedPages);
        break;
      }

      case "xlsx": {
        // PDF/Table → XLSX – only attempt if table extraction is reliable
        // For now, we generate an XLSX with the extracted text in cells.
        // True table extraction would require a separate table-extraction
        // pipeline.  We document this limitation.
        mimeType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        extension = "xlsx";
        convertedContent = await this.generateXlsx(extractedPages);
        break;
      }

      default: {
        throw new Error(`Unsupported target format: ${targetFormat}`);
      }
    }

    // ---- Upload generated file to B2 ----
    const storageKey = `converted/${userId}/${crypto.randomUUID()}.${extension}`;
    await backblazeProvider.upload(storageKey, new Uint8Array(convertedContent), mimeType);

    // ---- Create GeneratedDocument metadata ----
    const generatedDoc = await GeneratedDocument.create({
      userId: document.userId,
      originalDocumentId: document._id,
      conversionType: `pdf_to_${targetFormat}` as
        | "pdf_to_txt"
        | "pdf_to_docx"
        | "pdf_to_xlsx",
      storageKey,
      originalName: document.originalName.replace(/\.pdf$/i, "") + "." + extension,
      mimeType,
      size: convertedContent.length,
    });

    // ---- Generate signed download URL ----
    const signedUrl = await backblazeProvider.getSignedDownloadUrl(storageKey, 900);

    return {
      convertedText: fullText,
      signedUrl,
      generatedDocumentId: generatedDoc._id.toString(),
      originalName: generatedDoc.originalName,
      mimeType,
      size: convertedContent.length,
    };
  }

  /**
   * Generates a .docx buffer from extracted pages.
   * Uses the `docx` library to create a real Word document with page breaks.
   */
  private async generateDocx(pages: { pageNumber: number; text: string }[]): Promise<Buffer> {
    const docx = await import("docx");
    const { Document, Paragraph, TextRun, PageBreak, HeadingLevel } = docx;

const children: any[] = [];

    for (const page of pages) {
      if (children.length > 0) {
        children.push(new Paragraph({ children: [new PageBreak()] }));
      }
      children.push(
        new Paragraph({
          text: `Page ${page.pageNumber}`,
          heading: HeadingLevel.HEADING_2,
        })
      );
      // Split page text into paragraphs
      const paragraphs = page.text.split(/\n\n+/);
      for (const para of paragraphs) {
        const trimmed = para.trim();
        if (trimmed.length > 0) {
          children.push(
            new Paragraph({
              children: [new TextRun(trimmed)],
              spacing: { after: 200 },
            })
          );
        }
      }
    }

    const doc = new Document({ sections: [{ children }] });
    return Buffer.from(await docx.Packer.toBuffer(doc));
  }

  /**
   * Generates an .xlsx buffer from extracted pages.
   * Uses the `xlsx` library to create a workbook with one sheet per page.
   *
   * NOTE: This is **text extraction to spreadsheet cells**, not true
   * table extraction.  Each page's text is placed in column A, one
   * paragraph per row.  Reliable table extraction would require a
   * dedicated table-detection pipeline (e.g., Camelot, Tabula, or
   * an AI-based approach).
   */
  private async generateXlsx(pages: { pageNumber: number; text: string }[]): Promise<Buffer> {
    const XLSX = await import("xlsx");

    const workbook = XLSX.utils.book_new();

    for (const page of pages) {
      const rows = page.text
        .split(/\n\n+/)
        .filter((p) => p.trim().length > 0)
        .map((p) => [p.trim()]);

      // Prepend a header row
      const sheetData = [[`Page ${page.pageNumber}`], ...rows];
      const sheet = XLSX.utils.aoa_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(workbook, sheet, `Page ${page.pageNumber}`);
    }

    return Buffer.from(XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }));
  }
}
