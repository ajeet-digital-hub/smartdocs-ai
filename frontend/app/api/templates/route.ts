import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import Template, { ITemplate } from "@/models/Template";
import { resolveCategorySlug, categoryNameForSlug } from "@/lib/template-categories";
import { canAccessTemplate, premiumTierLabel } from "@/lib/template-access";
import { PlanId } from "@/lib/plan-config";
import Subscription from "@/models/Subscription";

export const dynamic = "force-dynamic";

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "24", 10)));

    // Category filter — accepts stable slug ("resume") or legacy display name ("Resume & CV")
    const categoryParam = searchParams.get("category");
    const categorySlug = resolveCategorySlug(categoryParam);

    const search = searchParams.get("search")?.trim() || "";

    // Filter param: all | free | premium | featured | popular | new
    const filter = searchParams.get("filter") || "all";
    const sort = searchParams.get("sort") || "newest";

    // ── Determine user's plan for per-template access flags ──
    let userPlan: PlanId = "free";
    if (session?.user?.id) {
      try {
        await dbConnect();
        const subscription = await Subscription.findOne({ userId: session.user.id, status: "ACTIVE" }).sort({ updatedAt: -1 });
        if (subscription) userPlan = subscription.planId as PlanId;
      } catch {
        // Non-fatal — default to free plan
      }
    }

    await dbConnect();

    // ── Build query filter ──
    const query: Record<string, unknown> = { status: "PUBLISHED" };

    if (categorySlug) {
      query.category = categorySlug;
    }

    if (search) {
      const safe = escapeRegex(search);
      const re = { $regex: safe, $options: "i" };
      query.$or = [
        { name: re },
        { description: re },
        { category: re },
        { tags: re },
      ];
    }

    switch (filter) {
      case "free":
        query.isPremium = false;
        break;
      case "premium":
        query.isPremium = true;
        break;
      case "featured":
        query.isFeatured = true;
        break;
      case "popular":
        query.isPopular = true;
        break;
      case "new":
        query.isNewArrival = true;
        break;
      default:
        break;
    }

    // ── Sort ──
    let sortOption: Record<string, 1 | -1> = {};
    switch (sort) {
      case "popular":
        sortOption = { isPopular: -1, usageCount: -1 };
        break;
      case "most-used":
        sortOption = { usageCount: -1 };
        break;
      case "az":
        sortOption = { name: 1 };
        break;
      case "newest":
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    const skip = (page - 1) * limit;
    const [templates, total] = await Promise.all([
      Template.find(query)
        .select(
          "templateId name slug description category tags fileType isPremium isFeatured isPopular isNewArrival thumbnail preview width height requiredPlan featured usageCount favoriteCount author createdAt updatedAt"
        )
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      Template.countDocuments(query),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    const mapped = (templates as unknown as ITemplate[]).map((t) => ({
      templateId: t.templateId,
      id: t.templateId,
      name: t.name,
      slug: t.slug,
      description: t.description,
      category: t.category,
      categoryName: categoryNameForSlug(t.category),
      tags: t.tags || [],
      fileType: t.fileType || "PDF",
      isPremium: t.isPremium || t.requiredPlan !== "free",
      requiredPlan: t.requiredPlan,
      premiumTier: t.requiredPlan !== "free" ? premiumTierLabel(t.requiredPlan) : null,
      isFeatured: t.isFeatured || t.featured,
      isPopular: t.isPopular || false,
      isNew: t.isNewArrival || false,
      thumbnail: t.thumbnail || "",
      preview: t.preview || "",
      width: t.width,
      height: t.height,
      author: t.author || "SmartDocs AI",
      usageCount: t.usageCount || t.useCount || 0,
      favoriteCount: t.favoriteCount || 0,
      hasAccess: canAccessTemplate(t.requiredPlan, userPlan),
      createdAt: t.createdAt,
    }));

    return NextResponse.json({
      success: true,
      ok: true,
      templates: mapped,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      filters: {
        category: categorySlug,
        search,
        filter,
        sort,
      },
    });
  } catch (error) {
    console.error("TEMPLATES LIST ERROR:", error);
    return NextResponse.json(
      { success: false, ok: false, error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

