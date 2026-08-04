import { PlanId, FeatureId, getPlan } from "./plan-config";

/**
 * Checks if a given plan has access to a specific feature.
 */
export function hasFeatureAccess(planId: PlanId, featureId: FeatureId): boolean {
  const plan = getPlan(planId);
  if (!plan) return false;
  return plan.features.includes(featureId);
}

/** All paid plan ids */
export const PAID_PLANS: PlanId[] = ["basic", "pro", "pro_plus", "enterprise"];

/**
 * Determine if a template can be used by a user plan.
 *
 * Free templates are always accessible. Premium templates require any paid plan
 * that includes `TEMPLATES_PREMIUM` (Basic and above in the current config).
 */
export function canAccessTemplate(requiredPlan: PlanId | string, userPlan: PlanId): boolean {
  if (requiredPlan === "free" || !requiredPlan) return true;
  // Any paid plan unlocks premium templates via TEMPLATES_PREMIUM feature.
  if (hasFeatureAccess(userPlan, "TEMPLATES_PREMIUM")) return true;
  // Fallback: direct plan comparison for robust gating.
  const rank: Record<string, number> = { free: 0, basic: 1, pro: 2, pro_plus: 3, enterprise: 4 };
  return (rank[userPlan] || 0) >= (rank[requiredPlan] || 0);
}

/** Map a template `requiredPlan` to a human-readable premium tier label */
export function premiumTierLabel(requiredPlan: PlanId | string): string {
  switch (requiredPlan) {
    case "basic":
      return "PRO";
    case "pro":
      return "PRO+";
    case "pro_plus":
      return "PRO+";
    case "enterprise":
      return "PRO+";
    default:
      return "PRO";
  }
}

