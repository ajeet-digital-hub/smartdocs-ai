"use client";

import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

export function Header() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

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
      <div style={{ fontSize: "18px", fontWeight: 700, color: "#241F1B" }}>
        SmartDocs AI
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {session?.user && (
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: "#8B2E3F",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {session.user.fullName?.charAt(0)?.toUpperCase() || "U"}
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
                  padding: "8px",
                  minWidth: "160px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  zIndex: 50,
                }}
              >
                <div style={{ padding: "8px 12px", fontSize: "14px", color: "#6E6459" }}>
                  {session.user.fullName || session.user.email}
                </div>
                <hr style={{ border: "none", borderTop: "1px solid #E5DCC8", margin: "4px 0" }} />
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "#8B2E3F",
                    textAlign: "left",
                    borderRadius: "8px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#F5F0E8")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

