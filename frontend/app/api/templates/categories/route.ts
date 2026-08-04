import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Template from "@/models/Template";
import { TEMPLATE_CATEGORIES } from "@/lib/template-categories";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();

    // Count templates per category slug (PUBLISHED only)
    const raw = await Template.aggregate<{ _id: string; count: number }>([
      { $match: { status: "PUBLISHED" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const countMap: Record<string, number> = {};
    for (const row of raw) {
      countMap[row._id] = row.count;
    }

    // Total published templates
    const totalCount = await Template.countDocuments({ status: "PUBLISHED" });

    const categories = TEMPLATE_CATEGORIES.filter((c) => c.slug !== "all").map((c) => ({
      slug: c.slug,
      name: c.name,
      count: countMap[c.slug] || 0,
    }));

    // Always include "All"
    const allCategories = [
      { slug: "all", name: "All", count: totalCount },
      ...categories,
    ];

    return NextResponse.json({
      success: true,
      ok: true,
      categories: allCategories,
      total: totalCount,
    });
  } catch (error) {
    console.error("TEMPLATE CATEGORIES ERROR:", error);
    return NextResponse.json(
      { success: false, ok: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

