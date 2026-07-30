import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import Subscription from "@/models/Subscription";
import User from "@/models/User";
import { getPlan, PLANS } from "@/lib/plan-config";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Find the user's active subscription
    const user = await User.findById(session.user.id).select("currentSubscription subscriptionStatus planExpiry");
    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    // If user has a current subscription reference, fetch it
    let subscription = null;
    if (user.currentSubscription) {
      subscription = await Subscription.findById(user.currentSubscription);
    }

    // If no subscription found, return default free plan info
    if (!subscription) {
      const freePlan = getPlan("free");
      return NextResponse.json({
        ok: true,
        subscription: null,
        currentPlan: {
          id: "free",
          name: "Free",
          price: 0,
          ...freePlan,
        },
        status: user.subscriptionStatus || "ACTIVE",
        expiry: user.planExpiry || null,
      });
    }

    const plan = getPlan(subscription.planId as any);

    return NextResponse.json({
      ok: true,
      subscription,
      currentPlan: {
        id: subscription.planId,
        ...plan,
      },
      status: subscription.status,
      expiry: subscription.expiryDate,
    });
  } catch (error) {
    console.error("Subscription fetch error:", error);
    return NextResponse.json({ ok: false, error: "Failed to fetch subscription" }, { status: 500 });
  }
}
