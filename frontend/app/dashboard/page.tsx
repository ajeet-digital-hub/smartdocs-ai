"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import DashboardLayout from "./components/DashboardLayout"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  const email = session?.user?.email || ""
  const user = {
    name: session?.user?.name || email.split("@")[0],
    email,
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="rounded-3xl bg-white px-6 py-4 shadow-lg ring-1 ring-black/5 dark:bg-slate-900">
          Loading dashboard...
        </div>
      </div>
    )
  }

  return <DashboardLayout user={user} />
}
