"use client"

import { useState, useEffect } from "react"
import FamilyGuardianLayout from "../components/FamilyGuardianLayout"
import LoadingState from "../components/LoadingState"
import EmptyState from "../components/EmptyState"
import ChildSelector from "../components/ChildSelector"
import { getChildren } from "@/lib/family-guardian-api"

export default function StudyGoalsPage() {
  const [children, setChildren] = useState<any[]>([])
  const [selectedChildId, setSelectedChildId] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)

  async function loadData() {
    setLoading(true)
    const res = await getChildren()
    if (res.ok && res.data?.children) setChildren(res.data.children)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const filteredChildren = selectedChildId
    ? children.filter((c) => c.id === selectedChildId)
    : children

  return (
    <FamilyGuardianLayout
      title="Study Goals"
      subtitle="Track study time and goals. Study First. Earn Screen Time."
    >
      {loading ? <LoadingState /> : (
        <div className="space-y-6">
          <div className="w-48">
            <ChildSelector selectedChildId={selectedChildId} onSelect={setSelectedChildId} />
          </div>

          {children.length === 0 ? (
            <EmptyState
              icon="📚"
              title="No children yet"
              description="Add a child profile first to set study goals."
              action={{ label: "Add Child", onClick: () => window.location.href = "/family-guardian/children" }}
            />
          ) : (
            <div className="space-y-6">
              {filteredChildren.map((child) => (
                <div key={child.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-sm font-bold text-white">
                        {child.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">{child.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Daily study goal: {child.studyGoalDaily} min</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Study First. Earn Screen Time.</p>
                    </div>
                  </div>

                  {/* Goal Progress */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-slate-600 dark:text-slate-400">Daily Study Progress</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">0 / {child.studyGoalDaily} min</span>
                      </div>
                      <div className="h-4 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-4 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all"
                          style={{ width: "0%" }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                        <p className="text-slate-500 dark:text-slate-400">Today</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">0 min</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                        <p className="text-slate-500 dark:text-slate-400">This Week</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">0 min</p>
                      </div>
                    </div>

                    {/* Screen Time Earned */}
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
                      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">🎮 Screen Time Earned</p>
                      <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">0 min</p>
                      <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">
                        Complete study goals to earn screen time rewards.
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Info Banner */}
              <div className="rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-6 dark:border-purple-800 dark:from-purple-950/30 dark:to-pink-950/30">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">📖</div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Study First. Earn Screen Time.</h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      This feature requires the Chrome Extension or Android companion app to track study time on connected devices.
                      Once a study goal is met, screen time rewards are automatically unlocked.
                    </p>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Note: Study time tracking requires a connected device with the Family Guardian companion app or extension installed.
                      Parent dashboard shows real data from connected devices. No data is fabricated.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </FamilyGuardianLayout>
  )
}

