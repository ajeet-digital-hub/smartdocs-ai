export type OtpEntry = {
  contact: string
  contactType: "email" | "phone"
  purpose: "signup" | "login"
  code?: string
  expiresAt?: number
  lastSent: number
  firstRequestAt: number
  requestCount: number
  verified?: boolean
  fullName?: string
  passwordHash?: string
  accountCreated?: boolean
  via?: "email" | "sms" | "whatsapp"
}

export const otpStore = new Map<string, OtpEntry>()
export const createdAccounts = new Map<
  string,
  {
    contact: string
    contactType: "email" | "phone"
    fullName: string
    passwordHash?: string
  }
>()

export const OTP_TTL = 10 * 60 * 1000
export const RESEND_COOLDOWN = 30 * 1000
export const MAX_REQUESTS_PER_WINDOW = 5
export const REQUEST_WINDOW = 60 * 60 * 1000

export const createContactKey = (contactType: "email" | "phone", contact: string) =>
  `${contactType}:${contact.toLowerCase()}`
