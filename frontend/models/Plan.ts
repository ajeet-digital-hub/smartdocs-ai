import mongoose, { Document, Model, Schema } from "mongoose";
import { FeatureId, PlanId } from "@/lib/subscription/plan-config";

export interface IPlan extends Document {
  name: PlanId;
  displayName: string;
  price: number; // in INR
  currency: string;
  billingCycle: "monthly" | "yearly";
  features: FeatureId[];
  storageLimitGB: number;
  aiCreditsMonthly: number;
  maxChatHistoryDays: number | 'unlimited';
  isActive: boolean;
  isPopular?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PlanSchema = new Schema<IPlan>(
  {
    name: { type: String, enum: ["free", "basic", "pro", "pro_plus", "enterprise"], required: true, unique: true },
    displayName: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: "INR" },
    billingCycle: { type: String, enum: ["monthly", "yearly"], required: true },
    features: [{ type: String, required: true }],
    storageLimitGB: { type: Number, required: true, min: 0 },
    aiCreditsMonthly: { type: Number, required: true, min: 0 },
    maxChatHistoryDays: { type: Schema.Types.Mixed, required: true }, // Number or 'unlimited'
    isActive: { type: Boolean, default: true },
    isPopular: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Plan: Model<IPlan> =
  (mongoose.models.Plan as Model<IPlan>) || mongoose.model<IPlan>("Plan", PlanSchema);

export default Plan;