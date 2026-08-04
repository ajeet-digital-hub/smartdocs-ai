"use client"

interface EmptyStateProps {
  icon: string
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900/50">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-4xl dark:bg-slate-800">
        {icon}
      </div>
      <h3 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 cursor-pointer rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

