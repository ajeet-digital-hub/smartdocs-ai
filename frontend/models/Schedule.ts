import mongoose, { Schema, Document, Model, models } from "mongoose";

export interface ISchedule extends Document {
  familyId: mongoose.Types.ObjectId;
  childId: mongoose.Types.ObjectId;
  name: string;
  type: "screen_time" | "study_time" | "custom";
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
  timezone: string;
  isActive: boolean;
  websiteRules?: {
    websiteId: mongoose.Types.ObjectId;
    action: "block" | "allow";
  }[];
  createdAt: Date;
}

const ScheduleSchema = new Schema<ISchedule>(
  {
    familyId: { type: Schema.Types.ObjectId, ref: "Family", required: true, index: true },
    childId: { type: Schema.Types.ObjectId, ref: "Child", required: true, index: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["screen_time", "study_time", "custom"],
      required: true,
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    daysOfWeek: { type: [Number], required: true },
    timezone: { type: String, default: "UTC" },
    isActive: { type: Boolean, default: true },
    websiteRules: [
      {
        websiteId: { type: Schema.Types.ObjectId, ref: "WebsitePolicy" },
        action: { type: String, enum: ["block", "allow"] },
      },
    ],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Schedule: Model<ISchedule> =
  (models.Schedule as Model<ISchedule>) ||
  mongoose.model<ISchedule>("Schedule", ScheduleSchema);

export default Schedule;

