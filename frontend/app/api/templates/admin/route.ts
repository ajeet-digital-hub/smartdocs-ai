import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import Template from "@/models/Template";
import { isAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !isAdmin(session.user.id)) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    await dbConnect();

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const [templates, total] = await Promise.all([
      Template.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Template.countDocuments(filter),
    ]);

    return NextResponse.json({
      ok: true,
      templates,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("ADMIN TEMPLATES LIST ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to fetch templates" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !isAdmin(session.user.id)) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, slug, description, category, thumbnail, preview, width, height, layers, fonts, defaultData, requiredPlan, status, featured } = body;

    if (!name || !slug || !category) {
      return NextResponse.json({ ok: false, error: "name, slug, and category are required" }, { status: 400 });
    }

    await dbConnect();

    // Check if slug already exists
    const existing = await Template.findOne({ slug });
    if (existing) {
      return NextResponse.json({ ok: false, error: "A template with this slug already exists" }, { status: 409 });
    }

    const templateId = `tpl_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const template = await Template.create({
      templateId,
      name,
      slug,
      description: description || "",
      category,
      thumbnail: thumbnail || "",
      preview: preview || "",
      width: width || 800,
      height: height || 600,
      layers: layers || [],
      fonts: fonts || [],
      defaultData: defaultData || {},
      requiredPlan: requiredPlan || "free",
      status: status || "DRAFT",
      featured: featured || false,
      createdBy: session.user.id,
    });

    return NextResponse.json({ ok: true, template }, { status: 201 });
  } catch (error) {
    console.error("ADMIN TEMPLATE CREATE ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to create template" }, { status: 500 });
  }
}
