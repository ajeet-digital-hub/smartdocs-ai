import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import mongoose from "mongoose";
import Notification from "@/models/Notification";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    if (mongoose.connection.readyState !== 1) {
      if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI not set");
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const notifications = await Notification.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = notifications.filter((n) => !n.read).length;

    return NextResponse.json({ ok: true, notifications, unreadCount });
  } catch (error) {
    console.error("NOTIFICATIONS GET ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, markAllRead } = body;

    if (mongoose.connection.readyState !== 1) {
      if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI not set");
      await mongoose.connect(process.env.MONGODB_URI);
    }

    if (markAllRead) {
      await Notification.updateMany(
        { userId: session.user.id, read: false },
        { $set: { read: true } }
      );
    } else if (notificationId) {
      await Notification.findOneAndUpdate(
        { _id: notificationId, userId: session.user.id },
        { $set: { read: true } }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("NOTIFICATIONS PATCH ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to update notifications" }, { status: 500 });
  }
}

