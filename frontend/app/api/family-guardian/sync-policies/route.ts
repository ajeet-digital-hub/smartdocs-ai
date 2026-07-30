import { NextResponse } from "next/server";
import { verifyDeviceToken } from "@/lib/device-auth";
import AppPolicy from "@/models/AppPolicy";
import WebsitePolicy from "@/models/WebsitePolicy";
import Schedule from "@/models/Schedule";
import Device from "@/models/Device"; // Import Device model to update lastSyncedPolicyVersion
import dbConnect from "@/lib/dbConnect";

/**
 * GET /api/family-guardian/sync-policies
 *
 * Device-authenticated endpoint for the child device to fetch all
 * applicable policies, schedules, and configurations.
 *
 * Headers: Authorization: Bearer <deviceToken>
 */
export async function GET(request: Request) {
  try {
    await dbConnect();
    // 1. Verify device token
    const { device, error, status } = await verifyDeviceToken(request, {
      skipSave: true,
    });
    if (!device || error) {
      return NextResponse.json({ ok: false, error: error || "Unauthorized" }, { status: status || 401 });
    }

    const { childId, familyId } = device;

    // 2. Fetch all relevant policies and schedules for the child
    const [appPolicies, websitePolicies, schedules] = await Promise.all([
      AppPolicy.find({ childId, familyId }).lean(),
      WebsitePolicy.find({ childId, familyId }).lean(),
      Schedule.find({ childId, familyId, isActive: true }).lean(),
    ]);

    // 3. Determine the latest policy version
    const allPoliciesAndSchedules: Array<
      InstanceType<typeof AppPolicy> | InstanceType<typeof WebsitePolicy> | InstanceType<typeof Schedule>
    > = [...appPolicies, ...websitePolicies, ...schedules];
    const maxPolicyVersion = allPoliciesAndSchedules.reduce(
      (max, p) => Math.max(max, p.policyVersion || 0),
      0
    );

    // Update device's last synced policy version
    device.lastSyncedPolicyVersion = maxPolicyVersion;
    device.lastSeen = new Date(); // Also update lastSeen on sync
    await device.save();

    // Transform policies into device-friendly format
    const blockedApps = appPolicies.filter(p => p.status === "BLOCKED").map(p => ({ appId: p.appId, appPackage: p.appPackage }));
    const limitedApps = appPolicies.filter(p => p.status === "LIMITED").map(p => ({ appId: p.appId, appPackage: p.appPackage, dailyLimitMinutes: p.dailyLimitMinutes }));
    const scheduledApps = appPolicies.filter(p => p.status === "SCHEDULED").map(p => ({ appId: p.appId, appPackage: p.appPackage, scheduleBlocks: p.scheduleBlocks }));

    const blockedWebsites = websitePolicies.filter(p => p.isBlocked).map(p => ({ domain: p.domain }));
    const limitedWebsites = websitePolicies.filter(p => p.dailyLimitMinutes).map(p => ({ domain: p.domain, dailyLimitMinutes: p.dailyLimitMinutes }));
    const scheduledWebsites = websitePolicies.filter(p => p.scheduleBlocks && p.scheduleBlocks.length > 0).map(p => ({ domain: p.domain, scheduleBlocks: p.scheduleBlocks }));

    return NextResponse.json({
      ok: true,
      policies: {
        blockedApps,
        limitedApps,
        scheduledApps,
        blockedWebsites,
        limitedWebsites,
        scheduledWebsites,
        schedules, // General schedules (e.g., sleep mode)
      },
      policyVersion: maxPolicyVersion, // The latest version available on the server
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    console.error("SYNC POLICIES ERROR:", {
      message: (error as Error).message,
      stack: (error as Error).stack,
      deviceToken: request.headers.get("Authorization"),
    });
    return NextResponse.json({ ok: false, error: "Failed to sync policies" }, { status: 500 });
  }
}