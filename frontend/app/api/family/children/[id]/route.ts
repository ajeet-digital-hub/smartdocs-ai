import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import mongoose from "mongoose";
import Family from "@/models/Family";
import Child from "@/models/Child";
import ActivityLog from "@/models/ActivityLog";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    if (mongoose.connection.readyState !== 1) {
      if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI not set");
      await mongoose.connect(process.env.MONGODB_URI, {
        dbName: process.env.MONGODB_DB_NAME || "smartdocs-ai",
      });
    }

    const family = await Family.findOne({ parentId: session.user.id });
    if (!family) {
      return NextResponse.json({ ok: false, error: "Family not found" }, { status: 404 });
    }

    const child = await Child.findOne({ _id: params.id, familyId: family._id }).lean();
    if (!child) {
      return NextResponse.json({ ok: false, error: "Child not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, child });
  } catch (error) {
    console.error("CHILD GET ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to fetch child" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, age, dateOfBirth, avatar, devices, currentStatus } = body;

    if (mongoose.connection.readyState !== 1) {
      if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI not set");
      await mongoose.connect(process.env.MONGODB_URI, {
        dbName: process.env.MONGODB_DB_NAME || "smartdocs-ai",
      });
    }

    const family = await Family.findOne({ parentId: session.user.id });
    if (!family) {
      return NextResponse.json({ ok: false, error: "Family not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (age !== undefined) updateData.age = age;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = new Date(dateOfBirth);
    if (avatar !== undefined) updateData.avatar = avatar;
    if (devices !== undefined) updateData.devices = devices;
    if (currentStatus !== undefined) updateData.currentStatus = currentStatus;

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
      parentId: session.user.id,
      action: "child_updated",
      details: `Updated child profile: ${child.name}`,
    });

    return NextResponse.json({ ok: true, child });
  } catch (error) {
    console.error("CHILD PUT ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to update child" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    if (mongoose.connection.readyState !== 1) {
      if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI not set");
      await mongoose.connect(process.env.MONGODB_URI, {
        dbName: process.env.MONGODB_DB_NAME || "smartdocs-ai",
      });
    }

    const family = await Family.findOne({ parentId: session.user.id });
    if (!family) {
      return NextResponse.json({ ok: false, error: "Family not found" }, { status: 404 });
    }

    const child = await Child.findOneAndDelete({ _id: params.id, familyId: family._id }).lean();
    if (!child) {
      return NextResponse.json({ ok: false, error: "Child not found" }, { status: 404 });
    }

    await ActivityLog.create({
      familyId: family._id,
      parentId: session.user.id,
      action: "child_deleted",
      details: `Deleted child profile: ${child.name}`,
    });

    return NextResponse.json({ ok: true, message: "Child deleted" });
  } catch (error) {
    console.error("CHILD DELETE ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to delete child" }, { status: 500 });
  }
}

