import { NextResponse } from "next/server"
import { requireParentAuth, getMongoDb, toJSON } from "@/lib/family-guardian-auth"

export const GET = requireParentAuth(async (req, family) => {
  try {
    const url = new URL(req.url)
    const status = url.searchParams.get("status")
    const db = await getMongoDb()

    const query: any = { familyId: family._id }
    if (status) query.status = status

    const requests = await db
      .collection("unlockrequests")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray()

    return NextResponse.json({ ok: true, requests: requests.map(toJSON) })
  } catch (error) {
    console.error("GET UNLOCK REQUESTS ERROR:", error)
    return NextResponse.json({ ok: false, error: "Failed to fetch requests." }, { status: 500 })
  }
})

