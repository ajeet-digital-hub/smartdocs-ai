import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import Template from "@/models/Template";
import UserDesign from "@/models/UserDesign";
import { canAccessTemplate } from "@/lib/template-access";
import { PlanId } from "@/lib/plan-config";
import Subscription from "@/models/Subscription";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized", loginUrl: "/login" }, { status: 401 });
    }

    const body = await req.json();
    const { templateId } = body;

    if (!templateId) {
      return NextResponse.json({ ok: false, error: "templateId is required" }, { status: 400 });
    }

    await dbConnect();

    const template = await Template.findOne({
      $or: [{ templateId }, { slug: templateId }, { _id: templateId }],
      status: "PUBLISHED",
    });

    if (!template) {
      return NextResponse.json({ ok: false, error: "Template not found" }, { status: 404 });
    }

    // ── Check plan access ──
    let userPlan: PlanId = "free";
    const subscription = await Subscription.findOne({ userId: session.user.id, status: "ACTIVE" }).sort({ updatedAt: -1 });
    if (subscription) {
      userPlan = subscription.planId as PlanId;
    }

    const hasAccess = canAccessTemplate(template.requiredPlan, userPlan);
    if (!hasAccess) {
      return NextResponse.json({
        ok: false,
        error: "This template requires a higher plan. Please upgrade to access it.",
        requiredPlan: template.requiredPlan,
        upgradeUrl: "/pricing",
      }, { status: 403 });
    }

    // ── Create a user design copy from the template ──
    const userDesign = await UserDesign.create({
      userId: session.user.id,
      templateId: template._id,
      name: `${template.name} (Copy)`,
      width: template.width,
      height: template.height,
      layers: JSON.parse(JSON.stringify(template.layers || [])),
      fonts: template.fonts || [],
      metadata: {
        originalTemplateId: template.templateId,
        originalTemplateName: template.name,
        category: template.category,
      },
    });

    // ── Increment usage counters ──
    await Template.updateOne({ _id: template._id }, { $inc: { useCount: 1, usageCount: 1 } });

    return NextResponse.json({
      ok: true,
      success: true,
      design: userDesign,
      redirectUrl: `/templates/editor/${userDesign._id}`,
    }, { status: 201 });
  } catch (error) {
    console.error("USE TEMPLATE ERROR:", error);
    return NextResponse.json({ ok: false, success: false, error: "Failed to use template" }, { status: 500 });
  }
}

