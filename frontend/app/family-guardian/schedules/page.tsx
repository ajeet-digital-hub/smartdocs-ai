"use client"

import { useState, useEffect } from "react"
import FamilyGuardianLayout from "../components/FamilyGuardianLayout"
import LoadingState from "../components/LoadingState"
import EmptyState from "../components/EmptyState"
import StatusBadge from "../components/StatusBadge"
import ChildSelector from "../components/ChildSelector"
import { getSchedules, createSchedule, deleteSchedule } from "@/lib/family-guardian-api"

const scheduleTypes = [
  { value: "study", label: "📚 Study Time" },
  { value: "school", label: "🏫 School Time" },
  { value: "sleep", label: "😴 Sleep Mode" },
  { value: "free", label: "🎮 Free Time" },
  { value: "custom", label: "⚙️ Custom" },
]

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<any[]>([])
  const [selectedChildId, setSelectedChildId] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [formData, setFormData] = useState<any>({
    name: "", type: "study", startTime: "08:00", endTime: "09:00", days: [1, 2, 3, 4, 5], sleepMode: false,
  })
  const [saving, setSaving] = useState(false)

  async function loadData() {
    setLoading(true)
    const res = await getSchedules({ childId: selectedChildId })
    if (res.ok && res.data?.schedules) setSchedules(res.data.schedules)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [selectedChildId])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await createSchedule({
      ...formData,
      childId: selectedChildId || null,
      sleepMode: formData.type === "sleep" ? true : formData.sleepMode,
    })
    if (res.ok) {
      setShowCreate(false)
      setFormData({ name: "", type: "study", startTime: "08:00", endTime: "09:00", days: [1, 2, 3, 4, 5], sleepMode: false })
      await loadData()
    } else {
      alert(res.error || "Failed to create schedule.")
    }
    setSaving(false)
  }

  async function handleDelete(scheduleId: string) {
    if (!confirm("Delete this schedule?")) return
    const res = await deleteSchedule(scheduleId)
    if (res.ok) await loadData()
  }

  function toggleDay(day: number) {
    setFormData((prev: any) => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter((d: number) => d !== day) : [...prev.days, day].sort(),
    }))
  }

  return (
    <FamilyGuardianLayout title="Schedules" subtitle="Set daily schedules for study, school, sleep, and free time">
      {loading ? <LoadingState /> : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="w-48"><ChildSelector selectedChildId={selectedChildId} onSelect={setSelectedChildId} /></div>
            <button onClick={() => setShowCreate(true)} className="cursor-pointer rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md">+ Add Schedule</button>
          </div>

          {showCreate && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Create Schedule</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Schedule Name</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Morning Study" required className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
                    <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                      {scheduleTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Start Time</label>
                    <input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">End Time</label>
                    <input type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200" />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Days</label>
                  <div className="flex flex-wrap gap-2">
                    {dayNames.map((day, i) => (
                      <button key={i} type="button" onClick={() => toggleDay(i)}
                        className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${formData.days.includes(i) ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"}`}>
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={saving || !formData.name} className="cursor-pointer rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50">{saving ? "Creating..." : "Create Schedule"}</button>
                  <button type="button" onClick={() => setShowCreate(false)} className="cursor-pointer rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {schedules.length === 0 ? (
            <EmptyState icon="⏰" title="No schedules yet" description="Create schedules to manage your children's routine automatically." action={{ label: "Add Schedule", onClick: () => setShowCreate(true) }} />
          ) : (
            <div className="space-y-3">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{schedule.type === "study" ? "📚" : schedule.type === "school" ? "🏫" : schedule.type === "sleep" ? "😴" : schedule.type === "free" ? "🎮" : "⚙️"}</div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{schedule.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {schedule.startTime} - {schedule.endTime}
                        {schedule.days && ` · ${schedule.days.map((d: number) => dayNames[d]).join(", ")}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={schedule.isActive ? "active" : "paused"} />
                    {schedule.sleepMode && <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">Sleep Mode</span>}
                    <button onClick={() => handleDelete(schedule.id)} className="cursor-pointer text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400">Delete</button>
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

