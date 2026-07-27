import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import mongoose from "mongoose";
import Family from "@/models/Family";
import WebsitePolicy from "@/models/WebsitePolicy";

const DEFAULT_WEBSITES = [
  { name: "YouTube", domain: "youtube.com", category: "entertainment" as const, icon: "🎬" },
  { name: "Instagram", domain: "instagram.com", category: "social" as const, icon: "📸" },
  { name: "Facebook", domain: "facebook.com", category: "social" as const, icon: "👤" },
  { name: "TikTok", domain: "tiktok.com", category: "social" as const, icon: "🎵" },
  { name: "Snapchat", domain: "snapchat.com", category: "social" as const, icon: "👻" },
  { name: "Netflix", domain: "netflix.com", category: "entertainment" as const, icon: "🎬" },
  { name: "Twitch", domain: "twitch.tv", category: "gaming" as const, icon: "🎮" },
  { name: "Discord", domain: "discord.com", category: "social" as const, icon: "💬" },
  { name: "Reddit", domain: "reddit.com", category: "social" as const, icon: "👽" },
  { name: "X (Twitter)", domain: "x.com", category: "social" as const, icon: "🐦" },
];

export async function GET() {
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

    const policies = await WebsitePolicy.find({ familyId: family._id }).sort({ name: 1 }).lean();

    return NextResponse.json({ ok: true, policies });
  } catch (error) {
    console.error("WEBSITE POLICIES GET ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to fetch policies" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { childId, name, domain, category, icon, isBlocked, dailyLimitMinutes, scheduleBlocks } = body;

    if (!childId || !name || !domain || !category) {
      return NextResponse.json({ ok: false, error: "Missing required fields: childId, name, domain, category" }, { status: 400 });
    }

    if (mongoose.connection.readyState !== 1) {
      if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI not set");
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const family = await Family.findOne({ parentId: session.user.id });
    if (!family) {
      return NextResponse.json({ ok: false, error: "Family not found" }, { status: 404 });
    }

    const policy = await WebsitePolicy.create({
      childId,
      familyId: family._id,
      name,
      domain: domain.toLowerCase().trim(),
      category,
      icon: icon || undefined,
      isBlocked: isBlocked || false,
      dailyLimitMinutes,
      scheduleBlocks: scheduleBlocks || [],
    });

    return NextResponse.json({ ok: true, policy }, { status: 201 });
  } catch (error) {
    console.error("WEBSITE POLICIES POST ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to create policy" }, { status: 500 });
  }
}

/** Seed default blocked websites for a child */
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { childId } = body;

    if (!childId) {
      return NextResponse.json({ ok: false, error: "childId is required" }, { status: 400 });
    }

    if (mongoose.connection.readyState !== 1) {
      if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI not set");
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const family = await Family.findOne({ parentId: session.user.id });
    if (!family) {
      return NextResponse.json({ ok: false, error: "Family not found" }, { status: 404 });
    }

    // Only seed if no policies exist for this child
    const existingCount = await WebsitePolicy.countDocuments({ childId, familyId: family._id });
    if (existingCount === 0) {
      for (const site of DEFAULT_WEBSITES) {
        await WebsitePolicy.create({
          childId,
          familyId: family._id,
          name: site.name,
          domain: site.domain,
          category: site.category,
          icon: site.icon,
          isBlocked: true,
          scheduleBlocks: [],
        });
      }
    }

    const policies = await WebsitePolicy.find({ childId, familyId: family._id }).sort({ name: 1 }).lean();

    return NextResponse.json({ ok: true, policies });
  } catch (error) {
    console.error("WEBSITE POLICIES PATCH ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to seed policies" }, { status: 500 });
  }
}

