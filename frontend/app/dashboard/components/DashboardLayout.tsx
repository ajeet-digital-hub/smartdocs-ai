"use client"

import { useState } from "react"
import Sidebar from "./Sidebar"
import Header from "./Header"
import ServiceCatalog from "./ServiceCatalog"

interface Props {
  user: {
    name: string
    email: string
    avatar?: string
  }
}

export default function DashboardLayout({ user }: Props) {
  const [darkMode, setDarkMode] = useState(false)

  return (
    <div className={darkMode ? "dark bg-slate-950 text-white" : "bg-gray-50 text-slate-900"}>
      <div className="flex min-h-screen">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <div className="flex-1 min-w-0">
          <Header user={user} darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />

          <main className="p-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Welcome, {user.name}</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Here's what's happening with your account.
                </p>
              </div>
            </div>

            <section className="grid gap-5 md:grid-cols-3 mb-6">
              <div className="rounded-2xl border bg-white p-4 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                <div className="text-sm text-slate-500 dark:text-slate-400">Subscription Status</div>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Free Plan</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Upgrade for more features</div>
                  </div>
                  <div className="text-sm text-orange-600">Manage</div>
                </div>
              </div>

              <div className="rounded-2xl border bg-white p-4 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                <div className="text-sm text-slate-500 dark:text-slate-400">Recent Projects</div>
                <div className="mt-3 text-sm text-slate-700 dark:text-slate-300">You have no recent projects.</div>
              </div>

              <div className="rounded-2xl border bg-white p-4 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                <div className="text-sm text-slate-500 dark:text-slate-400">Storage Usage</div>
                <div className="mt-3 text-sm text-slate-700 dark:text-slate-300">0 / 1 GB used</div>
              </div>
            </section>

            <section className="mb-6"><ServiceCatalog /></section>

            <section>
              <h2 className="mb-4 text-xl font-semibold">Recent Downloads</h2>
              <div className="rounded-2xl border bg-white p-4 shadow-sm dark:bg-slate-900 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300">
                No downloads yet.
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}
