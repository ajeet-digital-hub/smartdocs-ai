import { NextResponse } from "next/server";
import { requireParentAuth } from "@/lib/family-guardian-auth";
import Child from "@/models/Child";
import dbConnect from "@/lib/dbConnect";
import { getPlanLimits } from "@/lib/plan-config";

/**
 * GET /api/family-guardian/children
 * Fetches all children for the authenticated parent's family.
 */
export const GET = requireParentAuth(async (req, family, session) => {
  try {
    await dbConnect();
    const children = await Child.find({ familyId: family._id }).sort({ name: 1 }).lean();
    return NextResponse.json({ ok: true, children });
  } catch (error: any) {
    console.error("CHILDREN GET API ERROR:", { message: error.message, stack: error.stack });
    const errorMessage = process.env.NODE_ENV === "development" ? `Failed to fetch children: ${error.message}` : "Failed to fetch children";
    return NextResponse.json({ ok: false, error: errorMessage }, { status: 500 });
  }
});

/**
 * POST /api/family-guardian/children
 * Creates a new child for the authenticated parent's family.
 */
export const POST = requireParentAuth(async (req, family, session) => {
  try {
    await dbConnect();
    const body = await req.json();
    const { name, age, avatar } = body;

    if (!name || !age) {
      return NextResponse.json({ ok: false, error: "Name and age are required." }, { status: 400 });
    }

    // --- Phase 19: Usage Limit Enforcement ---
    const limits = getPlanLimits(family.subscriptionId?.planId || 'free');
    const currentChildCount = await Child.countDocuments({ familyId: family._id });

    if (currentChildCount >= limits.maxChildren) {
      return NextResponse.json({
        ok: false,
        error: `Your current plan supports a maximum of ${limits.maxChildren} children. Please upgrade your plan to add more.`
      }, { status: 403 }); // 403 Forbidden
    }

    const child = await Child.create({
      familyId: family._id,
      name,
      age,
      avatar,
    });

    return NextResponse.json({
      ok: true,
      child,
    }, { status: 201 });
  } catch (error) {
    console.error("CHILDREN POST API ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to create child." }, { status: 500 }); // More specific error message in dev
  }
});