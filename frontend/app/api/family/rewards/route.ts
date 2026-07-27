import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import mongoose from "mongoose";
import Family from "@/models/Family";
import RewardGoal from "@/models/RewardGoal";
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

    const family = await Family.findOne({ parentId: session.user.id });
    if (!family) {
      return NextResponse.json({ ok: false, error: "Family not found" }, { status: 404 });
    }

    const rewards = await RewardGoal.find({ familyId: family._id })
      .populate("childId", "name age avatar")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ ok: true, rewards });
  } catch (error) {
    console.error("REWARDS GET ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to fetch rewards" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { childId, title, description, requiredMinutes, requiredTask, rewardType, rewardTarget, rewardDurationMinutes, startDate, endDate } = body;

    if (!childId || !title || !rewardType || !rewardDurationMinutes || !startDate) {
      return NextResponse.json({ ok: false, error: "Missing required fields: childId, title, rewardType, rewardDurationMinutes, startDate" }, { status: 400 });
    }

    if (mongoose.connection.readyState !== 1) {
      if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI not set");
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const family = await Family.findOne({ parentId: session.user.id });
    if (!family) {
      return NextResponse.json({ ok: false, error: "Family not found" }, { status: 404 });
    }

    const reward = await RewardGoal.create({
      childId,
      familyId: family._id,
      title,
      description,
      requiredMinutes,
      requiredTask,
      rewardType,
      rewardTarget,
      rewardDurationMinutes,
      remainingRewardMinutes: rewardDurationMinutes,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
    });

    return NextResponse.json({ ok: true, reward }, { status: 201 });
  } catch (error) {
    console.error("REWARDS POST ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to create reward" }, { status: 500 });
  }
}

