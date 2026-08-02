import { PlanId, FeatureId } from "./plan-config";

/**
 * Represents entitlement metadata for a single AI service.
 * Every service that consumes AI credits or has plan-based access
 * should be registered here.
 */
export interface ServiceEntitlement {
  /** Unique service identifier (matches tool registry IDs) */
  serviceId: string;
  /** Human-readable service name */
  name: string;
  /** Feature flag required for access */
  requiredFeature: FeatureId;
  /** Minimum plan required */
  requiredPlan: PlanId;
  /** AI credit cost per operation */
  creditCost: number;
  /** Monthly usage limit (0 = unlimited) */
  monthlyLimit: number;
  /** Fair-use daily limit (0 = unlimited) */
  fairUseDailyLimit: number;
  /** Whether the service is actually implemented */
  implemented: boolean;
}

/**
 * Service Entitlement Registry
 *
 * Backend source of truth for service-level access control.
 * All AI tools and services must be registered here.
 *
 * Only register services that actually exist and are implemented.
 */
export const SERVICE_ENTITLEMENTS: ServiceEntitlement[] = [
  // ─── AI Chat ───
  {
    serviceId: "ai_chat",
    name: "AI Chat",
    requiredFeature: "AI_CHAT_UNLIMITED",
    requiredPlan: "free",
    creditCost: 1,
    monthlyLimit: 0,
    fairUseDailyLimit: 30,
    implemented: true,
  },
  // ─── Document Q&A ───
  {
    serviceId: "document_qa",
    name: "Document Q&A",
    requiredFeature: "DOCUMENT_AI",
    requiredPlan: "basic",
    creditCost: 2,
    monthlyLimit: 0,
    fairUseDailyLimit: 0,
    implemented: true,
  },
  // ─── Document Summarization ───
  {
    serviceId: "document_summary",
    name: "Document Summarization",
    requiredFeature: "DOCUMENT_AI",
    requiredPlan: "pro",
    creditCost: 3,
    monthlyLimit: 0,
    fairUseDailyLimit: 0,
    implemented: true,
  },
  // ─── Document Translation ───
  {
    serviceId: "document_translation",
    name: "Document Translation",
    requiredFeature: "DOCUMENT_TRANSLATION",
    requiredPlan: "pro_plus",
    creditCost: 5,
    monthlyLimit: 0,
    fairUseDailyLimit: 0,
    implemented: true,
  },
  // ─── Document OCR ───
  {
    serviceId: "document_ocr",
    name: "Document OCR",
    requiredFeature: "OCR",
    requiredPlan: "basic",
    creditCost: 2,
    monthlyLimit: 0,
    fairUseDailyLimit: 0,
    implemented: true,
  },
  // ─── Document Conversion ───
  {
    serviceId: "document_conversion",
    name: "Document Conversion",
    requiredFeature: "DOCUMENT_CONVERSION",
    requiredPlan: "pro",
    creditCost: 0,
    monthlyLimit: 0,
    fairUseDailyLimit: 0,
    implemented: true,
  },
  // ─── Service Discovery ───
  {
    serviceId: "service_discovery",
    name: "Service Discovery",
    requiredFeature: "AI_CHAT_LIMITED",
    requiredPlan: "free",
    creditCost: 0,
    monthlyLimit: 0,
    fairUseDailyLimit: 0,
    implemented: true,
  },
];

/**
 * Get entitlement for a specific service.
 */
export function getServiceEntitlement(serviceId: string): ServiceEntitlement | undefined {
  return SERVICE_ENTITLEMENTS.find((s) => s.serviceId === serviceId);
}

/**
 * Check if a plan can access a service based on entitlement rules.
 * Returns true if the service is available on the given plan.
 */
export function canAccessService(planId: PlanId, serviceId: string): boolean {
  const entitlement = getServiceEntitlement(serviceId);
  if (!entitlement) return false;
  if (!entitlement.implemented) return false;

  const planHierarchy: PlanId[] = ["free", "basic", "pro", "pro_plus", "enterprise"];
  const planIndex = planHierarchy.indexOf(planId);
  const requiredIndex = planHierarchy.indexOf(entitlement.requiredPlan);

  if (planIndex === -1) return false;
  if (requiredIndex === -1) return false;

  return planIndex >= requiredIndex;
}

/**
 * Get all services available for a given plan.
 */
export function getServicesForPlan(planId: PlanId): ServiceEntitlement[] {
  return SERVICE_ENTITLEMENTS.filter((s) => s.implemented && canAccessService(planId, s.serviceId));
}

/**
 * Calculate credit cost for a specific service operation.
 */
export function getCreditCost(serviceId: string): number {
  const entitlement = getServiceEntitlement(serviceId);
  return entitlement?.creditCost ?? 0;
}

/**
 * Check if a service has a monthly usage limit.
 */
export function getMonthlyLimit(serviceId: string): number {
  const entitlement = getServiceEntitlement(serviceId);
  return entitlement?.monthlyLimit ?? 0;
}
