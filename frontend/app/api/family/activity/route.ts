import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import mongoose from "mongoose";
import Family from "@/models/Family";
import ActivityLog from "@/models/ActivityLog";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const childId = searchParams.get("childId");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    if (mongoose.connection.readyState !== 1) {
      if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI not set");
      await mongoose.connect(process.env.MONGODB_URI, {
        dbName: process.env.MONGODB_DB_NAME || "smartdocs-ai",
      });
    }

    const family = await Family.findOne({ parentId: session.user.id });
    if (!family) {
      return NextResponse.json({ ok: false, error: "Family not found" }, { status: 404 });
    }

    const query: Record<string, unknown> = { familyId: family._id };
    if (childId) query.childId = childId;

    const logs = await ActivityLog.find(query)
      .populate("childId", "name age avatar")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ ok: true, logs });
  } catch (error) {
    console.error("ACTIVITY GET ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to fetch activity logs" }, { status: 500 });
  }
}

