import Subscription, { ISubscription, SubscriptionStatus } from "@/models/Subscription";
import { PlanId } from "@/lib/plan-config";
import User from "@/models/User";
import mongoose from "mongoose";

export async function activateSubscription(userId: mongoose.Types.ObjectId, planId: PlanId, paymentDetails: any): Promise<ISubscription> {
  // In a real scenario, this would involve creating a subscription with the payment gateway
  // and then updating our database.

  const newSubscription = await Subscription.create({
    userId,
    planId,
    status: "ACTIVE",
    startDate: new Date(),
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    // ... other payment details
  });
  await User.findByIdAndUpdate(userId, { currentSubscription: newSubscription._id, subscriptionStatus: "ACTIVE", planExpiry: newSubscription.expiryDate });
  return newSubscription;
}

// TODO: Implement cancelSubscription, upgradeSubscription, downgradeSubscription
