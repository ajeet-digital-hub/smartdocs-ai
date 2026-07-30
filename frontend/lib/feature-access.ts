import { PlanId, FeatureId, getPlan } from "./plan-config";

/**
 * Checks if a given plan has access to a specific feature.
 * @param planId The ID of the plan.
 * @param featureId The ID of the feature to check.
 * @returns True if the plan includes the feature, false otherwise.
 */
export function hasFeatureAccess(planId: PlanId, featureId: FeatureId): boolean {
  const plan = getPlan(planId);
  if (!plan) return false; // Unknown plan
  return plan.features.includes(featureId);
}