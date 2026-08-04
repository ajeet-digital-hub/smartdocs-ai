"use client"

import { useState, useEffect } from "react"
import FamilyGuardianLayout from "../components/FamilyGuardianLayout"
import LoadingState from "../components/LoadingState"
import EmptyState from "../components/EmptyState"
import ChildSelector from "../components/ChildSelector"
import { getChildren, updateScreenTimeLimit } from "@/lib/family-guardian-api"

export default function ScreenTimePage() {
  const [children, setChildren] = useState<any[]>([])
  const [selectedChildId, setSelectedChildId] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState(false)

  async function loadData() {
    setLoading(true)
    const res = await getChildren()
    if (res.ok && res.data?.children) {
      setChildren(res.data.children)
      const limits: Record<string, number> = {}
      res.data.children.forEach((c: any) => { limits[c.id] = c.screenTimeLimitDaily })
      setEditing(limits)
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const filteredChildren = selectedChildId
    ? children.filter((c) => c.id === selectedChildId)
    : children

  async function handleUpdate(childId: string) {
    const dailyLimitMinutes = editing[childId]
    if (typeof dailyLimitMinutes !== "number" || dailyLimitMinutes < 0 || dailyLimitMinutes > 1440) {
      alert("Enter a valid limit (0-1440 minutes).")
      return
    }
    setSaving(true)
    const res = await updateScreenTimeLimit(childId, { dailyLimitMinutes })
    if (!res.ok) {
      alert(res.error || "Failed to update limit.")
    }
    setSaving(false)
  }

  return (
    <FamilyGuardianLayout title="Screen Time" subtitle="Set and manage daily screen time limits for each child">
      {loading ? <LoadingState /> : (
        <div className="space-y-6">
          <div className="w-48">
            <ChildSelector selectedChildId={selectedChildId} onSelect={setSelectedChildId} />
          </div>

          {children.length === 0 ? (
            <EmptyState icon="⏱️" title="No children yet" description="Add a child profile first to set screen time limits." action={{ label: "Add Child", onClick: () => window.location.href = "/family-guardian/children" }} />
          ) : (
            <div className="space-y-4">
              {filteredChildren.map((child) => (
                <div key={child.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-sm font-bold text-white">
                        {child.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">{child.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Age {child.age}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Daily Limit</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            max={1440}
                            value={editing[child.id] || 0}
                            onChange={(e) => setEditing({ ...editing, [child.id]: parseInt(e.target.value) || 0 })}
                            className="w-20 rounded-lg border border-slate-300 px-3 py-1.5 text-center text-sm font-medium dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                          />
                          <span className="text-sm text-slate-500 dark:text-slate-400">min</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleUpdate(child.id)}
                        disabled={saving}
                        className="cursor-pointer rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
                      >
                        {saving ? "Saving..." : "Update"}
                      </button>
                    </div>
                  </div>

                  {/* Progress bar visual */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-600 dark:text-slate-400">Study Goal: {child.studyGoalDaily} min/day</span>
                      <span className="text-slate-600 dark:text-slate-400">Screen Limit: {editing[child.id] || child.screenTimeLimitDaily} min/day</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                        style={{ width: `${Math.min(100, ((editing[child.id] || child.screenTimeLimitDaily) / 240) * 100)}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                      {editing[child.id] >= 240 ? "High limit" : editing[child.id] >= 120 ? "Moderate limit" : "Healthy limit"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </FamilyGuardianLayout>
  )
}

