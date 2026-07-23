"use client"

import { useEffect, useState } from "react"
import DashboardLayout from "./components/DashboardLayout"

export default function Dashboard() {
  const [user, setUser] = useState<{ name: string; email: string; avatar?: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window === "undefined") return

    const u = localStorage.getItem("sd_user")

    if (!u) {
      setUser({
        name: "Guest",
        email: "guest@smartdocs.ai",
      })
      setLoading(false)
      return
    }

    setUser({
      name: u.includes("@") ? u.split("@")[0] : u,
      email: u,
    })
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="rounded-3xl bg-white px-6 py-4 shadow-lg ring-1 ring-black/5 dark:bg-slate-900">
          Loading dashboard...
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <DashboardLayout user={user} />
}
