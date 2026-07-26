import mongoose, { Schema, Document, Model, models } from "mongoose";

export interface IRewardGoal extends Document {
  childId: mongoose.Types.ObjectId;
  familyId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  requiredMinutes?: number;
  requiredTask?: string;
  rewardType: "screen_time" | "treat" | "custom";
  rewardTarget: string;
  rewardDurationMinutes: number;
  remainingRewardMinutes: number;
  progressMinutes: number;
  status: "active" | "completed" | "expired";
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
}

const RewardGoalSchema = new Schema<IRewardGoal>(
  {
    childId: { type: Schema.Types.ObjectId, ref: "Child", required: true, index: true },
    familyId: { type: Schema.Types.ObjectId, ref: "Family", required: true, index: true },
    title: { type: String, required: true },
    description: String,
    requiredMinutes: Number,
    requiredTask: String,
    rewardType: {
      type: String,
      enum: ["screen_time", "treat", "custom"],
      required: true,
    },
    rewardTarget: { type: String, required: true },
    rewardDurationMinutes: { type: Number, required: true },
    remainingRewardMinutes: { type: Number, required: true },
    progressMinutes: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "completed", "expired"],
      default: "active",
    },
    startDate: { type: Date, required: true },
    endDate: Date,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

RewardGoalSchema.index({ familyId: 1, childId: 1, status: 1 });

const RewardGoal: Model<IRewardGoal> =
  (models.RewardGoal as Model<IRewardGoal>) ||
  mongoose.model<IRewardGoal>("RewardGoal", RewardGoalSchema);

export default RewardGoal;

