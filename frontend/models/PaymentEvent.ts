import mongoose, { Document, Model, Schema } from "mongoose";
import { PaymentGateway } from "./Subscription";

export interface IPaymentEvent extends Document {
  provider: PaymentGateway;
  eventId: string; // Unique ID from the payment provider for the event
  eventType: string; // e.g., "payment.captured", "subscription.created"
  payload: Record<string, any>; // Raw event payload
  payloadHash: string; // Hash of the payload for integrity check
  processed: boolean;
  processedAt?: Date;
  createdAt: Date;
}

const PaymentEventSchema = new Schema<IPaymentEvent>(
  {
    provider: { type: String, enum: ["stripe", "razorpay", "none"], required: true },
    eventId: { type: String, required: true },
    eventType: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, required: true },
    payloadHash: { type: String, required: true },
    processed: { type: Boolean, default: false },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

PaymentEventSchema.index({ provider: 1, eventId: 1 }, { unique: true });

const PaymentEvent: Model<IPaymentEvent> = (mongoose.models.PaymentEvent as Model<IPaymentEvent>) || mongoose.model<IPaymentEvent>("PaymentEvent", PaymentEventSchema);

export default PaymentEvent;