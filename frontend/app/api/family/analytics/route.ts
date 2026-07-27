import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import mongoose from "mongoose";
import Family from "@/models/Family";
import Child from "@/models/Child";
import Schedule from "@/models/Schedule";
import WebsitePolicy from "@/models/WebsitePolicy";
import UnlockRequest from "@/models/UnlockRequest";
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
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const family = await Family.findOne({ parentId: session.user.id });
    if (!family) {
      return NextResponse.json({ ok: false, error: "Family not found" }, { status: 404 });
    }

    const children = await Child.find({ familyId: family._id }).lean();
    const activeSchedules = await Schedule.countDocuments({ familyId: family._id, isActive: true });
    const blockedWebsites = await WebsitePolicy.countDocuments({ familyId: family._id, isBlocked: true });
    const pendingUnlocks = await UnlockRequest.countDocuments({ familyId: family._id, status: "pending" });
    const activeRewards = await RewardGoal.countDocuments({ familyId: family._id, status: "active" });
    const completedRewards = await RewardGoal.countDocuments({ familyId: family._id, status: "completed" });

    // Calculate study stats
    const studyGoals = await RewardGoal.find({ familyId: family._id }).lean();
    const totalStudyMinutes = studyGoals.reduce((sum, g) => sum + (g.progressMinutes || 0), 0);

    // Activity summary (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentActivity = await ActivityLog.countDocuments({
      familyId: family._id,
      createdAt: { $gte: weekAgo },
    });

    const childAnalytics = await Promise.all(
      children.map(async (child) => {
        const childSchedules = await Schedule.find({ childId: child._id }).lean();
        const childBlocked = await WebsitePolicy.countDocuments({ childId: child._id, isBlocked: true });
        const childRequests = await UnlockRequest.countDocuments({ childId: child._id });
        const childPendingRequests = await UnlockRequest.countDocuments({ childId: child._id, status: "pending" });
        const childRewards = await RewardGoal.find({ childId: child._id }).lean();
        const childStudyMin = childRewards.reduce((sum, g) => sum + (g.progressMinutes || 0), 0);

        return {
          childId: child._id,
          name: child.name,
          age: child.age,
          avatar: child.avatar,
          currentStatus: child.currentStatus,
          points: child.points,
          studyStreak: child.studyStreak,
          schedules: childSchedules.length,
          blockedWebsites: childBlocked,
          totalUnlockRequests: childRequests,
          pendingUnlockRequests: childPendingRequests,
          totalRewards: childRewards.length,
          studyMinutes: childStudyMin,
          completedRewards: childRewards.filter((r) => r.status === "completed").length,
        };
      })
    );

    return NextResponse.json({
      ok: true,
      analytics: {
        totalChildren: children.length,
        activeSchedules,
        blockedWebsites,
        pendingUnlocks,
        activeRewards,
        completedRewards,
        totalStudyMinutes,
        recentActivity,
        children: childAnalytics,
      },
    });
  } catch (error) {
    console.error("ANALYTICS GET ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to fetch analytics" }, { status: 500 });
  }
}

