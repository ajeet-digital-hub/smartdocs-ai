import { NextResponse } from "next/server";
import Device, { IInstalledApp } from "@/models/Device";
import Family from "@/models/Family";
import AppPolicy from "@/models/AppPolicy";
import WebsitePolicy from "@/models/WebsitePolicy";
import Schedule from "@/models/Schedule";
import ActivityLog from "@/models/ActivityLog";
import dbConnect from "@/lib/dbConnect";
import { verifyDeviceToken } from "@/lib/device-auth";

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
 *   lastSyncedPolicyVersion: number // Version of policies last synced by the device
 */
export async function POST(request: Request) {
  try {
    await dbConnect();
    // Verify device token
    const { device, error, status } = await verifyDeviceToken(request, {
      skipSave: true, // We will save the device manually later with more updates
    });
    if (!device || error) {
      return NextResponse.json(
        { ok: false, error: error || "Unauthorized" },
        { status: status || 401 }
      );
    }

    const body = await request.json();
    const {
      status: deviceStatus,
      batteryLevel,
      screenOn,
      foregroundApp,
      installedApps,
      lastSyncedPolicyVersion: deviceReportedPolicyVersion,
    } = body;

    // Update device status and timing
    const updateData: Record<string, unknown> = {
      lastSeen: new Date(),
      status: deviceStatus === "offline" ? "offline" : "online",
      batteryLevel: batteryLevel,
    };

    // If device reports as offline, log it
    if (deviceStatus === "offline" && device.status !== "offline") {
      const family = await Family.findById(device.familyId)
        .select("parentId")
        .lean();
      await ActivityLog.create({
        familyId: device.familyId,
        childId: device.childId,
        parentId: family?.parentId || device.familyId,
        action: "device_offline",
        details: `Device went offline: ${device.deviceName}`,
        metadata: { deviceId: device.deviceId, deviceName: device.deviceName },
      });
    }

    // Process installed apps if provided
    if (
      installedApps &&
      Array.isArray(installedApps) &&
      installedApps.length > 0
    ) {
      const now = new Date();
      const newInstalledApps: IInstalledApp[] = [];
      const incomingPackagesMap = new Map<string, IInstalledApp>(
        installedApps.map((app: IInstalledApp) => [app.packageName, app])
      );

      // Update existing apps and add new ones
      for (const existingApp of device.installedApps) {
        if (incomingPackagesMap.has(existingApp.packageName)) {
          const incoming = incomingPackagesMap.get(existingApp.packageName)!;
          newInstalledApps.push({
            ...existingApp.toObject(), // Convert Mongoose subdoc to plain object
            appName: incoming.appName || existingApp.appName,
            version: incoming.version || existingApp.version,
            isDetected: true,
            lastDetected: now,
          });
          incomingPackagesMap.delete(existingApp.packageName); // Remove from incoming map
        }
      }
      // Add any remaining new apps
      for (const incomingApp of incomingPackagesMap.values()) {
        newInstalledApps.push({
          packageName: incomingApp.packageName,
          appName: incomingApp.appName || "Unknown",
          version: incomingApp.version || "1.0",
          isDetected: true,
          lastDetected: now,
        });
      }
      device.installedApps = newInstalledApps;
    }

    // Apply other updates to device
    Object.assign(device, updateData);
    await device.save();

    // Check if policy updates are available by comparing versions
    const maxPolicyVersion = await AppPolicy.findOne({
      childId: device.childId,
      familyId: device.familyId,
    })
      .sort({ policyVersion: -1 })
      .select("policyVersion")
      .lean();

    const latestPolicyVersion = maxPolicyVersion?.policyVersion || 0;

    const policyUpdatesRequired =
      deviceReportedPolicyVersion < latestPolicyVersion;

    // Log heartbeat activity periodically (not every beat - avoid noise)
    // Only log heartbeat if status changed or significant event

    return NextResponse.json({
      ok: true,
      status: device.status, // Current status of the device
      lastSeen: device.lastSeen.toISOString(),
      policyUpdatesRequired,
      latestPolicyVersion,
      serverTime: new Date().toISOString(),
      deviceId: device.deviceId,
    });
  } catch (error) {
    console.error("DEVICE HEARTBEAT ERROR:", {
      route: "/api/family-guardian/device-heartbeat",
      message: (error as Error).message,
      stack: (error as Error).stack,
      deviceToken: request.headers.get("Authorization"),
    });
    return NextResponse.json(
      { ok: false, error: "Failed to process heartbeat" },
      { status: 500 }
    );
  }
}
