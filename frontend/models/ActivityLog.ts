import mongoose, { Document, Model, Schema } from "mongoose";

export type ActivityAction =
  | "child_created"
  | "child_updated"
  | "child_deleted"
  | "schedule_created"
  | "schedule_updated"
  | "schedule_deleted"
  | "policy_created"
  | "policy_updated"
  | "policy_deleted"
  | "unlock_requested"
  | "unlock_approved"
  | "unlock_denied"
  | "unlock_emergency"
  | "reward_created"
  | "reward_completed"
  | "reward_expired"
  | "study_goal_updated"
  | "streak_updated"
  | "emergency_access_granted"
  | "emergency_access_denied"
  | "settings_updated";

export interface IActivityLog extends Document {
  familyId: mongoose.Types.ObjectId;
  childId?: mongoose.Types.ObjectId;
  parentId: mongoose.Types.ObjectId;
  action: ActivityAction;
  details: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    familyId: { type: Schema.Types.ObjectId, ref: "Family", required: true, index: true },
    childId: { type: Schema.Types.ObjectId, ref: "Child" },
    parentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    action: {
      type: String,
      enum: [
        "child_created", "child_updated", "child_deleted",
        "schedule_created", "schedule_updated", "schedule_deleted",
        "policy_created", "policy_updated", "policy_deleted",
        "unlock_requested", "unlock_approved", "unlock_denied", "unlock_emergency",
        "reward_created", "reward_completed", "reward_expired",
        "study_goal_updated", "streak_updated",
        "emergency_access_granted", "emergency_access_denied",
        "settings_updated",
      ],
      required: true,
    },
    details: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ActivityLogSchema.index({ familyId: 1, createdAt: -1 });
ActivityLogSchema.index({ childId: 1, createdAt: -1 });

const ActivityLog: Model<IActivityLog> =
  (mongoose.models.ActivityLog as Model<IActivityLog>) ||
  mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);

export default ActivityLog;

