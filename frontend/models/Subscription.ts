import mongoose, { Document, Model, Schema } from "mongoose";
import { PlanId } from "@/lib/subscription/plan-config";

export type SubscriptionStatus = "ACTIVE" | "PENDING" | "EXPIRED" | "CANCELLED" | "TRIALING" | "PAST_DUE" | "GRACE_PERIOD";
export type PaymentGateway = "stripe" | "razorpay" | "none";

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  planId: PlanId;
  status: SubscriptionStatus;
  startDate: Date;
  expiryDate: Date;
  paymentStatus: string; // e.g., "paid", "failed", "refunded"
  paymentGateway: PaymentGateway;
  paymentCustomerId?: string; // ID from payment gateway
  paymentSubscriptionId?: string; // ID from payment gateway
  gracePeriodEnd?: Date; // For handling failed renewals
  paymentRetryCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true, unique: true },
    planId: { type: String, enum: ["free", "basic", "pro", "pro_plus", "enterprise"], required: true, index: true },
    status: { type: String, enum: ["ACTIVE", "PENDING", "EXPIRED", "CANCELLED", "TRIALING", "PAST_DUE"], default: "TRIALING" },
    startDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, required: true },
    paymentStatus: { type: String, default: "none" },
    paymentGateway: { type: String, enum: ["stripe", "razorpay", "none"], default: "none" },
    paymentCustomerId: { type: String },
    paymentSubscriptionId: { type: String },
    gracePeriodEnd: { type: Date },
    paymentRetryCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Subscription: Model<ISubscription> =
  (mongoose.models.Subscription as Model<ISubscription>) || mongoose.model<ISubscription>("Subscription", SubscriptionSchema);

export default Subscription;