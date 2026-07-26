import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import mongoose from "mongoose";
import Family from "@/models/Family";
import Child from "@/models/Child";
import ActivityLog from "@/models/ActivityLog";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const childId = searchParams.get("childId");

    if (mongoose.connection.readyState !== 1) {
      if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI not set");
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const family = await Family.findOne({ parentId: session.user.id });
    if (!family) {
      return NextResponse.json({ ok: false, error: "Family not found" }, { status: 404 });
    }

    const query: Record<string, unknown> = { familyId: family._id };
    if (childId) query._id = childId;

    const children = await Child.find(query)
      .select("name age devices currentStatus")
      .lean();

    // Extract devices with child info
    const devices = children.flatMap((child) =>
      (child.devices || []).map((device) => ({
        ...device,
        childId: child._id,
        childName: child.name,
        childAge: child.age,
      }))
    );

    return NextResponse.json({ ok: true, devices });
  } catch (error) {
    console.error("DEVICES GET ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to fetch devices" }, { status: 500 });
  }
}

// Update device status (lock/unlock)
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { childId, deviceIndex, status, deviceId } = body;

    if (!childId) {
      return NextResponse.json({ ok: false, error: "childId is required" }, { status: 400 });
    }

    if (!["online", "offline", "locked", "unlocked"].includes(status)) {
      return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
    }

    if (mongoose.connection.readyState !== 1) {
      if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI not set");
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const family = await Family.findOne({ parentId: session.user.id });
    if (!family) {
      return NextResponse.json({ ok: false, error: "Family not found" }, { status: 404 });
    }

    let updateQuery = {};
    if (deviceIndex !== undefined) {
      updateQuery = { $set: { [`devices.${deviceIndex}.status`]: status } };
    } else if (deviceId) {
      updateQuery = { $set: { "devices.$[elem].status": status } };
    } else {
      return NextResponse.json({ ok: false, error: "deviceIndex or deviceId required" }, { status: 400 });
    }

    const child = await Child.findOneAndUpdate(
      { _id: childId, familyId: family._id },
      deviceId
        ? { $set: { "devices.$[elem].status": status } }
        : { $set: { [`devices.${deviceIndex}.status`]: status } },
      { 
        new: true,
        ...(deviceId ? { arrayFilters: [{ "elem.deviceId": deviceId }] } : {})
      }
    ).lean();

    if (!child) {
      return NextResponse.json({ ok: false, error: "Child not found" }, { status: 404 });
    }

    await ActivityLog.create({
      familyId: family._id,
      childId: child._id,
      parentId: session.user.id,
      action: status === "locked" ? "device_locked" : "device_unlocked",
      details: `${status === "locked" ? "Locked" : "Unlocked"} device for ${child.name}`,
    });

    return NextResponse.json({ ok: true, child });
  } catch (error) {
    console.error("DEVICES PATCH ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to update device" }, { status: 500 });
  }
}

