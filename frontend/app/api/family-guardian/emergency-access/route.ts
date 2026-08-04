import { NextResponse } from "next/server"
import { requireParentAuth, getMongoDb, toJSON } from "@/lib/family-guardian-auth"

export const GET = requireParentAuth(async (req, family) => {
  try {
    const db = await getMongoDb()
    const requests = await db
      .collection("emergencyaccessrequests")
      .find({ familyId: family._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray()

    return NextResponse.json({ ok: true, requests: requests.map(toJSON) })
  } catch (error) {
    console.error("GET EMERGENCY REQUESTS ERROR:", error)
    return NextResponse.json({ ok: false, error: "Failed to fetch requests." }, { status: 500 })
  }
})

