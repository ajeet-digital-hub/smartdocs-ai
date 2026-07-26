import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import mongoose from "mongoose";
import Family from "@/models/Family";
import Child from "@/models/Child";
import Device from "@/models/Device";
import ActivityLog from "@/models/ActivityLog";

/**
 * POST /api/family-guardian/revoke-device
 *
 * Parent-session authenticated endpoint to revoke a paired device.
 * This invalidates the device token and sets the device status to offline.
 * The device will not be able to make further API calls.
 *
 * Body: { deviceId: string }
 *
 * Session-authenticated (parent)
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { deviceId } = body;

    if (!deviceId) {
      return NextResponse.json({ ok: false, error: "deviceId is required" }, { status: 400 });
    }

    if (mongoose.connection.readyState !== 1) {
      if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI not set");
      await mongoose.connect(process.env.MONGODB_URI);
    }

    // Verify the parent owns this family
    const family = await Family.findOne({ parentId: session.user.id });
    if (!family) {
      return NextResponse.json({ ok: false, error: "Family not found" }, { status: 404 });
    }

    // Find the device by ID and family
    const device = await Device.findOne({
      _id: deviceId,
      familyId: family._id,
    });

    if (!device) {
      return NextResponse.json({ ok: false, error: "Device not found or not associated with your family" }, { status: 404 });
    }

    // Get the child for logging
    const child = await Child.findOne({ _id: device.childId, familyId: family._id });

    // Store device info before clearing
    const revokedDevice = {
      deviceName: device.deviceName,
      platform: device.platform,
      deviceId: device.deviceId,
      childName: child?.name || "Unknown",
    };

    // Revoke: clear device token and set status to offline
    device.deviceToken = "REVOKED_" + device.deviceToken.substring(0, 16); // Invalidate token
    device.status = "offline";
    device.fcmToken = undefined;
    await device.save();

    // Log the revocation
    await ActivityLog.create({
      familyId: family._id,
      childId: device.childId,
      parentId: session.user.id,
      action: "device_revoked" as const,
      details: `Device revoked: ${revokedDevice.deviceName} (${revokedDevice.platform}) for ${revokedDevice.childName}`,
      metadata: {
        deviceId: device._id.toString(),
        deviceName: revokedDevice.deviceName,
        platform: revokedDevice.platform,
        childName: revokedDevice.childName,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Device has been revoked and can no longer connect",
      device: {
        _id: device._id,
        deviceName: revokedDevice.deviceName,
        platform: revokedDevice.platform,
        status: "offline",
        revokedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("REVOKE DEVICE ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to revoke device" }, { status: 500 });
  }
}

