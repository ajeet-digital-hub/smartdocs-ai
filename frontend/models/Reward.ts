import mongoose, { Document, Model, Schema } from "mongoose"

export type RewardType = "screen-time" | "app-unlock" | "website-unlock" | "special"
export type RewardStatus = "active" | "claimed" | "expired" | "revoked"

export interface IReward extends Document {
  familyId: mongoose.Types.ObjectId
  childId: mongoose.Types.ObjectId
  name: string
  description?: string
  type: RewardType
  targetId?: string // appId or website domain
  targetName?: string
  minutesEarned: number
  minutesUsed: number
  status: RewardStatus
  source: "study-goal" | "quiz" | "manual" | "emergency"
  sourceId?: string
  expiresAt?: Date
  claimedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const RewardSchema = new Schema<IReward>(
  {
    familyId: { type: Schema.Types.ObjectId, ref: "Family", required: true, index: true },
    childId: { type: Schema.Types.ObjectId, ref: "Child", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: {
      type: String,
      enum: ["screen-time", "app-unlock", "website-unlock", "special"],
      default: "screen-time",
    },
    targetId: { type: String },
    targetName: { type: String },
    minutesEarned: { type: Number, required: true, min: 0 },
    minutesUsed: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "claimed", "expired", "revoked"], default: "active" },
    source: { type: String, enum: ["study-goal", "quiz", "manual", "emergency"], required: true },
    sourceId: { type: String },
    expiresAt: { type: Date },
    claimedAt: { type: Date },
  },
  { timestamps: true }
)

const Reward = (mongoose.models.Reward as Model<IReward>) ||
  mongoose.model<IReward>("Reward", RewardSchema)

export default Reward

