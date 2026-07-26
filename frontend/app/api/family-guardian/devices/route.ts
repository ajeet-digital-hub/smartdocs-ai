import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import mongoose from "mongoose";
import Family from "@/models/Family";
import Child from "@/models/Child";
import Device from "@/models/Device";
import ActivityLog from "@/models/ActivityLog";

/**
 * GET /api/family-guardian/devices
 *
 * Session-authenticated (parent). Lists all paired devices for the family.
 * Optional query param: childId to filter by child.
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const childId = searchParams.get("childId");

    if (mongoose.connection.readyState !== 1) {
      if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI not set");
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const family = await Family.findOne({ parentId: session.user.id });
    if (!family) {
      return NextResponse.json({ ok: false, error: "Family not found" }, { status: 404 });
    }

    // Build query for devices
    const query: Record<string, unknown> = { familyId: family._id };
    if (childId) query.childId = childId;

    const devices = await Device.find(query)
      .populate("childId", "name age")
      .sort({ lastSeen: -1 })
      .lean();

    // Transform for frontend
    const transformedDevices = devices.map((device) => ({
      _id: device._id,
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      platform: device.platform,
      appVersion: device.appVersion,
      status: device.status,
      lastSeen: device.lastSeen,
      childId: device.childId,
      installedApps: device.installedApps,
    }));

    return NextResponse.json({
      ok: true,
      devices: transformedDevices,
      totalDevices: transformedDevices.length,
    });
  } catch (error) {
    console.error("DEVICES GET ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to fetch devices" }, { status: 500 });
  }
}

/**
 * PATCH /api/family-guardian/devices
 *
 * Session-authenticated (parent). Update device status (lock/unlock).
 * For a real implementation, this would push a notification to the device.
 */
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { deviceId, status } = body;

    if (!deviceId) {
      return NextResponse.json({ ok: false, error: "deviceId is required" }, { status: 400 });
    }

    if (!["online", "offline", "pending"].includes(status)) {
      return NextResponse.json({ ok: false, error: "Invalid status. Must be: online, offline, pending" }, { status: 400 });
    }

    if (mongoose.connection.readyState !== 1) {
      if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI not set");
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const family = await Family.findOne({ parentId: session.user.id });
    if (!family) {
      return NextResponse.json({ ok: false, error: "Family not found" }, { status: 404 });
    }

    const device = await Device.findOneAndUpdate(
      { _id: deviceId, familyId: family._id },
      { $set: { status, lastSeen: new Date() } },
      { new: true }
    );

    if (!device) {
      return NextResponse.json({ ok: false, error: "Device not found" }, { status: 404 });
    }

    // Get child name for logging
    const child = await Child.findById(device.childId).select("name").lean();

    const actionType = status === "online" ? "device_unlocked" : "device_locked";
    await ActivityLog.create({
      familyId: family._id,
      childId: device.childId,
      parentId: session.user.id,
      action: actionType as any,
      details: `${status === "online" ? "Unlocked" : "Locked"} device ${device.deviceName} for ${child?.name || "Unknown"}`,
      metadata: { deviceId: device._id.toString(), deviceName: device.deviceName, status },
    });

    return NextResponse.json({
      ok: true,
      device: {
        _id: device._id,
        deviceId: device.deviceId,
        deviceName: device.deviceName,
        status: device.status,
        lastSeen: device.lastSeen,
      },
    });
  } catch (error) {
    console.error("DEVICES PATCH ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to update device" }, { status: 500 });
  }
}

/**
 * DELETE /api/family-guardian/devices
 *
 * Session-authenticated (parent). Delete/revoke a device.
 *
 * Body: { deviceId: string }
 */
export async function DELETE(request: Request) {
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

    const family = await Family.findOne({ parentId: session.user.id });
    if (!family) {
      return NextResponse.json({ ok: false, error: "Family not found" }, { status: 404 });
    }

    const device = await Device.findOneAndDelete({ _id: deviceId, familyId: family._id });
    if (!device) {
      return NextResponse.json({ ok: false, error: "Device not found" }, { status: 404 });
    }

    const child = await Child.findById(device.childId).select("name").lean();

    await ActivityLog.create({
      familyId: family._id,
      childId: device.childId,
      parentId: session.user.id,
      action: "device_revoked" as const,
      details: `Device removed: ${device.deviceName} for ${child?.name || "Unknown"}`,
      metadata: { deviceId: device._id.toString(), deviceName: device.deviceName, platform: device.platform },
    });

    return NextResponse.json({
      ok: true,
      message: "Device removed successfully",
      device: {
        deviceName: device.deviceName,
        platform: device.platform,
        deviceId: device.deviceId,
      },
    });
  } catch (error) {
    console.error("DEVICES DELETE ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to remove device" }, { status: 500 });
  }
}
