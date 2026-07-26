import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import mongoose from "mongoose";
import Family from "@/models/Family";
import Child from "@/models/Child";
import ActivityLog from "@/models/ActivityLog";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { childId, deviceName, deviceType } = body;

    if (!childId || !deviceName || !deviceType) {
      return NextResponse.json({ ok: false, error: "Missing required fields: childId, deviceName, deviceType" }, { status: 400 });
    }

    if (!["browser", "android", "ios", "desktop"].includes(deviceType)) {
      return NextResponse.json({ ok: false, error: "Invalid device type" }, { status: 400 });
    }

    if (mongoose.connection.readyState !== 1) {
      if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI not set");
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const family = await Family.findOne({ parentId: session.user.id });
    if (!family) {
      return NextResponse.json({ ok: false, error: "Family not found" }, { status: 404 });
    }

    const child = await Child.findOne({ _id: childId, familyId: family._id });
    if (!child) {
      return NextResponse.json({ ok: false, error: "Child not found" }, { status: 404 });
    }

    // Generate unique pairing code
    const pairingCode = crypto.randomBytes(4).toString("hex").toUpperCase();
    const codeExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Save pairing code on family document
    await Family.findOneAndUpdate(
      { _id: family._id },
      { $set: { pairingCode, pairingCodeExpires: codeExpires } }
    );

    // Generate QR code data URL (simplified - just return code for now)
    // In production, use a QR library to generate actual QR image
    const pairingData = JSON.stringify({
      familyCode: pairingCode,
      childId: childId,
      deviceName,
      deviceType,
      expiresAt: codeExpires.toISOString(),
    });

    await ActivityLog.create({
      familyId: family._id,
      childId: child._id,
      parentId: session.user.id,
      action: "device_pair_initiated",
      details: `Initiated device pairing for ${child.name}: ${deviceName} (${deviceType})`,
      metadata: { pairingCode, deviceName, deviceType },
    });

    return NextResponse.json({
      ok: true,
      pairingCode,
      expiresAt: codeExpires.toISOString(),
      pairingData,
    });
  } catch (error) {
    console.error("PAIR DEVICE ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to generate pairing code" }, { status: 500 });
  }
}

// Verify a pairing code and pair a device to a child
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { pairingCode, deviceName, deviceType, deviceId } = body;

    if (!pairingCode || !deviceName || !deviceType) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }

    if (mongoose.connection.readyState !== 1) {
      if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI not set");
      await mongoose.connect(process.env.MONGODB_URI);
    }

    // Find family by pairing code
    const family = await Family.findOne({
      pairingCode,
      pairingCodeExpires: { $gt: new Date() },
    });

    if (!family) {
      return NextResponse.json({ ok: false, error: "Invalid or expired pairing code" }, { status: 400 });
    }

    // Clear the pairing code (one-time use)
    await Family.findOneAndUpdate(
      { _id: family._id },
      { $unset: { pairingCode: "", pairingCodeExpires: "" } }
    );

    // Get the first child (or we could require childId in the pairing)
    const child = await Child.findOne({ familyId: family._id }).sort({ name: 1 });
    if (!child) {
      return NextResponse.json({ ok: false, error: "No child found" }, { status: 404 });
    }

    // Add device to child
    const device = {
      name: deviceName,
      type: deviceType,
      deviceId: deviceId || undefined,
      pairedAt: new Date(),
      lastSeenAt: new Date(),
      status: "online" as const,
    };

    await Child.findOneAndUpdate(
      { _id: child._id },
      { $push: { devices: device } }
    );

    return NextResponse.json({
      ok: true,
      message: `Device paired successfully with ${child.name}`,
      childId: child._id,
    });
  } catch (error) {
    console.error("PAIR DEVICE VERIFY ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to pair device" }, { status: 500 });
  }
}

