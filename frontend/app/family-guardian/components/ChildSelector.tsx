"use client"

import { useState, useEffect } from "react"
import { getChildren } from "@/lib/family-guardian-api"

interface Child {
  id: string
  name: string
  age: number
  avatar?: string
}

interface ChildSelectorProps {
  selectedChildId?: string
  onSelect: (childId: string | undefined) => void
  label?: string
}

export default function ChildSelector({ selectedChildId, onSelect, label }: ChildSelectorProps) {
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const res = await getChildren()
      if (res.ok && res.data?.children) {
        setChildren(res.data.children)
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="h-10 w-full animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
    )
  }

  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <select
        value={selectedChildId || ""}
        onChange={(e) => onSelect(e.target.value || undefined)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition-colors focus:border-purple-500 focus:ring-1 focus:ring-purple-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-purple-400"
      >
        <option value="">All Children</option>
        {children.map((child) => (
          <option key={child.id} value={child.id}>
            {child.name} ({child.age} yrs)
          </option>
        ))}
      </select>
    </div>
  )
}

