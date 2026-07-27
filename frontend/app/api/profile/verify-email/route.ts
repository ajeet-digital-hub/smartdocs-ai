import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import mongoose from "mongoose";
import crypto from "crypto";
import User from "@/models/User";
import sgMail from "@sendgrid/mail";

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    if (mongoose.connection.readyState !== 1) {
      if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI not set");
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const user = await User.findById(session.user.id);
    if (!user || !user.email) {
      return NextResponse.json({ ok: false, error: "No email associated with this account." }, { status: 400 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ ok: false, error: "Email is already verified." }, { status: 400 });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    await User.findByIdAndUpdate(session.user.id, { $set: { verificationToken } });

    if (!process.env.SENDGRID_API_KEY) {
      // In development, return the token for testing
      return NextResponse.json({
        ok: true,
        message: "Verification email sent.",
        ...(process.env.NODE_ENV === "development" ? { verificationToken } : {}),
      });
    }

    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/profile/verify-email/${verificationToken}`;
    
    await sgMail.send({
      to: user.email,
      from: "support@smartdocs.ai",
      subject: "Verify your SmartDocs AI email",
      html: `
        <p>Please click the link below to verify your email address:</p>
        <a href="${verifyUrl}">${verifyUrl}</a>
        <p>This link will expire in 24 hours.</p>
      `,
    });

    return NextResponse.json({ ok: true, message: "Verification email sent." });
  } catch (error) {
    console.error("VERIFY EMAIL ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to send verification email." }, { status: 500 });
  }
}

