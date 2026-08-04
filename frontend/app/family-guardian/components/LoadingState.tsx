"use client"

export default function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="mt-3 h-8 w-16 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>
      <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="h-4 w-48 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 w-full rounded-lg bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      </div>
    </div>
  )
}

