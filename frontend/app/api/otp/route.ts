import { NextResponse } from "next/server"
import {
  createContactKey,
  otpStore,
  OTP_TTL,
  RESEND_COOLDOWN,
  MAX_REQUESTS_PER_WINDOW,
  REQUEST_WINDOW,
} from "./store"
import {
  generateOtpCode,
  hashPassword,
  isValidCountryCode,
  isValidEmail,
  isValidFullName,
  isValidPassword,
  normalizePhoneNumber,
} from "../utils"

function badRequest(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status })
}

async function sendOtpEmail(email: string, code: string) {
  const apiKey = process.env.SENDGRID_API_KEY
  const fromEmail = process.env.EMAIL_FROM

  if (!apiKey || !fromEmail) {
    throw new Error("Email service is not configured. Set SENDGRID_API_KEY and EMAIL_FROM in environment variables.")
  }

  const payload = {
    personalizations: [{ to: [{ email }] }],
    from: { email: fromEmail },
    subject: "Your SmartDocs AI verification code",
    content: [
      {
        type: "text/plain",
        value: `Your SmartDocs AI verification code is ${code}. It expires in 10 minutes.`,
      },
    ],
  }

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to send OTP email: ${text}`)
  }
}

async function sendPhoneOtp(phone: string, channel: "sms" | "whatsapp") {
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
  body.append("Channel", channel)

  const response = await fetch(
    `https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`,
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
    throw new Error(`Failed to send phone OTP: ${text}`)
  }
}

function getRateLimitMeta(existing: ReturnType<typeof otpStore.get>, now: number) {
  const requestCount = existing && now - existing.firstRequestAt < REQUEST_WINDOW ? existing.requestCount : 0
  const firstRequestAt = existing && now - existing.firstRequestAt < REQUEST_WINDOW ? existing.firstRequestAt : now
  return { requestCount, firstRequestAt }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const purpose = body.purpose === "login" ? "login" : "signup"
  const now = Date.now()

  if (body.phoneNumber || body.countryCode) {
    if (!isValidCountryCode(body.countryCode)) {
      return badRequest("Please provide a valid country code.")
    }

    const normalizedPhone = normalizePhoneNumber(body.countryCode, body.phoneNumber)
    if (!normalizedPhone) {
      return badRequest("Please provide a valid phone number.")
    }

    const contactKey = createContactKey("phone", normalizedPhone)
    const existing = otpStore.get(contactKey)

    if (existing?.accountCreated && purpose === "signup") {
      return badRequest("An account already exists for this phone number.", 409)
    }

    if (existing && now - existing.lastSent < RESEND_COOLDOWN) {
      const secondsLeft = Math.ceil((RESEND_COOLDOWN - (now - existing.lastSent)) / 1000)
      return badRequest(`Please wait ${secondsLeft} seconds before requesting a new code.`, 429)
    }

    const { requestCount, firstRequestAt } = getRateLimitMeta(existing, now)
    if (requestCount >= MAX_REQUESTS_PER_WINDOW) {
      return badRequest("Too many OTP requests. Please try again later.", 429)
    }

    if (purpose === "signup" && !isValidFullName(body.fullName)) {
      return badRequest("Please enter your full name.")
    }

    const channel = body.via === "whatsapp" ? "whatsapp" : "sms"

    try {
      await sendPhoneOtp(normalizedPhone, channel)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send phone OTP."
      return badRequest(message, 500)
    }

    otpStore.set(contactKey, {
      contact: normalizedPhone,
      contactType: "phone",
      purpose,
      via: channel,
      lastSent: now,
      firstRequestAt,
      requestCount: requestCount + 1,
      verified: false,
      fullName: purpose === "signup" ? body.fullName?.trim() : undefined,
      passwordHash: purpose === "signup" ? hashPassword(body.password || "") : undefined,
      accountCreated: purpose === "signup" ? false : undefined,
    })

    return NextResponse.json({ ok: true, cooldown: RESEND_COOLDOWN / 1000, via: channel })
  }

  const email = body.email
  if (!isValidEmail(email)) {
    return badRequest("Please provide a valid email address.")
  }

  const contactKey = createContactKey("email", email)
  const existing = otpStore.get(contactKey)

  if (existing?.accountCreated && purpose === "signup") {
    return badRequest("An account already exists for this email.", 409)
  }

  if (existing && now - existing.lastSent < RESEND_COOLDOWN) {
    const secondsLeft = Math.ceil((RESEND_COOLDOWN - (now - existing.lastSent)) / 1000)
    return badRequest(`Please wait ${secondsLeft} seconds before requesting a new code.`, 429)
  }

  const { requestCount, firstRequestAt } = getRateLimitMeta(existing, now)
  if (requestCount >= MAX_REQUESTS_PER_WINDOW) {
    return badRequest("Too many OTP requests. Please try again later.", 429)
  }

  if (purpose === "signup") {
    if (!isValidFullName(body.fullName)) {
      return badRequest("Please enter your full name.")
    }

    if (!isValidPassword(body.password)) {
      return badRequest(
        "Password does not meet security requirements. It must be at least 8 characters, include 3 of 4 character types, and have no more than 2 identical characters in a row.",
      )
    }
  }

  const code = generateOtpCode()
  const entry = {
    contact: email,
    contactType: "email" as const,
    purpose: purpose as "signup" | "login",
    via: "email" as const,
    code,
    expiresAt: now + OTP_TTL,
    lastSent: now,
    firstRequestAt,
    requestCount: requestCount + 1,
    verified: false,
    fullName: purpose === "signup" ? body.fullName?.trim() : undefined,
    passwordHash: purpose === "signup" ? hashPassword(body.password || "") : undefined,
    accountCreated: purpose === "signup" ? false : undefined,
  }
  otpStore.set(contactKey, entry)

  // try {
  //   await sendOtpEmail(email, code)
  // } catch (error) {
  //   otpStore.delete(contactKey)
  //   const message = error instanceof Error ? error.message : "Failed to send OTP email."
  //   return badRequest(message, 500)
  // }
  
  // HACK: Temporarily bypass email sending for testing
  console.log(`OTP for ${email}: ${code}`);

  const responsePayload: {
    ok: true
    cooldown: number
    expiresIn: number
    dev?: { code: string }
  } = {
    ok: true,
    cooldown: RESEND_COOLDOWN / 1000,
    expiresIn: OTP_TTL / 1000,
  }

  if (process.env.NODE_ENV === "development") {
    responsePayload.dev = { code }
  }

  return NextResponse.json(responsePayload)
}
