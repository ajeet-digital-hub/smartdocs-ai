import { ISubscription, PlanId } from "@/models/Subscription";
import mongoose from "mongoose";

export interface CreateOrderResponse {
  orderId: string;
  provider: "stripe" | "razorpay";
  keyId: string; // Public key for the payment gateway
}

export interface PaymentProvider {
  createOrder(
    userId: mongoose.Types.ObjectId,
    amount: number, // in smallest currency unit (e.g., paise)
    currency: string,
    receiptId: string,
    notes?: Record<string, string>
  ): Promise<CreateOrderResponse>;

  verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean;

  verifyWebhookSignature(payload: string, signature: string): boolean;

  handleWebhook(event: any): Promise<void>;

  cancelSubscription(subscriptionId: string): Promise<void>;
}