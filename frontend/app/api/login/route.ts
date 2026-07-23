import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: "Email and password are required." }, { status: 400 })
    }

    // Forward the login request to the Express backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

    const response = await fetch(`${backendUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, error: data.error || "Unable to sign in." },
        { status: response.status },
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("LOGIN PROXY ERROR:", error)
    return NextResponse.json(
      { ok: false, error: "Unable to sign in. Please ensure the backend server is running." },
      { status: 500 },
    )
  }
}

