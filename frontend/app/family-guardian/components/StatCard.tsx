"use client"

interface StatCardProps {
  label: string
  value: string | number
  icon: string
  color?: string
  subtitle?: string
}

export default function StatCard({ label, value, icon, color = "purple", subtitle }: StatCardProps) {
  const colorMap: Record<string, string> = {
    purple: "from-purple-500 to-purple-600",
    blue: "from-blue-500 to-blue-600",
    green: "from-emerald-500 to-green-600",
    orange: "from-orange-500 to-amber-600",
    red: "from-red-500 to-rose-600",
    pink: "from-pink-500 to-rose-600",
    indigo: "from-indigo-500 to-indigo-600",
    teal: "from-teal-500 to-cyan-600",
  }

  const gradient = colorMap[color] || colorMap.purple

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{subtitle}</p>
          )}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-xl text-white shadow-sm`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

