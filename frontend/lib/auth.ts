import bcrypt from "bcrypt"
import { getMongoClient } from "@/lib/mongodb"

export type AuthenticatedUser = {
  id: string
  fullName: string
  email?: string
  phoneNumber?: string
}

export async function authenticateCredentials(emailInput: unknown, passwordInput: unknown) {
  const email = typeof emailInput === "string" ? emailInput.trim().toLowerCase() : ""
  const password = typeof passwordInput === "string" ? passwordInput : ""

  if (!email || !password) {
    return { user: null, reason: "invalid-input" as const }
  }

  try {
    const client = await getMongoClient()
    const db = client.db(process.env.MONGODB_DB_NAME || "smartdocs-ai")
    const user = await db.collection("users").findOne(
      { email },
      { projection: { fullName: 1, email: 1, phoneNumber: 1, passwordHash: 1 } },
    )

    if (!user) {
      return { user: null, reason: "user-not-found" as const }
    }

    if (typeof user.passwordHash !== "string" || !(await bcrypt.compare(password, user.passwordHash))) {
      return { user: null, reason: "password-mismatch" as const }
    }

    const authenticatedUser: AuthenticatedUser = {
      id: user._id.toString(),
      fullName: typeof user.fullName === "string" ? user.fullName : "",
      email: typeof user.email === "string" ? user.email : undefined,
      phoneNumber: typeof user.phoneNumber === "string" ? user.phoneNumber : undefined,
    }

    return { user: authenticatedUser, reason: null }
  } catch (error) {
    console.error("authenticateCredentials: Database error:", error)
    return { user: null, reason: "database-error" as const }
  }
}
