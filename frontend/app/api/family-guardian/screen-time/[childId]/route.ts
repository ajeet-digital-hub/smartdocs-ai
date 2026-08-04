import { NextResponse } from "next/server"
import { requireParentAuth, getMongoDb } from "@/lib/family-guardian-auth"
import { ObjectId } from "mongodb"

export const PUT = requireParentAuth(async (req, family) => {
  try {
    const url = new URL(req.url)
    const segments = url.pathname.split("/")
    const childId = segments[segments.length - 2]
    if (!childId || !ObjectId.isValid(childId)) {
      return NextResponse.json({ ok: false, error: "Invalid child ID." }, { status: 400 })
    }

    const body = await req.json()
    const db = await getMongoDb()

    const child = await db.collection("children").findOne({
      _id: new ObjectId(childId),
      familyId: family._id,
    })
    if (!child) {
      return NextResponse.json({ ok: false, error: "Child not found." }, { status: 404 })
    }

    const dailyLimitMinutes = body.dailyLimitMinutes
    if (typeof dailyLimitMinutes !== "number" || dailyLimitMinutes < 0 || dailyLimitMinutes > 1440) {
      return NextResponse.json({ ok: false, error: "Valid daily limit (0-1440 minutes) is required." }, { status: 400 })
    }

    await db.collection("children").updateOne(
      { _id: new ObjectId(childId) },
      { $set: { screenTimeLimitDaily: dailyLimitMinutes, updatedAt: new Date() } }
    )

    // Upsert screen time limit record
    await db.collection("screentimelimits").updateOne(
      { familyId: family._id, childId: new ObjectId(childId) },
      {
        $set: {
          dailyLimitMinutes,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          familyId: family._id,
          childId: new ObjectId(childId),
          createdAt: new Date(),
        },
      },
      { upsert: true }
    )

    return NextResponse.json({ ok: true, limit: { childId, dailyLimitMinutes } })
  } catch (error) {
    console.error("UPDATE SCREEN TIME LIMIT ERROR:", error)
    return NextResponse.json({ ok: false, error: "Failed to update screen time limit." }, { status: 500 })
  }
})

