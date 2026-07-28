import { NextResponse } from "next/server"
import { requireParentAuth, getMongoDb, toJSON } from "@/lib/family-guardian-auth"
import { ObjectId } from "mongodb"

export const GET = requireParentAuth(async (req, family) => {
  try {
    const url = new URL(req.url)
    const id = url.pathname.split("/")[url.pathname.split("/").length - 2]
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ ok: false, error: "Invalid device ID." }, { status: 400 })
    }

    const db = await getMongoDb()
    const device = await db.collection("devices").findOne({
      _id: new ObjectId(id),
      familyId: family._id,
    })

    if (!device) {
      return NextResponse.json({ ok: false, error: "Device not found." }, { status: 404 })
    }

    return NextResponse.json({ ok: true, device: toJSON(device) })
  } catch (error) {
    console.error("GET DEVICE ERROR:", error)
    return NextResponse.json({ ok: false, error: "Failed to fetch device." }, { status: 500 })
  }
})

export const PUT = requireParentAuth(async (req, family) => {
  try {
    const url = new URL(req.url)
    const id = url.pathname.split("/")[url.pathname.split("/").length - 2]
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ ok: false, error: "Invalid device ID." }, { status: 400 })
    }

    const body = await req.json()
    const db = await getMongoDb()

    const existing = await db.collection("devices").findOne({
      _id: new ObjectId(id),
      familyId: family._id,
    })
    if (!existing) {
      return NextResponse.json({ ok: false, error: "Device not found." }, { status: 404 })
    }

    const updates: any = { updatedAt: new Date() }
    if (body.name) updates.name = body.name.trim()
    if (body.status) updates.status = body.status

    await db.collection("devices").updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    )

    const updated = await db.collection("devices").findOne({ _id: new ObjectId(id) })

    return NextResponse.json({ ok: true, device: toJSON(updated) })
  } catch (error) {
    console.error("UPDATE DEVICE ERROR:", error)
    return NextResponse.json({ ok: false, error: "Failed to update device." }, { status: 500 })
  }
})

