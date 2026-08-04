"use client"

import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

interface HeaderProps {
  user: {
    name: string
    email: string
    avatar?: string
  }
  darkMode: boolean
  toggleDarkMode: () => void
}

export default function Header({ user, darkMode, toggleDarkMode }: HeaderProps) {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-3 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex items-center gap-3">
        <div className="md:hidden">
          {/* Mobile menu toggle could go here */}
          <button
            onClick={() => router.push("/dashboard")}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-emerald-600 text-xs font-bold text-white shadow-sm"
          >
            S
          </button>
        </div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white hidden sm:block">
          SmartDocs AI
        </h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="cursor-pointer rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* User */}
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-1.5 dark:border-slate-700">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-xs font-bold text-white">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{user.name}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">{user.email}</p>
          </div>
        </div>

        {/* Sign Out */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          Sign Out
        </button>
      </div>
    </header>
  )
}

