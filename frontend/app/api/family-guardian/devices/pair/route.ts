import { NextResponse } from "next/server"
import { requireParentAuth, getMongoDb } from "@/lib/family-guardian-auth"
import { ObjectId } from "mongodb"
import * as crypto from "crypto"

export const POST = requireParentAuth(async (req, family) => {
  try {
    const body = await req.json()
    const db = await getMongoDb()

    const { childId, deviceType, deviceName } = body

    const validTypes = ["android", "ios", "chrome-extension", "edge-extension", "browser", "smart-tv", "android-tv", "other"]
    if (!deviceType || !validTypes.includes(deviceType)) {
      return NextResponse.json({ ok: false, error: "Valid device type is required." }, { status: 400 })
    }

    let childObjectId = null
    if (childId) {
      if (!ObjectId.isValid(childId)) {
        return NextResponse.json({ ok: false, error: "Invalid child ID." }, { status: 400 })
      }
      childObjectId = new ObjectId(childId)
      const child = await db.collection("children").findOne({
        _id: childObjectId,
        familyId: family._id,
      })
      if (!child) {
        return NextResponse.json({ ok: false, error: "Child not found." }, { status: 404 })
      }
    }

    // Generate pairing code and token
    const pairingCode = crypto.randomBytes(3).toString("hex").toUpperCase()
    const pairingToken = crypto.randomBytes(32).toString("hex")
    const pairingTokenHash = crypto.createHash("sha256").update(pairingToken).digest("hex")

    const now = new Date()
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000) // 15 minutes expiry

    const pairing = {
      familyId: family._id,
      childId: childObjectId,
      deviceType,
      deviceName: deviceName || `${deviceType} device`,
      pairingCode,
      pairingToken,
      pairingTokenHash,
      status: "pending",
      expiresAt,
      createdAt: now,
      updatedAt: now,
    }

    await db.collection("devicepairings").insertOne(pairing)

    return NextResponse.json({
      ok: true,
      pairingCode,
      pairingToken,
      expiresAt: expiresAt.toISOString(),
      deviceType,
    })
  } catch (error) {
    console.error("PAIR DEVICE ERROR:", error)
    return NextResponse.json({ ok: false, error: "Failed to initiate pairing." }, { status: 500 })
  }
})

