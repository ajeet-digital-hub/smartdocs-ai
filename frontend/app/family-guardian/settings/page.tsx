"use client"

import { useState, useEffect } from "react"
import FamilyGuardianLayout from "../components/FamilyGuardianLayout"
import LoadingState from "../components/LoadingState"
import { getFamily, updateFamily } from "@/lib/family-guardian-api"

export default function SettingsPage() {
  const [family, setFamily] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [familyName, setFamilyName] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function loadData() {
    setLoading(true)
    const res = await getFamily()
    if (res.ok && res.data?.family) {
      setFamily(res.data.family)
      setFamilyName(res.data.family.familyName || "")
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    const res = await updateFamily({ familyName })
    if (res.ok) {
      setSaved(true)
      setFamily(res.data?.family)
      setTimeout(() => setSaved(false), 3000)
    } else {
      alert(res.error || "Failed to update settings.")
    }
    setSaving(false)
  }

  return (
    <FamilyGuardianLayout title="Settings" subtitle="Configure your Family Guardian">
      {loading ? <LoadingState /> : (
        <div className="space-y-6 max-w-2xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Family Settings</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Family Name</label>
                <input type="text" value={familyName} onChange={(e) => setFamilyName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200" />
              </div>
              <div className="flex items-center gap-3">
                <button type="submit" disabled={saving}
                  className="cursor-pointer rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50">
                  {saving ? "Saving..." : "Save Settings"}
                </button>
                {saved && <span className="text-sm text-emerald-600 dark:text-emerald-400">✓ Settings saved</span>}
              </div>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Plan Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Current Plan</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 capitalize">{family?.plan || "free"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Max Children</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{family?.maxChildren || 5}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Max Devices</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{family?.maxDevices || 10}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            <strong>🔒 Privacy Notice</strong>
            <p className="mt-1">
              Family Guardian is designed with privacy in mind. We do not collect unnecessary personal data.
              All device tracking and monitoring is transparent and requires explicit parent setup and child awareness.
              No covert surveillance is implemented.
            </p>
          </div>
        </div>
      )}
    </FamilyGuardianLayout>
  )
}
