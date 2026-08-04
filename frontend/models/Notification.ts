import mongoose, { Document, Model, Schema } from "mongoose"

export type NotificationType =
  | "unlock_request"
  | "emergency_request"
  | "study_goal_completed"
  | "device_offline"
  | "device_online"
  | "screen_time_limit"
  | "policy_violation"
  | "reward_earned"
  | "device_paired"
  | "system"

export type NotificationPriority = "low" | "normal" | "high" | "urgent"

export interface INotification extends Document {
  familyId: mongoose.Types.ObjectId
  childId?: mongoose.Types.ObjectId
  type: NotificationType
  title: string
  message: string
  priority: NotificationPriority
  read: boolean
  actionUrl?: string
  metadata?: Record<string, unknown>
  createdAt: Date
}

const NotificationSchema = new Schema<INotification>(
  {
    familyId: { type: Schema.Types.ObjectId, ref: "Family", required: true, index: true },
    childId: { type: Schema.Types.ObjectId, ref: "Child", index: true },
    type: {
      type: String,
      enum: [
        "unlock_request",
        "emergency_request",
        "study_goal_completed",
        "device_offline",
        "device_online",
        "screen_time_limit",
        "policy_violation",
        "reward_earned",
        "device_paired",
        "system",
      ],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    priority: { type: String, enum: ["low", "normal", "high", "urgent"], default: "normal" },
    read: { type: Boolean, default: false },
    actionUrl: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
)

NotificationSchema.index({ familyId: 1, read: 1, createdAt: -1 })

const Notification = (mongoose.models.Notification as Model<INotification>) ||
  mongoose.model<INotification>("Notification", NotificationSchema)

export default Notification

