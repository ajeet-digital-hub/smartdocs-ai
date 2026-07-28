import mongoose, { Document, Model, Schema } from "mongoose"

export type PolicyState = "allowed" | "limited" | "scheduled" | "blocked"
export type PolicyScope = "global" | "child" | "device"

export interface IWebsitePolicy extends Document {
  familyId: mongoose.Types.ObjectId
  childId?: mongoose.Types.ObjectId
  deviceId?: mongoose.Types.ObjectId
  scope: PolicyScope
  domain: string
  displayName: string
  category?: string
  state: PolicyState
  dailyLimitMinutes?: number
  scheduleStart?: string // HH:mm format
  scheduleEnd?: string // HH:mm format
  allowedDays: number[] // 0=Sun, 1=Mon, ...
  timezone: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const WebsitePolicySchema = new Schema<IWebsitePolicy>(
  {
    familyId: { type: Schema.Types.ObjectId, ref: "Family", required: true, index: true },
    childId: { type: Schema.Types.ObjectId, ref: "Child", index: true },
    deviceId: { type: Schema.Types.ObjectId, ref: "Device", index: true },
    scope: { type: String, enum: ["global", "child", "device"], default: "child" },
    domain: { type: String, required: true, trim: true, lowercase: true },
    displayName: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    state: { type: String, enum: ["allowed", "limited", "scheduled", "blocked"], required: true },
    dailyLimitMinutes: { type: Number, min: 0 },
    scheduleStart: { type: String },
    scheduleEnd: { type: String },
    allowedDays: [{ type: Number, min: 0, max: 6 }],
    timezone: { type: String, default: "UTC" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

WebsitePolicySchema.index({ familyId: 1, domain: 1 })
WebsitePolicySchema.index({ childId: 1, domain: 1 })

const WebsitePolicy = (mongoose.models.WebsitePolicy as Model<IWebsitePolicy>) ||
  mongoose.model<IWebsitePolicy>("WebsitePolicy", WebsitePolicySchema)

export default WebsitePolicy

