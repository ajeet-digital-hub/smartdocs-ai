import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Device from "@/models/Device";
import Family from "@/models/Family";
import AppPolicy from "@/models/AppPolicy";
import ActivityLog from "@/models/ActivityLog";
import { verifyDeviceToken } from "../device-auth/route";

/*
 * POST /api/family-guardian/device-heartbeat
 *
 * Device-authenticated endpoint for the child device to report
 * its current status periodically. Updates device online status,
 * last seen timestamp, and installed apps.
 *
 * Headers: Authorization: Bearer <deviceToken>
 *
 * Body:
 *   status: "online" | "offline"
 *   batteryLevel: number (0-100)
 *   screenOn: boolean
 *   foregroundApp: string (package name)
 *   installedApps: Array of { packageName, appName, version }
 */
export async function POST(request: Request) {
  try {
    // Verify device token
    const { device, error, status } = await verifyDeviceToken(request);
    if (!device || error) {
      return NextResponse.json({ ok: false, error: error || "Unauthorized" }, { status: status || 401 });
    }

    const body = await request.json();
    const { status: deviceStatus, batteryLevel, screenOn, foregroundApp, installedApps } = body;

    // Update device status and timing
    const updateData: Record<string, unknown> = {
      lastSeen: new Date(),
      status: deviceStatus === "offline" ? "offline" : "online",
    };

    // If device reports as offline, log it
    if (deviceStatus === "offline" && device.status !== "offline") {
      const family = await Family.findById(device.familyId).select("parentId").lean();
      await ActivityLog.create({
        familyId: device.familyId,
        childId: device.childId,
        parentId: family?.parentId || device.familyId,
        action: "device_offline",
        details: `Device went offline: ${device.deviceName}`,
        metadata: { deviceId: device.deviceId, deviceName: device.deviceName },
      });
    }

    // Update installed apps if provided
    if (installedApps && Array.isArray(installedApps) && installedApps.length > 0) {
      const now = new Date();
      const detectedPackages = new Set<string>();

      for (const app of installedApps) {
        if (!app.packageName) continue;
        detectedPackages.add(app.packageName);

        // Check if app already exists in installedApps array
        const existingIndex = device.installedApps.findIndex(
          (ia) => ia.packageName === app.packageName
        );

        if (existingIndex >= 0) {
          // Update existing entry
          device.installedApps[existingIndex].isDetected = true;
          device.installedApps[existingIndex].lastDetected = now;
          device.installedApps[existingIndex].appName = app.appName || device.installedApps[existingIndex].appName;
          device.installedApps[existingIndex].version = app.version || device.installedApps[existingIndex].version;
        } else {
          // Add new entry
          (device.installedApps as any).push({
            packageName: app.packageName,
            appName: app.appName || "Unknown",
            version: app.version || "1.0",
            isDetected: true,
            lastDetected: now,
          });
        }
      }

      // Mark apps not in the report as not detected (they were uninstalled)
      for (let i = 0; i < device.installedApps.length; i++) {
        if (!detectedPackages.has(device.installedApps[i].packageName)) {
          device.installedApps[i].isDetected = false;
        }
      }
    }

    // Apply updates to device
    device.status = updateData.status as "online" | "offline" | "pending";
    device.lastSeen = updateData.lastSeen as Date;
    await device.save();

    // Check if policy updates are available by comparing versions
    const maxPolicyVersion = await AppPolicy.findOne({
      childId: device.childId,
      familyId: device.familyId,
    })
      .sort({ policyVersion: -1 })
      .select("policyVersion")
      .lean();

    const currentPolicyVersion = maxPolicyVersion?.policyVersion || 0;

    // Log heartbeat activity periodically (not every beat - avoid noise)
    // Only log heartbeat if status changed or significant event

    return NextResponse.json({
      ok: true,
      status: device.status,
      lastSeen: device.lastSeen.toISOString(),
      policyUpdatesRequired: false, // Will be updated when policy version tracking is implemented
      currentPolicyVersion,
      serverTime: new Date().toISOString(),
      deviceId: device.deviceId,
    });
  } catch (error) {
    console.error("DEVICE HEARTBEAT ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to process heartbeat" }, { status: 500 });
  }
}

