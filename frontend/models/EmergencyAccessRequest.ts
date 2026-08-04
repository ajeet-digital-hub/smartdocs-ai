import mongoose, { Document, Model, Schema } from "mongoose"

export type EmergencyStatus = "pending" | "approved" | "denied" | "expired"

export interface IEmergencyAccessRequest extends Document {
  familyId: mongoose.Types.ObjectId
  childId: mongoose.Types.ObjectId
  deviceId?: mongoose.Types.ObjectId
  reason: string
  requestedDuration: number // minutes 5, 10, or 30
  grantedDuration?: number
  status: EmergencyStatus
  respondedBy?: mongoose.Types.ObjectId
  respondedAt?: Date
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

const EmergencyAccessRequestSchema = new Schema<IEmergencyAccessRequest>(
  {
    familyId: { type: Schema.Types.ObjectId, ref: "Family", required: true, index: true },
    childId: { type: Schema.Types.ObjectId, ref: "Child", required: true, index: true },
    deviceId: { type: Schema.Types.ObjectId, ref: "Device" },
    reason: { type: String, required: true, trim: true },
    requestedDuration: { type: Number, required: true, enum: [5, 10, 30] },
    grantedDuration: { type: Number, min: 0 },
    status: { type: String, enum: ["pending", "approved", "denied", "expired"], default: "pending" },
    respondedBy: { type: Schema.Types.ObjectId, ref: "User" },
    respondedAt: { type: Date },
    expiresAt: { type: Date },
  },
  { timestamps: true }
)

const EmergencyAccessRequest = (mongoose.models.EmergencyAccessRequest as Model<IEmergencyAccessRequest>) ||
  mongoose.model<IEmergencyAccessRequest>("EmergencyAccessRequest", EmergencyAccessRequestSchema)

export default EmergencyAccessRequest

