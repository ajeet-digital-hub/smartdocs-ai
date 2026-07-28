import { NextResponse } from "next/server"
import { requireParentAuth, getMongoDb, toJSON } from "@/lib/family-guardian-auth"

export const GET = requireParentAuth(async (req, family) => {
  return NextResponse.json({ ok: true, family: toJSON(family) })
})

export const PUT = requireParentAuth(async (req, family) => {
  try {
    const body = await req.json()
    const db = await getMongoDb()

    const updates: any = {}
    if (body.familyName) updates.familyName = body.familyName.trim()
    if (body.plan) updates.plan = body.plan

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ ok: false, error: "No fields to update." }, { status: 400 })
    }

    updates.updatedAt = new Date()

    await db.collection("families").updateOne(
      { _id: family._id },
      { $set: updates }
    )

    const updated = await db.collection("families").findOne({ _id: family._id })

    return NextResponse.json({ ok: true, family: toJSON(updated) })
  } catch (error) {
    console.error("UPDATE FAMILY ERROR:", error)
    return NextResponse.json({ ok: false, error: "Failed to update family." }, { status: 500 })
  }
})

