import { NextResponse } from "next/server"
import { getMongoDb, toJSON } from "@/lib/family-guardian-auth"
import * as crypto from "crypto"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const db = await getMongoDb()

    const { pairingCode, deviceToken } = body

    if (!pairingCode || !deviceToken) {
      return NextResponse.json({ ok: false, error: "Pairing code and device token are required." }, { status: 400 })
    }

    // Find pending pairing
    const pairing = await db.collection("devicepairings").findOne({
      pairingCode: pairingCode.toUpperCase(),
      status: "pending",
      expiresAt: { $gt: new Date() },
    })

    if (!pairing) {
      return NextResponse.json({ ok: false, error: "Invalid or expired pairing code." }, { status: 400 })
    }

    // Verify token
    const tokenHash = crypto.createHash("sha256").update(deviceToken).digest("hex")
    if (tokenHash !== pairing.pairingTokenHash) {
      return NextResponse.json({ ok: false, error: "Invalid pairing token." }, { status: 401 })
    }

    // Generate device token
    const deviceTokenNew = crypto.randomBytes(32).toString("hex")
    const deviceTokenHash = crypto.createHash("sha256").update(deviceTokenNew).digest("hex")

    const now = new Date()
    const device = {
      familyId: pairing.familyId,
      childId: pairing.childId || null,
      name: pairing.deviceName || "New Device",
      deviceType: pairing.deviceType,
      deviceToken: deviceTokenNew,
      deviceTokenHash,
      status: "online",
      connectionStatus: "connected",
      policySyncStatus: "pending",
      lastSeen: now,
      pairedAt: now,
      capabilities: [],
      createdAt: now,
      updatedAt: now,
    }

    const result = await db.collection("devices").insertOne(device)

    // Update pairing status
    await db.collection("devicepairings").updateOne(
      { _id: pairing._id },
      {
        $set: {
          status: "completed",
          deviceId: result.insertedId,
          pairedAt: now,
          updatedAt: now,
        },
      }
    )

    // Log activity
    await db.collection("activitylogs").insertOne({
      familyId: pairing.familyId,
      childId: pairing.childId,
      deviceId: result.insertedId,
      action: "device_paired",
      details: `New ${pairing.deviceType} device paired`,
      createdAt: now,
    })

    const created = await db.collection("devices").findOne({ _id: result.insertedId })

    return NextResponse.json({ ok: true, device: toJSON(created) }, { status: 201 })
  } catch (error) {
    console.error("COMPLETE PAIRING ERROR:", error)
    return NextResponse.json({ ok: false, error: "Failed to complete pairing." }, { status: 500 })
  }
}

