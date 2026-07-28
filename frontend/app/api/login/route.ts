import { NextResponse } from "next/server"

import { authenticateCredentials } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = await authenticateCredentials(body.email, body.password)

    if (result.reason === "invalid-input") {
      return NextResponse.json({ ok: false, error: "Email and password are required." }, { status: 400 })
    }

    if (result.reason === "user-not-found" || result.reason === "password-mismatch") {
      return NextResponse.json({ ok: false, error: "Invalid email or password." }, { status: 401 })
    }

    if (result.reason === "database-error") {
      return NextResponse.json({ ok: false, error: "Authentication database error." }, { status: 500 })
    }

    return NextResponse.json({ ok: true, message: "Login successful", user: result.user }, { status: 200 })
  } catch (error) {
    console.error("LOGIN AUTH REQUEST ERROR:", error)
    return NextResponse.json({ ok: false, error: "Unable to sign in." }, { status: 500 })
  }
}
