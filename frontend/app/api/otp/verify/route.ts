import { NextResponse } from "next/server"
import clientPromise from "../../../../lib/mongodb"
import { createContactKey, otpStore } from "../store"
import { isValidEmail, normalizePhoneNumber } from "../../utils"

function badRequest(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status })
}

function isValidOtp(code: unknown): code is string {
  return typeof code === "string" && /^\d{6}$/.test(code)
}

async function verifyPhoneOtp(phone: string, code: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID

  if (!accountSid || !authToken || !serviceSid) {
    throw new Error(
      "SMS/WhatsApp provider is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SERVICE_SID.",
    )
  }

  const authHeader = `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`
  const body = new URLSearchParams()
  body.append("To", phone)
  body.append("Code", code)

  const response = await fetch(
    `https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`,
    {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    },
  )

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to verify phone OTP: ${text}`)
  }

  const data = await response.json()
  return data.status === "approved"
}

async function createUser(stored: any) {
  const dbName = process.env.MONGODB_DB_NAME
  if (!dbName) {
    throw new Error("Database name is not configured. Set MONGODB_DB_NAME in environment variables.")
  }

  try {
    const client = await clientPromise
    const db = client.db(dbName)
    const usersCollection = db.collection("users")

    const userDocument = {
      fullName: stored.fullName,
      email: stored.contactType === "email" ? stored.contact : undefined,
      phone: stored.contactType === "phone" ? stored.contact : undefined,
      password: stored.passwordHash,
      createdAt: new Date(),
    }

    await usersCollection.insertOne(userDocument)
  } catch (error) {
    console.error("Failed to create user:", error)
    throw new Error("Could not save user to the database.")
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const code = body.code

  if (!isValidOtp(code)) {
    return badRequest("Please provide a valid 6-digit OTP code.")
  }

  const handleSuccess = async (key: string, stored: any) => {
    otpStore.delete(key)
    if (stored.purpose === "signup") {
      try {
        await createUser(stored)
        return NextResponse.json({ ok: true, message: "Account created successfully" })
      } catch (error) {
        return badRequest(error instanceof Error ? error.message : "An unexpected error occurred.", 500)
      }
    }
    return NextResponse.json({ ok: true })
  }

  if (typeof body.email === "string") {
    const email = body.email
    if (!isValidEmail(email)) {
      return badRequest("Please provide a valid email address.")
    }

    const key = createContactKey("email", email)
    const stored = otpStore.get(key)
    if (!stored) {
      return badRequest("No OTP was sent to this email. Please request a new code.", 404)
    }
    if (stored.contactType !== "email" || !stored.expiresAt || Date.now() > stored.expiresAt || stored.code !== code) {
      if (stored.expiresAt && Date.now() > stored.expiresAt) {
        otpStore.delete(key)
        return badRequest("OTP has expired. Please request a new code.", 410)
      }
      return badRequest("Invalid OTP code.")
    }

    return await handleSuccess(key, stored)
  }

  if (typeof body.phoneNumber === "string" && typeof body.countryCode === "string") {
    const normalizedPhone = normalizePhoneNumber(body.countryCode, body.phoneNumber)
    if (!normalizedPhone) {
      return badRequest("Please provide a valid phone number.")
    }

    const key = createContactKey("phone", normalizedPhone)
    const stored = otpStore.get(key)
    if (!stored) {
      return badRequest("No OTP was sent to this phone number. Please request a new code.", 404)
    }

    const approved = await verifyPhoneOtp(normalizedPhone, code)
    if (!approved) {
      return badRequest("Invalid phone OTP code.")
    }

    return await handleSuccess(key, stored)
  }

  return badRequest("Please provide a valid email or phone number with the OTP code.")
}
