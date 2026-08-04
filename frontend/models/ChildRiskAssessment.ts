import mongoose, { Document, Model, Schema } from "mongoose";

export type RiskType =
  | "excessive_screen_usage"
  | "sleep_risk"
  | "gaming_dependency_pattern"
  | "safety_risk" // e.g., repeated access to blocked content
  | "wellness_decline"
  | "social_media_overuse"
  | "unusual_activity";

export type RiskSeverity = "low" | "medium" | "high" | "critical";
export type RiskStatus = "active" | "resolved" | "dismissed";

export interface IChildRiskAssessment extends Document {
  familyId: mongoose.Types.ObjectId;
  childId: mongoose.Types.ObjectId;
  riskType: RiskType;
  severity: RiskSeverity;
  confidenceScore: number; // 0-100
  evidence: string; // Summary of activity logs or patterns
  recommendations: string[]; // Actionable advice
  status: RiskStatus;
  detectedAt: Date;
  resolvedAt?: Date;
}

const ChildRiskAssessmentSchema = new Schema<IChildRiskAssessment>(
  {
    familyId: { type: Schema.Types.ObjectId, ref: "Family", required: true },
    childId: { type: Schema.Types.ObjectId, ref: "Child", required: true, index: true },
    riskType: { type: String, enum: ["excessive_screen_usage", "sleep_risk", "gaming_dependency_pattern", "safety_risk", "wellness_decline", "social_media_overuse", "unusual_activity"], required: true },
    severity: { type: String, enum: ["low", "medium", "high", "critical"], required: true },
    confidenceScore: { type: Number, required: true, min: 0, max: 100 },
    evidence: { type: String, required: true },
    recommendations: [{ type: String }],
    status: { type: String, enum: ["active", "resolved", "dismissed"], default: "active" },
    detectedAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

ChildRiskAssessmentSchema.index({ childId: 1, detectedAt: -1 });
ChildRiskAssessmentSchema.index({ familyId: 1, status: 1 });

const ChildRiskAssessment = (mongoose.models.ChildRiskAssessment as Model<IChildRiskAssessment>) || mongoose.model<IChildRiskAssessment>("ChildRiskAssessment", ChildRiskAssessmentSchema);

export default ChildRiskAssessment;