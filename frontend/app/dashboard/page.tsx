"use client";

import { useSession } from "next-auth/react";
import { WelcomeModal } from "@/components/WelcomeModal";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div style={{ color: "white", textAlign: "center", paddingTop: "50px" }}>Loading...</div>;
  }

  if (status === "unauthenticated" || !session?.user) {
    // This should be handled by middleware, but as a fallback:
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }

  return (
    <>
      {session.user.hasSeenWelcome === false && <WelcomeModal />}
      <div style={{ padding: "40px 24px", maxWidth: "1280px", margin: "0 auto" }}>
        <div style={{ background: "#FFFDF7", borderRadius: "20px", padding: "44px 48px 40px" }}>
          <h1 style={{ fontSize: "29px", fontWeight: 700, color: "#241F1B", margin: "0 0 8px" }}>Welcome, {session.user.fullName || 'User'}!</h1>
          <p style={{ fontSize: "15px", color: "#6E6459", marginBottom: "28px" }}>This is your dashboard.</p>
        </div>
      </div>
    </>
  );
}