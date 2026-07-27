import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import mongoose from "mongoose";
import Family from "@/models/Family";
import Child from "@/models/Child";
import Device from "@/models/Device";
import ActivityLog from "@/models/ActivityLog";
import crypto from "crypto";

/**
 * POST /api/family-guardian/device-auth
 * 
 * Called by the child device app to authenticate and pair after
 * the parent generates a pairing code. This creates a Device document
 * with a secure deviceToken for all future device API calls.
 * 
 * Body: { pairingCode, deviceId, deviceName, platform, fcmToken?, appVersion? }
 * 
 * IMPORTANT: This endpoint is NOT session-authenticated. The pairing code
 * serves as the one-time authentication credential. After successful pairing,
 * the device uses deviceToken for all subsequent requests.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pairingCode, deviceId, deviceName, platform, fcmToken, appVersion } = body;

    // Validate required fields
    if (!pairingCode || typeof pairingCode !== "string") {
      return NextResponse.json({ ok: false, error: "Pairing code is required" }, { status: 400 });
    }
    if (!deviceId || typeof deviceId !== "string") {
      return NextResponse.json({ ok: false, error: "Device ID is required" }, { status: 400 });
    }
    if (!deviceName || typeof deviceName !== "string") {
      return NextResponse.json({ ok: false, error: "Device name is required" }, { status: 400 });
    }
    if (!platform || !["android", "ios", "web"].includes(platform)) {
      return NextResponse.json({ ok: false, error: "Valid platform (android, ios, web) is required" }, { status: 400 });
    }

    if (mongoose.connection.readyState !== 1) {
      if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI not set");
      await mongoose.connect(process.env.MONGODB_URI, {
        dbName: process.env.MONGODB_DB_NAME || "smartdocs-ai",
      });
    }

    // Find family by pairing code (not expired)
    const family = await Family.findOne({
      pairingCode: pairingCode.trim().toUpperCase(),
      pairingCodeExpires: { $gt: new Date() },
    });

    if (!family) {
      return NextResponse.json({ ok: false, error: "Invalid or expired pairing code" }, { status: 401 });
    }

    // Get the child that was specified during pairing code generation
    // We stored pairing info in the family document; find the child by checking
    // which child was most recently associated
    const child = await Child.findOne({ familyId: family._id }).sort({ createdAt: 1 });

    if (!child) {
      return NextResponse.json({ ok: false, error: "No child found for this family" }, { status: 404 });
    }

    // Clear the pairing code (single-use)
    await Family.findOneAndUpdate(
      { _id: family._id },
      { $unset: { pairingCode: "", pairingCodeExpires: "" } }
    );

    // Generate secure device token
    const deviceToken = crypto.randomBytes(32).toString("hex");

    // Check if device with this deviceId already exists for this child
    const existingDevice = await Device.findOne({
      childId: child._id,
      deviceId: deviceId,
    });

    if (existingDevice) {
      // Re-pairing an existing device - update token and status
      existingDevice.deviceToken = deviceToken;
      existingDevice.status = "online";
      existingDevice.lastSeen = new Date();
      existingDevice.deviceName = deviceName;
      existingDevice.platform = platform;
      existingDevice.appVersion = appVersion || existingDevice.appVersion;
      if (fcmToken) existingDevice.fcmToken = fcmToken;
      await existingDevice.save();

      await ActivityLog.create({
        familyId: family._id,
        childId: child._id,
        parentId: family.parentId,
        action: "device_paired" as const,
        details: `Device re-paired: ${deviceName} (${platform}) for ${child.name}`,
        metadata: { deviceId, deviceName, platform },
      });

      return NextResponse.json({
        ok: true,
        message: "Device re-paired successfully",
        deviceToken,
        childId: child._id,
        familyId: family._id,
        childName: child.name,
        isReconnect: true,
      });
    }

    // Create new Device document
    const device = await Device.create({
      childId: child._id,
      familyId: family._id,
      deviceId,
      deviceName,
      platform,
      appVersion: appVersion || "1.0.0",
      status: "online",
      lastSeen: new Date(),
      deviceToken,
      fcmToken: fcmToken || undefined,
      installedApps: [],
    });

    // Log the event
    await ActivityLog.create({
      familyId: family._id,
      childId: child._id,
      parentId: family.parentId,
      action: "device_paired" as const,
      details: `Device paired: ${deviceName} (${platform}) for ${child.name}`,
      metadata: { deviceId, deviceName, platform },
    });

    return NextResponse.json({
      ok: true,
      message: "Device paired successfully",
      deviceToken,
      childId: child._id,
      familyId: family._id,
      childName: child.name,
      device: {
        _id: device._id,
        deviceId: device.deviceId,
        deviceName: device.deviceName,
        platform: device.platform,
        status: device.status,
      },
    });
  } catch (error) {
    console.error("DEVICE AUTH ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to authenticate device" }, { status: 500 });
  }
}

/**
 * Helper to extract and verify a device token from Authorization header
 * Used by device-authenticated endpoints
 */
export async function verifyDeviceToken(request: Request): Promise<{
  device: InstanceType<typeof Device> | null;
  error?: string;
  status?: number;
}> {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { device: null, error: "Missing or invalid Authorization header", status: 401 };
    }

    const token = authHeader.substring(7);
    if (!token || token.length < 32) {
      return { device: null, error: "Invalid device token", status: 401 };
    }

    if (mongoose.connection.readyState !== 1) {
      if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI not set");
      await mongoose.connect(process.env.MONGODB_URI, {
        dbName: process.env.MONGODB_DB_NAME || "smartdocs-ai",
      });
    }

    const device = await Device.findOne({ deviceToken: token });
    if (!device) {
      return { device: null, error: "Device not found or token revoked", status: 401 };
    }

    // Update last seen
    device.lastSeen = new Date();
    device.status = "online";
    await device.save();

    return { device };
  } catch (error) {
    console.error("DEVICE TOKEN VERIFY ERROR:", error);
    return { device: null, error: "Failed to verify device token", status: 500 };
  }
}

