"use client";

import { Header } from "@/components/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{
      minHeight: "100vh",
      fontFamily: '"Segoe UI",-apple-system,BlinkMacSystemFont,Roboto,Helvetica,Arial,sans-serif',
      background: "radial-gradient(1200px 600px at 15% 10%, #2b1620 0%, transparent 55%),radial-gradient(900px 500px at 85% 90%, #201828 0%, transparent 55%),#141018",
    }}>
      <Header />
      <main>
        {children}
      </main>
    </div>
  )
}

