import mongoose, { Document, Model, Schema } from "mongoose"

export type ActivityAction =
  | "device_paired"
  | "device_revoked"
  | "child_created"
  | "child_updated"
  | "policy_created"
  | "policy_updated"
  | "policy_deleted"
  | "schedule_created"
  | "schedule_updated"
  | "unlock_approved"
  | "unlock_denied"
  | "emergency_approved"
  | "emergency_denied"
  | "reward_created"
  | "reward_claimed"
  | "study_goal_completed"
  | "screen_time_limit_reached"
  | "website_blocked"
  | "app_blocked"
  | "settings_changed"
  | "family_created"

export type ActivityActorType = "parent" | "child" | "device" | "system"

export interface IActivityLog extends Document {
  familyId: mongoose.Types.ObjectId
  childId?: mongoose.Types.ObjectId
  actorType: ActivityActorType
  actorId: string
  action: ActivityAction
  targetType?: string
  targetId?: string
  description: string
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    familyId: { type: Schema.Types.ObjectId, ref: "Family", required: true, index: true },
    childId: { type: Schema.Types.ObjectId, ref: "Child", index: true },
    actorType: { type: String, enum: ["parent", "child", "device", "system"], required: true },
    actorId: { type: String, required: true },
    action: { type: String, required: true },
    targetType: { type: String },
    targetId: { type: String },
    description: { type: String, required: true, trim: true },
    metadata: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

ActivityLogSchema.index({ familyId: 1, createdAt: -1 })
ActivityLogSchema.index({ childId: 1, createdAt: -1 })
ActivityLogSchema.index({ action: 1 })

const ActivityLog = (mongoose.models.ActivityLog as Model<IActivityLog>) ||
  mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema)

export default ActivityLog

