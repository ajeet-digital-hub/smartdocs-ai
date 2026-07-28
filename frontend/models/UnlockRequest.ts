import mongoose, { Document, Model, Schema } from "mongoose"

export type UnlockRequestStatus = "pending" | "approved" | "denied" | "expired"
export type UnlockRequestType = "website" | "app" | "screen-time" | "emergency"

export interface IUnlockRequest extends Document {
  familyId: mongoose.Types.ObjectId
  childId: mongoose.Types.ObjectId
  deviceId?: mongoose.Types.ObjectId
  type: UnlockRequestType
  targetId: string
  targetName: string
  reason?: string
  requestedDuration: number // minutes
  grantedDuration?: number
  status: UnlockRequestStatus
  respondedBy?: mongoose.Types.ObjectId
  respondedAt?: Date
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

const UnlockRequestSchema = new Schema<IUnlockRequest>(
  {
    familyId: { type: Schema.Types.ObjectId, ref: "Family", required: true, index: true },
    childId: { type: Schema.Types.ObjectId, ref: "Child", required: true, index: true },
    deviceId: { type: Schema.Types.ObjectId, ref: "Device" },
    type: {
      type: String,
      enum: ["website", "app", "screen-time", "emergency"],
      required: true,
    },
    targetId: { type: String, required: true },
    targetName: { type: String, required: true },
    reason: { type: String, trim: true },
    requestedDuration: { type: Number, required: true, min: 1 },
    grantedDuration: { type: Number, min: 0 },
    status: {
      type: String,
      enum: ["pending", "approved", "denied", "expired"],
      default: "pending",
    },
    respondedBy: { type: Schema.Types.ObjectId, ref: "User" },
    respondedAt: { type: Date },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
)

const UnlockRequest = (mongoose.models.UnlockRequest as Model<IUnlockRequest>) ||
  mongoose.model<IUnlockRequest>("UnlockRequest", UnlockRequestSchema)

export default UnlockRequest

