import { NextResponse } from "next/server"
import { requireParentAuth, getMongoDb, toJSON } from "@/lib/family-guardian-auth"
import { ObjectId } from "mongodb"

export const PUT = requireParentAuth(async (req, family) => {
  try {
    const url = new URL(req.url)
    const segments = url.pathname.split("/")
    const id = segments[segments.length - 2]
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ ok: false, error: "Invalid policy ID." }, { status: 400 })
    }

    const body = await req.json()
    const db = await getMongoDb()

    const existing = await db.collection("apppolicies").findOne({
      _id: new ObjectId(id),
      familyId: family._id,
    })
    if (!existing) {
      return NextResponse.json({ ok: false, error: "Policy not found." }, { status: 404 })
    }

    const updates: any = { updatedAt: new Date() }
    if (body.state) updates.state = body.state
    if (body.appName) updates.appName = body.appName
    if (body.category !== undefined) updates.category = body.category
    if (body.dailyLimitMinutes !== undefined) updates.dailyLimitMinutes = body.dailyLimitMinutes
    if (body.scheduleStart !== undefined) updates.scheduleStart = body.scheduleStart
    if (body.scheduleEnd !== undefined) updates.scheduleEnd = body.scheduleEnd
    if (body.allowedDays) updates.allowedDays = body.allowedDays
    if (body.isActive !== undefined) updates.isActive = body.isActive

    await db.collection("apppolicies").updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    )

    const updated = await db.collection("apppolicies").findOne({ _id: new ObjectId(id) })

    return NextResponse.json({ ok: true, policy: toJSON(updated) })
  } catch (error) {
    console.error("UPDATE APP POLICY ERROR:", error)
    return NextResponse.json({ ok: false, error: "Failed to update policy." }, { status: 500 })
  }
})

export const DELETE = requireParentAuth(async (req, family) => {
  try {
    const url = new URL(req.url)
    const segments = url.pathname.split("/")
    const id = segments[segments.length - 2]
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ ok: false, error: "Invalid policy ID." }, { status: 400 })
    }

    const db = await getMongoDb()
    const existing = await db.collection("apppolicies").findOne({
      _id: new ObjectId(id),
      familyId: family._id,
    })
    if (!existing) {
      return NextResponse.json({ ok: false, error: "Policy not found." }, { status: 404 })
    }

    await db.collection("apppolicies").deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ ok: true, message: "Policy deleted." })
  } catch (error) {
    console.error("DELETE APP POLICY ERROR:", error)
    return NextResponse.json({ ok: false, error: "Failed to delete policy." }, { status: 500 })
  }
})

