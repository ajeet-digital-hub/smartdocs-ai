import { IActivityLog } from "@/models/ActivityLog";
import { IDigitalWellnessScore } from "@/models/DigitalWellnessScore";
import { IChild } from "@/models/Child";
import { detectRisks } from "./risk-detector";
import { predictFutureRisks } from "./prediction-engine";
import { IChildRiskAssessment } from "@/models/ChildRiskAssessment";

/**
 * Orchestrates the entire safety analysis process for a child.
 * This service will be called by background jobs or API endpoints.
 */
export async function analyzeChildSafety(
  child: IChild,
  historicalActivities: IActivityLog[],
  wellnessScores: IDigitalWellnessScore[]
): Promise<IChildRiskAssessment[]> {
  const detectedRisks = detectRisks(child, historicalActivities, wellnessScores);
  const predictedRisks = predictFutureRisks(child, historicalActivities, wellnessScores);

  // In a real scenario, we would convert DetectedRisk and PredictedRisk
  // into IChildRiskAssessment documents and save them.
  // For this phase, we'll just return a placeholder based on detected risks.
  return detectedRisks.map(risk => ({ ...risk, childId: child._id, familyId: child.familyId, detectedAt: new Date(), status: 'active', recommendations: [] } as IChildRiskAssessment));
}