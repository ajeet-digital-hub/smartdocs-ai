import { ITool } from "./tool-registry";
import { SMARTDOCS_SERVICES, SmartDocsService, ImplementationStatus } from "./service-knowledge";
import { PlanId, FeatureId } from "@/lib/plan-config";
import { hasFeatureAccess } from "@/lib/feature-access";
import { getServiceEntitlement, canAccessService } from "@/lib/service-entitlement";
import { getPlan } from "@/lib/plan-config";

export interface IServiceDiscoveryToolParams {
  query?: string;
  userPlanId: PlanId;
  outputLanguage: string;
}

export interface IServiceDiscoveryToolResult {
  response: string;
}

export class ServiceDiscoveryTool implements ITool {
  public readonly id = "service_discovery";
  public readonly name = "Service Discovery";
  public readonly description = "Provides information about the services and features available in SmartDocs AI. Use this when the user asks 'What can you do?', 'What services are available?', or asks about specific capabilities (e.g., 'PDF features', 'image tools', 'translation').";
  public readonly requiredFeatures = ["AI_CHAT"];
  public readonly category = "Live Information";

  async execute(params: IServiceDiscoveryToolParams): Promise<IServiceDiscoveryToolResult> {
    const { query, userPlanId, outputLanguage } = params;

    let filteredServices = SMARTDOCS_SERVICES.filter(service =>
      service.implementationStatus === "IMPLEMENTED" || service.implementationStatus === "PARTIALLY_IMPLEMENTED"
    );

    if (query) {
      const lowerQuery = query.toLowerCase();
      filteredServices = filteredServices.filter(service =>
        service.name.toLowerCase().includes(lowerQuery) ||
        service.description.toLowerCase().includes(lowerQuery) ||
        service.category.toLowerCase().includes(lowerQuery) ||
        service.supportedFileTypes.some(type => type.toLowerCase().includes(lowerQuery)) ||
        service.exampleUserRequests.some(req => req.toLowerCase().includes(lowerQuery))
      );
    }

    if (filteredServices.length === 0) {
      return { response: `I couldn't find any services matching "${query}" that are currently available.` };
    }

    const plan = getPlan(userPlanId);

    const serviceDescriptions = filteredServices.map(service => {
      const planAccess = service.requiredPlan === "All plans" || canAccessService(userPlanId, service.name)
        ? "Available on your plan."
        : `Requires ${service.requiredPlan} plan or higher.`;
      const entitlement = getServiceEntitlement(service.name);
      const creditInfo = entitlement ? ` (${entitlement.creditCost} credits per use)` : "";
      return `- **${service.name}** (${service.category}): ${service.description}${creditInfo}. ${planAccess}`;
    }).join("\n");

    let finalResponse = `Here are the services I can currently help you with:\n\n${serviceDescriptions}`;

    if (plan) {
      finalResponse += `\n\nYour plan (${plan.name}) includes ${plan.limits.aiCreditsMonthly} AI credits per month.`;
    }

    if (query && query.toLowerCase().includes("plan")) {
      finalResponse += `\n\nTo see all features for your current plan, visit the pricing page or your dashboard.`;
    }

    return { response: `${finalResponse}\n\nPlease respond in ${outputLanguage}.` };
  }
}
