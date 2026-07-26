import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import mongoose from "mongoose";
import User from "@/models/User";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return NextResponse.json({ ok: false, error: "No file uploaded" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { ok: false, error: "Invalid file type. Allowed: JPEG, PNG, WebP" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { ok: false, error: "File too large. Maximum size is 5MB" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const ext = path.extname(file.name) || ".jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "profile");

    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });

    // Write file
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const relativePath = `/uploads/profile/${filename}`;

    // Update user record
    if (mongoose.connection.readyState !== 1) {
      if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI not set");
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    // Delete old avatar if exists
    if (user.image && user.image.startsWith("/uploads/")) {
      try {
        await unlink(path.join(process.cwd(), "public", user.image));
      } catch {
        // File may not exist, ignore
      }
    }

    // Update user with new image path
    await User.findByIdAndUpdate(session.user.id, {
      $set: { image: relativePath },
    });

    return NextResponse.json({
      ok: true,
      photoUrl: relativePath,
    });
  } catch (error) {
    console.error("AVATAR UPLOAD ERROR:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to upload avatar" },
      { status: 500 }
    );
  }
}

