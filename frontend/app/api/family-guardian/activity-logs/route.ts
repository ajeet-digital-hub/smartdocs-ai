import { NextResponse } from "next/server"
import { requireParentAuth, getMongoDb, toJSON } from "@/lib/family-guardian-auth"
import { ObjectId } from "mongodb"

export const GET = requireParentAuth(async (req, family) => {
  try {
    const url = new URL(req.url)
    const childId = url.searchParams.get("childId")
    const limit = parseInt(url.searchParams.get("limit") || "50")
    const offset = parseInt(url.searchParams.get("offset") || "0")

    const db = await getMongoDb()

    const query: any = { familyId: family._id }
    if (childId && ObjectId.isValid(childId)) {
      query.childId = new ObjectId(childId)
    }

    const total = await db.collection("activitylogs").countDocuments(query)

    const logs = await db
      .collection("activitylogs")
      .find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(Math.min(limit, 100))
      .toArray()

    return NextResponse.json({
      ok: true,
      logs: logs.map(toJSON),
      total,
    })
  } catch (error) {
    console.error("GET ACTIVITY LOGS ERROR:", error)
    return NextResponse.json({ ok: false, error: "Failed to fetch logs." }, { status: 500 })
  }
})

