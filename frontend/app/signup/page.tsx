"use client"

import { useState } from "react"
import Link from "next/link"
import { signIn } from "next-auth/react"

const passwordRules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  {
    label: "Uppercase, lowercase, number, or symbol (3 of 4)",
    test: (p: string) =>
      [/[a-z]/.test(p), /[A-Z]/.test(p), /[0-9]/.test(p), /[!@#$%^&*]/.test(p)].filter(Boolean).length >= 3,
  },
  { label: "No more than two repeated characters in a row", test: (p: string) => !/(.)\1\1/.test(p) },
]

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function EyeIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "14px 16px", fontSize: "15px", borderRadius: "12px",
  border: "1.5px solid #E5DCC8", background: "#FBF5E9", color: "#241F1B",
  outline: "none", transition: "border-color .15s ease, background .15s ease",
  boxSizing: "border-box", fontFamily: "inherit",
}

const eyeBtnStyle: React.CSSProperties = {
  position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
  background: "none", border: "none", cursor: "pointer", color: "#A79C8B",
  padding: "4px", display: "flex", alignItems: "center",
}

const socialBtnStyle: React.CSSProperties = {
  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
  gap: "8px", padding: "16px 8px", borderRadius: "12px",
  border: "1.5px solid #E5DCC8", background: "#fff", cursor: "pointer",
  transition: "all .15s ease", minHeight: "84px",
}

export default function SignupPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [signupMethod, setSignupMethod] = useState<"email" | "phone">("email")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword
  const passwordValidation = passwordRules.map((r) => ({ label: r.label, valid: r.test(password) }))

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!fullName.trim() || fullName.trim().length < 2) { setError("Enter a valid full name."); return }
    if (signupMethod === "email" && !isValidEmail(email)) { setError("Enter a valid email address."); return }
    if (password !== confirmPassword) { setError("Passwords do not match."); return }
    if (!passwordRules.every((r) => r.test(password))) { setError("Password does not meet security requirements."); return }
    if (!termsAccepted) { setError("Please accept the Terms & Conditions."); return }

    setLoading(true)
    try {
      const body: Record<string, unknown> = { fullName: fullName.trim(), password, signupMethod }
      if (signupMethod === "email") body.email = email.trim().toLowerCase()
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || data?.ok !== true) throw new Error(data?.error || "Unable to create your account.")
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create your account.")
    } finally {
      setLoading(false)
    }
  }

  const handleSocialSignIn = async (provider: "google" | "apple") => {
    setLoading(true)
    setError(null)
    await signIn(provider, { callbackUrl: "/dashboard" })
    setLoading(false)
  }

  const handlePasskey = async () => {
    setError(null)
    if (!window.PublicKeyCredential) { setError("Passkey authentication is not supported in this browser."); return }
    try {
      const res = await fetch("/api/passkey/status")
      const data = await res.json()
      if (!res.ok || !data.configured) {
        throw new Error(data.missing
          ? "Passkey backend is not configured. Required: " + data.missing.join(", ")
          : "Passkey is not configured.")
      }
      setError("Passkey is configured, but passkey sign-in requires backend WebAuthn setup before it can be completed.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Passkey is not configured.")
    }
  }

  if (success) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        padding: "48px 20px",
        fontFamily: '"Segoe UI",-apple-system,BlinkMacSystemFont,Roboto,Helvetica,Arial,sans-serif',
        background: "radial-gradient(1200px 600px at 15% 10%, #2b1620 0%, transparent 55%),radial-gradient(900px 500px at 85% 90%, #201828 0%, transparent 55%),#141018",
      }}>
        <div style={{
          width: "100%", maxWidth: "520px", background: "#FFFDF7", borderRadius: "20px",
          padding: "44px 48px 40px", boxShadow: "0 30px 60px -20px rgba(0,0,0,0.45)", textAlign: "center",
        }}>
          <div style={{
            width: "64px", height: "64px", borderRadius: "50%", background: "#3F7D53",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px", color: "#fff", fontSize: "32px", fontWeight: 700,
          }}>✓</div>
          <h1 style={{ fontSize: "29px", fontWeight: 700, color: "#241F1B", margin: "0 0 8px" }}>
            Account created successfully!
          </h1>
          <p style={{ fontSize: "15px", color: "#6E6459", marginBottom: "28px" }}>
            Your account has been created. You can now sign in.
          </p>
          <Link href="/login" style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            padding: "15px 36px", border: "none", borderRadius: "12px",
            background: "#8B2E3F", color: "#fff", fontSize: "16px", fontWeight: 700,
            textDecoration: "none", cursor: "pointer", transition: "background .15s ease",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#6E1F2C" }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#8B2E3F" }}>
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "48px 20px",
      fontFamily: '"Segoe UI",-apple-system,BlinkMacSystemFont,Roboto,Helvetica,Arial,sans-serif',
      background: "radial-gradient(1200px 600px at 15% 10%, #2b1620 0%, transparent 55%),radial-gradient(900px 500px at 85% 90%, #201828 0%, transparent 55%),#141018",
    }}>
      <div style={{
        width: "100%", maxWidth: "520px", background: "#FFFDF7", borderRadius: "20px",
        padding: "44px 48px 40px", boxShadow: "0 30px 60px -20px rgba(0,0,0,0.45)",
      }}>
        <div style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.28em", color: "#8B2E3F", marginBottom: "18px" }}>
          SMARTDOCS
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
          <h1 style={{ fontSize: "29px", fontWeight: 700, color: "#241F1B", lineHeight: 1.2, margin: 0 }}>
            Create your account
          </h1>
          <div style={{ fontSize: "14px", color: "#6E6459", whiteSpace: "nowrap", paddingTop: "6px" }}>
            Already registered?{" "}
            <Link href="/login" style={{ color: "#8B2E3F", fontWeight: 600, textDecoration: "none" }}
              onMouseEnter={(e) => { e.currentTarget.style.textDecoration = "underline" }}
              onMouseLeave={(e) => { e.currentTarget.style.textDecoration = "none" }}>
              Sign in
            </Link>
          </div>
        </div>
        {/* end top-row */}

        <p style={{ fontSize: "15px", color: "#6E6459", marginTop: "8px", marginBottom: "24px" }}>
          Create your account using Email or Mobile Number.
        </p>

        <div style={{ display: "flex", gap: "10px", marginBottom: "26px" }}>
          {(["email" as const, "phone" as const]).map((method) => (
            <button key={method} type="button"
              onClick={() => setSignupMethod(method)}
              style={{
                flex: 1, padding: "13px 14px", borderRadius: "12px",
                border: signupMethod === method ? "1.5px solid #8B2E3F" : "1.5px solid #E5DCC8",
                background: signupMethod === method ? "#8B2E3F" : "#fff",
                fontSize: "14.5px", fontWeight: 600,
                color: signupMethod === method ? "#fff" : "#241F1B",
                cursor: "pointer", transition: "all .15s ease",
              }}>
              {method === "email" ? "Email Signup" : "Mobile Signup"}
            </button>
          ))}
        </div>

        {error && (
          <div style={{
            borderRadius: "12px", border: "1.5px solid #e74c3c",
            background: "#fdf0ef", padding: "14px 16px",
            fontSize: "14px", color: "#c0392b", marginBottom: "20px",
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignup}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#241F1B", marginBottom: "8px" }}>
              Full name
            </label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Doe" autoComplete="name"
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = "#8B2E3F"; e.target.style.background = "#fff" }}
              onBlur={(e) => { e.target.style.borderColor = "#E5DCC8"; e.target.style.background = "#FBF5E9" }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#241F1B", marginBottom: "8px" }}>
              Email address
            </label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" autoComplete="email"
              style={inputStyle}
              onBlur={(e) => { e.target.style.borderColor = "#E5DCC8"; e.target.style.background = "#FBF5E9" }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#241F1B", marginBottom: "8px" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input type={showPassword ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password" autoComplete="new-password"
                style={{ ...inputStyle, paddingRight: "46px" }}
                onFocus={(e) => { e.target.style.borderColor = "#8B2E3F"; e.target.style.background = "#fff" }}
                onBlur={(e) => { e.target.style.borderColor = "#E5DCC8"; e.target.style.background = "#FBF5E9" }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={eyeBtnStyle} aria-label={showPassword ? "Hide password" : "Show password"}>
                <EyeIcon />
              </button>
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#241F1B", marginBottom: "8px" }}>
              Confirm password
            </label>
            <div style={{ position: "relative" }}>
              <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password" autoComplete="new-password"
                style={{
                  ...inputStyle, paddingRight: "46px",
                  borderColor: confirmPassword.length > 0
                    ? (password === confirmPassword ? "#3F7D53" : "#e74c3c") : "#E5DCC8",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#8B2E3F"; e.target.style.background = "#fff" }}
                onBlur={(e) => {
                  e.target.style.borderColor = e.target.value.length > 0
                    ? (password === e.target.value ? "#3F7D53" : "#e74c3c") : "#E5DCC8"
                  e.target.style.background = "#FBF5E9"
                }}
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={eyeBtnStyle} aria-label={showConfirmPassword ? "Hide password" : "Show password"}>
                <EyeIcon />
              </button>
            </div>
            {confirmPassword.length > 0 && (
              <p style={{
                fontSize: "13px", marginTop: "6px",
                color: password === confirmPassword ? "#3F7D53" : "#e74c3c",
                fontWeight: password === confirmPassword ? 600 : 400,
              }}>
                {password === confirmPassword ? "✓ Passwords match." : "Passwords do not match."}
              </p>
            )}
          </div>

          <div style={{ background: "#FBF5E9", borderRadius: "12px", padding: "16px 18px", marginBottom: "22px" }}>
            {passwordValidation.map((rule) => (
              <div key={rule.label} style={{
                display: "flex", alignItems: "center", gap: "9px", fontSize: "13.5px",
                color: rule.valid ? "#3F7D53" : "#6E6459",
                fontWeight: rule.valid ? 600 : 400, padding: "4px 0",
              }}>
                <span style={{
                  width: "15px", height: "15px", borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  ...(rule.valid
                    ? { border: "none", background: "#3F7D53", color: "#fff", fontSize: "10px" }
                    : { border: "1.5px solid #A79C8B" }),
                }}>
                  {rule.valid ? "✓" : ""}
                </span>
                <span>{rule.label}</span>
              </div>
            ))}
          </div>

          <label style={{
            display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px",
            fontSize: "14px", color: "#241F1B", cursor: "pointer",
          }}>
            <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)}
              style={{ width: "17px", height: "17px", accentColor: "#8B2E3F", cursor: "pointer", flexShrink: 0 }} />
            <span>
              I agree to the{" "}
              <a href="#" style={{ color: "#8B2E3F", fontWeight: 600, textDecoration: "none" }}
                onMouseEnter={(e) => { e.currentTarget.style.textDecoration = "underline" }}
                onMouseLeave={(e) => { e.currentTarget.style.textDecoration = "none" }}>
                Terms &amp; Conditions
              </a>
            </span>
          </label>

          <button type="submit" disabled={loading || !passwordsMatch}
            style={{
              width: "100%", padding: "15px", border: "none", borderRadius: "12px",
              background: loading || !passwordsMatch ? "#c49a8f" : "#8B2E3F",
              color: "#fff", fontSize: "16px", fontWeight: 700,
              cursor: loading || !passwordsMatch ? "not-allowed" : "pointer",
              transition: "background .15s ease",
            }}
            onMouseEnter={(e) => { if (!loading && passwordsMatch) { e.currentTarget.style.background = "#6E1F2C" } }}
            onMouseLeave={(e) => { if (!loading && passwordsMatch) { e.currentTarget.style.background = "#8B2E3F" } }}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: "14px", margin: "28px 0 20px" }}>
          <span style={{ flex: 1, height: "1px", background: "#E5DCC8" }} />
          <span style={{ fontSize: "13px", color: "#A79C8B", whiteSpace: "nowrap" }}>Other options</span>
          <span style={{ flex: 1, height: "1px", background: "#E5DCC8" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
          <button type="button" onClick={() => handleSocialSignIn("google")} disabled={loading}
            style={socialBtnStyle}
            onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.borderColor = "#A79C8B"; e.currentTarget.style.background = "#FBF5E9" } }}
            onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.borderColor = "#E5DCC8"; e.currentTarget.style.background = "#fff" } }}>
            <svg viewBox="0 0 24 24" style={{ width: "22px", height: "22px" }}>
              <path fill="#4285F4" d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.55-5.17 3.55-8.66z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3a7.15 7.15 0 0 1-4.06 1.15 7.13 7.13 0 0 1-6.7-4.94H1.29v3.1A12 12 0 0 0 12 24z" />
              <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6v-3.1H1.29a12 12 0 0 0 0 10.8z" />
              <path fill="#EA4335" d="M12 4.75c1.76 0 3.35.6 4.6 1.79l3.44-3.44A11.94 11.94 0 0 0 12 0 12 12 0 0 0 1.29 6.6l4.01 3.1A7.13 7.13 0 0 1 12 4.75z" />
            </svg>
            <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#241F1B", textAlign: "center", lineHeight: 1.25 }}>Google</span>
          </button>
          <button type="button" onClick={() => handleSocialSignIn("apple")} disabled={loading}
            style={socialBtnStyle}
            onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.borderColor = "#A79C8B"; e.currentTarget.style.background = "#FBF5E9" } }}
            onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.borderColor = "#E5DCC8"; e.currentTarget.style.background = "#fff" } }}>
            <svg viewBox="0 0 24 24" style={{ width: "22px", height: "22px" }} fill="#1F2430">
              <path d="M16.36 1.43c0 1.14-.46 2.2-1.2 2.98-.83.89-2.15 1.57-3.24 1.48-.14-1.1.42-2.26 1.16-3.02.8-.83 2.2-1.47 3.28-1.44zM20.6 17.53c-.35.81-.77 1.6-1.28 2.34-.7 1.03-1.28 1.75-1.72 2.15-.68.66-1.4 1-2.19 1.02-.56.02-1.24-.16-2.02-.51-.79-.35-1.51-.52-2.18-.52-.7 0-1.44.17-2.24.52-.8.35-1.44.53-1.94.55-.75.03-1.49-.32-2.22-1.05-.48-.44-1.09-1.19-1.83-2.26-.79-1.13-1.44-2.44-1.95-3.94-.54-1.62-.82-3.19-.82-4.71 0-1.74.38-3.24 1.13-4.5a6.66 6.66 0 0 1 2.36-2.4 6.34 6.34 0 0 1 3.19-.9c.6 0 1.4.19 2.4.55.99.36 1.62.55 1.89.55.2 0 .9-.21 2.1-.64 1.13-.4 2.09-.56 2.86-.5 2.12.17 3.71.99 4.77 2.49-1.9 1.15-2.84 2.76-2.82 4.82.02 1.61.6 2.94 1.75 4-.36 1.06-.9.9-1.61 2.96z" />
            </svg>
            <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#241F1B", textAlign: "center", lineHeight: 1.25 }}>Apple</span>
          </button>
          <button type="button" onClick={handlePasskey} disabled={loading}
            style={socialBtnStyle}
            onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.borderColor = "#A79C8B"; e.currentTarget.style.background = "#FBF5E9" } }}
            onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.borderColor = "#E5DCC8"; e.currentTarget.style.background = "#fff" } }}>
            <svg viewBox="0 0 24 24" style={{ width: "22px", height: "22px" }} fill="none" stroke="#1F2430" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4.5" />
              <path d="M8 15h8l-1 6H9l-1-6z" />
              <path d="M10.5 15v-2.5M13.5 15v-2.5" />
            </svg>
            <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#241F1B", textAlign: "center", lineHeight: 1.25 }}>Passkey</span>
          </button>
        </div>
      </div>
    </div>
  )
}
