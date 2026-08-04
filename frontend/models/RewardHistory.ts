import mongoose, { Document, Model, Schema } from "mongoose"

export type RewardAction = "earned" | "claimed" | "used" | "expired" | "revoked"

export interface IRewardHistory extends Document {
  familyId: mongoose.Types.ObjectId
  childId: mongoose.Types.ObjectId
  rewardId?: mongoose.Types.ObjectId
  action: RewardAction
  minutes: number
  description: string
  source: string
  createdAt: Date
}

const RewardHistorySchema = new Schema<IRewardHistory>(
  {
    familyId: { type: Schema.Types.ObjectId, ref: "Family", required: true, index: true },
    childId: { type: Schema.Types.ObjectId, ref: "Child", required: true, index: true },
    rewardId: { type: Schema.Types.ObjectId, ref: "Reward" },
    action: { type: String, enum: ["earned", "claimed", "used", "expired", "revoked"], required: true },
    minutes: { type: Number, required: true },
    description: { type: String, required: true, trim: true },
    source: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

const RewardHistory = (mongoose.models.RewardHistory as Model<IRewardHistory>) ||
  mongoose.model<IRewardHistory>("RewardHistory", RewardHistorySchema)

export default RewardHistory

