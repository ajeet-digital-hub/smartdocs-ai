import { Retriever, RetrievedChunk } from "@/models/retriever";
import StoredDocument from "@/models/Document";
import mongoose from "mongoose";
import { ITool } from "./tool-registry";
import { SMARTDOCS_SERVICES } from "./service-knowledge";

export interface IDocumentQAToolParams {
  documentId: string;
  query: string;
  userId: string;
}

export interface IDocumentQAToolResult {
  context: string;
  retrievedChunks: RetrievedChunk[];
}

export class DocumentQATool implements ITool {
  public readonly id = "document_qa";
  public readonly name = "Document Q&A";
  public readonly description = "Answers questions about a specific uploaded document. Use this when the user's query refers to a document.";
  public readonly requiredFeatures = ["DOCUMENT_AI"];
  public readonly category = "PDF & Documents";

  async execute(params: IDocumentQAToolParams): Promise<IDocumentQAToolResult> {
    const { documentId, query, userId } = params;

    const document = await StoredDocument.findById(documentId);
    if (!document || document.userId.toString() !== userId) {
      throw new Error("Document not found or you do not have permission to access it.");
    }
    if (document.status !== "PROCESSED") {
      throw new Error("This document is still being processed. Please try again later.");
    }

    const retriever = new Retriever();
    const retrievedChunks = await retriever.retrieve(documentId, query, 5);

    const context = retrievedChunks.length > 0
      ? retrievedChunks.map((chunk) => `Source (Page ${chunk.pageNumber}):\n${chunk.text}`).join("\n\n---\n\n")
      : "No relevant information was found in the document to answer this question.";

    return { context, retrievedChunks };
  }
}