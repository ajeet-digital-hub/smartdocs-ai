import { NextResponse } from "next/server"
import { requireParentAuth, getMongoDb, toJSON } from "@/lib/family-guardian-auth"
import { ObjectId } from "mongodb"

export const GET = requireParentAuth(async (req, family) => {
  try {
    const url = new URL(req.url)
    const id = url.pathname.split("/").pop()
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ ok: false, error: "Invalid child ID." }, { status: 400 })
    }

    const db = await getMongoDb()
    const child = await db.collection("children").findOne({
      _id: new ObjectId(id),
      familyId: family._id,
    })

    if (!child) {
      return NextResponse.json({ ok: false, error: "Child not found." }, { status: 404 })
    }

    return NextResponse.json({ ok: true, child: toJSON(child) })
  } catch (error) {
    console.error("GET CHILD ERROR:", error)
    return NextResponse.json({ ok: false, error: "Failed to fetch child." }, { status: 500 })
  }
})

export const PUT = requireParentAuth(async (req, family) => {
  try {
    const url = new URL(req.url)
    const id = url.pathname.split("/").pop()
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ ok: false, error: "Invalid child ID." }, { status: 400 })
    }

    const body = await req.json()
    const db = await getMongoDb()

    // Verify ownership
    const existing = await db.collection("children").findOne({
      _id: new ObjectId(id),
      familyId: family._id,
    })
    if (!existing) {
      return NextResponse.json({ ok: false, error: "Child not found." }, { status: 404 })
    }

    const updates: any = { updatedAt: new Date() }
    if (body.name) updates.name = body.name.trim()
    if (body.age !== undefined) updates.age = body.age
    if (body.dateOfBirth) updates.dateOfBirth = new Date(body.dateOfBirth)
    if (body.avatar !== undefined) updates.avatar = body.avatar
    if (body.screenTimeLimitDaily !== undefined) updates.screenTimeLimitDaily = body.screenTimeLimitDaily
    if (body.studyGoalDaily !== undefined) updates.studyGoalDaily = body.studyGoalDaily
    if (body.status) updates.status = body.status

    await db.collection("children").updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    )

    const updated = await db.collection("children").findOne({ _id: new ObjectId(id) })

    return NextResponse.json({ ok: true, child: toJSON(updated) })
  } catch (error) {
    console.error("UPDATE CHILD ERROR:", error)
    return NextResponse.json({ ok: false, error: "Failed to update child." }, { status: 500 })
  }
})

export const DELETE = requireParentAuth(async (req, family) => {
  try {
    const url = new URL(req.url)
    const id = url.pathname.split("/").pop()
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ ok: false, error: "Invalid child ID." }, { status: 400 })
    }

    const db = await getMongoDb()

    const existing = await db.collection("children").findOne({
      _id: new ObjectId(id),
      familyId: family._id,
    })
    if (!existing) {
      return NextResponse.json({ ok: false, error: "Child not found." }, { status: 404 })
    }

    // Clean up child data
    await db.collection("children").deleteOne({ _id: new ObjectId(id) })
    await db.collection("devices").updateMany(
      { childId: new ObjectId(id) },
      { $set: { childId: null, updatedAt: new Date() } }
    )
    await db.collection("websitepolicies").deleteMany({ childId: new ObjectId(id) })
    await db.collection("apppolicies").deleteMany({ childId: new ObjectId(id) })
    await db.collection("schedules").deleteMany({ childId: new ObjectId(id) })

    return NextResponse.json({ ok: true, message: "Child profile deleted." })
  } catch (error) {
    console.error("DELETE CHILD ERROR:", error)
    return NextResponse.json({ ok: false, error: "Failed to delete child." }, { status: 500 })
  }
})

