import mongoose, { Document, Model, Schema } from "mongoose";

export interface IScoreFactors {
  screenTime: { score: number; value: number; max: number }; // value in minutes
  sleepHabits: { score: number; violations: number };
  educationalUsage: { score: number; value: number }; // value in minutes
  riskAlerts: { score: number; count: number };
}

export interface IDigitalWellnessScore extends Document {
  familyId: mongoose.Types.ObjectId;
  childId: mongoose.Types.ObjectId;
  date: Date;
  score: number;
  summary: string; // e.g., "Healthy", "Needs Improvement"
  scoreFactors: IScoreFactors;
  createdAt: Date;
}

const DigitalWellnessScoreSchema = new Schema<IDigitalWellnessScore>(
  {
    familyId: { type: Schema.Types.ObjectId, ref: "Family", required: true },
    childId: { type: Schema.Types.ObjectId, ref: "Child", required: true },
    date: { type: Date, required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    summary: { type: String, required: true },
    scoreFactors: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

DigitalWellnessScoreSchema.index({ childId: 1, date: -1 });

const DigitalWellnessScore =
  (mongoose.models.DigitalWellnessScore as Model<IDigitalWellnessScore>) ||
  mongoose.model<IDigitalWellnessScore>("DigitalWellnessScore", DigitalWellnessScoreSchema);

export default DigitalWellnessScore;