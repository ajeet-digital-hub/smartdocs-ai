import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import clientPromise from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: "Email and password are required." }, { status: 400 })
    }

    if (!process.env.MONGODB_URI) {
      console.error("LOGIN ERROR: Missing MONGODB_URI environment variable.")
      return NextResponse.json(
        { ok: false, error: "MONGODB_URI is missing. Please configure MongoDB in .env.local." },
        { status: 500 },
      )
    }

    let db
    try {
      const client = await clientPromise
      db = client.db(process.env.MONGODB_DB_NAME || "smartdocs-ai")
    } catch (error) {
      console.error("LOGIN DB CONNECTION ERROR:", error)
      return NextResponse.json({ ok: false, error: "Unable to connect to MongoDB." }, { status: 500 })
    }

    const users = db.collection("users")
    const user = await users.findOne({ email: email.toLowerCase().trim() })

    if (!user) {
      return NextResponse.json({ ok: false, error: "Invalid email or password." }, { status: 401 })
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash)

    if (!isMatch) {
      return NextResponse.json({ ok: false, error: "Invalid email or password." }, { status: 401 })
    }

    // Note: In a real app, you would generate a JWT token here
    // and return it to the client.
    // For this fix, we will just return a success message.

    return NextResponse.json(
      {
        ok: true,
        message: "Login successful",
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("LOGIN ERROR:", error)
    return NextResponse.json(
      { ok: false, error: "Unable to sign in. An unexpected error occurred." },
      { status: 500 },
    )
  }
}
