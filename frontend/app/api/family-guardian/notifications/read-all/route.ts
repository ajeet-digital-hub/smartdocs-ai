import { NextResponse } from "next/server"
import { requireParentAuth, getMongoDb } from "@/lib/family-guardian-auth"

export const POST = requireParentAuth(async (req, family) => {
  try {
    const db = await getMongoDb()
    await db.collection("notifications").updateMany(
      { familyId: family._id, read: false },
      { $set: { read: true } }
    )

    return NextResponse.json({ ok: true, message: "All notifications marked as read." })
  } catch (error) {
    console.error("MARK ALL READ ERROR:", error)
    return NextResponse.json({ ok: false, error: "Failed to mark notifications as read." }, { status: 500 })
  }
})

