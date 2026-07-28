import mongoose, { Document, Model, Schema } from "mongoose"

export interface IDevicePairing extends Document {
  familyId: mongoose.Types.ObjectId
  childId?: mongoose.Types.ObjectId
  deviceId?: mongoose.Types.ObjectId
  pairingCode: string
  pairingToken: string
  pairingTokenHash: string
  status: "pending" | "approved" | "expired" | "revoked" | "completed"
  deviceType: string
  expiresAt: Date
  pairedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const DevicePairingSchema = new Schema<IDevicePairing>(
  {
    familyId: { type: Schema.Types.ObjectId, ref: "Family", required: true, index: true },
    childId: { type: Schema.Types.ObjectId, ref: "Child" },
    deviceId: { type: Schema.Types.ObjectId, ref: "Device" },
    pairingCode: { type: String, required: true },
    pairingToken: { type: String, required: true, select: false },
    pairingTokenHash: { type: String, required: true, select: false },
    status: {
      type: String,
      enum: ["pending", "approved", "expired", "revoked", "completed"],
      default: "pending",
    },
    deviceType: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
    pairedAt: { type: Date },
  },
  { timestamps: true }
)

DevicePairingSchema.index({ pairingCode: 1 }, { unique: true })
DevicePairingSchema.index({ pairingTokenHash: 1 })

const DevicePairing = (mongoose.models.DevicePairing as Model<IDevicePairing>) ||
  mongoose.model<IDevicePairing>("DevicePairing", DevicePairingSchema)

export default DevicePairing

