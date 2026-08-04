import mongoose, { Document, Model, Schema } from "mongoose";

export type StreakType = "study" | "bedtime_compliance" | "screen_time_balance";

export interface IChildStreak extends Document {
  familyId: mongoose.Types.ObjectId;
  childId: mongoose.Types.ObjectId;
  streakType: StreakType;
  currentStreak: number;
  longestStreak: number;
  lastUpdatedAt: Date;
}

const ChildStreakSchema = new Schema<IChildStreak>(
  {
    familyId: { type: Schema.Types.ObjectId, ref: "Family", required: true },
    childId: { type: Schema.Types.ObjectId, ref: "Child", required: true },
    streakType: { type: String, enum: ["study", "bedtime_compliance", "screen_time_balance"], required: true },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastUpdatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ChildStreakSchema.index({ childId: 1, streakType: 1 }, { unique: true });

const ChildStreak = (mongoose.models.ChildStreak as Model<IChildStreak>) || mongoose.model<IChildStreak>("ChildStreak", ChildStreakSchema);

export default ChildStreak;