import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import Template, { ITemplate } from "@/models/Template";
import { categoryNameForSlug } from "@/lib/template-categories";
import { canAccessTemplate, premiumTierLabel } from "@/lib/template-access";
import { PlanId } from "@/lib/plan-config";
import Subscription from "@/models/Subscription";

export const dynamic = "force-dynamic";

/**
 * GET /api/templates/[id]
 * Returns a single template's enriched detail (by templateId, slug, or _id).
 *
 * - Public endpoint: viewing a template preview does NOT require login.
 * - Premium templates are returned with `hasAccess: false` (never a 403) so the
 *   UI can show the "Upgrade to Use" CTA. Actual gating happens on "Use Template".
 * - Viewing a preview does NOT increment `useCount`. Usage is only tracked via
 *   `POST /api/templates/use` when the user actually uses the template.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    await dbConnect();

    // Only match `_id` if `id` is a valid ObjectId. Otherwise MongoDB throws a
    // CastError when trying to cast a slug string (e.g. "financial-report-reports")
    // to an ObjectId, which would surface as a 500 instead of a clean lookup.
    const or: Record<string, unknown>[] = [{ templateId: id }, { slug: id }];
    if (id && /^[0-9a-fA-F]{24}$/.test(id)) {
      or.push({ _id: id });
    }

    const template = await Template.findOne({
      $or: or,
      status: "PUBLISHED",
    }).lean();

    if (!template) {
      return NextResponse.json(
        { success: false, ok: false, error: "Template not found" },
        { status: 404 }
      );
    }

    // Determine user's plan for per-template access flag (non-fatal).
    let userPlan: PlanId = "free";
    if (session?.user?.id) {
      try {
        const subscription = await Subscription.findOne({
          userId: session.user.id,
          status: "ACTIVE",
        }).sort({ updatedAt: -1 });
        if (subscription) userPlan = subscription.planId as PlanId;
      } catch {
        // Non-fatal — default to free plan
      }
    }

    const t = template as unknown as ITemplate;

    const enriched = {
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
      layers: t.layers || [],
      fonts: t.fonts || [],
      author: t.author || "SmartDocs AI",
      usageCount: t.usageCount || t.useCount || 0,
      favoriteCount: t.favoriteCount || 0,
      hasAccess: canAccessTemplate(t.requiredPlan, userPlan),
      createdAt: t.createdAt,
    };

    return NextResponse.json({ success: true, ok: true, template: enriched });
  } catch (error) {
    console.error("TEMPLATE GET ERROR:", error);
    return NextResponse.json(
      { success: false, ok: false, error: "Failed to fetch template" },
      { status: 500 }
    );
  }
}
