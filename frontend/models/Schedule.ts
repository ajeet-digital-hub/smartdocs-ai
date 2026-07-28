import mongoose, { Document, Model, Schema } from "mongoose"

export type ScheduleType = "study" | "school" | "sleep" | "free" | "custom"

export interface ISchedule extends Document {
  familyId: mongoose.Types.ObjectId
  childId?: mongoose.Types.ObjectId
  deviceId?: mongoose.Types.ObjectId
  name: string
  type: ScheduleType
  startTime: string // HH:mm
  endTime: string // HH:mm
  days: number[] // 0=Sun, 1=Mon, ..., 6=Sat
  timezone: string
  isActive: boolean
  policyScope: "all" | "specific"
  blockedCategories: string[]
  blockedWebsites: string[]
  blockedApps: string[]
  allowedCategories: string[]
  allowedWebsites: string[]
  allowedApps: string[]
  sleepMode: boolean
  emergencyAccessEnabled: boolean
  createdAt: Date
  updatedAt: Date
}

const ScheduleSchema = new Schema<ISchedule>(
  {
    familyId: { type: Schema.Types.ObjectId, ref: "Family", required: true, index: true },
    childId: { type: Schema.Types.ObjectId, ref: "Child", index: true },
    deviceId: { type: Schema.Types.ObjectId, ref: "Device", index: true },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["study", "school", "sleep", "free", "custom"],
      required: true,
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    days: [{ type: Number, min: 0, max: 6 }],
    timezone: { type: String, default: "UTC" },
    isActive: { type: Boolean, default: true },
    policyScope: { type: String, enum: ["all", "specific"], default: "all" },
    blockedCategories: [{ type: String }],
    blockedWebsites: [{ type: String }],
    blockedApps: [{ type: String }],
    allowedCategories: [{ type: String }],
    allowedWebsites: [{ type: String }],
    allowedApps: [{ type: String }],
    sleepMode: { type: Boolean, default: false },
    emergencyAccessEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
)

ScheduleSchema.index({ familyId: 1, childId: 1 })

const Schedule = (mongoose.models.Schedule as Model<ISchedule>) ||
  mongoose.model<ISchedule>("Schedule", ScheduleSchema)

export default Schedule

