"use client"

interface StatusBadgeProps {
  status: string
  size?: "sm" | "md"
}

const statusStyles: Record<string, string> = {
  online: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  offline: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  paused: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  revoked: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  sleeping: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  denied: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  synced: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  "not-applicable": "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  failed: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  connected: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  disconnected: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  pairing: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  allowed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  limited: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  blocked: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  free: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  study: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  school: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  sleep: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  custom: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
}

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const style = statusStyles[status.toLowerCase()] || "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
  const sizeClass = size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm"

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${style}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

