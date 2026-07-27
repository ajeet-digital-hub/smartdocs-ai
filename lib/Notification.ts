import mongoose, { Document, Model, models, Schema } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  message: string;
  read: boolean;
  link?: string;
  type: 'security' | 'general';
}

const NotificationSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  link: { type: String },
  type: { type: String, enum: ['security', 'general'], default: 'general' },
}, { timestamps: true });

const Notification: Model<INotification> = models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;