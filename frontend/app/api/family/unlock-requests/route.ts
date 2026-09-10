import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import mongoose from "mongoose";
import Family from "@/models/Family";
import UnlockRequest from "@/models/UnlockRequest";

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

    const family = await Family.findOne({ parentId: session.user.id });
    if (!family) {
      return NextResponse.json({ ok: false, error: "Family not found" }, { status: 404 });
    }

    const requests = await UnlockRequest.find({ familyId: family._id })
      .populate("childId", "name age avatar")
      .populate("websiteId", "name domain")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const pendingCount = requests.filter((r) => r.status === "pending").length;

    return NextResponse.json({ ok: true, requests, pendingCount });
  } catch (error) {
    console.error("UNLOCK REQUESTS GET ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to fetch unlock requests" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { childId, websiteName, websiteDomain, reason, type, websiteId } = body;

    if (!childId || !websiteName || !websiteDomain || !reason) {
      return NextResponse.json({ ok: false, error: "Missing required fields: childId, websiteName, websiteDomain, reason" }, { status: 400 });
    }

    if (mongoose.connection.readyState !== 1) {
      if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI not set");
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const family = await Family.findOne({ parentId: session.user.id });
    if (!family) {
      return NextResponse.json({ ok: false, error: "Family not found" }, { status: 404 });
    }

    const unlockRequest = await UnlockRequest.create({
      childId,
      familyId: family._id,
      parentId: session.user.id,
      websiteId,
      websiteName,
      websiteDomain,
      reason,
      type: type || "normal",
    });

    return NextResponse.json({ ok: true, unlockRequest }, { status: 201 });
  } catch (error) {
    console.error("UNLOCK REQUESTS POST ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to create unlock request" }, { status: 500 });
  }
}

