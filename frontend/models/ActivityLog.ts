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

export type ActivitySeverity = "info" | "warning" | "critical";

export interface IActivityLog extends Document {
  familyId: mongoose.Types.ObjectId
  childId?: mongoose.Types.ObjectId
  actorType: ActivityActorType // e.g., "parent", "child", "device", "system"
  actorId: mongoose.Types.ObjectId | string // ID of the actor (User, Child, Device)
  action: ActivityAction
  targetType?: string
  targetId?: string
  description?: string // Made optional to match usage in some APIs
  severity: ActivitySeverity;
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
    actorId: { type: Schema.Types.Mixed, required: true }, // Can be ObjectId or string
    action: { type: String, required: true },
    targetType: { type: String },
    targetId: { type: String },
    description: { type: String, trim: true }, // Made optional to match interface
    severity: { type: String, enum: ["info", "warning", "critical"], default: "info" },
    metadata: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

ActivityLogSchema.index({ familyId: 1, createdAt: -1 });
ActivityLogSchema.index({ childId: 1, createdAt: -1 });
ActivityLogSchema.index({ action: 1 });

const ActivityLog = (mongoose.models.ActivityLog as Model<IActivityLog>) ||
  mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema)

export default ActivityLog
