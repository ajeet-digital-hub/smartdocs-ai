"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (data.ok) {
        setSent(true);
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10"
      style={{
        background: "#0B1C33",
        backgroundImage: "radial-gradient(circle at 20% 20%, #123059 0%, #0B1C33 55%)",
      }}
    >
      <div className="relative w-full max-w-md">
        <div className="rounded-[20px] bg-white p-9 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="mb-7 flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#1D64C9] to-[#0F9D7C] text-lg font-bold text-white shadow-sm">
              S
            </div>
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[3px] text-[#1D64C9] m-0 leading-tight">SMARTDOCS</p>
              <h1 className="text-[21px] font-bold text-[#0B1C33] m-0 leading-tight">AI</h1>
            </div>
          </div>

          {sent ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📧</div>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#0B1C33", marginBottom: "8px" }}>
                Check Your Email
              </h2>
              <p style={{ fontSize: "14px", color: "#5A6B7B", lineHeight: 1.6, marginBottom: "24px" }}>
                If an account exists with that email address, we&apos;ve sent a password reset link.
                Please check your inbox and spam folder.
              </p>
              <Link
                href="/login"
                style={{
                  display: "inline-block",
                  padding: "12px 24px",
                  background: "linear-gradient(135deg, #1D64C9, #0F9D7C)",
                  color: "#fff",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#0B1C33", textAlign: "center", marginBottom: "4px" }}>
                Forgot Password?
              </h2>
              <p style={{ fontSize: "14px", color: "#5A6B7B", textAlign: "center", marginBottom: "24px" }}>
                Enter your email and we&apos;ll send you a reset link.
              </p>

              {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div>
                  <label htmlFor="email" style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#33475B", marginBottom: "6px" }}>
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    style={{
                      width: "100%",
                      height: "46px",
                      borderRadius: "12px",
                      border: "1px solid #E0E6ED",
                      background: "#F8FAFC",
                      padding: "0 14px",
                      fontSize: "14px",
                      color: "#0B1C33",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    height: "48px",
                    borderRadius: "12px",
                    border: "none",
                    background: "linear-gradient(135deg, #1D64C9, #0F9D7C)",
                    color: "#fff",
                    fontSize: "15px",
                    fontWeight: 700,
                    cursor: "pointer",
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <div style={{ textAlign: "center", marginTop: "24px" }}>
                <Link
                  href="/login"
                  style={{ color: "#0F9D7C", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}
                >
                  ← Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

