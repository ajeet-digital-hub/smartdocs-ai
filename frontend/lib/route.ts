import { NextResponse } from "next/server";
import { requireParentAuth } from "@/lib/family-guardian-auth";
import ActivityLog from "@/models/ActivityLog";
import dbConnect from "@/lib/dbConnect";

/**
 * GET /api/family-guardian/analytics/:childId
 *
 * Returns analytics data for a specific child.
 *
 * Query Params:
 *   period: "day" | "week" | "month" (default: "day")
 */
export const GET = requireParentAuth(async (req, family, session, { params }) => {
  try {
    await dbConnect();
    const { childId } = params;
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "day";

    let startDate: Date;
    const now = new Date();

    switch (period) {
      case "day":
        now.setHours(0, 0, 0, 0); // Start of today
        startDate = now;
        break;
      case "week":
        startDate = new Date(now.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1))); // Start of week (Monday)
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Start of the month
        break;
      default:
        startDate = now;
    }

    const activities = await ActivityLog.find({
      childId,
      familyId: family._id,
      createdAt: { $gte: startDate },
    }).lean();

    const [studyGoals, onlineDevicesCount] = await Promise.all([
      StudyGoal.find({ childId: childId, familyId: family._id, status: "active" }).lean(),
      Device.countDocuments({ childId, familyId: family._id, status: "online" }),
    ]);

    let totalScreenTime = 0; // in minutes
    const appUsage: { [key: string]: { appName: string; usageTime: number } } = {};
    let blockedAttempts = 0;
    let unlockRequests = 0;
    const screenTimeByDay: { [key: string]: number } = {};

    activities.forEach((activity) => {
      if (activity.action === "app_launch" && activity.metadata?.usageDuration) {
        const usageMinutes = Math.round(activity.metadata.usageDuration / 60);
        totalScreenTime += usageMinutes;

        const appName = activity.metadata.appName || "Unknown App";
        if (!appUsage[appName]) {
          appUsage[appName] = { appName, usageTime: 0 };
        }
        appUsage[appName].usageTime += usageMinutes;

        const day = new Date(activity.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
        if (!screenTimeByDay[day]) screenTimeByDay[day] = 0;
        screenTimeByDay[day] += usageMinutes;

      } else if (activity.action === "app_blocked" || activity.action === "website_blocked") {
        blockedAttempts++;
      } else if (activity.action === "unlock_request_sent") {
        unlockRequests++;
      }
    });

    let totalStudyProgress = 0;
    if (studyGoals.length > 0) {
      const totalTarget = studyGoals.reduce((sum, goal) => sum + (goal.targetMinutes || 0), 0);
      const totalCompleted = studyGoals.reduce((sum, goal) => sum + (goal.completedMinutes || 0), 0);
      if (totalTarget > 0) {
        totalStudyProgress = Math.round((totalCompleted / totalTarget) * 100);
      }
    }

    const mostUsedApps = Object.values(appUsage)
      .sort((a, b) => b.usageTime - a.usageTime)
      .slice(0, 5); // Top 5 apps

    const screenTimeChartData = Object.entries(screenTimeByDay).map(([day, minutes]) => ({ day, minutes }));

    return NextResponse.json({
      ok: true, // Keep consistent with other APIs
      analytics: {
        totalScreenTime,
        mostUsedApps,
        blockedAttempts,
        unlockRequests,
        studyProgress: totalStudyProgress,
        devicesOnline: onlineDevicesCount,
        screenTimeByDay: screenTimeChartData,
      },
    });
  } catch (error) {
    console.error("GET ANALYTICS API ERROR:", { message: (error as Error).message, stack: (error as Error).stack });
    return NextResponse.json({ success: false, error: "Failed to retrieve analytics data" }, { status: 500 });
  }
});
