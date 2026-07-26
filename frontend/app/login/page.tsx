"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function EyeIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12S5.25 5.25 12 5.25 21.75 12 21.75 12 18.75 18.75 12 18.75 2.25 12 2.25 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="m3 3 18 18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.6 5.4A10.7 10.7 0 0 1 12 5.25C18.75 5.25 21.75 12 21.75 12a18.2 18.2 0 0 1-3.25 4.5M6.1 6.1C3.65 8.1 2.25 12 2.25 12s3 6.75 9.75 6.75c1.2 0 2.28-.21 3.24-.57M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [loginMode, setLoginMode] = useState<"password" | "email-otp" | "mobile-otp">("password")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [mobileNumber, setMobileNumber] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (!cooldown) return
    const interval = window.setInterval(() => setCooldown((prev) => Math.max(prev - 1, 0)), 1000)
    return () => window.clearInterval(interval)
  }, [cooldown])

  const passwordReady = useMemo(
    () => email.trim().length > 0 && password.trim().length > 0,
    [email, password],
  )

  const handlePasswordLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    if (!isValidEmail(email)) { setError("Enter a valid email address."); return }
    if (!password) { setError("Enter your password."); return }
    setLoading(true)

    const result = await signIn("credentials", {
      redirect: false,
      email: email,
      password: password,
    })

    setLoading(false)

    if (result?.error) {
      setError(result.error)
    } else if (result?.ok) {
      router.push("/dashboard")
    }
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (loginMode === "email-otp" && !isValidEmail(email)) { setError("Enter a valid email address."); return }
    if (loginMode === "mobile-otp" && mobileNumber.replace(/\D/g, "").length < 10) { setError("Enter a valid mobile number."); return }
    setLoading(true)
    try {
      const response = await fetch("/api/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purpose: "login",
          ...(loginMode === "email-otp" ? { email } : { phoneNumber: mobileNumber, via: "sms" }),
        }),
      })
      const result = await response.json()
      if (!response.ok || !result.ok) throw new Error(result.error || "Unable to send OTP.")
      setOtpSent(true)
      setCooldown(30)
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Unable to send OTP.")
    } finally { setLoading(false) }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otpCode.length !== 6) { setError("Enter a 6-digit OTP code."); return }
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: otpCode,
          ...(loginMode === "email-otp" ? { email } : { phoneNumber: mobileNumber }),
        }),
      })
      const result = await response.json()
      if (!response.ok || !result.ok) throw new Error(result.error || "Unable to verify OTP.")
      router.push("/dashboard")
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : "Unable to verify OTP.")
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8"
      style={{
        background: "#0B1C33",
        backgroundImage: "radial-gradient(circle at 20% 20%, #123059 0%, #0B1C33 55%)",
      }}
    >
      <div className="relative w-full max-w-md">
        <div className="rounded-[20px] bg-white p-9 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          {/* Brand */}
          <div className="mb-7 flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#1D64C9] to-[#0F9D7C] text-lg font-bold text-white shadow-sm">
              S
            </div>
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[3px] text-[#1D64C9] m-0 leading-tight">SMARTDOCS</p>
              <h1 className="text-[21px] font-bold text-[#0B1C33] m-0 leading-tight">AI Login</h1>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-[6px] rounded-[999px] bg-[#F1F5F9] p-[4px]">
            {[
              { key: "password", label: "Password" },
              { key: "email-otp", label: "Email OTP" },
              { key: "mobile-otp", label: "Mobile OTP" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => { setLoginMode(tab.key as typeof loginMode); setOtpSent(false); setOtpCode(""); setError(null) }}
                className={`flex-1 rounded-[999px] border-none px-0 py-[10px] text-sm font-semibold transition-all duration-200 ${
                  loginMode === tab.key
                    ? "bg-[#1D64C9] text-white shadow-sm"
                    : "bg-transparent text-[#5A6B7B] hover:text-[#1D64C9]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Password Panel */}
          {loginMode === "password" && (
            <form className="space-y-[18px]" onSubmit={handlePasswordLogin}>
              <div className="relative">
                <label htmlFor="email" className="mb-[6px] block text-[13px] font-semibold text-[#33475B]">Email address</label>
                <input
                  id="email" type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-[46px] w-full rounded-xl border border-[#E0E6ED] bg-[#F8FAFC] px-[14px] pr-[44px] text-sm text-[#0B1C33] outline-none transition-all duration-150 focus:border-[#1D64C9] focus:shadow-[0_0_0_3px_rgba(29,100,201,0.15)]"
                />
              </div>
              <div className="relative">
                <label htmlFor="password" className="mb-[6px] block text-[13px] font-semibold text-[#33475B]">Password</label>
                <input
                  id="password" type={showPassword ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-[46px] w-full rounded-xl border border-[#E0E6ED] bg-[#F8FAFC] px-[14px] pr-[44px] text-sm text-[#0B1C33] outline-none transition-all duration-150 focus:border-[#1D64C9] focus:shadow-[0_0_0_3px_rgba(29,100,201,0.15)]"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-[14px] top-[38px] cursor-pointer text-[#8A99A8] text-lg select-none hover:text-[#5A6B7B]">
                  {showPassword ? "\u{1F440}" : "\u{1F441}"}
                </button>
              </div>
              <div className="text-right mb-[22px]">
                <Link href="/forgot-password" className="text-[13px] font-semibold text-[#0F9D7C] no-underline hover:underline">
                  Forgot password?
                </Link>
              </div>
              <button type="submit" disabled={loading || !passwordReady}
                className="h-[48px] w-full rounded-xl border-none bg-gradient-to-r from-[#1D64C9] to-[#0F9D7C] text-[15px] font-bold text-white shadow-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          )}

          {/* OTP Panels */}
          {(loginMode === "email-otp" || loginMode === "mobile-otp") && (
            <>
              {!otpSent ? (
                <form className="space-y-[18px]" onSubmit={handleSendOtp}>
                  {loginMode === "email-otp" ? (
                    <div className="relative">
                      <label htmlFor="email2" className="mb-[6px] block text-[13px] font-semibold text-[#33475B]">Email address</label>
                      <input id="email2" type="email" value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="h-[46px] w-full rounded-xl border border-[#E0E6ED] bg-[#F8FAFC] px-[14px] pr-[44px] text-sm text-[#0B1C33] outline-none transition-all duration-150 focus:border-[#1D64C9] focus:shadow-[0_0_0_3px_rgba(29,100,201,0.15)]"
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <label htmlFor="mobile" className="mb-[6px] block text-[13px] font-semibold text-[#33475B]">Mobile number</label>
                      <input id="mobile" type="tel" value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="h-[46px] w-full rounded-xl border border-[#E0E6ED] bg-[#F8FAFC] px-[14px] pr-[44px] text-sm text-[#0B1C33] outline-none transition-all duration-150 focus:border-[#1D64C9] focus:shadow-[0_0_0_3px_rgba(29,100,201,0.15)]"
                      />
                    </div>
                  )}
                  <button type="submit" disabled={loading}
                    className="h-[48px] w-full rounded-xl border-none bg-gradient-to-r from-[#1D64C9] to-[#0F9D7C] text-[15px] font-bold text-white shadow-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed">
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </button>
                </form>
              ) : (
                <form className="space-y-[18px]" onSubmit={handleVerifyOtp}>
                  <div className="relative">
                    <label htmlFor="otp" className="mb-[6px] block text-[13px] font-semibold text-[#33475B]">Enter OTP</label>
                    <input id="otp" type="text" inputMode="numeric" pattern="\d{6}" value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="6-digit code"
                      className="h-[46px] w-full rounded-xl border border-[#E0E6ED] bg-[#F8FAFC] px-[14px] pr-[44px] text-sm text-[#0B1C33] outline-none transition-all duration-150 focus:border-[#1D64C9] focus:shadow-[0_0_0_3px_rgba(29,100,201,0.15)] tracking-[8px] text-center text-lg font-bold"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" disabled={loading || otpCode.length !== 6}
                      className="flex-1 h-[48px] rounded-xl border-none bg-gradient-to-r from-[#1D64C9] to-[#0F9D7C] text-[15px] font-bold text-white shadow-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed">
                      {loading ? "Verifying..." : "Verify & sign in"}
                    </button>
                    <button type="button" onClick={() => { setOtpSent(false); setOtpCode(""); handleSendOtp as any }}
                      disabled={cooldown > 0}
                      className="h-[48px] rounded-xl border border-[#E0E6ED] bg-white px-5 text-[13px] font-semibold text-[#5A6B7B] transition-all hover:border-[#1D64C9] hover:text-[#1D64C9] disabled:opacity-50 disabled:cursor-not-allowed">
                      {cooldown > 0 ? `${cooldown}s` : "Resend"}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {/* Divider */}
          <div className="mt-8 flex items-center gap-3 text-sm text-[#8A99A8]">
            <span className="h-px flex-1 bg-[#E0E6ED]" />
            <span>or sign in with</span>
            <span className="h-px flex-1 bg-[#E0E6ED]" />
          </div>

          {/* Social */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#E0E6ED] bg-white px-4 py-3 text-sm font-semibold text-[#5A6B7B] transition-all hover:border-[#1D64C9] hover:text-[#1D64C9]">
              <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </button>
            <button type="button" onClick={() => signIn("apple", { callbackUrl: "/dashboard" })}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#E0E6ED] bg-white px-4 py-3 text-sm font-semibold text-[#5A6B7B] transition-all hover:border-[#1D64C9] hover:text-[#1D64C9]">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#000"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
              Apple
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

