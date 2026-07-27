import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import mongoose from "mongoose";
import Family from "@/models/Family";
import Child from "@/models/Child";
import ActivityLog from "@/models/ActivityLog";

async function ensureFamily(userId: string) {
  if (mongoose.connection.readyState !== 1) {
    if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI not set");
    await mongoose.connect(process.env.MONGODB_URI);
  }

  let family = await Family.findOne({ parentId: userId });
  if (!family) {
    family = await Family.create({ parentId: userId, name: "My Family" });
  }
  return family;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const family = await ensureFamily(session.user.id);
    const children = await Child.find({ familyId: family._id }).sort({ name: 1 }).lean();

    return NextResponse.json({ ok: true, children });
  } catch (error) {
    console.error("CHILDREN GET ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to fetch children" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, age, dateOfBirth, avatar } = body;

    if (!name || typeof name !== "string" || name.trim().length < 1) {
      return NextResponse.json({ ok: false, error: "Child name is required" }, { status: 400 });
    }
    if (!age || typeof age !== "number" || age < 1 || age > 18) {
      return NextResponse.json({ ok: false, error: "Valid age (1-18) is required" }, { status: 400 });
    }

    const family = await ensureFamily(session.user.id);

    const child = await Child.create({
      familyId: family._id,
      name: name.trim(),
      age,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      avatar,
    });

    await ActivityLog.create({
      familyId: family._id,
      childId: child._id,
      parentId: session.user.id,
      action: "child_created",
      details: `Created child profile: ${name}`,
    });

    return NextResponse.json({ ok: true, child }, { status: 201 });
  } catch (error) {
    console.error("CHILDREN POST ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to create child" }, { status: 500 });
  }
}

