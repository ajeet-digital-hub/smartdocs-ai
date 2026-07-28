import mongoose, { Document, Model, Schema } from "mongoose"

export type DeviceType = "android" | "ios" | "chrome-extension" | "edge-extension" | "browser" | "smart-tv" | "android-tv" | "other"
export type DeviceStatus = "online" | "offline" | "paused" | "revoked"
export type ConnectionStatus = "connected" | "disconnected" | "pending" | "pairing"
export type PolicySyncStatus = "synced" | "pending" | "failed" | "not-applicable"

export interface IDevice extends Document {
  familyId: mongoose.Types.ObjectId
  childId?: mongoose.Types.ObjectId
  name: string
  deviceType: DeviceType
  deviceToken?: string
  deviceTokenHash?: string
  publicKey?: string
  status: DeviceStatus
  connectionStatus: ConnectionStatus
  policySyncStatus: PolicySyncStatus
  lastSeen?: Date
  lastIpAddress?: string
  userAgent?: string
  firmwareVersion?: string
  capabilities: string[]
  pairedAt?: Date
  revokedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const DeviceSchema = new Schema<IDevice>(
  {
    familyId: { type: Schema.Types.ObjectId, ref: "Family", required: true, index: true },
    childId: { type: Schema.Types.ObjectId, ref: "Child", index: true },
    name: { type: String, required: true, trim: true },
    deviceType: {
      type: String,
      enum: ["android", "ios", "chrome-extension", "edge-extension", "browser", "smart-tv", "android-tv", "other"],
      required: true,
    },
    deviceToken: { type: String, select: false },
    deviceTokenHash: { type: String, select: false },
    publicKey: { type: String, select: false },
    status: { type: String, enum: ["online", "offline", "paused", "revoked"], default: "offline" },
    connectionStatus: {
      type: String,
      enum: ["connected", "disconnected", "pending", "pairing"],
      default: "disconnected",
    },
    policySyncStatus: {
      type: String,
      enum: ["synced", "pending", "failed", "not-applicable"],
      default: "not-applicable",
    },
    lastSeen: { type: Date },
    lastIpAddress: { type: String },
    userAgent: { type: String },
    firmwareVersion: { type: String },
    capabilities: [{ type: String }],
    pairedAt: { type: Date },
    revokedAt: { type: Date },
  },
  { timestamps: true }
)

DeviceSchema.index({ familyId: 1, deviceType: 1 })
DeviceSchema.index({ deviceTokenHash: 1 }, { sparse: true })

const Device = (mongoose.models.Device as Model<IDevice>) || mongoose.model<IDevice>("Device", DeviceSchema)

export default Device

