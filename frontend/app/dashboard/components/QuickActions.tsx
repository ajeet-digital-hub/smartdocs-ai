"use client"

import React from "react"
import Link from "next/link"

const actions = [
  { key: "passport", title: "Passport Size Photo Maker", emoji: "🧾" },
  { key: "bg", title: "Background Remover", emoji: "✂️" },
  { key: "resize", title: "Image Resize", emoji: "🔧" },
  { key: "crop", title: "Image Crop", emoji: "🔪" },
  { key: "id", title: "ID Card Maker", emoji: "🪪" },
  { key: "resume", title: "Resume Builder", emoji: "📄" },
  { key: "pdf", title: "PDF Tools", emoji: "📑" },
  { key: "ai", title: "AI Tools", emoji: "🤖" },
  { key: "video", title: "Video Tools", emoji: "VD" },
  { key: "audio", title: "Audio Tools", emoji: "AU" },
]

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {actions.map((a) => (
        <Link
          key={a.key}
          href={`/dashboard/tools/${a.key}`}
          className="rounded-2xl border bg-white p-4 text-sm shadow-sm transition hover:-translate-y-0.5 hover:border-purple-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600">{a.emoji}</div>
            <div>
              <div className="font-semibold text-slate-900">{a.title}</div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
