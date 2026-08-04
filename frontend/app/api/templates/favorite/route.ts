import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import Template from "@/models/Template";
import TemplateFavorite from "@/models/TemplateFavorite";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

/**
 * GET /api/templates/favorite
 * Returns the list of template IDs the authenticated user has favorited.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const favorites = await TemplateFavorite.find({ userId: session.user.id })
      .select("templateId")
      .lean();

    const ids = favorites.map((f) => f.templateId.toString());

    return NextResponse.json({ ok: true, success: true, favoriteIds: ids });
  } catch (error) {
    console.error("FAVORITES GET ERROR:", error);
    return NextResponse.json({ ok: false, success: false, error: "Failed to fetch favorites" }, { status: 500 });
  }
}

/**
 * POST /api/templates/favorite
 * Body: { templateId, slug? }
 * Toggles favorite status for the authenticated user.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { templateId, slug } = body;

    const identifier = templateId || slug;
    if (!identifier) {
      return NextResponse.json({ ok: false, success: false, error: "templateId or slug is required" }, { status: 400 });
    }

    await dbConnect();

    const template = await Template.findOne({
      $or: [{ templateId: identifier }, { slug: identifier }, { _id: identifier }],
      status: "PUBLISHED",
    }).select("_id");

    if (!template) {
      return NextResponse.json({ ok: false, success: false, error: "Template not found" }, { status: 404 });
    }

    const existing = await TemplateFavorite.findOne({
      userId: session.user.id,
      templateId: template._id,
    });

    let favorited: boolean;
    if (existing) {
      await TemplateFavorite.deleteOne({ _id: existing._id });
      await Template.updateOne({ _id: template._id }, { $inc: { favoriteCount: -1 } });
      favorited = false;
    } else {
      await TemplateFavorite.create({
        userId: new mongoose.Types.ObjectId(session.user.id),
        templateId: template._id,
      });
      await Template.updateOne({ _id: template._id }, { $inc: { favoriteCount: 1 } });
      favorited = true;
    }

    const updated = await Template.findById(template._id).select("favoriteCount");
    const favoriteCount = updated?.favoriteCount || 0;

    return NextResponse.json({
      ok: true,
      success: true,
      favorited,
      favoriteCount,
    });
  } catch (error) {
    console.error("FAVORITES POST ERROR:", error);
    return NextResponse.json({ ok: false, success: false, error: "Failed to update favorite" }, { status: 500 });
  }
}

