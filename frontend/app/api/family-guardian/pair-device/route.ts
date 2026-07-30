import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Family from "@/models/Family";
import Child from "@/models/Child";
import ActivityLog from "@/models/ActivityLog"; // Ensure ActivityLog is imported
import crypto from "crypto";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";

/**
 * POST /api/family-guardian/pair-device
 *
 * Session-authenticated (parent). Generates a secure one-time pairing code
 * and QR-ready data for the parent to share with the child device.
 *
 * The pairing code:
 * - Is 8 characters (alphanumeric, uppercase)
 * - Expires after 15 minutes (reduced from 30min for security)
 * - Is single-use (cleared after successful pairing)
 * - Never exposes authentication tokens
 * - Only contains: pairingCode + childId + deviceName + deviceType + expiry
 *
 * Body: { childId, deviceName, deviceType }
 * Response: { pairingCode, expiresAt, qrData }
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { childId, deviceName, deviceType } = body;

    if (!childId || !deviceName || !deviceType) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields: childId, deviceName, deviceType" },
        { status: 400 }
      );
    }

    const validTypes = ["android", "ios", "web", "browser", "desktop"];
    if (!validTypes.includes(deviceType)) {
      return NextResponse.json(
        { ok: false, error: "Invalid device type. Must be: android, ios, web, browser, or desktop" },
        { status: 400 }
      );
    }

    try {
      await dbConnect();
    } catch (dbError: any) {
      console.error("DB Connection Error in pair-device:", {
        type: "MongoDB Connection Failure",
        stage: "API Route Initialization",
        route: "/api/family-guardian/pair-device",
        message: dbError.message,
        name: dbError.name,
        stack: dbError.stack,
      });
      return NextResponse.json({ ok: false, error: "Database connection failed.", details: dbError.message }, { status: 500 });
    }

    const family = await Family.findOne({ parentId: new mongoose.Types.ObjectId(session.user.id) }); // Ensure parentId is ObjectId
    if (!family) {
      return NextResponse.json({ ok: false, error: "Family not found" }, { status: 404 });
    }

    const child = await Child.findOne({ _id: childId, familyId: family._id });
    if (!child) {
      return NextResponse.json({ ok: false, error: "Child not found" }, { status: 404 });
    }

    // Generate secure pairing code (8 chars, alphanumeric, uppercase)
    const pairingCode = crypto.randomBytes(4).toString("hex").toUpperCase();
    const codeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save pairing code on family document
    await Family.findOneAndUpdate(
      { _id: family._id },
      { $set: { pairingCode, pairingCodeExpires: codeExpires } }
    );

    // Generate QR-code-ready data string
    // Format: FAMILYGUARDIAN://PAIR?code=XXXXXX&cid=YYYYYY
    // In production, the mobile app will scan this QR and extract the params
    const qrData = `FAMILYGUARDIAN://PAIR?code=${pairingCode}&cid=${childId}&name=${encodeURIComponent(deviceName)}&type=${deviceType}&expires=${codeExpires.getTime()}`;

    // Also generate a simplified JSON version for manual code entry
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
      action: "device_pair_initiated" as const,
      details: `Initiated device pairing for ${child.name}: ${deviceName} (${deviceType})`,
      metadata: { pairingCode, deviceName, deviceType },
    });

    return NextResponse.json({
      ok: true,
      pairingCode,
      expiresAt: codeExpires.toISOString(),
      qrData,
      pairingData,
      instructions: {
        codeEntry: "Enter this code on the child's device app",
        qrScan: "Scan the QR code with the child's device app (requires QR library)",
        expiry: "This code expires in 15 minutes and can only be used once",
      },
    });
  } catch (error) {
    console.error("PAIR DEVICE ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to generate pairing code" }, { status: 500 });
  }
}
