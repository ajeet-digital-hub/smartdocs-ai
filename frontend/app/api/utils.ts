import * as crypto from "crypto"

export function isValidEmail(email: unknown): email is string {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidFullName(name: unknown): name is string {
  return typeof name === "string" && name.trim().length >= 2
}

export function isValidPassword(password: unknown): password is string {
  if (typeof password !== "string") return false

  const hasLowercase = /[a-z]/.test(password)
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[!@#$%^&*]/.test(password)
  const hasLength = password.length >= 8
  const hasNoTripleRepeat = !/(.)\1\1/.test(password)
  const typeCount = [hasLowercase, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length

  return hasLength && typeCount >= 3 && hasNoTripleRepeat
}

export function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex")
}

export function generateOtpCode() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, "0")
}

export function isValidCountryCode(code: unknown): code is string {
  return typeof code === "string" && /^\+?[0-9]{1,4}$/.test(code)
}

export function normalizePhoneNumber(countryCode: unknown, phone: unknown): string | null {
  if (typeof countryCode !== "string" || typeof phone !== "string") return null

  const digits = phone.replace(/\D/g, "")
  const code = countryCode.replace(/\D/g, "")

  if (!/^[0-9]{1,4}$/.test(code) || digits.length < 7 || digits.length > 15) {
    return null
  }

  return `+${code}${digits}`
}

export function isValidPhoneNumber(phone: unknown): phone is string {
  return typeof phone === "string" && /^[0-9]{7,15}$/.test(phone)
}

export function formatCountryCode(code: string) {
  return code.startsWith("+") ? code : `+${code}`
}

export async function verifyTurnstileToken(token: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    return { valid: true, missingConfig: true }
  }

  const form = new URLSearchParams()
  form.append("secret", secret)
  form.append("response", token)

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form,
  })

  if (!response.ok) {
    return { valid: false, error: "Captcha verification failed." }
  }

  const data = await response.json()
  return {
    valid: Boolean(data.success),
    error: (data.error_description as string) || (Array.isArray(data["error-codes"]) ? data["error-codes"].join(", ") : undefined),
  }
}

