import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import Family from "@/models/Family";
import Child from "@/models/Child";
import ActivityLog from "@/models/ActivityLog";
import mongoose from "mongoose";

async function ensureFamily(userId: string) {
  let family = await Family.findOne({ parentId: new mongoose.Types.ObjectId(userId) });
  if (!family) {
    family = await Family.create({ parentId: new mongoose.Types.ObjectId(userId), name: "My Family" });
  }
  return family;
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const family = await ensureFamily(session.user.id);
    if (!family) {
      return NextResponse.json({ ok: false, error: "Family not found" }, { status: 404 });
    }

    const child = await Child.findOne({ _id: params.id, familyId: family._id }).lean();
    if (!child) {
      return NextResponse.json({ ok: false, error: "Child not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, child });
  } catch (error: any) {
    console.error("CHILD GET ERROR:", { message: error.message, stack: error.stack });
    return NextResponse.json({ ok: false, error: "Failed to fetch child" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { name, age, dateOfBirth, avatar, screenTimeLimitDaily, studyGoalDaily, status } = body;

    const family = await ensureFamily(session.user.id);
    if (!family) {
      return NextResponse.json({ ok: false, error: "Family not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (age !== undefined) updateData.age = age;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = new Date(dateOfBirth);
    if (avatar !== undefined) updateData.avatar = avatar;
    if (screenTimeLimitDaily !== undefined) updateData.screenTimeLimitDaily = screenTimeLimitDaily;
    if (studyGoalDaily !== undefined) updateData.studyGoalDaily = studyGoalDaily;
    if (status !== undefined) updateData.status = status;

    const child = await Child.findOneAndUpdate(
      { _id: params.id, familyId: family._id },
      { $set: updateData },
      { new: true }
    ).lean();

    if (!child) {
      return NextResponse.json({ ok: false, error: "Child not found" }, { status: 404 });
    }

    await ActivityLog.create({
      familyId: family._id,
      childId: child._id,
      parentId: new mongoose.Types.ObjectId(session.user.id),
      action: "child_updated",
      details: `Updated child profile: ${child.name}`,
    });

    return NextResponse.json({ ok: true, child });
  } catch (error: any) {
    console.error("CHILD PUT ERROR:", { message: error.message, stack: error.stack });
    return NextResponse.json({ ok: false, error: "Failed to update child" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const family = await ensureFamily(session.user.id);
    const child = await Child.findOneAndDelete({ _id: params.id, familyId: family._id }).lean();
    if (!child) {
      return NextResponse.json({ ok: false, error: "Child not found" }, { status: 404 });
    }

    await ActivityLog.create({ familyId: family._id, parentId: new mongoose.Types.ObjectId(session.user.id), action: "child_deleted", details: `Deleted child profile: ${child.name}` });

    return NextResponse.json({ ok: true, message: "Child deleted" });
  } catch (error: any) {
    console.error("CHILD DELETE ERROR:", { message: error.message, stack: error.stack });
    return NextResponse.json({ ok: false, error: "Failed to delete child" }, { status: 500 });
  }
}