"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    if (typeof window === "undefined") return null
    return localStorage.getItem("sd_user")
  })
  const isAuth = Boolean(userEmail)

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "sd_user") {
        try {
          const user = localStorage.getItem("sd_user")
          setUserEmail(user)
        } catch {
          setUserEmail(null)
        }
      }
    }

    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem("sd_user")
    setUserEmail(null)
    router.push("/login")
  }

  return (
    <header className="border-t-4 border-purple-600 border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-2xl font-bold text-orange-600">SmartDocs AI</Link>
        </div>

        <nav className="flex items-center gap-4">
          <Link href="/" className="hidden text-gray-600 hover:text-orange-600 md:block">
            Home
          </Link>
          <Link href="/services" className="text-gray-600 hover:text-orange-600">
            Services
          </Link>
          <Link href="/dashboard" className="text-gray-600 hover:text-orange-600">
            Dashboard
          </Link>

          {!isAuth ? (
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/login')}
                className="rounded-lg border border-purple-300 px-4 py-2 text-purple-700 transition hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Login
              </button>
              <Link
                href="/signup"
                className="rounded-lg bg-purple-600 px-4 py-2 text-white transition hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 hidden sm:inline">{userEmail ?? "User"}</span>
              <button
                onClick={handleLogout}
                className="rounded-lg bg-orange-50 px-3 py-1 text-sm text-orange-600 border border-orange-200 hover:bg-orange-100"
              >
                Logout
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
