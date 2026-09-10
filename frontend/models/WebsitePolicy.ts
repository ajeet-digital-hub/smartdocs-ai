import mongoose, { Document, Model, Schema } from "mongoose";

export interface IScheduleBlock {
  startTime: string;
  endTime: string;
  daysOfWeek: string[];
}

export interface IWebsitePolicy extends Document {
  childId: mongoose.Types.ObjectId;
  familyId: mongoose.Types.ObjectId;
  name: string;
  domain: string;
  category: string;
  icon?: string;
  isBlocked: boolean;
  dailyLimitMinutes?: number;
  scheduleBlocks: IScheduleBlock[];
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleBlockSchema = new Schema<IScheduleBlock>(
  {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    daysOfWeek: [{ type: String, enum: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] }],
  },
  { _id: false }
);

const WebsitePolicySchema = new Schema<IWebsitePolicy>(
  {
    childId: { type: Schema.Types.ObjectId, ref: "Child", required: true, index: true },
    familyId: { type: Schema.Types.ObjectId, ref: "Family", required: true, index: true },
    name: { type: String, required: true, trim: true },
    domain: { type: String, required: true, trim: true, lowercase: true },
    category: { type: String, required: true },
    icon: { type: String },
    isBlocked: { type: Boolean, default: false },
    dailyLimitMinutes: { type: Number },
    scheduleBlocks: [ScheduleBlockSchema],
  },
  { timestamps: true }
);

WebsitePolicySchema.index({ childId: 1, domain: 1 }, { unique: true });
WebsitePolicySchema.index({ familyId: 1, isBlocked: 1 });

const WebsitePolicy: Model<IWebsitePolicy> =
  (mongoose.models.WebsitePolicy as Model<IWebsitePolicy>) ||
  mongoose.model<IWebsitePolicy>("WebsitePolicy", WebsitePolicySchema);

export default WebsitePolicy;

