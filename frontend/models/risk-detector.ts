import { IActivityLog, ActivitySeverity } from "@/models/ActivityLog";
import { IDigitalWellnessScore } from "@/models/DigitalWellnessScore";
import { IChild } from "@/models/Child";
import { RiskType, RiskSeverity } from "@/models/ChildRiskAssessment";
import { analyzeBehaviorPatterns } from "./behavior-pattern-engine";

interface DetectedRisk {
  type: RiskType;
  severity: RiskSeverity;
  confidence: number;
  evidence: string;
}

/**
 * Detects specific digital risks based on analyzed behavior patterns.
 */
export function detectRisks(
  child: IChild,
  activities: IActivityLog[],
  wellnessScores: IDigitalWellnessScore[]
): DetectedRisk[] {
  const detected: DetectedRisk[] = [];
  const patterns = analyzeBehaviorPatterns(child, activities, wellnessScores);

  // Example: Detect excessive screen usage
  if (patterns.screenTimeTrend === 'increasing' && activities.length > 10) {
    detected.push({
      type: "excessive_screen_usage",
      severity: "medium",
      confidence: 70,
      evidence: `Screen time has been increasing over the last period. Total activities: ${activities.length}.`,
    });
  }

  // Example: Detect gaming dependency pattern
  if (patterns.gamingUsageTrend === 'increasing' && patterns.bedtimeViolationsCount > 0) {
    detected.push({ type: "gaming_dependency_pattern", severity: "high", confidence: 85, evidence: "Gaming usage is trending up, and there are recent bedtime violations." });
  }

  // Add more risk detection rules here
  return detected;
}