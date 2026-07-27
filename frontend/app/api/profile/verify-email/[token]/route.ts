import { NextResponse } from "next/server";
import mongoose from "mongoose";
import User from "@/models/User";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    
    if (!token) {
      // Redirect to a page showing error
      return NextResponse.redirect(new URL("/dashboard?verify=invalid", request.url));
    }

    if (mongoose.connection.readyState !== 1) {
      if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI not set");
      await mongoose.connect(process.env.MONGODB_URI, {
        dbName: process.env.MONGODB_DB_NAME || "smartdocs-ai",
      });
    }

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return NextResponse.redirect(new URL("/dashboard?verify=invalid", request.url));
    }

    await User.findByIdAndUpdate(user._id, {
      $set: { emailVerified: new Date() },
      $unset: { verificationToken: "" },
    });

    return NextResponse.redirect(new URL("/dashboard?verify=success", request.url));
  } catch (error) {
    console.error("VERIFY EMAIL TOKEN ERROR:", error);
    return NextResponse.redirect(new URL("/dashboard?verify=error", request.url));
  }
}

