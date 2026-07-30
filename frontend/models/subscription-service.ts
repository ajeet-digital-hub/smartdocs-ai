import Subscription, { ISubscription, SubscriptionPlan, SubscriptionStatus } from "@/models/Subscription";
import User from "@/models/User";
import mongoose from "mongoose";
import { getPlan } from "./plan-config";

/**
 * Creates a pending subscription record when a user initiates a checkout.
 * This record is later activated by a payment webhook.
 */
export async function createPendingSubscription(userId: mongoose.Types.ObjectId, planId: SubscriptionPlan): Promise<ISubscription> {
  const plan = getPlan(planId);
  if (!plan) throw new Error("Invalid plan ID");

  const expiryDate = new Date();
  if (plan.billingCycle === 'monthly') {
    expiryDate.setMonth(expiryDate.getMonth() + 1);
  } else {
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  }

  // Upsert to handle cases where user retries checkout
  const subscription = await Subscription.findOneAndUpdate(
    { userId, status: "PENDING" },
    {
      userId,
      planId,
      status: "PENDING",
      startDate: new Date(),
      expiryDate,
      paymentStatus: "pending",
    },
    { upsert: true, new: true }
  );
  return subscription;
}

/**
 * Activates a subscription upon successful payment confirmation from a webhook.
 */
export async function activateSubscription(paymentSubscriptionId: string, paymentCustomerId: string, paymentGateway: 'stripe' | 'razorpay'): Promise<ISubscription | null> {
  // Find the subscription based on the ID from the payment provider
  const subscription = await Subscription.findOneAndUpdate(
    { paymentSubscriptionId }, // Or find by a temporary checkout session ID
    {
      status: "ACTIVE",
      paymentStatus: "paid",
      paymentCustomerId,
      paymentGateway,
    },
    { new: true }
  );

  if (subscription) {
    await User.findByIdAndUpdate(subscription.userId, {
      currentSubscription: subscription._id,
      subscriptionStatus: "ACTIVE",
      planExpiry: subscription.expiryDate,
    });
  }
  return subscription;
}

export async function cancelSubscription(userId: mongoose.Types.ObjectId): Promise<void> {
  // 1. Call payment provider to cancel the subscription at period end.
  // 2. Update our local subscription status to 'CANCELLED'.
  const subscription = await Subscription.findOneAndUpdate(
    { userId, status: "ACTIVE" },
    { status: "CANCELLED" }
  );
  if (subscription) {
    await User.findByIdAndUpdate(userId, { subscriptionStatus: "CANCELLED" });
  }
}

// TODO: Implement handleSubscriptionRenewal, handlePaymentFailure, etc.