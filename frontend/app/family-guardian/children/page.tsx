"use client"

import { useState, useEffect } from "react"
import FamilyGuardianLayout from "../components/FamilyGuardianLayout"
import LoadingState from "../components/LoadingState"
import EmptyState from "../components/EmptyState"
import StatusBadge from "../components/StatusBadge"
import { getChildren, createChild, deleteChild } from "@/lib/family-guardian-api"

export default function ChildrenPage() {
  const [children, setChildren] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [formData, setFormData] = useState({ name: "", age: 5, avatar: "" })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadChildren() {
    setLoading(true)
    const res = await getChildren()
    if (res.ok && res.data?.children) {
      setChildren(res.data.children)
    }
    setLoading(false)
  }

  useEffect(() => { loadChildren() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    const res = await createChild(formData)
    if (res.ok && res.data?.child) {
      setShowCreate(false)
      setFormData({ name: "", age: 5, avatar: "" })
      await loadChildren()
    } else {
      setError(res.error || "Failed to create child profile.")
    }
    setSaving(false)
  }

  async function handleDelete(childId: string, name: string) {
    if (!confirm(`Delete ${name}'s profile? This cannot be undone.`)) return
    const res = await deleteChild(childId)
    if (res.ok) {
      await loadChildren()
    }
  }

  return (
    <FamilyGuardianLayout
      title="Children"
      subtitle="Manage your child profiles and their screen time settings"
    >
      {loading ? (
        <LoadingState />
      ) : (
        <div className="space-y-6">
          {/* Create Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowCreate(true)}
              className="cursor-pointer rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md"
            >
              + Add Child
            </button>
          </div>

          {/* Create Form Modal */}
          {showCreate && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Add New Child</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
                    {error}
                  </div>
                )}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Child's Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rahul"
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Age</label>
                  <input
                    type="number"
                    min={0}
                    max={18}
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={saving || !formData.name.trim()}
                    className="cursor-pointer rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "Creating..." : "Create Profile"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowCreate(false); setError(null) }}
                    className="cursor-pointer rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Children List */}
          {children.length === 0 ? (
            <EmptyState
              icon="👶"
              title="No children yet"
              description="Create your first child profile to start managing screen time."
              action={{ label: "Add Child", onClick: () => setShowCreate(true) }}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {children.map((child) => (
                <div
                  key={child.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-lg font-bold text-white">
                        {child.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">{child.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Age {child.age}</p>
                      </div>
                    </div>
                    <StatusBadge status={child.status || "active"} />
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Daily Screen Limit</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{child.screenTimeLimitDaily} min</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Daily Study Goal</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{child.studyGoalDaily} min</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Devices Assigned</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{child.assignedDevices?.length || 0}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                    <a
                      href={`/family-guardian/policies?childId=${child.id}`}
                      className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium text-purple-600 transition-colors hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-950"
                    >
                      Policies
                    </a>
                    <a
                      href={`/family-guardian/schedules?childId=${child.id}`}
                      className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950"
                    >
                      Schedules
                    </a>
                    <a
                      href={`/family-guardian/screen-time?childId=${child.id}`}
                      className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950"
                    >
                      Screen Time
                    </a>
                    <button
                      onClick={() => handleDelete(child.id, child.name)}
                      className="cursor-pointer ml-auto rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                    >
                      Delete
                    </button>
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

