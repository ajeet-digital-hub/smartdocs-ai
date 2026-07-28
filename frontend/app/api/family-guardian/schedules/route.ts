import { NextResponse } from "next/server"
import { requireParentAuth, getMongoDb, toJSON } from "@/lib/family-guardian-auth"
import { ObjectId } from "mongodb"

export const GET = requireParentAuth(async (req, family) => {
  try {
    const url = new URL(req.url)
    const childId = url.searchParams.get("childId")
    const db = await getMongoDb()

    const query: any = { familyId: family._id }
    if (childId && ObjectId.isValid(childId)) {
      query.childId = new ObjectId(childId)
    }

    const schedules = await db
      .collection("schedules")
      .find(query)
      .sort({ startTime: 1 })
      .toArray()

    return NextResponse.json({ ok: true, schedules: schedules.map(toJSON) })
  } catch (error) {
    console.error("GET SCHEDULES ERROR:", error)
    return NextResponse.json({ ok: false, error: "Failed to fetch schedules." }, { status: 500 })
  }
})

export const POST = requireParentAuth(async (req, family) => {
  try {
    const body = await req.json()
    const db = await getMongoDb()

    const { name, type, startTime, endTime, days, childId, timezone, sleepMode, blockedCategories, blockedWebsites, blockedApps } = body

    if (!name || !type || !startTime || !endTime) {
      return NextResponse.json({ ok: false, error: "Name, type, start time, and end time are required." }, { status: 400 })
    }

    const validTypes = ["study", "school", "sleep", "free", "custom"]
    if (!validTypes.includes(type)) {
      return NextResponse.json({ ok: false, error: "Invalid schedule type." }, { status: 400 })
    }

    const now = new Date()
    const schedule = {
      familyId: family._id,
      childId: childId && ObjectId.isValid(childId) ? new ObjectId(childId) : null,
      name,
      type,
      startTime,
      endTime,
      days: days || [0, 1, 2, 3, 4, 5, 6],
      timezone: timezone || "UTC",
      isActive: true,
      policyScope: "all",
      blockedCategories: blockedCategories || [],
      blockedWebsites: blockedWebsites || [],
      blockedApps: blockedApps || [],
      allowedCategories: [],
      allowedWebsites: [],
      allowedApps: [],
      sleepMode: sleepMode || false,
      emergencyAccessEnabled: true,
      createdAt: now,
      updatedAt: now,
    }

    const result = await db.collection("schedules").insertOne(schedule)
    const created = await db.collection("schedules").findOne({ _id: result.insertedId })

    return NextResponse.json({ ok: true, schedule: toJSON(created) }, { status: 201 })
  } catch (error) {
    console.error("CREATE SCHEDULE ERROR:", error)
    return NextResponse.json({ ok: false, error: "Failed to create schedule." }, { status: 500 })
  }
})

