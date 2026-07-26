import mongoose, { Schema, Document, Model, models } from "mongoose";

export interface IWebsitePolicy extends Document {
  childId: mongoose.Types.ObjectId;
  familyId: mongoose.Types.ObjectId;
  name: string;
  domain: string;
  category: "social" | "entertainment" | "gaming" | "education" | "news" | "shopping" | "other";
  icon?: string;
  isBlocked: boolean;
  dailyLimitMinutes?: number;
  scheduleBlocks: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
  createdAt: Date;
}

const WebsitePolicySchema = new Schema<IWebsitePolicy>(
  {
    childId: { type: Schema.Types.ObjectId, ref: "Child", required: true, index: true },
    familyId: { type: Schema.Types.ObjectId, ref: "Family", required: true, index: true },
    name: { type: String, required: true },
    domain: { type: String, required: true },
    category: {
      type: String,
      enum: ["social", "entertainment", "gaming", "education", "news", "shopping", "other"],
      required: true,
    },
    icon: String,
    isBlocked: { type: Boolean, default: false },
    dailyLimitMinutes: Number,
    scheduleBlocks: [
      {
        dayOfWeek: Number,
        startTime: String,
        endTime: String,
      },
    ],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

WebsitePolicySchema.index({ familyId: 1, childId: 1 });
WebsitePolicySchema.index({ childId: 1, domain: 1 });

const WebsitePolicy: Model<IWebsitePolicy> =
  (models.WebsitePolicy as Model<IWebsitePolicy>) ||
  mongoose.model<IWebsitePolicy>("WebsitePolicy", WebsitePolicySchema);

export default WebsitePolicy;

