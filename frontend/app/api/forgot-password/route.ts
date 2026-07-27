import { NextResponse } from "next/server";
import mongoose from "mongoose";
import crypto from "crypto";
import User from "@/models/User";
import { sendPasswordResetEmail } from "../../../../lib/mail";

// Use consistent response to prevent email enumeration
const GENERIC_RESPONSE = NextResponse.json({
  ok: true,
  message: "If an account with that email exists, a password reset link has been sent.",
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return GENERIC_RESPONSE;
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (mongoose.connection.readyState !== 1) {
      if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI not set");
      await mongoose.connect(process.env.MONGODB_URI, {
        dbName: process.env.MONGODB_DB_NAME || "smartdocs-ai",
      });
    }

    const user = await User.findOne({ email: normalizedEmail });

    // Always return the same response to prevent email enumeration
    if (!user) {
      return GENERIC_RESPONSE;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await User.findByIdAndUpdate(user._id, {
      $set: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      },
    });

    try {
      await sendPasswordResetEmail(normalizedEmail, resetToken);
    } catch (emailError) {
      console.error("FORGOT PASSWORD EMAIL ERROR:", emailError);
      // Still return success to prevent enumeration
    }

    return GENERIC_RESPONSE;
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return NextResponse.json({ ok: false, error: "An unexpected error occurred." }, { status: 500 });
  }
}

