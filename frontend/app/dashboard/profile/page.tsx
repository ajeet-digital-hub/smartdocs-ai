"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
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

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", phoneNumber: "", countryCode: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSave = async () => {
    setSaving(true);
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
        setEditMode(false);
        setMessage({ type: "success", text: "Profile updated successfully!" });
        await update({ fullName: data.user.fullName });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update profile." });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setMessage({ type: "error", text: "Please upload a valid image file (JPEG, PNG, GIF, or WebP)." });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image must be less than 5MB." });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setSaving(true);
      try {
        const res = await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
        });
        const data = await res.json();
        if (data.ok) {
          setProfile(data.user);
          setMessage({ type: "success", text: "Profile photo updated!" });
          await update({ image: base64 });
        } else {
          setMessage({ type: "error", text: data.error || "Failed to upload photo." });
        }
      } catch {
        setMessage({ type: "error", text: "Failed to upload photo." });
      } finally {
        setSaving(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: "" }),
      });
      const data = await res.json();
      if (data.ok) {
        setProfile(data.user);
        setMessage({ type: "success", text: "Profile photo removed." });
        await update({ image: null });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to remove photo." });
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <div style={{ padding: "40px 24px", maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ background: "#FFFDF7", borderRadius: "20px", padding: "44px", textAlign: "center" }}>
          Loading profile...
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ padding: "40px 24px", maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ background: "#FFFDF7", borderRadius: "20px", padding: "44px", textAlign: "center" }}>
          Could not load profile.
        </div>
      </div>
    );
  }

  const initial = profile.fullName?.charAt(0)?.toUpperCase() || "U";
  const verified = !!profile.emailVerified;

  return (
    <div style={{ padding: "40px 24px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ background: "#FFFDF7", borderRadius: "20px", padding: "44px 48px 40px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#241F1B", margin: "0" }}>My Profile</h1>
            <p style={{ fontSize: "14px", color: "#6E6459", marginTop: "4px" }}>Manage your personal information</p>
          </div>
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              style={{
                padding: "10px 20px",
                background: "#8B2E3F",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Edit Profile
            </button>
          ) : (
            <button
              onClick={() => { setEditMode(false); setFormData({ fullName: profile.fullName, phoneNumber: profile.phoneNumber || "", countryCode: profile.countryCode || "" }); }}
              style={{
                padding: "10px 20px",
                background: "transparent",
                color: "#6E6459",
                border: "1px solid #E5DCC8",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          )}
        </div>

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

        <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
          {/* Profile Photo Section */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", minWidth: "200px" }}>
            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                background: profile.image
                  ? `url(${profile.image}) center/cover`
                  : "linear-gradient(135deg, #8B2E3F, #5C1A2A)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "36px",
                fontWeight: 700,
              }}
            >
              {!profile.image && initial}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              style={{ display: "none" }}
              onChange={handlePhotoUpload}
            />
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={saving}
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
                Upload Photo
              </button>
              {profile.image && (
                <button
                  onClick={removePhoto}
                  disabled={saving}
                  style={{
                    padding: "8px 16px",
                    background: "#FFF5F5",
                    color: "#C53030",
                    border: "1px solid #FED7D7",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              )}
            </div>
            <p style={{ fontSize: "12px", color: "#8A7F72", margin: 0 }}>JPEG, PNG, GIF, or WebP. Max 5MB.</p>
          </div>

          {/* Profile Details */}
          <div style={{ flex: 1, minWidth: "280px" }}>
            <div style={{ display: "grid", gap: "20px" }}>
              {/* Full Name */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#4A3F34", marginBottom: "6px" }}>Full Name</label>
                {editMode ? (
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
                ) : (
                  <p style={{ fontSize: "15px", color: "#241F1B", margin: "0", padding: "10px 0" }}>{profile.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#4A3F34", marginBottom: "6px" }}>Email Address</label>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <p style={{ fontSize: "15px", color: "#241F1B", margin: "0", padding: "10px 0" }}>{profile.email || "Not set"}</p>
                  {verified ? (
                    <span style={{ fontSize: "12px", color: "#276749", background: "#F0FFF4", padding: "2px 8px", borderRadius: "4px", fontWeight: 600 }}>
                      ✅ Email Verified
                    </span>
                  ) : (
                    <span style={{ fontSize: "12px", color: "#C53030", background: "#FFF5F5", padding: "2px 8px", borderRadius: "4px", fontWeight: 600 }}>
                      ⚠️ Email Not Verified
                    </span>
                  )}
                </div>
                {!verified && profile.email && (
                  <button
                    onClick={async () => {
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
                    }}
                    style={{
                      marginTop: "8px",
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
                    Resend Verification Email
                  </button>
                )}
              </div>

              {/* Phone */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#4A3F34", marginBottom: "6px" }}>Mobile Number</label>
                {editMode ? (
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
                        boxSizing: "border-box",
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
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                ) : (
                  <p style={{ fontSize: "15px", color: "#241F1B", margin: "0", padding: "10px 0" }}>
                    {profile.phoneNumber ? `${profile.countryCode || ""} ${profile.phoneNumber}` : "Not set"}
                  </p>
                )}
              </div>

              {/* Account Created */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#4A3F34", marginBottom: "6px" }}>Account Created</label>
                <p style={{ fontSize: "15px", color: "#241F1B", margin: "0", padding: "10px 0" }}>
                  {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "Unknown"}
                </p>
              </div>

              {/* Save Button */}
              {editMode && (
                <button
                  onClick={handleSave}
                  disabled={saving || !formData.fullName.trim()}
                  style={{
                    width: "100%",
                    padding: "12px 24px",
                    background: "#8B2E3F",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "15px",
                    fontWeight: 600,
                    cursor: "pointer",
                    opacity: saving || !formData.fullName.trim() ? 0.6 : 1,
                    marginTop: "8px",
                  }}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

