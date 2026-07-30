import { NextResponse } from "next/server"
import { requireParentAuth, toJSON } from "@/lib/family-guardian-auth";
import dbConnect from "@/lib/dbConnect"
import { IFamily } from "@/models/Family"; // Import IFamily for typing
import Family from "@/models/Family"

export const GET = requireParentAuth(async (req, family) => {
  try {
    // The 'family' object is already provided by requireParentAuth
    if (!family) {
      return NextResponse.json({ ok: false, error: "Family not found for this user." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, family: toJSON(family) });
  } catch (error: any) {
    console.error("GET FAMILY API ERROR:", { message: error.message, stack: error.stack });
    return NextResponse.json({ ok: false, error: "Failed to retrieve family data." }, { status: 500 });
  }
})

export const PUT = requireParentAuth(async (req, family) => {
  try { // family is already InstanceType<typeof Family> from requireParentAuth
    await dbConnect()
    const body = await req.json()

    const updates: any = {}
    if (body.familyName) updates.familyName = body.familyName.trim()

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ ok: true, family: toJSON(family) }) // Nothing to update, return current state
    }

    const updated = await Family.findByIdAndUpdate<IFamily>(
      family._id,
      { $set: updates },
      { new: true }
    ).lean()

    return NextResponse.json({ ok: true, family: toJSON(updated) })
  } catch (error: unknown) {
    console.error("UPDATE FAMILY ERROR:", { message: (error as Error).message, stack: (error as Error).stack });
    return NextResponse.json({ ok: false, error: "Failed to update family." }, { status: 500 })
  }
})
