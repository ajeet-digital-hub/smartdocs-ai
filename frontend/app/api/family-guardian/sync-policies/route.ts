import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Device from "@/models/Device";
import AppPolicy from "@/models/AppPolicy";
import WebsitePolicy from "@/models/WebsitePolicy";
import Schedule from "@/models/Schedule";
import { verifyDeviceToken } from "../device-auth/route";

/**
 * GET /api/family-guardian/sync-policies
 *
 * Device-authenticated endpoint that returns all active policies and schedules
 * for the child device to enforce locally.
 *
 * Headers:
 *   Authorization: Bearer <deviceToken>
 *
 * Query params:
 *   lastPolicyVersion (optional) - For delta sync; returns only changes since this version
 *
 * Response:
 *   {
 *     appPolicies: [...],
 *     websitePolicies: [...],
 *     schedules: [...],
 *     currentPolicyVersion: number,
 *     hasUpdates: boolean
 *   }
 */
export async function GET(request: Request) {
  try {
    // Verify device token
    const { device, error, status } = await verifyDeviceToken(request);
    if (!device || error) {
      return NextResponse.json({ ok: false, error: error || "Unauthorized" }, { status: status || 401 });
    }

    const { searchParams } = new URL(request.url);
    const lastPolicyVersion = parseInt(searchParams.get("lastPolicyVersion") || "0", 10);

    // Fetch all active app policies for this child
    const appPolicies = await AppPolicy.find({
      childId: device.childId,
      familyId: device.familyId,
    })
      .select("appId appName appPackage appStoreId category icon isBlocked isAllowed dailyLimitMinutes scheduleBlocks temporaryUnlock policyVersion")
      .lean();

    // Fetch all website policies for this child
    const websitePolicies = await WebsitePolicy.find({
      childId: device.childId,
      familyId: device.familyId,
    })
      .select("name domain category icon isBlocked dailyLimitMinutes scheduleBlocks")
      .lean();

    // Fetch schedules for this child
    const schedules = await Schedule.find({
      childId: device.childId,
      familyId: device.familyId,
      isActive: true,
    })
      .select("name type startTime endTime daysOfWeek timezone websiteRules")
      .lean();

    // Calculate the current policy version (max version across all policies)
    let currentPolicyVersion = lastPolicyVersion;
    for (const policy of appPolicies) {
      if (policy.policyVersion > currentPolicyVersion) {
        currentPolicyVersion = policy.policyVersion;
      }
    }

    // Determine if there are updates since last sync
    const hasUpdates = currentPolicyVersion > lastPolicyVersion;

    return NextResponse.json({
      ok: true,
      appPolicies,
      websitePolicies,
      schedules,
      currentPolicyVersion,
      lastSyncedAt: new Date().toISOString(),
      hasUpdates,
      deviceInfo: {
        deviceId: device.deviceId,
        deviceName: device.deviceName,
        platform: device.platform,
        status: device.status,
      },
    });
  } catch (error) {
    console.error("SYNC POLICIES ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to sync policies" }, { status: 500 });
  }
}

