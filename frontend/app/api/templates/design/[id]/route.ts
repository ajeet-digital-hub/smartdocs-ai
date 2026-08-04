import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import UserDesign from "@/models/UserDesign";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const design = await UserDesign.findOne({ _id: id, userId: session.user.id });
    if (!design) {
      return NextResponse.json({ ok: false, error: "Design not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, design });
  } catch (error) {
    console.error("DESIGN GET ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to fetch design" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { layers, name } = body;

    if (!layers && !name) {
      return NextResponse.json({ ok: false, error: "Nothing to update" }, { status: 400 });
    }

    await dbConnect();
    const update: Record<string, unknown> = {};
    if (layers) update.layers = layers;
    if (name) update.name = name;

    const design = await UserDesign.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: update },
      { new: true }
    );

    if (!design) {
      return NextResponse.json({ ok: false, error: "Design not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, design });
  } catch (error) {
    console.error("DESIGN PATCH ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to update design" }, { status: 500 });
  }
}
