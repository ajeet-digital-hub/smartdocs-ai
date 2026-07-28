import { NextResponse } from "next/server"
import { requireParentAuth, getMongoDb, toJSON } from "@/lib/family-guardian-auth"
import { ObjectId } from "mongodb"

export const POST = requireParentAuth(async (req, family) => {
  try {
    const url = new URL(req.url)
    const segments = url.pathname.split("/")
    const id = segments[segments.length - 2]
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ ok: false, error: "Invalid device ID." }, { status: 400 })
    }

    const body = await req.json()
    const { childId } = body
    if (!childId || !ObjectId.isValid(childId)) {
      return NextResponse.json({ ok: false, error: "Valid child ID is required." }, { status: 400 })
    }

    const db = await getMongoDb()

    // Verify device exists
    const device = await db.collection("devices").findOne({
      _id: new ObjectId(id),
      familyId: family._id,
    })
    if (!device) {
      return NextResponse.json({ ok: false, error: "Device not found." }, { status: 404 })
    }

    // Verify child exists
    const child = await db.collection("children").findOne({
      _id: new ObjectId(childId),
      familyId: family._id,
    })
    if (!child) {
      return NextResponse.json({ ok: false, error: "Child not found." }, { status: 404 })
    }

    const now = new Date()
    await db.collection("devices").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          childId: new ObjectId(childId),
          updatedAt: now,
          policySyncStatus: "pending",
        },
      }
    )

    // Update child's assigned devices
    await db.collection("children").updateOne(
      { _id: new ObjectId(childId) },
      { $addToSet: { assignedDevices: new ObjectId(id) } }
    )

    const updated = await db.collection("devices").findOne({ _id: new ObjectId(id) })

    return NextResponse.json({ ok: true, device: toJSON(updated) })
  } catch (error) {
    console.error("ASSIGN DEVICE ERROR:", error)
    return NextResponse.json({ ok: false, error: "Failed to assign device." }, { status: 500 })
  }
})

