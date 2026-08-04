import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import Subscription from "@/models/Subscription";
import User from "@/models/User";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, paymentId, signature, planId, subscriptionId, simulated } = body;

    if (!planId) {
      return NextResponse.json({ ok: false, error: "Missing planId" }, { status: 400 });
    }

    await dbConnect();

    // For simulated payments (demo mode), activate directly
    if (simulated) {
      const sub = await Subscription.findOneAndUpdate(
        { _id: subscriptionId || new mongoose.Types.ObjectId(), userId: session.user.id },
        {
          status: "ACTIVE",
          paymentStatus: "paid",
          paymentGateway: "razorpay",
          paymentId: paymentId || `sim_${Date.now()}`,
        },
        { new: true }
      );

      if (sub) {
        await User.findByIdAndUpdate(session.user.id, {
          subscriptionStatus: "ACTIVE",
          planExpiry: sub.expiryDate,
        });
      }

      return NextResponse.json({
        ok: true,
        subscription: sub,
        message: "Subscription activated successfully",
      });
    }

    // Verify Razorpay payment signature
    const crypto = await import("crypto");
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ ok: false, error: "Invalid payment signature" }, { status: 400 });
    }

    // Find and activate subscription
    const sub = await Subscription.findOneAndUpdate(
      { userId: session.user.id, status: "PENDING" },
      {
        status: "ACTIVE",
        paymentStatus: "paid",
        paymentGateway: "razorpay",
        paymentSubscriptionId: orderId,
      },
      { new: true }
    );

    if (sub) {
      await User.findByIdAndUpdate(session.user.id, {
        currentSubscription: sub._id,
        subscriptionStatus: "ACTIVE",
        planExpiry: sub.expiryDate,
      });
    }

    return NextResponse.json({
      ok: true,
      subscription: sub,
      message: "Subscription activated successfully",
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ ok: false, error: "Verification failed" }, { status: 500 });
  }
}
