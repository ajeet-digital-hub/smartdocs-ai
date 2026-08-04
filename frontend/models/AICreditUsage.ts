import mongoose, { Document, Model, Schema } from "mongoose";

export type AICreditFeature =
  | "AI_CHAT"
  | "PDF_ANALYSIS"
  | "DOCUMENT_AI"
  | "IMAGE_AI"
  | "TRANSLATION"
  | "AUTOMATION"
  | "FAMILY_GUARDIAN_AI"
  | "OTHER";

export interface IAICreditUsage extends Document {
  userId: mongoose.Types.ObjectId;
  feature: AICreditFeature;
  creditsUsed: number;
  createdAt: Date;
}

const AICreditUsageSchema = new Schema<IAICreditUsage>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    feature: { type: String, enum: ["AI_CHAT", "PDF_ANALYSIS", "DOCUMENT_AI", "IMAGE_AI", "TRANSLATION", "AUTOMATION", "FAMILY_GUARDIAN_AI", "OTHER"], required: true },
    creditsUsed: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

const AICreditUsage: Model<IAICreditUsage> =
  (mongoose.models.AICreditUsage as Model<IAICreditUsage>) || mongoose.model<IAICreditUsage>("AICreditUsage", AICreditUsageSchema);

export default AICreditUsage;