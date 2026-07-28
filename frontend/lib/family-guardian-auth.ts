import { getServerSession } from "next-auth"
import { getMongoClient } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { NextResponse } from "next/server"

export interface FamilyGuardianSession {
  user: {
    id: string
    name: string
    email: string
  }
}

export async function getFamilyGuardianSession(): Promise<FamilyGuardianSession | null> {
  try {
    const session = await getServerSession()
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

export async function getParentFamily(familyId?: string) {
  const session = await getFamilyGuardianSession()
  if (!session) return null

  const client = await getMongoClient()
  const db = client.db(process.env.MONGODB_DB_NAME || "smartdocs-ai")

  // Find the user
  const user = await db.collection("users").findOne(
    { email: session.user.email },
    { projection: { _id: 1 } }
  )
  if (!user) return null

  if (familyId) {
    // Verify family belongs to this parent
    const family = await db.collection("families").findOne({
      _id: new ObjectId(familyId),
      parentId: user._id,
    })
    return family
  }

  // Find or create family
  let family = await db.collection("families").findOne({ parentId: user._id })

  if (!family) {
    const now = new Date()
    const result = await db.collection("families").insertOne({
      parentId: user._id,
      familyName: `${session.user.name}'s Family`,
      plan: "free",
      maxChildren: 5,
      maxDevices: 10,
      createdAt: now,
      updatedAt: now,
    })
    family = await db.collection("families").findOne({ _id: result.insertedId })
  }

  return family
}

export function requireParentAuth(handler: (req: Request, family: any, session: FamilyGuardianSession) => Promise<NextResponse>) {
  return async (req: Request) => {
    try {
      const session = await getFamilyGuardianSession()
      if (!session) {
        return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 })
      }

      const family = await getParentFamily()
      if (!family) {
        return NextResponse.json({ ok: false, error: "Family not found." }, { status: 404 })
      }

      return handler(req, family, session)
    } catch (error) {
      console.error("FAMILY GUARDIAN AUTH ERROR:", error)
      return NextResponse.json({ ok: false, error: "Internal server error." }, { status: 500 })
    }
  }
}

export function requireChildAuth(handler: (req: Request, childId: string, family: any) => Promise<NextResponse>) {
  return async (req: Request) => {
    try {
      const session = await getFamilyGuardianSession()
      if (!session) {
        return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 })
      }

      const family = await getParentFamily()
      if (!family) {
        return NextResponse.json({ ok: false, error: "Family not found." }, { status: 404 })
      }

      const url = new URL(req.url)
      const childId = url.searchParams.get("childId")
      if (!childId) {
        return NextResponse.json({ ok: false, error: "Child ID is required." }, { status: 400 })
      }

      const client = await getMongoClient()
      const db = client.db(process.env.MONGODB_DB_NAME || "smartdocs-ai")
      const child = await db.collection("children").findOne({
        _id: new ObjectId(childId),
        familyId: family._id,
      })

      if (!child) {
        return NextResponse.json({ ok: false, error: "Child not found." }, { status: 404 })
      }

      return handler(req, childId, family)
    } catch (error) {
      console.error("CHILD AUTH ERROR:", error)
      return NextResponse.json({ ok: false, error: "Internal server error." }, { status: 500 })
    }
  }
}

export async function getMongoDb() {
  const client = await getMongoClient()
  return client.db(process.env.MONGODB_DB_NAME || "smartdocs-ai")
}

export function getObjectId(id: string): ObjectId {
  return new ObjectId(id)
}

export function toJSON(doc: any): any {
  if (!doc) return null
  const obj = { ...doc }
  if (obj._id) {
    obj.id = obj._id.toString()
    delete obj._id
  }
  delete obj.__v
  return obj
}
