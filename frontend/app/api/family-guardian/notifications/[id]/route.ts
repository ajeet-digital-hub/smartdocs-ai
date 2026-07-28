import { NextResponse } from "next/server"
import { requireParentAuth, getMongoDb, toJSON } from "@/lib/family-guardian-auth"
import { ObjectId } from "mongodb"

export const PUT = requireParentAuth(async (req, family) => {
  try {
    const url = new URL(req.url)
    const segments = url.pathname.split("/")
    const id = segments[segments.length - 2]
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ ok: false, error: "Invalid notification ID." }, { status: 400 })
    }

    const db = await getMongoDb()
    const existing = await db.collection("notifications").findOne({
      _id: new ObjectId(id),
      familyId: family._id,
    })
    if (!existing) {
      return NextResponse.json({ ok: false, error: "Notification not found." }, { status: 404 })
    }

    await db.collection("notifications").updateOne(
      { _id: new ObjectId(id) },
      { $set: { read: true } }
    )

    const updated = await db.collection("notifications").findOne({ _id: new ObjectId(id) })

    return NextResponse.json({ ok: true, notification: toJSON(updated) })
  } catch (error) {
    console.error("MARK NOTIFICATION READ ERROR:", error)
    return NextResponse.json({ ok: false, error: "Failed to mark notification as read." }, { status: 500 })
  }
})

