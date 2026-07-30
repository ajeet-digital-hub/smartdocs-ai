"use client";

import { signOut, useSession } from "next-auth/react";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { NotificationBell } from "./NotificationBell";

export function Header() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const user = session?.user;

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 24px",
        background: "#FFFDF7",
        borderBottom: "1px solid #E5DCC8",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #8B2E3F, #6B1F2E)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 700,
          }}
        >
          S
        </div>
        <div style={{ fontSize: "18px", fontWeight: 700, color: "#241F1B" }}>
          SmartDocs AI
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {user && (
          <>
            {/* Notification Bell */}
            <NotificationBell />

            {/* Profile Dropdown */}
            <div style={{ position: "relative" }} ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                title={user.fullName || user.name || "User"}
                style={{
                  background: user.image
                    ? "transparent"
                    : "linear-gradient(135deg, #8B2E3F, #5C1A2A)",
                  color: "#fff",
                  border: user.image ? "2px solid #E5DCC8" : "none",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  padding: 0,
                }}
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  user.fullName?.charAt(0)?.toUpperCase() ||
                  user.name?.charAt(0)?.toUpperCase() ||
                  user.email?.charAt(0)?.toUpperCase() ||
                  "U"
                )}
              </button>

              {menuOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "44px",
                    background: "#fff",
                    border: "1px solid #E5DCC8",
                    borderRadius: "12px",
                    padding: "6px 0",
                    minWidth: "220px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    zIndex: 50,
                  }}
                >
                  {/* User info header */}
                  <div
                    style={{
                      padding: "12px 14px 10px",
                      borderBottom: "1px solid #F0EBE0",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#241F1B",
                      }}
                    >
                      {user.fullName || user.name || "User"}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#8A7F72",
                        marginTop: "2px",
                      }}
                    >
                      {user.email || ""}
                    </div>
                  </div>

                  {/* Menu items */}
                  <div style={{ padding: "4px 0" }}>
                    <Link
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "9px 14px",
                        fontSize: "14px",
                        color: "#4A3F34",
                        textDecoration: "none",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#F5F0E8")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <span style={{ fontSize: "16px" }}>🏠</span>
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/family-guardian"
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "9px 14px",
                        fontSize: "14px",
                        color: "#4A3F34",
                        textDecoration: "none",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#F5F0E8")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <span style={{ fontSize: "16px" }}>🛡️</span>
                      Family Guardian
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "9px 14px",
                        fontSize: "14px",
                        color: "#4A3F34",
                        textDecoration: "none",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#F5F0E8")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <span style={{ fontSize: "16px" }}>👤</span>
                      My Profile
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "9px 14px",
                        fontSize: "14px",
                        color: "#4A3F34",
                        textDecoration: "none",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#F5F0E8")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <span style={{ fontSize: "16px" }}>⚙️</span>
                      Account Settings
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "9px 14px",
                        fontSize: "14px",
                        color: "#4A3F34",
                        textDecoration: "none",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#F5F0E8")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <span style={{ fontSize: "16px" }}>🔒</span>
                      Change Password
                    </Link>
                  </div>

                  {/* Logout */}
                  <div
                    style={{
                      borderTop: "1px solid #F0EBE0",
                      padding: "4px 0",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => signOut()}
                      style={{
                        width: "100%",
                        padding: "9px 14px",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        fontSize: "14px",
                        color: "#C0392B",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        borderRadius: "0",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#FEF2F2")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <span style={{ fontSize: "16px" }}>🚪</span>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
