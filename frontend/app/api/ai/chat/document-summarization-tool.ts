import { generateAIResponseWithUsage } from "@/lib/ai-provider";
import { ITool } from "./tool-registry";
import { SMARTDOCS_SERVICES } from "./service-knowledge";

export interface IDocumentSummarizationToolParams {
  textToSummarize: string;
  outputLanguage: string;
}

export interface IDocumentSummarizationToolResult {
  summary: string;
  totalTokensUsed: number;
}

export class DocumentSummarizationTool implements ITool {
  public readonly id = "document_summary";
  public readonly name = "Document Summarization";
  public readonly description = "Summarizes a given block of text. Use this after retrieving content from a document if the user asks for a summary. Can also summarize general text.";
  public readonly requiredFeatures = ["DOCUMENT_AI"];
  public readonly category = "PDF & Documents";
  public readonly supportedFileTypes = ["PDF", "N/A"]; // Can summarize general text too
  public readonly supportedLanguages = SMARTDOCS_SERVICES.find(s => s.name === "Document Summarization")?.supportedLanguages || [];
  public readonly requiredPlan = SMARTDOCS_SERVICES.find(s => s.name === "Document Summarization")?.requiredPlan;
  public readonly creditCost = SMARTDOCS_SERVICES.find(s => s.name === "Document Summarization")?.creditUsage;

  async execute(params: IDocumentSummarizationToolParams): Promise<IDocumentSummarizationToolResult> {
    const { textToSummarize, outputLanguage } = params;

    const prompt = `Summarize the following text. Respond in ${outputLanguage}.\n\nTEXT:\n${textToSummarize}`;
    const { response: summary, tokensUsed } = await generateAIResponseWithUsage(prompt);

    return { summary, totalTokensUsed: tokensUsed };
  }
}