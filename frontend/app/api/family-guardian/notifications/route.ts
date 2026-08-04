import { NextResponse } from "next/server"
import { requireParentAuth, getMongoDb, toJSON } from "@/lib/family-guardian-auth"

export const GET = requireParentAuth(async (req, family) => {
  try {
    const url = new URL(req.url)
    const unreadOnly = url.searchParams.get("unreadOnly")
    const db = await getMongoDb()

    const query: any = { familyId: family._id }
    if (unreadOnly === "true") query.read = false

    const notifications = await db
      .collection("notifications")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray()

    const unreadCount = await db.collection("notifications")
      .countDocuments({ familyId: family._id, read: false })

    return NextResponse.json({
      ok: true,
      notifications: notifications.map(toJSON),
      unreadCount,
    })
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error)
    return NextResponse.json({ ok: false, error: "Failed to fetch notifications." }, { status: 500 })
  }
})

