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

    const limits = await db
      .collection("screentimelimits")
      .find(query)
      .toArray()

    return NextResponse.json({ ok: true, limits: limits.map(toJSON) })
  } catch (error) {
    console.error("GET SCREEN TIME LIMITS ERROR:", error)
    return NextResponse.json({ ok: false, error: "Failed to fetch limits." }, { status: 500 })
  }
})

