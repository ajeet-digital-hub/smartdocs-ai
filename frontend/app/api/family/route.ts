import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import mongoose from "mongoose";
import Family from "@/models/Family";
import Child from "@/models/Child";
import ActivityLog from "@/models/ActivityLog";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    if (mongoose.connection.readyState !== 1) {
      if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI not set");
      await mongoose.connect(process.env.MONGODB_URI, {
        dbName: process.env.MONGODB_DB_NAME || "smartdocs-ai",
      });
    }

    let family = await Family.findOne({ parentId: session.user.id }).lean();
    
    // Auto-create family if it doesn't exist
    if (!family) {
      const newFamily = await Family.create({ parentId: session.user.id, name: "My Family" });
      family = newFamily.toObject();
    }

    const children = await Child.find({ familyId: family._id }).sort({ name: 1 }).lean();

    return NextResponse.json({ ok: true, family, children });
  } catch (error) {
    console.error("FAMILY GET ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to fetch family" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length < 1) {
      return NextResponse.json({ ok: false, error: "Family name is required" }, { status: 400 });
    }

    if (mongoose.connection.readyState !== 1) {
      if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI not set");
      await mongoose.connect(process.env.MONGODB_URI, {
        dbName: process.env.MONGODB_DB_NAME || "smartdocs-ai",
      });
    }

    const family = await Family.findOneAndUpdate(
      { parentId: session.user.id },
      { $set: { name: name.trim() } },
      { new: true, upsert: true }
    ).lean();

    return NextResponse.json({ ok: true, family });
  } catch (error) {
    console.error("FAMILY PUT ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to update family" }, { status: 500 });
  }
}

