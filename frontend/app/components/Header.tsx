"use client"

import { useRouter } from "next/navigation"

export default function Header() {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => router.push("/login")}
      className="rounded-lg bg-orange-600 px-5 py-2 text-white transition hover:bg-orange-700"
    >
      Login
    </button>
  )
}
