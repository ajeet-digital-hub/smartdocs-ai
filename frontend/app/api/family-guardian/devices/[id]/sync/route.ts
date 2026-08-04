import { NextResponse } from "next/server"
import { requireParentAuth, getMongoDb } from "@/lib/family-guardian-auth"
import { ObjectId } from "mongodb"

export const POST = requireParentAuth(async (req, family) => {
  try {
    const url = new URL(req.url)
    const segments = url.pathname.split("/")
    const id = segments[segments.length - 2]
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

    // Gather all active policies and schedules for this device/child
    const childId = device.childId
    const policies: any[] = []
    const schedules: any[] = []

    // Global policies (no child assigned)
    const globalWebsites = await db.collection("websitepolicies")
      .find({ familyId: family._id, childId: null, isActive: true })
      .toArray()
    policies.push(...globalWebsites)

    const globalApps = await db.collection("apppolicies")
      .find({ familyId: family._id, childId: null, isActive: true })
      .toArray()
    policies.push(...globalApps)

    if (childId) {
      const childWebsites = await db.collection("websitepolicies")
        .find({ familyId: family._id, childId: childId, isActive: true })
        .toArray()
      policies.push(...childWebsites)

      const childApps = await db.collection("apppolicies")
        .find({ familyId: family._id, childId: childId, isActive: true })
        .toArray()
      policies.push(...childApps)

      const childSchedules = await db.collection("schedules")
        .find({ familyId: family._id, childId: childId, isActive: true })
        .toArray()
      schedules.push(...childSchedules)

      // Get child screen time limit
      const child = await db.collection("children").findOne({ _id: childId })
      if (child) {
        policies.push({
          type: "screen_time_limit",
          dailyLimitMinutes: child.screenTimeLimitDaily,
        })
      }
    }

    // Update sync status
    await db.collection("devices").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          policySyncStatus: "synced",
          lastSeen: new Date(),
          updatedAt: new Date(),
          connectionStatus: "connected",
        },
      }
    )

    return NextResponse.json({
      ok: true,
      message: "Policies synchronized.",
      policies: policies.map((p) => ({
        id: p._id?.toString(),
        type: p.domain ? "website" : p.appId ? "app" : p.type || "policy",
        ...(p.domain ? { domain: p.domain, displayName: p.displayName } : {}),
        ...(p.appId ? { appId: p.appId, appName: p.appName, packageName: p.packageName } : {}),
        state: p.state,
        dailyLimitMinutes: p.dailyLimitMinutes,
        scheduleStart: p.scheduleStart,
        scheduleEnd: p.scheduleEnd,
        allowedDays: p.allowedDays,
      })),
      schedules,
    })
  } catch (error) {
    console.error("SYNC POLICIES ERROR:", error)
    return NextResponse.json({ ok: false, error: "Failed to sync policies." }, { status: 500 })
  }
})

