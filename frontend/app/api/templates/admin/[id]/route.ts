import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import Template from "@/models/Template";
import { isAdmin } from "@/lib/admin-auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    if (!session?.user?.id || !isAdmin(session.user.id)) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    await dbConnect();

    // Validate slug uniqueness if changing
    if (body.slug) {
      const existing = await Template.findOne({ slug: body.slug, _id: { $ne: id } });
      if (existing) {
        return NextResponse.json({ ok: false, error: "A template with this slug already exists" }, { status: 409 });
      }
    }

    const allowedFields = [
      "name", "slug", "description", "category", "thumbnail", "preview",
      "width", "height", "layers", "fonts", "defaultData", "requiredPlan",
      "status", "featured",
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const template = await Template.findOneAndUpdate(
      { $or: [{ templateId: id }, { slug: id }, { _id: id }] },
      { $set: updateData },
      { new: true }
    );

    if (!template) {
      return NextResponse.json({ ok: false, error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, template });
  } catch (error) {
    console.error("ADMIN TEMPLATE UPDATE ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to update template" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    if (!session?.user?.id || !isAdmin(session.user.id)) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const template = await Template.findOneAndDelete({
      $or: [{ templateId: id }, { slug: id }, { _id: id }],
    });

    if (!template) {
      return NextResponse.json({ ok: false, error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, message: "Template deleted successfully" });
  } catch (error) {
    console.error("ADMIN TEMPLATE DELETE ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to delete template" }, { status: 500 });
  }
}
