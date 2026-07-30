import { ISubscription, SubscriptionStatus } from "@/models/Subscription";
import mongoose from "mongoose";

const validTransitions: Record<SubscriptionStatus, SubscriptionStatus[]> = {
  TRIALING: ["ACTIVE", "EXPIRED"],
  PENDING: ["ACTIVE", "CANCELLED"],
  ACTIVE: ["CANCELLED", "PAST_DUE", "EXPIRED"],
  PAST_DUE: ["ACTIVE", "EXPIRED"],
  CANCELLED: ["EXPIRED"],
  EXPIRED: [],
  GRACE_PERIOD: ["ACTIVE", "EXPIRED"],
};

interface TransitionOptions {
  session: mongoose.ClientSession;
  paymentStatus?: string;
  paymentGateway?: "stripe" | "razorpay" | "none";
  paymentCustomerId?: string;
  paymentSubscriptionId?: string;
}

export async function transitionSubscriptionState(
  subscription: ISubscription,
  newState: SubscriptionStatus,
  options: Partial<TransitionOptions> = {}
): Promise<ISubscription> {
  const currentState = subscription.status;

  if (!validTransitions[currentState]?.includes(newState)) {
    const errorMsg = `Invalid subscription transition from ${currentState} to ${newState}.`;
    console.error("INVALID_SUBSCRIPTION_TRANSITION", {
      subscriptionId: subscription._id.toString(),
      userId: subscription.userId.toString(),
      from: currentState,
      to: newState,
    });
    throw new Error(errorMsg);
  }

  subscription.status = newState;

  // Apply additional updates based on the new state
  if (newState === "ACTIVE") {
    subscription.paymentStatus = options.paymentStatus || "paid";
    if (options.paymentGateway) subscription.paymentGateway = options.paymentGateway;
    if (options.paymentCustomerId) subscription.paymentCustomerId = options.paymentCustomerId;
    if (options.paymentSubscriptionId) subscription.paymentSubscriptionId = options.paymentSubscriptionId;
  } else if (newState === "CANCELLED") {
    // The subscription will expire at the end of the current period.
    // No immediate change to expiryDate is needed.
  }

  return subscription.save({ session: options.session });
}