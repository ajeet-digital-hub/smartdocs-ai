import { ISubscription, SubscriptionPlan } from "@/models/Subscription";
import mongoose from "mongoose";

export interface CheckoutSession {
  id: string;
  url: string; // URL to redirect user for payment
}

export interface PaymentProvider {
  createCheckoutSession(
    userId: mongoose.Types.ObjectId,
    planId: SubscriptionPlan,
    billingCycle: "monthly" | "yearly",
    successUrl: string,
    cancelUrl: string
  ): Promise<CheckoutSession>;

  verifyPayment(payload: any, signature: string): Promise<{ success: boolean; subscriptionId?: string }>;

  handleWebhook(event: any): Promise<void>;

  cancelSubscription(subscriptionId: string): Promise<void>;
}