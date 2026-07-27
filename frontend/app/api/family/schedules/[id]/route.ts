import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import mongoose from "mongoose";
import Family from "@/models/Family";
import Schedule from "@/models/Schedule";
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
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const family = await Family.findOne({ parentId: session.user.id });
    if (!family) {
      return NextResponse.json({ ok: false, error: "Family not found" }, { status: 404 });
    }

    const allowedFields = ["name", "type", "startTime", "endTime", "daysOfWeek", "timezone", "isActive", "websiteRules"];
    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const schedule = await Schedule.findOneAndUpdate(
      { _id: params.id, familyId: family._id },
      { $set: updateData },
      { new: true }
    ).lean();

    if (!schedule) {
      return NextResponse.json({ ok: false, error: "Schedule not found" }, { status: 404 });
    }

    await ActivityLog.create({
      familyId: family._id,
      parentId: session.user.id,
      action: "schedule_updated",
      details: `Updated schedule: ${schedule.name}`,
    });

    return NextResponse.json({ ok: true, schedule });
  } catch (error) {
    console.error("SCHEDULE PUT ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to update schedule" }, { status: 500 });
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

    const schedule = await Schedule.findOneAndDelete({ _id: params.id, familyId: family._id }).lean();
    if (!schedule) {
      return NextResponse.json({ ok: false, error: "Schedule not found" }, { status: 404 });
    }

    await ActivityLog.create({
      familyId: family._id,
      parentId: session.user.id,
      action: "schedule_deleted",
      details: `Deleted schedule: ${schedule.name}`,
    });

    return NextResponse.json({ ok: true, message: "Schedule deleted" });
  } catch (error) {
    console.error("SCHEDULE DELETE ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to delete schedule" }, { status: 500 });
  }
}

