"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const mainNav = [
  { label: "Dashboard", href: "/dashboard", icon: "📊" },
  { label: "AI Workspace", href: "/ai-tools", icon: "🤖" },
  { label: "Services", href: "/services", icon: "🛠️" },
  { label: "Subscription", href: "/dashboard/subscription", icon: "💳" },
]

const guardianNav = [
  { label: "Overview", href: "/family-guardian", icon: "👨‍👩‍👧‍👦" },
  { label: "Children", href: "/family-guardian/children", icon: "👶" },
  { label: "Connected Devices", href: "/family-guardian/devices", icon: "📱" },
  { label: "Website & App Policies", href: "/family-guardian/policies", icon: "🔒" },
  { label: "Schedules", href: "/family-guardian/schedules", icon: "⏰" },
  { label: "Screen Time", href: "/family-guardian/screen-time", icon: "⏱️" },
  { label: "Study Goals", href: "/family-guardian/study-goals", icon: "📚" },
  { label: "Rewards", href: "/family-guardian/rewards", icon: "🎁" },
  { label: "Unlock Requests", href: "/family-guardian/unlock-requests", icon: "🔓" },
  { label: "Emergency Access", href: "/family-guardian/emergency-access", icon: "🆘" },
  { label: "Analytics", href: "/family-guardian/analytics", icon: "📈" },
  { label: "Activity Logs", href: "/family-guardian/activity-logs", icon: "📋" },
  { label: "Settings", href: "/family-guardian/settings", icon: "⚙️" },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [guardianOpen, setGuardianOpen] = useState(pathname?.startsWith("/family-guardian") || false)

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    if (href === "/services") return pathname === "/services"
    if (href === "/family-guardian") return pathname === "/family-guardian"
    return pathname?.startsWith(href)
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-emerald-600 text-xs font-bold text-white shadow-sm">
          S
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-blue-600 dark:text-blue-400 leading-tight">
            SMARTDOCS
          </p>
          <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight">AI</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {/* Main Navigation */}
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Main
        </p>
        <div className="mb-4 space-y-1">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        {/* Family Guardian */}
        <div>
          <button
            onClick={() => setGuardianOpen(!guardianOpen)}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              guardianOpen
                ? "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">👨‍👩‍👧‍👦</span>
              <div className="text-left">
                <div>Family Guardian</div>
                <div className="text-[10px] font-normal text-purple-500">Study First. Earn Screen Time.</div>
              </div>
            </div>
            <svg
              className={`h-4 w-4 transition-transform ${guardianOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {guardianOpen && (
            <div className="ml-2 mt-1 space-y-0.5 border-l-2 border-purple-200 pl-2 dark:border-purple-800">
              {guardianNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-800">
        <p className="text-center text-xs text-slate-400 dark:text-slate-500">
          SmartDocs AI &copy; {new Date().getFullYear()}
        </p>
      </div>
    </aside>
  )
}

