import mongoose, { Document, Model, Schema } from "mongoose";

export type FamilyInsightType =
  | "family_health_update"
  | "child_risk_highlight"
  | "child_improvement"
  | "family_achievement"
  | "family_recommendation";

export type FamilyInsightSeverity = "info" | "low" | "medium" | "high";

export interface IFamilyInsight extends Document {
  familyId: mongoose.Types.ObjectId;
  insightType: FamilyInsightType;
  severity: FamilyInsightSeverity;
  affectedChildren: mongoose.Types.ObjectId[];
  summary: string;
  recommendations: string[];
  createdAt: Date;
}

const FamilyInsightSchema = new Schema<IFamilyInsight>(
  {
    familyId: { type: Schema.Types.ObjectId, ref: "Family", required: true, index: true },
    insightType: { type: String, enum: ["family_health_update", "child_risk_highlight", "child_improvement", "family_achievement", "family_recommendation"], required: true },
    severity: { type: String, enum: ["info", "low", "medium", "high"], default: "info" },
    affectedChildren: [{ type: Schema.Types.ObjectId, ref: "Child" }],
    summary: { type: String, required: true },
    recommendations: [{ type: String }],
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

FamilyInsightSchema.index({ familyId: 1, createdAt: -1 });

const FamilyInsight = (mongoose.models.FamilyInsight as Model<IFamilyInsight>) || mongoose.model<IFamilyInsight>("FamilyInsight", FamilyInsightSchema);

export default FamilyInsight;