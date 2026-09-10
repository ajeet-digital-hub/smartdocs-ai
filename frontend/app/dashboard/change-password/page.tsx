"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function PasswordStrengthIndicator({ password }: { password: string }) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score += 1;

  const label = score <= 2 ? "Weak" : score <= 4 ? "Fair" : score <= 5 ? "Good" : "Strong";
  const color = score <= 2 ? "#E53E3E" : score <= 4 ? "#DD6B20" : score <= 5 ? "#38A169" : "#2B6CB0";
  const width = Math.min(100, (score / 7) * 100);

  if (!password) return null;

  return (
    <div style={{ marginTop: "6px" }}>
      <div
        style={{
          height: "4px",
          background: "#E5DCC8",
          borderRadius: "2px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${width}%`,
            background: color,
            borderRadius: "2px",
            transition: "all 0.3s",
          }}
        />
      </div>
      <p style={{ fontSize: "11px", color, margin: "4px 0 0 0", fontWeight: 600 }}>
        {label}
      </p>
    </div>
  );
}

export default function ChangePasswordPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: "error", text: "All fields are required." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();

      if (data.ok) {
        setMessage({ type: "success", text: "Password changed successfully!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage({ type: "error", text: data.error || "Failed to change password." });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to change password." });
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div style={{ padding: "40px 24px", maxWidth: "600px", margin: "0 auto" }}>
        <div
          style={{
            background: "#FFFDF7",
            borderRadius: "20px",
            padding: "44px",
            textAlign: "center",
          }}
        >
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 24px", maxWidth: "600px", margin: "0 auto" }}>
      <div
        style={{
          background: "#FFFDF7",
          borderRadius: "20px",
          padding: "44px 48px 40px",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#241F1B",
            margin: "0 0 4px 0",
          }}
        >
          Change Password
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "#6E6459",
            margin: "0 0 24px 0",
          }}
        >
          Update your account password
        </p>

        {message && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "20px",
              fontSize: "14px",
              background: message.type === "success" ? "#F0FFF4" : "#FFF5F5",
              color: message.type === "success" ? "#276749" : "#C53030",
              border: `1px solid ${
                message.type === "success" ? "#C6F6D5" : "#FED7D7"
              }`,
            }}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gap: "20px", maxWidth: "450px" }}>
            {/* Current Password */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#4A3F34",
                  marginBottom: "6px",
                }}
              >
                Current Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPasswords.current ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 40px 10px 14px",
                    border: "1.5px solid #E5DCC8",
                    borderRadius: "8px",
                    fontSize: "14px",
                    color: "#241F1B",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords({
                      ...showPasswords,
                      current: !showPasswords.current,
                    })
                  }
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "#8A7F72",
                  }}
                >
                  {showPasswords.current ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#4A3F34",
                  marginBottom: "6px",
                }}
              >
                New Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPasswords.new ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 40px 10px 14px",
                    border: "1.5px solid #E5DCC8",
                    borderRadius: "8px",
                    fontSize: "14px",
                    color: "#241F1B",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords({
                      ...showPasswords,
                      new: !showPasswords.new,
                    })
                  }
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "#8A7F72",
                  }}
                >
                  {showPasswords.new ? "🙈" : "👁️"}
                </button>
              </div>
              <PasswordStrengthIndicator password={newPassword} />
            </div>

            {/* Confirm New Password */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#4A3F34",
                  marginBottom: "6px",
                }}
              >
                Confirm New Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 40px 10px 14px",
                    border: "1.5px solid #E5DCC8",
                    borderRadius: "8px",
                    fontSize: "14px",
                    color: "#241F1B",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords({
                      ...showPasswords,
                      confirm: !showPasswords.confirm,
                    })
                  }
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "#8A7F72",
                  }}
                >
                  {showPasswords.confirm ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={
                submitting || !currentPassword || !newPassword || !confirmPassword
              }
              style={{
                padding: "12px 24px",
                background: "#8B2E3F",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
                opacity:
                  submitting || !currentPassword || !newPassword || !confirmPassword
                    ? 0.6
                    : 1,
                marginTop: "8px",
              }}
            >
              {submitting ? "Changing Password..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

