"use client"

import { useState, useEffect } from "react"
import FamilyGuardianLayout from "../components/FamilyGuardianLayout"
import LoadingState from "../components/LoadingState"
import EmptyState from "../components/EmptyState"
import StatusBadge from "../components/StatusBadge"
import ChildSelector from "../components/ChildSelector"
import { getWebsitePolicies, createWebsitePolicy, deleteWebsitePolicy, getAppPolicies, createAppPolicy, deleteAppPolicy } from "@/lib/family-guardian-api"

type TabType = "websites" | "apps"

const policyStates = ["allowed", "limited", "scheduled", "blocked"]

export default function PoliciesPage() {
  const [tab, setTab] = useState<TabType>("websites")
  const [selectedChildId, setSelectedChildId] = useState<string | undefined>()
  const [websitePolicies, setWebsitePolicies] = useState<any[]>([])
  const [appPolicies, setAppPolicies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [formData, setFormData] = useState<any>({
    domain: "", displayName: "", state: "blocked", childId: "", category: "", dailyLimitMinutes: 30, scheduleStart: "", scheduleEnd: ""
  })
  const [appFormData, setAppFormData] = useState<any>({
    appId: "", appName: "", packageName: "", state: "blocked", platform: "all", category: "", dailyLimitMinutes: 30, scheduleStart: "", scheduleEnd: ""
  })
  const [saving, setSaving] = useState(false)

  async function loadData() {
    setLoading(true)
    const [webRes, appRes] = await Promise.all([
      getWebsitePolicies({ childId: selectedChildId }),
      getAppPolicies({ childId: selectedChildId }),
    ])
    if (webRes.ok && webRes.data?.policies) setWebsitePolicies(webRes.data.policies)
    if (appRes.ok && appRes.data?.policies) setAppPolicies(appRes.data.policies)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [selectedChildId])

  async function handleCreateWebsite(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await createWebsitePolicy({
      ...formData,
      childId: formData.childId || selectedChildId || null,
    })
    if (res.ok) {
      setShowCreate(false)
      setFormData({ domain: "", displayName: "", state: "blocked", childId: "", category: "", dailyLimitMinutes: 30, scheduleStart: "", scheduleEnd: "" })
      await loadData()
    } else {
      alert(res.error || "Failed to create policy.")
    }
    setSaving(false)
  }

  async function handleCreateApp(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await createAppPolicy({
      ...appFormData,
      childId: appFormData.childId || selectedChildId || null,
    })
    if (res.ok) {
      setShowCreate(false)
      setAppFormData({ appId: "", appName: "", packageName: "", state: "blocked", platform: "all", category: "", dailyLimitMinutes: 30, scheduleStart: "", scheduleEnd: "" })
      await loadData()
    } else {
      alert(res.error || "Failed to create policy.")
    }
    setSaving(false)
  }

  async function handleDelete(policyId: string, type: TabType) {
    if (!confirm("Delete this policy?")) return
    const res = type === "websites" ? await deleteWebsitePolicy(policyId) : await deleteAppPolicy(policyId)
    if (res.ok) await loadData()
  }

  return (
    <FamilyGuardianLayout
      title="Website & App Policies"
      subtitle="Control which websites and apps children can access"
    >
      {loading ? (
        <LoadingState />
      ) : (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setTab("websites")}
                className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  tab === "websites" ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                Websites
              </button>
              <button
                onClick={() => setTab("apps")}
                className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  tab === "apps" ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                Apps
              </button>
            </div>
            <div className="flex gap-3">
              <div className="w-48">
                <ChildSelector selectedChildId={selectedChildId} onSelect={setSelectedChildId} />
              </div>
              <button
                onClick={() => setShowCreate(true)}
                className="cursor-pointer rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md"
              >
                + Add Policy
              </button>
            </div>
          </div>

          {/* Create Form */}
          {showCreate && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              {tab === "websites" ? (
                <form onSubmit={handleCreateWebsite} className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Add Website Policy</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Domain</label>
                      <input type="text" value={formData.domain} onChange={(e) => setFormData({ ...formData, domain: e.target.value })} placeholder="youtube.com" required className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Display Name</label>
                      <input type="text" value={formData.displayName} onChange={(e) => setFormData({ ...formData, displayName: e.target.value })} placeholder="YouTube" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">State</label>
                      <select value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                        {policyStates.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                      <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="Social Media" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" disabled={saving || !formData.domain} className="cursor-pointer rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50">Create</button>
                    <button type="button" onClick={() => setShowCreate(false)} className="cursor-pointer rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">Cancel</button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleCreateApp} className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Add App Policy</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">App Name</label>
                      <input type="text" value={appFormData.appName} onChange={(e) => setAppFormData({ ...appFormData, appName: e.target.value })} placeholder="Instagram" required className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">App ID</label>
                      <input type="text" value={appFormData.appId} onChange={(e) => setAppFormData({ ...appFormData, appId: e.target.value })} placeholder="com.instagram.android" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Platform</label>
                      <select value={appFormData.platform} onChange={(e) => setAppFormData({ ...appFormData, platform: e.target.value })} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                        <option value="all">All Platforms</option>
                        <option value="android">Android</option>
                        <option value="ios">iOS</option>
                        <option value="web">Web</option>
                        <option value="tv">Smart TV</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">State</label>
                      <select value={appFormData.state} onChange={(e) => setAppFormData({ ...appFormData, state: e.target.value })} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                        {policyStates.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" disabled={saving || !appFormData.appName} className="cursor-pointer rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50">Create</button>
                    <button type="button" onClick={() => setShowCreate(false)} className="cursor-pointer rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">Cancel</button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Policies List */}
          {tab === "websites" && (
            websitePolicies.length === 0 ? (
              <EmptyState icon="🌐" title="No website policies" description="Create policies to control website access for your children." action={{ label: "Add Policy", onClick: () => setShowCreate(true) }} />
            ) : (
              <div className="space-y-3">
                {websitePolicies.map((policy) => (
                  <div key={policy.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="text-xl">🌐</div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{policy.displayName || policy.domain}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{policy.domain}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={policy.state} />
                      <button onClick={() => handleDelete(policy.id, "websites")} className="cursor-pointer text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {tab === "apps" && (
            appPolicies.length === 0 ? (
              <EmptyState icon="📱" title="No app policies" description="Create policies to control app access on connected devices." action={{ label: "Add Policy", onClick: () => setShowCreate(true) }} />
            ) : (
              <div className="space-y-3">
                {appPolicies.map((policy) => (
                  <div key={policy.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="text-xl">📱</div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{policy.appName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{policy.appId} · {policy.platform}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={policy.state} />
                      <button onClick={() => handleDelete(policy.id, "apps")} className="cursor-pointer text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}
    </FamilyGuardianLayout>
  )
}

