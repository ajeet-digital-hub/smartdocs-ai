import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import Family from "@/models/Family";
import RewardGoal from "@/models/RewardGoal";
import ActivityLog from "@/models/ActivityLog";
import mongoose from "mongoose";

async function ensureFamily(userId: string) {
  let family = await Family.findOne({ parentId: new mongoose.Types.ObjectId(userId) });
  if (!family) {
    family = await Family.create({ parentId: new mongoose.Types.ObjectId(userId), name: "My Family" });
  }
  return family;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const family = await ensureFamily(session.user.id);
    if (!family) {
      return NextResponse.json({ ok: false, error: "Family not found" }, { status: 404 });
    }

    const rewards = await RewardGoal.find({ familyId: family._id })
      .populate("childId", "name age avatar")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ ok: true, rewards });
  } catch (error: any) {
    console.error("REWARDS GET ERROR:", { message: error.message, stack: error.stack });
    return NextResponse.json({ ok: false, error: "Failed to fetch rewards" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { childId, title, description, requiredMinutes, requiredTask, rewardType, rewardTarget, rewardDurationMinutes, startDate, endDate } = body;

    if (!childId || !title || !rewardType || !rewardDurationMinutes || !startDate) {
      return NextResponse.json({ ok: false, error: "Missing required fields: childId, title, rewardType, rewardDurationMinutes, startDate" }, { status: 400 });
    }

    const family = await ensureFamily(session.user.id);
    if (!family) {
      return NextResponse.json({ ok: false, error: "Family not found" }, { status: 404 });
    }

    const reward = await RewardGoal.create({
      childId, familyId: family._id, title, description, requiredMinutes, requiredTask, rewardType, rewardTarget, rewardDurationMinutes,
      remainingRewardMinutes: rewardDurationMinutes, startDate: new Date(startDate), endDate: endDate ? new Date(endDate) : undefined,
    });

    return NextResponse.json({ ok: true, reward }, { status: 201 });
  } catch (error: any) {
    console.error("REWARDS POST ERROR:", { message: error.message, stack: error.stack });
    return NextResponse.json({ ok: false, error: "Failed to create reward" }, { status: 500 });
  }
}
