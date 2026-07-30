import bcrypt from "bcrypt"
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User"

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
    await dbConnect()
    const user = await User.findOne(
      { email },
      "fullName email phoneNumber passwordHash"
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
