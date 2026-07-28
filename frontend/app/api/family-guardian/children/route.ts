import { NextResponse } from "next/server"
import { requireParentAuth, getMongoDb, toJSON } from "@/lib/family-guardian-auth"

export const GET = requireParentAuth(async (req, family) => {
  try {
    const db = await getMongoDb()
    const children = await db
      .collection("children")
      .find({ familyId: family._id })
      .sort({ name: 1 })
      .toArray()

    return NextResponse.json({ ok: true, children: children.map(toJSON) })
  } catch (error) {
    console.error("GET CHILDREN ERROR:", error)
    return NextResponse.json({ ok: false, error: "Failed to fetch children." }, { status: 500 })
  }
})

export const POST = requireParentAuth(async (req, family) => {
  try {
    const body = await req.json()
    const db = await getMongoDb()

    const { name, age, dateOfBirth, avatar } = body

    if (!name || typeof name !== "string" || name.trim().length < 1) {
      return NextResponse.json({ ok: false, error: "Child name is required." }, { status: 400 })
    }

    if (!age || typeof age !== "number" || age < 0 || age > 18) {
      return NextResponse.json({ ok: false, error: "Valid age (0-18) is required." }, { status: 400 })
    }

    // Check max children limit
    const count = await db.collection("children").countDocuments({ familyId: family._id })
    if (count >= (family.maxChildren || 5)) {
      return NextResponse.json({ ok: false, error: "Maximum children limit reached." }, { status: 400 })
    }

    const now = new Date()
    const child = {
      familyId: family._id,
      name: name.trim(),
      age,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      avatar: avatar || "",
      assignedDevices: [],
      screenTimeLimitDaily: 120,
      studyGoalDaily: 60,
      status: "active",
      createdAt: now,
      updatedAt: now,
    }

    const result = await db.collection("children").insertOne(child)

    // Log activity
    await db.collection("activitylogs").insertOne({
      familyId: family._id,
      childId: result.insertedId,
      action: "child_created",
      details: `Child profile '${name}' created`,
      createdAt: now,
    })

    const created = await db.collection("children").findOne({ _id: result.insertedId })

    return NextResponse.json({ ok: true, child: toJSON(created) }, { status: 201 })
  } catch (error) {
    console.error("CREATE CHILD ERROR:", error)
    return NextResponse.json({ ok: false, error: "Failed to create child profile." }, { status: 500 })
  }
})

