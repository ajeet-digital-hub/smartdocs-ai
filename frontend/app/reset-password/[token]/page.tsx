"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const getStrength = (p: string): { label: string; color: string; score: number } => {
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[a-z]/.test(p)) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[!@#$%^&*]/.test(p)) score++;
    if (!/(.)\1\1/.test(p)) score++;
    if (score <= 2) return { label: "Weak", color: "#E53E3E", score };
    if (score <= 4) return { label: "Fair", color: "#DD6B20", score };
    if (score <= 5) return { label: "Good", color: "#38A169", score };
    return { label: "Strong", color: "#2B6CB0", score };
  };

  const strength = getStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    if (password.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessage({ type: "success", text: "Your password has been changed successfully!" });
        setTimeout(() => router.push("/login"), 2500);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to reset password." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10"
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

          {message?.type === "success" ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#0B1C33", marginBottom: "8px" }}>
                Password Reset Successful
              </h2>
              <p style={{ fontSize: "14px", color: "#276749", marginBottom: "24px" }}>
                Your password has been changed successfully. Redirecting to login...
              </p>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#0B1C33", textAlign: "center", marginBottom: "24px" }}>
                Set New Password
              </h2>

              {message && (
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: "12px",
                    marginBottom: "16px",
                    fontSize: "14px",
                    background: message.type === "error" ? "#FFF5F5" : "#F0FFF4",
                    color: message.type === "error" ? "#C53030" : "#276749",
                    border: `1px solid ${message.type === "error" ? "#FED7D7" : "#C6F6D5"}`,
                  }}
                >
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div>
                  <label htmlFor="password" style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#33475B", marginBottom: "6px" }}>
                    New Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      style={{
                        width: "100%",
                        height: "46px",
                        borderRadius: "12px",
                        border: "1px solid #E0E6ED",
                        background: "#F8FAFC",
                        padding: "0 44px 0 14px",
                        fontSize: "14px",
                        color: "#0B1C33",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "18px",
                        color: "#8A99A8",
                      }}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div style={{ marginTop: "8px" }}>
                      <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                        <div
                          style={{
                            height: "4px",
                            flex: 1,
                            borderRadius: "2px",
                            background: strength.color,
                            opacity: strength.score >= 1 ? 1 : 0.2,
                          }}
                        />
                        <div
                          style={{
                            height: "4px",
                            flex: 1,
                            borderRadius: "2px",
                            background: strength.color,
                            opacity: strength.score >= 2 ? 1 : 0.2,
                          }}
                        />
                        <div
                          style={{
                            height: "4px",
                            flex: 1,
                            borderRadius: "2px",
                            background: strength.color,
                            opacity: strength.score >= 3 ? 1 : 0.2,
                          }}
                        />
                        <div
                          style={{
                            height: "4px",
                            flex: 1,
                            borderRadius: "2px",
                            background: strength.color,
                            opacity: strength.score >= 4 ? 1 : 0.2,
                          }}
                        />
                      </div>
                      <p style={{ fontSize: "12px", fontWeight: 600, color: strength.color, margin: 0 }}>
                        Password strength: {strength.label}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="confirm-password"
                    style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#33475B", marginBottom: "6px" }}
                  >
                    Confirm New Password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
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
                    height: "46px",
                    borderRadius: "12px",
                    border: "none",
                    background: loading ? "#A0AEC0" : "linear-gradient(to right, #1D64C9, #0F9D7C)",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  {loading ? "Changing..." : "Change Password"}
                </button>
              </form>

              <div style={{ textAlign: "center", marginTop: "24px" }}>
                <Link href="/login" style={{ fontSize: "13px", color: "#33475B", textDecoration: "none" }}>
                  &larr; Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
