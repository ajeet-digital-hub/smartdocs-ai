import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import mongoose from "mongoose";
import Family from "@/models/Family";
import WebsitePolicy from "@/models/WebsitePolicy";
import ActivityLog from "@/models/ActivityLog";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

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

    const allowedFields = ["name", "domain", "category", "icon", "isBlocked", "dailyLimitMinutes", "scheduleBlocks"];
    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = field === "domain" ? body[field].toLowerCase().trim() : body[field];
      }
    }

    const policy = await WebsitePolicy.findOneAndUpdate(
      { _id: params.id, familyId: family._id },
      { $set: updateData },
      { new: true }
    ).lean();

    if (!policy) {
      return NextResponse.json({ ok: false, error: "Website policy not found" }, { status: 404 });
    }

    await ActivityLog.create({
      familyId: family._id,
      parentId: session.user.id,
      action: "policy_updated",
      details: `Updated website policy: ${policy.name}`,
    });

    return NextResponse.json({ ok: true, policy });
  } catch (error) {
    console.error("WEBSITE POLICY PUT ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to update policy" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    if (mongoose.connection.readyState !== 1) {
      if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI not set");
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const family = await Family.findOne({ parentId: session.user.id });
    if (!family) {
      return NextResponse.json({ ok: false, error: "Family not found" }, { status: 404 });
    }

    const policy = await WebsitePolicy.findOneAndDelete({ _id: params.id, familyId: family._id }).lean();
    if (!policy) {
      return NextResponse.json({ ok: false, error: "Website policy not found" }, { status: 404 });
    }

    await ActivityLog.create({
      familyId: family._id,
      parentId: session.user.id,
      action: "policy_deleted",
      details: `Deleted website policy: ${policy.name}`,
    });

    return NextResponse.json({ ok: true, message: "Policy deleted" });
  } catch (error) {
    console.error("WEBSITE POLICY DELETE ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to delete policy" }, { status: 500 });
  }
}

