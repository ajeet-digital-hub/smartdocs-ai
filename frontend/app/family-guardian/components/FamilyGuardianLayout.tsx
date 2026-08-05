"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Sidebar from "@/app/dashboard/components/Sidebar"
import Header from "@/app/dashboard/components/Header"

interface Props {
  children: React.ReactNode
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export default function FamilyGuardianLayout({ children, title, subtitle, actions }: Props) {
  const { data: session, status } = useSession()
  const [darkMode, setDarkMode] = useState(false)
  const router = useRouter()

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="rounded-3xl bg-white px-6 py-4 shadow-lg ring-1 ring-black/5 dark:bg-slate-900">
          Loading Family Guardian...
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  const user = {
    name: session?.user?.name || "Parent",
    email: session?.user?.email || "",
  }

  return (
    <div className={darkMode ? "dark bg-slate-950 text-white" : "bg-gray-50 text-slate-900"}>
      <div className="flex min-h-screen">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <div className="flex-1 min-w-0">
          <Header user={user} darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />

          <main className="p-6">
<div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
                </div>
                {subtitle && (
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
                )}
              </div>
              {actions && <div>{actions}</div>}
            </div>

            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

