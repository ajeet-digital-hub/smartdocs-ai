import { NextResponse } from "next/server";
import { requireParentAuth } from "@/lib/family-guardian-auth";
import Child from "@/models/Child";
import dbConnect from "@/lib/dbConnect";

/**
 * GET /api/family-guardian/children/[childId]
 *
 * Retrieves a single child's details, ensuring the parent has access.
 */
async function getChildHandler(req: Request, family: any, session: any, { params }: { params: { childId: string } }) {
  try {
    await dbConnect(); // Ensure DB connection
    const { childId } = params;

    const child = await Child.findOne({ _id: childId, familyId: family._id }).lean();

    if (!child) {
      return NextResponse.json({ ok: false, error: "Child not found or access denied." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, child });
  } catch (error: any) {
    console.error("GET CHILD API ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to retrieve child data." }, { status: 500 });
  }
}

export const GET = requireParentAuth(getChildHandler as any);