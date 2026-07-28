import { NextResponse } from "next/server"
import { requireParentAuth, getMongoDb, toJSON } from "@/lib/family-guardian-auth"

export const GET = requireParentAuth(async (req, family) => {
  try {
    const db = await getMongoDb()
    const devices = await db
      .collection("devices")
      .find({ familyId: family._id, status: { $ne: "revoked" } })
      .sort({ lastSeen: -1 })
      .toArray()

    return NextResponse.json({ ok: true, devices: devices.map(toJSON) })
  } catch (error) {
    console.error("GET DEVICES ERROR:", error)
    return NextResponse.json({ ok: false, error: "Failed to fetch devices." }, { status: 500 })
  }
})

