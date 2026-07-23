"use client"

import { useEffect, useState } from "react"

interface Props {
  user: { name: string; email: string; avatar?: string }
  darkMode: boolean
  toggleDarkMode: () => void
}

export default function Header({ user, darkMode, toggleDarkMode }: Props) {
  const [theme, setTheme] = useState<string>(() => (typeof window !== "undefined" ? localStorage.getItem("theme") || "light" : "light"))

  useEffect(() => {
    if (typeof window === "undefined") return
    document.documentElement.classList.toggle("dark", theme === "dark")
    localStorage.setItem("theme", theme)
  }, [theme])

  return (
    <header className="flex items-center justify-between border-b bg-white dark:bg-slate-900 dark:border-slate-800 px-4 py-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage your account and tools</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            toggleDarkMode()
            setTheme((t) => (t === "light" ? "dark" : "light"))
          }}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          aria-label="Toggle theme"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>

        <div className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 dark:bg-slate-800">
          <div className="h-8 w-8 rounded-full bg-orange-500 text-white flex items-center justify-center">U</div>
          <div className="text-sm text-slate-800 dark:text-slate-200">{user.name}</div>
        </div>
      </div>
    </header>
  )
}
