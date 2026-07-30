import mongoose, { Document, Model, Schema } from "mongoose";
import { PaymentGateway, SubscriptionStatus } from "./Subscription";

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED" | "CANCELLED";

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  subscriptionId: mongoose.Types.ObjectId;
  provider: PaymentGateway;
  orderId: string; // Order ID from payment gateway
  paymentId?: string; // Payment ID from payment gateway (if successful)
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod?: string; // e.g., "card", "upi"
  transactionDetails?: Record<string, any>; // Raw details from payment gateway
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: "Subscription", required: true, index: true },
    provider: { type: String, enum: ["stripe", "razorpay", "none"], required: true },
    orderId: { type: String, required: true, index: true },
    paymentId: { type: String, unique: true, sparse: true }, // Unique for successful payments
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true },
    status: { type: String, enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED", "CANCELLED"], default: "PENDING" },
    paymentMethod: { type: String },
    transactionDetails: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

const Payment: Model<IPayment> = (mongoose.models.Payment as Model<IPayment>) || mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment;