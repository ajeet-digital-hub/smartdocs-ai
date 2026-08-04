"use client"

import { useState, useEffect } from "react"
import FamilyGuardianLayout from "../components/FamilyGuardianLayout"
import LoadingState from "../components/LoadingState"
import EmptyState from "../components/EmptyState"
import ChildSelector from "../components/ChildSelector"
import { getRewards, createReward } from "@/lib/family-guardian-api"

export default function RewardsPage() {
  const [rewards, setRewards] = useState<any[]>([])
  const [selectedChildId, setSelectedChildId] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [formData, setFormData] = useState({ name: "", description: "", requiredStudyMinutes: 30, screenTimeRewardMinutes: 15 })
  const [saving, setSaving] = useState(false)

  async function loadData() {
    setLoading(true)
    const res = await getRewards({ childId: selectedChildId })
    if (res.ok && res.data?.rewards) setRewards(res.data.rewards)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [selectedChildId])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await createReward({ ...formData, childId: selectedChildId || null })
    if (res.ok) {
      setShowCreate(false)
      setFormData({ name: "", description: "", requiredStudyMinutes: 30, screenTimeRewardMinutes: 15 })
      await loadData()
    } else {
      alert(res.error || "Failed to create reward.")
    }
    setSaving(false)
  }

  return (
    <FamilyGuardianLayout title="Rewards" subtitle="Create rewards for study goals and screen time achievements">
      {loading ? <LoadingState /> : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="w-48"><ChildSelector selectedChildId={selectedChildId} onSelect={setSelectedChildId} /></div>
            <button onClick={() => setShowCreate(true)} className="cursor-pointer rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md">+ Create Reward</button>
          </div>

          {showCreate && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Create Reward</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Reward Name</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="30 min YouTube" required className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Required Study (min)</label>
                    <input type="number" min={1} value={formData.requiredStudyMinutes} onChange={(e) => setFormData({ ...formData, requiredStudyMinutes: parseInt(e.target.value) || 0 })} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Screen Time Reward (min)</label>
                    <input type="number" min={1} value={formData.screenTimeRewardMinutes} onChange={(e) => setFormData({ ...formData, screenTimeRewardMinutes: parseInt(e.target.value) || 0 })} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Complete 60 min study for 30 min YouTube" rows={2} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200" />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={saving || !formData.name} className="cursor-pointer rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50">{saving ? "Creating..." : "Create Reward"}</button>
                  <button type="button" onClick={() => setShowCreate(false)} className="cursor-pointer rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {rewards.length === 0 ? (
            <EmptyState icon="🎁" title="No rewards yet" description="Create rewards to motivate your children with screen time incentives." action={{ label: "Create Reward", onClick: () => setShowCreate(true) }} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rewards.map((reward) => (
                <div key={reward.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl">🎁</div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{reward.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{reward.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">📚 {reward.requiredStudyMinutes} min study</span>
                    <span className="font-medium text-purple-600 dark:text-purple-400">🎮 {reward.screenTimeRewardMinutes} min</span>
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
