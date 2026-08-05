import mongoose from "mongoose";
import User from "@/models/User";
import Subscription from "@/models/Subscription";
import AICreditUsage from "@/models/AICreditUsage";
import { getPlanLimits, PlanId } from "@/lib/plan-config";

export class InsufficientCreditsError extends Error {
  public readonly code = "INSUFFICIENT_CREDITS";
  public availableCredits: number;

  constructor(message: string, availableCredits = 0) {
    super(message);
    this.name = "InsufficientCreditsError";
    this.availableCredits = availableCredits;
  }
}

/**
 * Safely deducts AI credits from a user's account within a transaction.
 * It prioritizes purchased credits (rechargeCredits) before using monthly plan credits.
 *
 * @param userId - The ID of the user.
 * @param creditsToDeduct - The number of credits to deduct.
 * @param feature - A label for the feature consuming the credits.
 * @throws {InsufficientCreditsError} if the user does not have enough credits.
 * @throws {Error} for other database or configuration errors.
 */
export async function deductCredits(userId: string, creditsToDeduct: number, feature: string): Promise<void> {
  if (creditsToDeduct <= 0) return;

  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  try {
    // 1. Get user, subscription, and current usage within the transaction for consistency.
    const user = await User.findById(userId).session(dbSession);
    if (!user) throw new Error("User not found.");

const subscription = await Subscription.findOne({ userId, status: "ACTIVE" }).session(dbSession);
const planLimits = getPlanLimits((subscription?.planId ?? "free") as PlanId);

    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);

    const usage = await AICreditUsage.aggregate(
      [{ $match: { userId, createdAt: { $gte: monthStart } } }],
      { $group: { _id: null, credits: { $sum: "$creditsUsed" } } }
    ).session(dbSession); // This makes the read part of the transaction
    const monthlyUsed = usage[0]?.credits ?? 0;

const monthlyRemaining = Math.max(0, (planLimits.aiCreditsMonthly ?? 0) - monthlyUsed);
    const purchasedRemaining = Math.max(0, (user.rechargeCredits ?? 0) - (user.rechargeCreditsUsed ?? 0));
    const available = monthlyRemaining + purchasedRemaining;

    if (available < creditsToDeduct) {
      throw new InsufficientCreditsError("You do not have enough AI credits.", available);
    }

    // 2. Deduct credits: purchased first, then monthly.
    const fromPurchased = Math.min(purchasedRemaining, creditsToDeduct);
    const fromMonthly = creditsToDeduct - fromPurchased;

    if (fromPurchased > 0) {
      user.rechargeCreditsUsed = (user.rechargeCreditsUsed ?? 0) + fromPurchased;
      await user.save({ session: dbSession });
    }
if (fromMonthly > 0) {
      await AICreditUsage.create([{ userId, feature: feature as any, creditsUsed: fromMonthly }], { session: dbSession });
    }

    await dbSession.commitTransaction();
  } catch (error) {
    await dbSession.abortTransaction();
    throw error; // Re-throw the original error (could be InsufficientCreditsError or something else)
  } finally {
    dbSession.endSession();
  }
}