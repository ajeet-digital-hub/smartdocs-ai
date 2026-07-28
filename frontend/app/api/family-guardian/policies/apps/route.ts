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
      query.$or = [
        { childId: new ObjectId(childId) },
        { childId: null },
      ]
    }

    const policies = await db
      .collection("apppolicies")
      .find(query)
      .sort({ appName: 1 })
      .toArray()

    return NextResponse.json({ ok: true, policies: policies.map(toJSON) })
  } catch (error) {
    console.error("GET APP POLICIES ERROR:", error)
    return NextResponse.json({ ok: false, error: "Failed to fetch policies." }, { status: 500 })
  }
})

export const POST = requireParentAuth(async (req, family) => {
  try {
    const body = await req.json()
    const db = await getMongoDb()

    const { appId, appName, state, childId, platform, category, dailyLimitMinutes, scheduleStart, scheduleEnd, allowedDays, timezone, packageName } = body

    if (!appId || !appName || !state) {
      return NextResponse.json({ ok: false, error: "App ID, name, and state are required." }, { status: 400 })
    }

    const validStates = ["allowed", "limited", "scheduled", "blocked"]
    if (!validStates.includes(state)) {
      return NextResponse.json({ ok: false, error: "Invalid policy state." }, { status: 400 })
    }

    const now = new Date()
    const policy = {
      familyId: family._id,
      childId: childId && ObjectId.isValid(childId) ? new ObjectId(childId) : null,
      scope: childId ? "child" : "global",
      appId,
      appName,
      packageName: packageName || null,
      platform: platform || "all",
      category: category || null,
      state,
      dailyLimitMinutes: dailyLimitMinutes || null,
      scheduleStart: scheduleStart || null,
      scheduleEnd: scheduleEnd || null,
      allowedDays: allowedDays || [0, 1, 2, 3, 4, 5, 6],
      timezone: timezone || "UTC",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }

    const result = await db.collection("apppolicies").insertOne(policy)
    const created = await db.collection("apppolicies").findOne({ _id: result.insertedId })

    return NextResponse.json({ ok: true, policy: toJSON(created) }, { status: 201 })
  } catch (error) {
    console.error("CREATE APP POLICY ERROR:", error)
    return NextResponse.json({ ok: false, error: "Failed to create policy." }, { status: 500 })
  }
})

