"use client"

import React from "react"
import Link from "next/link"

const items = [
  { href: "/dashboard", label: "Dashboard", emoji: "🏠" },
  { href: "/services", label: "All Services", emoji: "🚀" },
  { href: "/dashboard/projects", label: "My Projects", emoji: "📁" },
  { href: "/dashboard/photo-tools", label: "Photo Tools", emoji: "🖼️" },
  { href: "/dashboard/id-card", label: "ID Card Maker", emoji: "🪪" },
  { href: "/dashboard/resume", label: "Resume Builder", emoji: "📄" },
  { href: "/dashboard/social", label: "Social Media Designer", emoji: "🎨" },
  { href: "/dashboard/pdf", label: "PDF Tools", emoji: "📑" },
  { href: "/dashboard/ai", label: "AI Tools", emoji: "🤖" },
  { href: "/dashboard/templates", label: "Templates", emoji: "📦" },
  { href: "/dashboard/billing", label: "Billing", emoji: "💳" },
  { href: "/dashboard/settings", label: "Settings", emoji: "⚙️" },
  { href: "/dashboard/tools/video", label: "Video Tools", emoji: "V" },
  { href: "/dashboard/tools/audio", label: "Audio Tools", emoji: "A" },
]

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  return (
    <aside className="w-72 shrink-0 border-r bg-white dark:bg-slate-900 dark:border-slate-800">
      <div className="p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold">S</div>
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">SmartDocs AI</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Workspace</div>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              onClick={onClose}
              className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <span className="text-sm">{it.emoji}</span>
              <span>{it.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  )
}
