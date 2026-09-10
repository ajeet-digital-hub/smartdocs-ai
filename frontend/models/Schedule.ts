import mongoose, { Document, Model, Schema } from "mongoose";

export interface IWebsiteRule {
  websiteId: mongoose.Types.ObjectId;
  action: "block" | "allow" | "limit";
  dailyLimitMinutes?: number;
}

export interface ISchedule extends Document {
  childId: mongoose.Types.ObjectId;
  familyId: mongoose.Types.ObjectId;
  name: string;
  type: "study" | "sleep" | "school" | "free" | "custom";
  startTime: string;
  endTime: string;
  daysOfWeek: string[];
  timezone: string;
  isActive: boolean;
  websiteRules: IWebsiteRule[];
  createdAt: Date;
  updatedAt: Date;
}

const WebsiteRuleSchema = new Schema<IWebsiteRule>(
  {
    websiteId: { type: Schema.Types.ObjectId, ref: "WebsitePolicy" },
    action: { type: String, enum: ["block", "allow", "limit"], required: true },
    dailyLimitMinutes: { type: Number },
  },
  { _id: false }
);

const ScheduleSchema = new Schema<ISchedule>(
  {
    childId: { type: Schema.Types.ObjectId, ref: "Child", required: true, index: true },
    familyId: { type: Schema.Types.ObjectId, ref: "Family", required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["study", "sleep", "school", "free", "custom"], required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    daysOfWeek: [{ type: String, enum: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] }],
    timezone: { type: String, default: "UTC" },
    isActive: { type: Boolean, default: true },
    websiteRules: [WebsiteRuleSchema],
  },
  { timestamps: true }
);

ScheduleSchema.index({ familyId: 1, isActive: 1 });

const Schedule: Model<ISchedule> =
  (mongoose.models.Schedule as Model<ISchedule>) ||
  mongoose.model<ISchedule>("Schedule", ScheduleSchema);

export default Schedule;

