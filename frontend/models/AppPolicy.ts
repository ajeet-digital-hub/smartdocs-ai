import mongoose, { Schema, Document } from "mongoose";

export interface IScheduleBlock {
  startTime: string; // e.g., "09:00"
  endTime: string;   // e.g., "17:00"
  daysOfWeek: string[]; // e.g., ["mon", "tue", "wed"]
}

export interface IAppPolicy extends Document {
  childId: mongoose.Types.ObjectId;
  familyId: mongoose.Types.ObjectId;
  appId: string; // Unique identifier from the application catalog (e.g., "youtube")
  appName: string;
  appPackage?: string; // Primary Android package name (e.g., "com.google.android.youtube")
  appStoreId?: string; // Primary iOS App Store ID
  category: string; // e.g., "social", "gaming"
  icon?: string; // Emoji or URL
  status: "ALLOWED" | "LIMITED" | "SCHEDULED" | "BLOCKED";
  dailyLimitMinutes?: number; // null for unlimited, number for minutes
  scheduleBlocks: IScheduleBlock[];
  policyVersion: number; // Incremented on each change for device sync
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleBlockSchema: Schema = new Schema({
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  daysOfWeek: [{ type: String, enum: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"], required: true }],
}, { _id: false });

const AppPolicySchema: Schema = new Schema(
  {
    childId: { type: Schema.Types.ObjectId, ref: "Child", required: true },
    familyId: { type: Schema.Types.ObjectId, ref: "Family", required: true },
    appId: { type: String, required: true },
    appName: { type: String, required: true },
    appPackage: { type: String },
    appStoreId: { type: String },
    category: { type: String, required: true },
    icon: { type: String },
    status: { type: String, enum: ["ALLOWED", "LIMITED", "SCHEDULED", "BLOCKED"], default: "ALLOWED" },
    dailyLimitMinutes: { type: Number, min: 0 },
    scheduleBlocks: [ScheduleBlockSchema],
    policyVersion: { type: Number, default: 1 },
  },
  { timestamps: true }
);

AppPolicySchema.index({ childId: 1, appId: 1 }, { unique: true });

export default (mongoose.models.AppPolicy as mongoose.Model<IAppPolicy>) ||
  mongoose.model<IAppPolicy>("AppPolicy", AppPolicySchema);