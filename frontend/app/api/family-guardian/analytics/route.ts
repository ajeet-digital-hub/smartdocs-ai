import { NextResponse } from "next/server"
import { requireParentAuth, getMongoDb, toJSON } from "@/lib/family-guardian-auth"
import { ObjectId } from "mongodb"

export const GET = requireParentAuth(async (req, family) => {
  try {
    const url = new URL(req.url)
    const childId = url.searchParams.get("childId")
    const period = url.searchParams.get("period") || "today"

    const db = await getMongoDb()

    // Get children
    const childrenQuery: any = { familyId: family._id }
    if (childId && ObjectId.isValid(childId)) {
      childrenQuery._id = new ObjectId(childId)
    }
    const children = await db.collection("children").find(childrenQuery).toArray()

    // Get all devices
    const devices = await db.collection("devices")
      .find({ familyId: family._id, status: { $ne: "revoked" } })
      .toArray()

    // Get pending unlock requests count
    const pendingUnlocks = await db.collection("unlockrequests")
      .countDocuments({ familyId: family._id, status: "pending" })

    // Get pending emergency requests count
    const pendingEmergency = await db.collection("emergencyaccessrequests")
      .countDocuments({ familyId: family._id, status: "pending" })

    // Get total policies
    const totalWebsitePolicies = await db.collection("websitepolicies")
      .countDocuments({ familyId: family._id, isActive: true })
    const totalAppPolicies = await db.collection("apppolicies")
      .countDocuments({ familyId: family._id, isActive: true })

    // Get total active schedules
    const totalSchedules = await db.collection("schedules")
      .countDocuments({ familyId: family._id, isActive: true })

    // Get recent activity count
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayActivities = await db.collection("activitylogs")
      .countDocuments({ familyId: family._id, createdAt: { $gte: today } })

    const analytics = {
      overview: {
        totalChildren: children.length,
        totalDevices: devices.length,
        onlineDevices: devices.filter((d: any) => d.status === "online").length,
        pendingUnlocks,
        pendingEmergency,
        totalWebsitePolicies,
        totalAppPolicies,
        totalSchedules,
        todayActivities,
      },
      children: children.map((child: any) => toJSON(child)),
      devices: devices.map((d: any) => ({
        ...toJSON(d),
        child: children.find((c: any) => c._id.toString() === (d.childId?.toString() || "")),
      })),
      period,
    }

    return NextResponse.json({ ok: true, analytics })
  } catch (error) {
    console.error("ANALYTICS ERROR:", error)
    return NextResponse.json({ ok: false, error: "Failed to fetch analytics." }, { status: 500 })
  }
})

