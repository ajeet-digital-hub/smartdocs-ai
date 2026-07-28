import mongoose, { Document, Model, Schema } from "mongoose"

export type PolicyState = "allowed" | "limited" | "scheduled" | "blocked"
export type PolicyScope = "global" | "child" | "device"
export type AppPlatform = "android" | "ios" | "web" | "tv" | "all"

export interface IAppPolicy extends Document {
  familyId: mongoose.Types.ObjectId
  childId?: mongoose.Types.ObjectId
  deviceId?: mongoose.Types.ObjectId
  scope: PolicyScope
  appId: string
  appName: string
  packageName?: string
  platform: AppPlatform
  category?: string
  state: PolicyState
  dailyLimitMinutes?: number
  scheduleStart?: string
  scheduleEnd?: string
  allowedDays: number[]
  timezone: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const AppPolicySchema = new Schema<IAppPolicy>(
  {
    familyId: { type: Schema.Types.ObjectId, ref: "Family", required: true, index: true },
    childId: { type: Schema.Types.ObjectId, ref: "Child", index: true },
    deviceId: { type: Schema.Types.ObjectId, ref: "Device", index: true },
    scope: { type: String, enum: ["global", "child", "device"], default: "child" },
    appId: { type: String, required: true, trim: true },
    appName: { type: String, required: true, trim: true },
    packageName: { type: String, trim: true },
    platform: { type: String, enum: ["android", "ios", "web", "tv", "all"], default: "all" },
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

AppPolicySchema.index({ familyId: 1, appId: 1 })
AppPolicySchema.index({ childId: 1, appId: 1 })

const AppPolicy = (mongoose.models.AppPolicy as Model<IAppPolicy>) ||
  mongoose.model<IAppPolicy>("AppPolicy", AppPolicySchema)

export default AppPolicy

