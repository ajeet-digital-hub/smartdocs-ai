"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

export function WelcomeModal() {
  const { data: session, update } = useSession();
  const [open, setOpen] = useState(true);

  const handleDismiss = async () => {
    try {
      await update({ hasSeenWelcome: true });
      setOpen(false);
    } catch {
      setOpen(false);
    }
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
    >
      <div
        style={{
          background: "#FFFDF7",
          borderRadius: "20px",
          padding: "44px 48px 40px",
          maxWidth: "450px",
          width: "90%",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "48px",
            marginBottom: "16px",
          }}
        >
          🎉
        </div>
        <h2
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#241F1B",
            margin: "0 0 8px",
          }}
        >
          Welcome to SmartDocs AI!
        </h2>
        <p
          style={{
            fontSize: "15px",
            color: "#6E6459",
            marginBottom: "28px",
            lineHeight: 1.5,
          }}
        >
          Your AI-powered workspace is ready. Start exploring services and
          managing your documents with ease.
        </p>
        <button
          type="button"
          onClick={handleDismiss}
          style={{
            width: "100%",
            padding: "14px 24px",
            border: "none",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: 600,
            cursor: "pointer",
            background: "#8B2E3F",
            color: "#fff",
          }}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

