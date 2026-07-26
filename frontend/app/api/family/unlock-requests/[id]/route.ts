import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import mongoose from "mongoose";
import Family from "@/models/Family";
import UnlockRequest from "@/models/UnlockRequest";
import ActivityLog from "@/models/ActivityLog";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status, deniedReason } = body;

    const validStatuses = ["approved_once", "approved_10min", "approved_30min", "denied"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ ok: false, error: "Invalid status. Must be one of: " + validStatuses.join(", ") }, { status: 400 });
    }

    if (mongoose.connection.readyState !== 1) {
      if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI not set");
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const family = await Family.findOne({ parentId: session.user.id });
    if (!family) {
      return NextResponse.json({ ok: false, error: "Family not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = { status };
    if (deniedReason) updateData.deniedReason = deniedReason;

    // Calculate approvedUntil for time-based approvals
    if (status === "approved_10min") {
      updateData.approvedUntil = new Date(Date.now() + 10 * 60 * 1000);
    } else if (status === "approved_30min") {
      updateData.approvedUntil = new Date(Date.now() + 30 * 60 * 1000);
    } else if (status === "approved_once") {
      updateData.approvedUntil = new Date(Date.now() + 5 * 60 * 1000); // 5 min
    }

    const unlockRequest = await UnlockRequest.findOneAndUpdate(
      { _id: params.id, familyId: family._id },
      { $set: updateData },
      { new: true }
    ).lean();

    if (!unlockRequest) {
      return NextResponse.json({ ok: false, error: "Unlock request not found" }, { status: 404 });
    }

    const actionType = status.startsWith("approved") ? "unlock_approved" : "unlock_denied";
    await ActivityLog.create({
      familyId: family._id,
      childId: unlockRequest.childId,
      parentId: session.user.id,
      action: actionType,
      details: `${status === "denied" ? "Denied" : "Approved"} unlock request for ${unlockRequest.websiteName}${deniedReason ? `: ${deniedReason}` : ""}`,
    });

    return NextResponse.json({ ok: true, unlockRequest });
  } catch (error) {
    console.error("UNLOCK REQUEST PUT ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to update unlock request" }, { status: 500 });
  }
}

