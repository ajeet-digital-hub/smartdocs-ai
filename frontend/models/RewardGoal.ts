import mongoose, { Document, Model, Schema } from "mongoose";

export interface IRewardGoal extends Document {
  childId: mongoose.Types.ObjectId;
  familyId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  requiredMinutes?: number;
  requiredTask?: string;
  rewardType: "screen_time" | "entertainment" | "custom";
  rewardTarget?: string;
  rewardDurationMinutes: number;
  progressMinutes: number;
  taskCompleted: boolean;
  remainingRewardMinutes: number;
  status: "active" | "completed" | "expired";
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RewardGoalSchema = new Schema<IRewardGoal>(
  {
    childId: { type: Schema.Types.ObjectId, ref: "Child", required: true, index: true },
    familyId: { type: Schema.Types.ObjectId, ref: "Family", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    requiredMinutes: { type: Number, min: 1 },
    requiredTask: { type: String, trim: true },
    rewardType: { type: String, enum: ["screen_time", "entertainment", "custom"], required: true },
    rewardTarget: { type: String, trim: true },
    rewardDurationMinutes: { type: Number, required: true, min: 1 },
    progressMinutes: { type: Number, default: 0, min: 0 },
    taskCompleted: { type: Boolean, default: false },
    remainingRewardMinutes: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ["active", "completed", "expired"], default: "active" },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
  },
  { timestamps: true }
);

RewardGoalSchema.index({ familyId: 1, status: 1 });

const RewardGoal: Model<IRewardGoal> =
  (mongoose.models.RewardGoal as Model<IRewardGoal>) ||
  mongoose.model<IRewardGoal>("RewardGoal", RewardGoalSchema);

export default RewardGoal;

