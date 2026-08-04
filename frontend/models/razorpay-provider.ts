import { PaymentProvider, CheckoutSession, CreateOrderResponse } from "./payment-provider";
import { PlanId } from "@/lib/subscription/plan-config";
import mongoose from "mongoose";
import Razorpay from "razorpay";
import crypto from "crypto";

export class RazorpayProvider implements PaymentProvider {
  private razorpay: Razorpay;

  constructor() {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay credentials are not configured in environment variables.");
    }
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  async createOrder(
    userId: mongoose.Types.ObjectId,
    amount: number, // Amount in smallest currency unit (e.g., paise)
    currency: string
  ): Promise<CreateOrderResponse> {
    const options = {
      amount,
      currency,
      receipt: `receipt_user_${userId}_${Date.now()}`,
    };
    const order = await this.razorpay.orders.create(options);
    return {
      orderId: order.id,
      provider: "razorpay",
      keyId: process.env.RAZORPAY_KEY_ID!,
    };
  }

  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");
    return expectedSignature === signature;
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      console.error("RAZORPAY_WEBHOOK_SECRET is not set. Cannot verify webhook.");
      return false;
    }
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(payload)
      .digest("hex");
    return expectedSignature === signature;
  }

  async handleWebhook(event: any): Promise<void> { /* TODO */ }
  async cancelSubscription(subscriptionId: string): Promise<void> { /* TODO */ }
}