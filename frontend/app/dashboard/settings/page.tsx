"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ProfileData {
  fullName: string;
  email: string;
  phoneNumber?: string;
  countryCode?: string;
  image?: string;
  emailVerified?: string | null;
  createdAt: string;
}

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

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Profile form
  const [formData, setFormData] = useState({ fullName: "", phoneNumber: "", countryCode: "" });

  // Password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (data.ok) {
        setProfile(data.user);
        setFormData({
          fullName: data.user.fullName || "",
          phoneNumber: data.user.phoneNumber || "",
          countryCode: data.user.countryCode || "",
        });
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.ok) {
        setProfile(data.user);
        setMessage({ type: "success", text: "Profile updated successfully!" });
        await update({ fullName: data.user.fullName });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update profile." });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to update profile." });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    try {
      const res = await fetch("/api/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessage({ type: "success", text: "Password changed successfully!" });
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to change password." });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to change password." });
    }
  };

  const handleSendVerification = async () => {
    setMessage(null);
    try {
      const res = await fetch("/api/profile/verify-email", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setMessage({ type: "success", text: "Verification email sent! Check your inbox." });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to send verification email." });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to send verification email." });
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "security", label: "Security", icon: "🔒" },
    { id: "email", label: "Email", icon: "📧" },
  ];

  if (status === "loading") {
    return (
      <div style={{ padding: "40px 24px", maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ background: "#FFFDF7", borderRadius: "20px", padding: "44px", textAlign: "center" }}>
          Loading...
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ padding: "40px 24px", maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ background: "#FFFDF7", borderRadius: "20px", padding: "44px", textAlign: "center" }}>
          Could not load profile.
        </div>
      </div>
    );
  }

  const verified = !!profile.emailVerified;

  return (
    <div style={{ padding: "40px 24px", maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#241F1B", margin: "0 0 4px 0" }}>Account Settings</h1>
      <p style={{ fontSize: "14px", color: "#6E6459", margin: "0 0 24px 0" }}>Manage your account preferences and security</p>

      {message && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontSize: "14px",
            background: message.type === "success" ? "#F0FFF4" : "#FFF5F5",
            color: message.type === "success" ? "#276749" : "#C53030",
            border: `1px solid ${message.type === "success" ? "#C6F6D5" : "#FED7D7"}`,
          }}
        >
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", flexWrap: "wrap" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 18px",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              background: activeTab === tab.id ? "#8B2E3F" : "#F5F0E8",
              color: activeTab === tab.id ? "#fff" : "#4A3F34",
              transition: "all 0.2s",
            }}
          >
            <span style={{ marginRight: "6px" }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ background: "#FFFDF7", borderRadius: "20px", padding: "32px" }}>
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <form onSubmit={handleProfileSubmit}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#241F1B", margin: "0 0 20px 0" }}>Profile Information</h2>
            <div style={{ display: "grid", gap: "20px", maxWidth: "500px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#4A3F34", marginBottom: "6px" }}>
                  Full Name
                </label>
                <input
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1.5px solid #E5DCC8",
                    borderRadius: "8px",
                    fontSize: "14px",
                    color: "#241F1B",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#4A3F34", marginBottom: "6px" }}>
                  Mobile Number
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    value={formData.countryCode}
                    onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                    placeholder="+1"
                    style={{
                      width: "80px",
                      padding: "10px 14px",
                      border: "1.5px solid #E5DCC8",
                      borderRadius: "8px",
                      fontSize: "14px",
                      color: "#241F1B",
                      outline: "none",
                    }}
                  />
                  <input
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="Phone number"
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      border: "1.5px solid #E5DCC8",
                      borderRadius: "8px",
                      fontSize: "14px",
                      color: "#241F1B",
                      outline: "none",
                    }}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={!formData.fullName.trim()}
                style={{
                  padding: "12px 24px",
                  background: "#8B2E3F",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                  opacity: formData.fullName.trim() ? 1 : 0.6,
                  marginTop: "8px",
                }}
              >
                Save Changes
              </button>
            </div>
          </form>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#241F1B", margin: "0 0 20px 0" }}>Change Password</h2>
            <form onSubmit={handlePasswordSubmit}>
              <div style={{ display: "grid", gap: "20px", maxWidth: "500px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#4A3F34", marginBottom: "6px" }}>
                    Current Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
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
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
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
                      {showPassword.current ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#4A3F34", marginBottom: "6px" }}>
                    New Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
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
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
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
                      {showPassword.new ? "🙈" : "👁️"}
                    </button>
                  </div>
                  <PasswordStrengthIndicator password={passwordData.newPassword} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#4A3F34", marginBottom: "6px" }}>
                    Confirm New Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
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
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
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
                      {showPassword.confirm ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  style={{
                    padding: "12px 24px",
                    background: "#8B2E3F",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "15px",
                    fontWeight: 600,
                    cursor: "pointer",
                    opacity: passwordData.currentPassword && passwordData.newPassword && passwordData.confirmPassword ? 1 : 0.6,
                    marginTop: "8px",
                  }}
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Email Tab */}
        {activeTab === "email" && (
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#241F1B", margin: "0 0 20px 0" }}>Email Settings</h2>
            <div style={{ maxWidth: "500px" }}>
              <div
                style={{
                  padding: "16px",
                  border: "1px solid #E5DCC8",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#241F1B", margin: "0 0 4px 0" }}>
                    {profile.email || "No email"}
                  </p>
                  {verified ? (
                    <span style={{ fontSize: "12px", color: "#276749", fontWeight: 600 }}>
                      ✅ Verified
                    </span>
                  ) : (
                    <span style={{ fontSize: "12px", color: "#C53030", fontWeight: 600 }}>
                      ⚠️ Not verified
                    </span>
                  )}
                </div>
                {!verified && (
                  <button
                    onClick={handleSendVerification}
                    style={{
                      padding: "8px 16px",
                      background: "#F5F0E8",
                      color: "#4A3F34",
                      border: "1px solid #E5DCC8",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Verify Email
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

