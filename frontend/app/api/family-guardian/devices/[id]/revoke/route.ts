import { NextResponse } from "next/server"
import { requireParentAuth, getMongoDb } from "@/lib/family-guardian-auth"
import { ObjectId } from "mongodb"

export const POST = requireParentAuth(async (req, family) => {
  try {
    const url = new URL(req.url)
    const segments = url.pathname.split("/")
    const id = segments[segments.length - 2]
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ ok: false, error: "Invalid device ID." }, { status: 400 })
    }

    const db = await getMongoDb()

    const existing = await db.collection("devices").findOne({
      _id: new ObjectId(id),
      familyId: family._id,
    })
    if (!existing) {
      return NextResponse.json({ ok: false, error: "Device not found." }, { status: 404 })
    }

    const now = new Date()
    await db.collection("devices").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "revoked",
          connectionStatus: "disconnected",
          policySyncStatus: "not-applicable",
          revokedAt: now,
          updatedAt: now,
        },
      }
    )

    // Invalidate pairing
    await db.collection("devicepairings").updateMany(
      { deviceId: new ObjectId(id) },
      { $set: { status: "revoked", updatedAt: now } }
    )

    // Log activity
    await db.collection("activitylogs").insertOne({
      familyId: family._id,
      childId: existing.childId,
      deviceId: existing._id,
      action: "device_revoked",
      details: `Device '${existing.name}' revoked`,
      createdAt: now,
    })

    return NextResponse.json({ ok: true, message: "Device revoked successfully." })
  } catch (error) {
    console.error("REVOKE DEVICE ERROR:", error)
    return NextResponse.json({ ok: false, error: "Failed to revoke device." }, { status: 500 })
  }
})

