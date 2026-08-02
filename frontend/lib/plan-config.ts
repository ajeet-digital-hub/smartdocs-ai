export type PlanId = "free" | "basic" | "pro" | "pro_plus" | "enterprise";
export type FeatureId =
  | "AI_CHAT_LIMITED"
  | "AI_CHAT_UNLIMITED"
  | "CHAT_HISTORY_1H"
  | "CHAT_HISTORY_7D"
  | "CHAT_HISTORY_UNLIMITED"
  | "TEMPORARY_FILES_AUTO_DELETE"
  | "BASIC_AI_FEATURES"
  | "PDF_TOOLS"
  | "OCR_SCANNER"
  | "OCR"
  | "PHOTO_TOOL"
  | "BASIC_IMAGE_ANALYSIS"
  | "ADVANCED_AI"
  | "DOCUMENT_AI"
  | "DOCUMENT_TRANSLATION"
  | "AUTOMATION_FEATURES"
  | "FAMILY_GUARDIAN_ACCESS"
  | "ADVANCED_PHOTO_AI"
  | "IMAGE_TO_DOCUMENT_CONVERSION"
  | "TABLE_EXTRACTION"
  | "PREMIUM_AI_FEATURES"
  | "MORE_AI_CREDITS"
  | "TEAM_FEATURES"
  | "PRIORITY_SUPPORT"
  | "ENTERPRISE_ADMIN_CONTROLS"
  | "MULTIPLE_FAMILIES"
  | "ADVANCED_ANALYTICS"
  | "DOCUMENT_CONVERSION";

export interface PlanLimits {
  storageGB: number;
  aiCreditsMonthly: number; // e.g., number of complex AI calls or token equivalent
  maxChatHistoryDays: number | 'unlimited';
  maxChildren?: number; // For Family Guardian
  maxDevices?: number; // For Family Guardian
}

export interface Plan {
  id: PlanId;
  name: string;
  price: number; // in INR
  currency: string;
  billingCycle: "monthly" | "yearly";
  features: FeatureId[];
  limits: PlanLimits;
  isPopular?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    currency: "INR",
    billingCycle: "monthly",
    features: ["AI_CHAT_LIMITED", "CHAT_HISTORY_1H", "TEMPORARY_FILES_AUTO_DELETE", "BASIC_AI_FEATURES"],
    limits: { storageGB: 0, aiCreditsMonthly: 100, maxChatHistoryDays: 1 },
  },
  {
    id: "basic",
    name: "Basic",
    price: 299,
    currency: "INR",
    billingCycle: "monthly",
    features: ["AI_CHAT_UNLIMITED", "CHAT_HISTORY_7D", "PDF_TOOLS", "OCR_SCANNER", "PHOTO_TOOL", "BASIC_IMAGE_ANALYSIS"],
    limits: { storageGB: 2, aiCreditsMonthly: 500, maxChatHistoryDays: 7 },
  },
{
    id: "pro",
    name: "Pro",
    price: 499,
    currency: "INR",
    billingCycle: "monthly",
    features: [
      "ADVANCED_AI", "DOCUMENT_AI", "AUTOMATION_FEATURES", "FAMILY_GUARDIAN_ACCESS",
      "ADVANCED_PHOTO_AI", "IMAGE_TO_DOCUMENT_CONVERSION", "TABLE_EXTRACTION",
      "DOCUMENT_CONVERSION", "CHAT_HISTORY_UNLIMITED",
      "OCR", "DOCUMENT_TRANSLATION"
    ],
    limits: { storageGB: 10, aiCreditsMonthly: 2000, maxChatHistoryDays: 'unlimited' },
  },
  {
    id: "pro_plus",
    name: "Pro+",
    price: 999,
    currency: "INR",
    billingCycle: "monthly",
    features: [
      "PREMIUM_AI_FEATURES", "MORE_AI_CREDITS", "TEAM_FEATURES", "PRIORITY_SUPPORT",
      "CHAT_HISTORY_UNLIMITED", "DOCUMENT_AI", "AUTOMATION_FEATURES",
      "FAMILY_GUARDIAN_ACCESS", "ADVANCED_PHOTO_AI", "DOCUMENT_TRANSLATION",
      "DOCUMENT_CONVERSION", "OCR", "TABLE_EXTRACTION"
    ],
    limits: { storageGB: 50, aiCreditsMonthly: 10000, maxChatHistoryDays: 'unlimited' },
    isPopular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 0, // Custom pricing
    currency: "INR",
    billingCycle: "yearly",
    features: ["PREMIUM_AI_FEATURES", "MORE_AI_CREDITS", "TEAM_FEATURES", "PRIORITY_SUPPORT", "ENTERPRISE_ADMIN_CONTROLS", "MULTIPLE_FAMILIES", "ADVANCED_ANALYTICS", "CHAT_HISTORY_UNLIMITED"],
    limits: { storageGB: 1000, aiCreditsMonthly: 50000, maxChatHistoryDays: 'unlimited' },
  },
];

export function getPlan(planId: PlanId): Plan | undefined {
  return PLANS.find(plan => plan.id === planId);
}

export function getPlanLimits(planId: PlanId): PlanLimits {
  return getPlan(planId)?.limits || PLANS[0].limits; // Default to free plan limits
}