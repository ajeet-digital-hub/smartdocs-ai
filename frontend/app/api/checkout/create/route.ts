import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { getPlan } from "@/lib/plan-config";
import { createPendingSubscription } from "@/models/subscription-service";
import { RazorpayProvider } from "@/models/razorpay-provider";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL("/login?callbackUrl=/pricing", req.url));
    }

    const { searchParams } = new URL(req.url);
    const planId = searchParams.get("planId");
    const userId = searchParams.get("userId");

    if (!planId || !userId) {
      return NextResponse.redirect(new URL("/pricing?error=invalid-params", req.url));
    }

    const plan = getPlan(planId as any);
    if (!plan) {
      return NextResponse.redirect(new URL("/pricing?error=invalid-plan", req.url));
    }

    if (plan.price === 0) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    await dbConnect();

    // Create pending subscription
    const pendingSub = await createPendingSubscription(
      new mongoose.Types.ObjectId(userId),
      planId as any
    );

    // Create Razorpay order
    const razorpay = new RazorpayProvider();
    const amountInPaise = plan.price * 100; // Convert INR to paise
    const order = await razorpay.createOrder(
      new mongoose.Types.ObjectId(userId),
      amountInPaise,
      "INR"
    );

    // Redirect to checkout page with order details
    const checkoutUrl = new URL("/checkout", req.url);
    checkoutUrl.searchParams.set("orderId", order.orderId);
    checkoutUrl.searchParams.set("planId", planId);
    checkoutUrl.searchParams.set("amount", plan.price.toString());
    checkoutUrl.searchParams.set("keyId", order.keyId);
    checkoutUrl.searchParams.set("subscriptionId", pendingSub._id?.toString() || "");

    return NextResponse.redirect(checkoutUrl);
  } catch (error) {
    console.error("Checkout creation error:", error);
    return NextResponse.redirect(new URL("/pricing?error=checkout-failed", req.url));
  }
}
