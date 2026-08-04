import { DocumentQATool } from "./document-qa-tool";
import { DocumentSummarizationTool } from "./document-summarization-tool";
import { ServiceDiscoveryTool } from "./service-discovery-tool";
import { SmartDocsService, ServiceCategory, SMARTDOCS_SERVICES } from "./service-knowledge";
import { DocumentTranslationTool } from "./document-translation-tool";
import { DocumentOCRTool } from "./document-ocr-tool";
import { DocumentConversionTool } from "@/lib/conversion/document-conversion-tool";
import { FamilyGuardianActionTool } from "./family-guardian-action-tool";

export interface ITool {
  id: string;
  name: string;
  description: string;
  requiredFeatures: string[];
  category: ServiceCategory;
  inputSchema?: Record<string, any>; // JSON schema for input parameters
  outputSchema?: Record<string, any>; // JSON schema for output
  supportedFileTypes?: string[];
  supportedLanguages?: string[];
  requiredPlan?: SmartDocsService['requiredPlan'];
  creditCost?: string;
  execute(params: any): Promise<any>;
}

class ToolRegistry {
  private tools: Map<string, ITool> = new Map();

  constructor() {
    this.register(new ServiceDiscoveryTool());
    this.register(new DocumentQATool());
    this.register(new DocumentSummarizationTool());
    this.register(new DocumentTranslationTool());
    this.register(new DocumentOCRTool());
    this.register(new DocumentConversionTool());
    this.register(new FamilyGuardianActionTool());
  }

  register(tool: ITool): void {
    if (this.tools.has(tool.id)) {
      console.warn(`Tool with id ${tool.id} is already registered. Overwriting.`);
    }

    // P2 Refactor: Attach service metadata from the single source of truth.
    const serviceInfo = SMARTDOCS_SERVICES.find(s => s.existingApiTool === tool.constructor.name);
    if (serviceInfo) {
      tool.name = serviceInfo.name;
      tool.supportedFileTypes = serviceInfo.supportedFileTypes;
      tool.supportedLanguages = serviceInfo.supportedLanguages;
      tool.requiredPlan = serviceInfo.requiredPlan;
      tool.creditCost = serviceInfo.creditUsage;
    }

    this.tools.set(tool.id, tool);
  }

  getTool(id: string): ITool | undefined {
    return this.tools.get(id);
  }

  getAllTools(): ITool[] {
    return Array.from(this.tools.values());
  }

  getToolDescriptions(): string {
    return this.getAllTools().map(tool => `- ${tool.name} (ID: ${tool.id}, Category: ${tool.category}): ${tool.description}`).join("\n");
  }
}

export const toolRegistry = new ToolRegistry();