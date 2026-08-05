import { NextResponse } from "next/server";
import { requireParentAuth, toJSON } from "@/lib/family-guardian-auth";
import { getMongoClient } from "@/lib/mongodb";
import { generateAIResponseWithUsage } from "@/lib/ai-provider";

/**
 * GET /api/family-guardian/insight
 *
 * Generates an AI insight for the parent's family dashboard using the SmartDocs
 * AI provider. It gathers real Family Guardian metrics (children, devices,
 * policies, schedules, recent activity) and asks the AI to produce a short,
 * actionable insight. No mock or static data is used.
 */
export const GET = requireParentAuth(async (req, family) => {
  try {
    const client = await getMongoClient();
    const db = client.db(process.env.MONGODB_DB_NAME || "smartdocs-ai");

    // Gather real family metrics.
    const children = await db.collection("children")
      .find({ familyId: family._id })
      .toArray();

    const devices = await db.collection("devices")
      .find({ familyId: family._id, status: { $ne: "revoked" } })
      .toArray();

    const activeAppPolicies = await db.collection("apppolicies")
      .countDocuments({ familyId: family._id, isActive: true });

    const activeSchedules = await db.collection("schedules")
      .countDocuments({ familyId: family._id, isActive: true });

    const pendingUnlocks = await db.collection("unlockrequests")
      .countDocuments({ familyId: family._id, status: "pending" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayActivities = await db.collection("activitylogs")
      .countDocuments({ familyId: family._id, createdAt: { $gte: today } });

    const summary = {
      totalChildren: children.length,
      childNames: children.map((c: any) => c.name || "child"),
      totalDevices: devices.length,
      onlineDevices: devices.filter((d: any) => d.status === "online").length,
      activeAppPolicies,
      activeSchedules,
      pendingUnlocks,
      todayActivities,
    };

    const prompt = `You are the SmartDocs Family Guardian assistant. Based on the following real family data, write one concise, supportive, actionable insight (2-3 sentences) for a parent. Offer a practical suggestion. Do not invent data beyond what is provided.

Family data: ${JSON.stringify(summary)}`;

    const { response } = await generateAIResponseWithUsage(prompt);

    return NextResponse.json({
      ok: true,
      insight: response.trim(),
      summary: toJSON(summary),
    });
  } catch (error) {
    console.error("FAMILY GUARDIAN INSIGHT ERROR:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to generate AI insight." },
      { status: 500 }
    );
  }
});
