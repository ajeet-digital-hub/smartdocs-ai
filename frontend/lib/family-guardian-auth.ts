import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { NextResponse } from "next/server"
import mongoose from "mongoose"
import crypto from "crypto"; // Import crypto for requestId
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import { IUser } from "@/models/User"; // Import IUser for typing
import Family from "@/models/Family"
import Subscription from "@/models/Subscription"; // Import the Subscription model
import { FeatureId, hasFeatureAccess } from "./feature-access"; // Use the feature-access module
import Child from "@/models/Child"

export interface FamilyGuardianSession {
  user: {
    id: string
    name: string
    email: string
  }
}

export async function getFamilyGuardianSession(): Promise<FamilyGuardianSession | null> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return null
    const sessionUser = session.user as { id?: string; name?: string | null; email?: string | null }
    return {
      user: {
        id: sessionUser.id || sessionUser.email || "",
        name: sessionUser.name || "",
        email: sessionUser.email || "",
      },
    }
  } catch {
    // Also check for custom token-based auth fallback
    return null
  }
}

export async function getParentFamily(userId: string): Promise<InstanceType<typeof Family>> {
  await dbConnect();

  // Find or create family
  let family = await Family.findOne({ parentId: new mongoose.Types.ObjectId(userId) });

  if (!family) {
    const now = new Date();
    family = await Family.create({
      parentId: new mongoose.Types.ObjectId(userId),
      familyName: `Family of ${userId}`, // Placeholder name
      plan: "free",
      maxChildren: 5,
      maxDevices: 10,
      createdAt: now,
      updatedAt: now,
    });
  }
  return family;
}

// Helper to get the current parent's family, creating one if it doesn't exist.
// This is a common pattern in Family Guardian APIs.
export async function ensureFamily(userId: string): Promise<InstanceType<typeof Family>> {
  await dbConnect();
  let family = await Family.findOne({ parentId: new mongoose.Types.ObjectId(userId) })
    .populate('subscriptionId');
  if (!family) {
    const user: IUser | null = await User.findById(userId); // Fetch user to get full name for family name if available
    family = await Family.create({ parentId: new mongoose.Types.ObjectId(userId), familyName: `${user?.fullName || 'My'} Family`, pairingChildId: undefined }); // Initialize pairingChildId
  }
  return family;
}

export function toJSON(doc: any): any {
  // This function is typically used to convert Mongoose documents to plain JSON objects
  // and handle ObjectId serialization. Mongoose .lean() already does most of this.
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  if (obj._id) {
    obj.id = obj._id.toString();
    delete obj._id;
  }
  delete obj.__v;
  return obj;
}

type HandlerContext = { params: Record<string, string> };
type AuthHandler = (req: Request, family: InstanceType<typeof Family>, session: FamilyGuardianSession, context: HandlerContext) => Promise<NextResponse>;

export function requireParentAuth(handler: AuthHandler) {
  return async (req: Request, context: HandlerContext) => {
    try {
      await dbConnect()

      const session = await getFamilyGuardianSession()
      if (!session) {
        return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 })
      }

      const family = await ensureFamily(session.user.id)
      if (!family) {
        return NextResponse.json({ ok: false, error: "Family not found." }, { status: 404 })
      }

      return handler(req, family, session, context);
    } catch (error) {
      const requestId = crypto.randomUUID();
      console.error("FAMILY_GUARDIAN_AUTH_ERROR", {
        requestId,
        message: (error as Error).message,
        stack: (error as Error).stack,
        url: req.url,
      });
      return NextResponse.json({
        ok: false,
        error: `An internal server error occurred. Please reference this ID: ${requestId}`
      }, { status: 500 });
    }
  }
}

export function requireFamilyGuardianFeature(feature: FeatureId, handler: AuthHandler) {
  const authHandler = requireParentAuth(async (req, family, session, context) => {
    // The family object from requireParentAuth should have subscription populated
    const subscription = family.subscriptionId as InstanceType<typeof Subscription> | null;
    const plan = subscription?.planId || 'free';

    if (!hasFeatureAccess(plan, feature)) {
      return NextResponse.json(
        {
          ok: false,
          error: `This feature requires a higher subscription plan.`,
          requiredPlan: 'pro', // This could be dynamic based on the feature
        },
        { status: 403 } // 403 Forbidden is more appropriate for permission issues
      );
    }
    return handler(req, family, session, context);
  });
  return authHandler;
}

type GeneralAuthHandler = (req: Request, user: InstanceType<typeof User>, session: FamilyGuardianSession, context: HandlerContext) => Promise<NextResponse>;

export function requireAuth(handler: GeneralAuthHandler) {
  return async (req: Request, context: HandlerContext) => {
    try {
      await dbConnect();

      const session = await getFamilyGuardianSession();
      if (!session) {
        return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
      }

      const user = await User.findById(session.user.id).populate('currentSubscription');
      if (!user) {
        return NextResponse.json({ ok: false, error: "User not found." }, { status: 404 });
      }

      return handler(req, user, session, context);
    } catch (error) {
      const requestId = crypto.randomUUID();
      console.error("GENERAL_AUTH_ERROR", {
        requestId,
        message: (error as Error).message,
        stack: (error as Error).stack,
        url: req.url,
      });
      return NextResponse.json({
        ok: false,
        error: `An internal server error occurred. Please reference this ID: ${requestId}`
      }, { status: 500 });
    }
  };
}

export function requireFeature(feature: FeatureId, handler: GeneralAuthHandler) {
  const authHandler = requireAuth(async (req, user, session, context) => {
    const subscription = user.currentSubscription as InstanceType<typeof Subscription> | undefined;
    const plan = subscription?.planId ?? 'free';
    const status = subscription?.status ?? 'EXPIRED';

    if (!hasFeatureAccess(plan, feature) || !['ACTIVE', 'TRIALING'].includes(status)) {
      return NextResponse.json(
        {
          ok: false,
          error: `This feature requires a higher subscription plan.`,
          requiredPlan: 'pro', // This could be dynamic based on the feature
        },
        { status: 403 }
      );
    }
    return handler(req, user, session, context);
  });
  return authHandler;
}

export function requireChildAuth(handler: (req: Request, child: InstanceType<typeof Child>, family: InstanceType<typeof Family>) => Promise<NextResponse>) {
  return async (req: Request) => {
    try {
      const session = await getFamilyGuardianSession()
      if (!session) {
        return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 })
      }

      const family = await ensureFamily(session.user.id)
      if (!family) {
        return NextResponse.json({ ok: false, error: "Family not found." }, { status: 404 })
      }

      const url = new URL(req.url)
      const childId = url.searchParams.get("childId")
      if (!childId) {
        return NextResponse.json({ ok: false, error: "Child ID is required." }, { status: 400 })
      }

      const child = await Child.findOne({
        _id: new mongoose.Types.ObjectId(childId),
        familyId: family._id
      })

      if (!child) {
        return NextResponse.json({ ok: false, error: "Child not found." }, { status: 404 })
      }

      return handler(req, child, family)
    } catch (error: unknown) {
      console.error("CHILD AUTH ERROR:", { message: (error as Error).message, stack: (error as Error).stack });
      return NextResponse.json({ ok: false, error: "Internal server error." }, { status: 500 })
    }
  }
}
