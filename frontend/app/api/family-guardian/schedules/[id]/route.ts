import { NextResponse } from "next/server"
import { requireParentAuth, getMongoDb, toJSON } from "@/lib/family-guardian-auth"
import { ObjectId } from "mongodb"

export const PUT = requireParentAuth(async (req, family) => {
  try {
    const url = new URL(req.url)
    const segments = url.pathname.split("/")
    const id = segments[segments.length - 2]
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ ok: false, error: "Invalid schedule ID." }, { status: 400 })
    }

    const body = await req.json()
    const db = await getMongoDb()

    const existing = await db.collection("schedules").findOne({
      _id: new ObjectId(id),
      familyId: family._id,
    })
    if (!existing) {
      return NextResponse.json({ ok: false, error: "Schedule not found." }, { status: 404 })
    }

    const updates: any = { updatedAt: new Date() }
    if (body.name) updates.name = body.name
    if (body.type) updates.type = body.type
    if (body.startTime) updates.startTime = body.startTime
    if (body.endTime) updates.endTime = body.endTime
    if (body.days) updates.days = body.days
    if (body.timezone) updates.timezone = body.timezone
    if (body.isActive !== undefined) updates.isActive = body.isActive
    if (body.sleepMode !== undefined) updates.sleepMode = body.sleepMode
    if (body.emergencyAccessEnabled !== undefined) updates.emergencyAccessEnabled = body.emergencyAccessEnabled
    if (body.blockedCategories) updates.blockedCategories = body.blockedCategories
    if (body.blockedWebsites) updates.blockedWebsites = body.blockedWebsites
    if (body.blockedApps) updates.blockedApps = body.blockedApps

    await db.collection("schedules").updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    )

    const updated = await db.collection("schedules").findOne({ _id: new ObjectId(id) })

    return NextResponse.json({ ok: true, schedule: toJSON(updated) })
  } catch (error) {
    console.error("UPDATE SCHEDULE ERROR:", error)
    return NextResponse.json({ ok: false, error: "Failed to update schedule." }, { status: 500 })
  }
})

export const DELETE = requireParentAuth(async (req, family) => {
  try {
    const url = new URL(req.url)
    const segments = url.pathname.split("/")
    const id = segments[segments.length - 2]
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ ok: false, error: "Invalid schedule ID." }, { status: 400 })
    }

    const db = await getMongoDb()
    const existing = await db.collection("schedules").findOne({
      _id: new ObjectId(id),
      familyId: family._id,
    })
    if (!existing) {
      return NextResponse.json({ ok: false, error: "Schedule not found." }, { status: 404 })
    }

    await db.collection("schedules").deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ ok: true, message: "Schedule deleted." })
  } catch (error) {
    console.error("DELETE SCHEDULE ERROR:", error)
    return NextResponse.json({ ok: false, error: "Failed to delete schedule." }, { status: 500 })
  }
})

