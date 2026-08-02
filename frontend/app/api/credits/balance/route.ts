import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import Subscription from "@/models/Subscription";
import User from "@/models/User";
import AICreditUsage from "@/models/AICreditUsage";
import { getPlan, PlanId } from "@/lib/plan-config";
import { calculateCreditBalance, CreditBalance } from "@/lib/credit-balance";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(session.user.id).select("rechargeCredits rechargeCreditsUsed currentSubscription");
    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    // Determine active plan
    let planId: PlanId = "free";
    if (user.currentSubscription) {
      const sub = await Subscription.findById(user.currentSubscription).select("planId status");
      if (sub && sub.status === "ACTIVE") {
        planId = sub.planId as PlanId;
      }
    }
    const plan = getPlan(planId);

    // Calculate monthly usage
    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);
    const usage = await AICreditUsage.aggregate([
      { $match: { userId: session.user.id, createdAt: { $gte: monthStart } } },
      { $group: { _id: null, credits: { $sum: "$creditsUsed" } } },
    ]);
    const monthlyUsed = usage[0]?.credits ?? 0;

    const rechargeCredits = user.rechargeCredits ?? 0;
    const rechargeUsed = user.rechargeCreditsUsed ?? 0;

    const balance: CreditBalance = calculateCreditBalance(planId, monthlyUsed, rechargeCredits, rechargeUsed);

    return NextResponse.json({
      ok: true,
      balance,
      planId,
      planName: plan?.name ?? "Free",
      monthlyLimit: plan?.limits.aiCreditsMonthly ?? 0,
      rechargeCredits,
      rechargeCreditsUsed: rechargeUsed,
    });
  } catch (error) {
    console.error("CREDIT BALANCE ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to fetch credit balance" }, { status: 500 });
  }
}
