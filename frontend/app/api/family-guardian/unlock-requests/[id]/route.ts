import { NextResponse } from "next/server"
import { requireParentAuth, getMongoDb, toJSON } from "@/lib/family-guardian-auth"
import { ObjectId } from "mongodb"

export const GET = requireParentAuth(async (req, family) => {
  try {
    const url = new URL(req.url)
    const segments = url.pathname.split("/")
    const id = segments[segments.length - 2]
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ ok: false, error: "Invalid request ID." }, { status: 400 })
    }

    const db = await getMongoDb()
    const request = await db.collection("unlockrequests").findOne({
      _id: new ObjectId(id),
      familyId: family._id,
    })

    if (!request) {
      return NextResponse.json({ ok: false, error: "Request not found." }, { status: 404 })
    }

    return NextResponse.json({ ok: true, request: toJSON(request) })
  } catch (error) {
    console.error("GET UNLOCK REQUEST ERROR:", error)
    return NextResponse.json({ ok: false, error: "Failed to fetch request." }, { status: 500 })
  }
})

export const POST = requireParentAuth(async (req, family) => {
  try {
    const url = new URL(req.url)
    const segments = url.pathname.split("/")
    const id = segments[segments.length - 2]
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ ok: false, error: "Invalid request ID." }, { status: 400 })
    }

    const body = await req.json()
    const { action, durationMinutes } = body

    if (!action || !["approve", "deny"].includes(action)) {
      return NextResponse.json({ ok: false, error: "Valid action (approve/deny) is required." }, { status: 400 })
    }

    const db = await getMongoDb()
    const existing = await db.collection("unlockrequests").findOne({
      _id: new ObjectId(id),
      familyId: family._id,
    })

    if (!existing) {
      return NextResponse.json({ ok: false, error: "Request not found." }, { status: 404 })
    }

    if (existing.status !== "pending") {
      return NextResponse.json({ ok: false, error: "Request already processed." }, { status: 400 })
    }

    const now = new Date()
    const updates: any = {
      status: action === "approve" ? "approved" : "denied",
      respondedAt: now,
      updatedAt: now,
    }

    if (action === "approve" && durationMinutes) {
      updates.approvedDurationMinutes = durationMinutes
      updates.expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000)
    }

    await db.collection("unlockrequests").updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    )

    // Log activity
    await db.collection("activitylogs").insertOne({
      familyId: family._id,
      childId: existing.childId,
      action: action === "approve" ? "unlock_approved" : "unlock_denied",
      details: `${action === "approve" ? "Approved" : "Denied"} unlock request for ${existing.targetDomain || existing.targetApp}`,
      metadata: { requestId: id, durationMinutes },
      createdAt: now,
    })

    const updated = await db.collection("unlockrequests").findOne({ _id: new ObjectId(id) })

    return NextResponse.json({ ok: true, request: toJSON(updated) })
  } catch (error) {
    console.error("RESPOND UNLOCK REQUEST ERROR:", error)
    return NextResponse.json({ ok: false, error: "Failed to process request." }, { status: 500 })
  }
})

