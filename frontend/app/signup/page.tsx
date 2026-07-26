"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, signupMethod: "email" }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create account.");
      }

      // On successful registration, redirect to login
      router.push("/login?status=signup_success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSocialSignIn = (provider: 'google' | 'apple') => {
    setLoading(true);
    signIn(provider, { callbackUrl: '/dashboard' });
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "14px 16px", fontSize: "15px", borderRadius: "12px",
    border: "1.5px solid #E5DCC8", background: "#FFF", color: "#241F1B",
    outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  };
  
  const buttonStyle: React.CSSProperties = {
    width: "100%", padding: "14px 24px", border: "none", borderRadius: "8px",
    fontSize: "15px", fontWeight: 600, cursor: "pointer",
    background: "#8B2E3F", color: "#fff", marginTop: "8px"
  };

  const socialBtnStyle: React.CSSProperties = {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    padding: '12px', background: '#fff', border: '1.5px solid #E5DCC8',
    borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s ease',
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "radial-gradient(1200px 600px at 15% 10%, #2b1620 0%, transparent 55%),radial-gradient(900px 500px at 85% 90%, #201828 0%, transparent 55%),#141018" }}>
      <div style={{ background: "#FFFDF7", borderRadius: "20px", padding: "44px 48px 40px", width: "100%", maxWidth: "450px" }}>
        <h1 style={{ fontSize: "29px", fontWeight: 700, color: "#241F1B", margin: "0 0 8px", textAlign: "center" }}>
          Create an Account
        </h1>
        <p style={{ fontSize: "15px", color: "#6E6459", marginBottom: "28px", textAlign: "center" }}>
          Get started with your AI-powered workspace.
        </p>

        {error && <div style={{ color: 'red', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#241F1B", marginBottom: "8px" }}>
              Full Name
            </label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} style={inputStyle} required />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#241F1B", marginBottom: "8px" }}>
              Email Address
            </label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#241F1B", marginBottom: "8px" }}>
              Password
            </label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} required />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#241F1B", marginBottom: "8px" }}>
              Confirm Password
            </label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={inputStyle} required />
          </div>
          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '24px 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#E5DCC8' }} />
          <span style={{ color: '#6E6459', fontSize: '13px' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#E5DCC8' }} />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="button" onClick={() => handleSocialSignIn("google")} disabled={loading} style={socialBtnStyle}>
            {/* Google SVG */}
            <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#241F1B" }}>Google</span>
          </button>
          <button type="button" onClick={() => handleSocialSignIn("apple")} disabled={loading} style={socialBtnStyle}>
            {/* Apple SVG */}
            <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#241F1B" }}>Apple</span>
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <span style={{ fontSize: "14px", color: "#6E6459" }}>Already have an account? </span>
          <Link href="/login" style={{ color: "#8B2E3F", textDecoration: "none", fontSize: "14px", fontWeight: 600 }}>
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}