import { NextResponse } from "next/server"
import mongoose from "mongoose"
import bcrypt from "bcrypt"
import dbConnect from "@/lib/dbConnect" // Use Mongoose connection
import User from "@/models/User" // Use the User model
import {
  isValidCountryCode,
  isValidEmail,
  isValidFullName,
  isValidPassword,
  normalizePhoneNumber,
} from "../../utils"

const SALT_ROUNDS = 12

function sanitizeErrorMessage(message: string) {
  return message
    .replace(/mongodb(?:\+srv)?:\/\/[^\s]+/gi, "mongodb://***")
    .replace(/(MONGODB_URI=)[^\s]+/gi, "$1***")
    .replace(/(GOOGLE_CLIENT_SECRET=|APPLE_PRIVATE_KEY=)[^\s]+/gi, "$1***")
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status })
}

function errorResponse(error: unknown, fallback: string, status = 500) {
  console.error("REGISTER ERROR:", error)
  if (process.env.NODE_ENV === "development") {
    const message = error instanceof Error ? sanitizeErrorMessage(error.message) : String(error)
    return jsonError(message || fallback, status)
  }
  return jsonError(fallback, status)
}

export async function POST(request: Request) {
  let body: any

  try {
    body = await request.json()
  } catch {
    return jsonError("Invalid JSON body.", 400)
  }

  const signupMethod = body.signupMethod === "phone" ? "phone" : body.signupMethod === "email" ? "email" : null
  if (!signupMethod) {
    return jsonError("Invalid input.", 400)
  }

  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : ""
  const password = typeof body.password === "string" ? body.password : ""
  if (!isValidFullName(fullName) || !isValidPassword(password)) {
    return jsonError("Invalid input.", 400)
  }

  let email: string | undefined
  let countryCode: string | undefined
  let phoneNumber: string | undefined
  let normalizedPhone: string | undefined

  if (signupMethod === "email") {
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
    if (!isValidEmail(email)) {
      return jsonError("Invalid input.", 400)
    }
  } else {
    countryCode = typeof body.countryCode === "string" ? body.countryCode.trim() : ""
    phoneNumber = typeof body.phoneNumber === "string" ? body.phoneNumber.trim() : ""
    if (!isValidCountryCode(countryCode) || !phoneNumber) {
      return jsonError("Invalid input.", 400)
    }

    const normalizedPhoneCandidate = normalizePhoneNumber(countryCode, phoneNumber)
    if (!normalizedPhoneCandidate) {
      return jsonError("Invalid input.", 400)
    }
    normalizedPhone = normalizedPhoneCandidate
  }

  try {
    await dbConnect();
    console.log("[Register] DB Connection State:", mongoose.connection.readyState === 1 ? "Connected" : "Disconnected");
  } catch (error) {
    console.error("REGISTER ERROR: MongoDB connection failed.", error)
    return errorResponse(error, "Unable to connect to the database.", 500)
  }

  try {
    const identifier = email || normalizedPhone;
    console.log(`[Register] Checking for existing user with identifier: ${identifier}`);
    if (email) {
      const existingUser = await User.findOne({ email }).lean();
      console.log("[Register] User lookup result:", existingUser ? `Found user with ID: ${existingUser._id}`: "Not found");
      if (existingUser) {
        return jsonError("Email already registered.", 409)
      }
    }

    if (normalizedPhone) {
      const existingPhoneUser = await User.findOne({ phoneNumber: normalizedPhone }).lean();
      console.log("[Register] Phone lookup result:", existingPhoneUser ? `Found user with ID: ${existingPhoneUser._id}`: "Not found");
      if (existingPhoneUser) {
        return jsonError("Phone number already registered.", 409)
      }
    }

    let passwordHash
    try {
      passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
      console.log("[Register] Password hashing successful.");
    } catch (error) {
      console.error("REGISTER ERROR: Password hashing failed.", error)
      return errorResponse(error, "Failed to process registration data.", 500)
    }

    console.log("[Register] Creating new user document in 'users' collection.");
    const newUser = new User({
      fullName,
      email: email || undefined,
      countryCode: countryCode || undefined,
      phoneNumber: normalizedPhone || undefined,
      passwordHash,
      provider: "credentials",
    });
    await newUser.save();
    console.log(`[Register] User document created successfully with ID: ${newUser._id}`);

    return NextResponse.json({ ok: true, message: "Account created successfully" }, { status: 201 })
  } catch (error) {
    console.error("REGISTER ERROR: User creation or query failed.", error)
    return errorResponse(error, "Unable to create account due to a database error.", 500)
  }
}
