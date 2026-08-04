import { NextResponse } from "next/server";
import { requireParentAuth } from "@/lib/family-guardian-auth";
import AppPolicy from "@/models/AppPolicy";
import { IAppPolicy } from "@/models/AppPolicy"; // Import interface for typing
import Child from "@/models/Child";
import dbConnect from "@/lib/dbConnect";

/**
 * GET /api/family-guardian/policies
 *
 * Retrieves all app policies for a specific child.
 * Expects a `childId` query parameter.
 */
export const GET = requireParentAuth(async (req, family, session) => {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const childId = searchParams.get("childId");

    if (!childId) {
      return NextResponse.json({ ok: false, error: "Child ID is required" }, { status: 400 });
    }

    const policies = await AppPolicy.find({ childId, familyId: family._id }).lean();
    return NextResponse.json({ ok: true, policies });
  } catch (error) {
    console.error("GET APP POLICIES ERROR:", { message: (error as Error).message, stack: (error as Error).stack });
    return NextResponse.json({ ok: false, error: "Failed to retrieve app policies" }, { status: 500 });
  }
});

/**
 * POST /api/family-guardian/policies
 *
 * Updates an existing application policy.
 */
export const POST = requireParentAuth(async (req, family, session) => {
  try {
    await dbConnect();
    const body = await req.json();
    const { childId, appId, appName, appPackage, appStoreId, category, status, dailyLimitMinutes, scheduleBlocks, icon } = body as IAppPolicy;

    if (!childId || !appId || !appName || !category || !status) {
      return NextResponse.json({ ok: false, error: "Missing required policy fields" }, { status: 400 });
    }

    // Ensure child belongs to family
    const child = await Child.findOne({ _id: childId, familyId: family._id });
    if (!child) {
      return NextResponse.json({ ok: false, error: "Child not found or does not belong to your family" }, { status: 404 });
    }

    const newPolicy = await AppPolicy.create({
      childId: child._id,
      familyId: family._id,
      appId,
      appName,
      appPackage,
      appStoreId,
      category,
      icon,
      status,
      dailyLimitMinutes,
      scheduleBlocks: scheduleBlocks || [],
      policyVersion: 1, // Initial version
    });

    // TODO: Increment policyVersion for all policies for this child/family to trigger device sync

    return NextResponse.json({ ok: true, policy: newPolicy }, { status: 201 });
  } catch (error: unknown) {
    console.error("CREATE APP POLICY ERROR:", { message: (error as Error).message, stack: (error as Error).stack });
    return NextResponse.json({ ok: false, error: "Failed to create app policy" }, { status: 500 });
  }
});