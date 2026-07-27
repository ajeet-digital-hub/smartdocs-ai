import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import mongoose from "mongoose";
import Family from "@/models/Family";
import Schedule from "@/models/Schedule";

export async function GET() {
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

    const schedules = await Schedule.find({ familyId: family._id })
      .populate("websiteRules.websiteId")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ ok: true, schedules });
  } catch (error) {
    console.error("SCHEDULES GET ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to fetch schedules" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { childId, name, type, startTime, endTime, daysOfWeek, timezone, isActive, websiteRules } = body;

    if (!childId || !name || !type || !startTime || !endTime || !daysOfWeek) {
      return NextResponse.json({ ok: false, error: "Missing required fields: childId, name, type, startTime, endTime, daysOfWeek" }, { status: 400 });
    }

    if (mongoose.connection.readyState !== 1) {
      if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI not set");
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const family = await Family.findOne({ parentId: session.user.id });
    if (!family) {
      return NextResponse.json({ ok: false, error: "Family not found" }, { status: 404 });
    }

    const schedule = await Schedule.create({
      childId,
      familyId: family._id,
      name,
      type,
      startTime,
      endTime,
      daysOfWeek,
      timezone: timezone || "UTC",
      isActive: isActive !== undefined ? isActive : true,
      websiteRules: websiteRules || [],
    });

    return NextResponse.json({ ok: true, schedule }, { status: 201 });
  } catch (error) {
    console.error("SCHEDULES POST ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to create schedule" }, { status: 500 });
  }
}

