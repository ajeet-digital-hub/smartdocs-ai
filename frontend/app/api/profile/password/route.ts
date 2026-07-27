import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "@/models/User";

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score += 1;
  if (!/(.)\1\1/.test(password)) score += 1;

  if (score <= 2) return { score, label: "Weak", color: "#E53E3E" };
  if (score <= 4) return { score, label: "Fair", color: "#DD6B20" };
  if (score <= 5) return { score, label: "Good", color: "#38A169" };
  return { score, label: "Strong", color: "#2B6CB0" };
}

function isValidPassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) return { valid: false, error: "Password must be at least 8 characters." };
  if (password.length > 128) return { valid: false, error: "Password is too long." };
  
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);
  const typeCount = [hasLowercase, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;
  
  if (typeCount < 3) return { valid: false, error: "Password must include at least 3 of: lowercase, uppercase, number, special character." };
  if (/(.)\1\1/.test(password)) return { valid: false, error: "Password must not contain three identical characters in a row." };
  
  return { valid: true };
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ ok: false, error: "Current password and new password are required." }, { status: 400 });
    }

    const validation = isValidPassword(newPassword);
    if (!validation.valid) {
      return NextResponse.json({ ok: false, error: validation.error }, { status: 400 });
    }

    if (mongoose.connection.readyState !== 1) {
      if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI not set");
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const user = await User.findById(session.user.id).select("+passwordHash");
    if (!user || !user.passwordHash) {
      return NextResponse.json({ ok: false, error: "Cannot change password for this account." }, { status: 400 });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ ok: false, error: "Current password is incorrect." }, { status: 400 });
    }

    const samePassword = await bcrypt.compare(newPassword, user.passwordHash);
    if (samePassword) {
      return NextResponse.json({ ok: false, error: "New password must be different from current password." }, { status: 400 });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(session.user.id, { $set: { passwordHash: newPasswordHash } });

    return NextResponse.json({ ok: true, message: "Your password has been changed successfully." });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to change password." }, { status: 500 });
  }
}

