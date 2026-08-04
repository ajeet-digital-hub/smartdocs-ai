import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { getRechargePack, RECHARGE_PACKS } from "@/lib/credit-balance";

/**
 * AI Credit Recharge API
 *
 * IMPORTANT:
 * This builds the recharge entitlement architecture ONLY.
 * Payment gateway is pending — no successful payment is simulated.
 * Activation of recharge credits must happen only after verified
 * payment through the canonical payment verification flow.
 */
export async function GET() {
  // Return available recharge packs (public catalog)
  return NextResponse.json({ ok: true, packs: RECHARGE_PACKS });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { packId } = body;

    if (!packId) {
      return NextResponse.json({ ok: false, error: "Missing packId" }, { status: 400 });
    }

    const pack = getRechargePack(packId);
    if (!pack) {
      return NextResponse.json({ ok: false, error: "Invalid recharge pack" }, { status: 400 });
    }

    await dbConnect();

    // Payment gateway is NOT configured/activated for recharge yet.
    // We do NOT simulate successful payments.
    // Return a 501 (Not Implemented) so the UI never shows a fake credit addition.
    return NextResponse.json(
      {
        ok: false,
        error: "AI Recharge is not yet available. Payment gateway integration is pending. Your credits remain unchanged.",
        pack,
      },
      { status: 501 }
    );
  } catch (error) {
    console.error("RECHARGE ERROR:", error);
    return NextResponse.json({ ok: false, error: "Recharge failed" }, { status: 500 });
  }
}
