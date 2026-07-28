"use client"

import { useState, useEffect } from "react"
import FamilyGuardianLayout from "./components/FamilyGuardianLayout"
import StatCard from "./components/StatCard"
import LoadingState from "./components/LoadingState"
import { getAnalytics } from "@/lib/family-guardian-api"

export default function FamilyGuardianDashboard() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const res = await getAnalytics()
      if (res.ok && res.data?.analytics) {
        setAnalytics(res.data.analytics)
      }
      setLoading(false)
    }
    load()
  }, [])

  return (
    <FamilyGuardianLayout
      title="Family Guardian"
      subtitle="Study First. Earn Screen Time."
    >
      {loading ? (
        <LoadingState />
      ) : (
        <div className="space-y-8">
          {/* Overview Stats */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Children"
              value={analytics?.overview?.totalChildren || 0}
              icon="👶"
              color="purple"
              subtitle="Registered profiles"
            />
            <StatCard
              label="Connected Devices"
              value={analytics?.overview?.totalDevices || 0}
              icon="📱"
              color="blue"
              subtitle={`${analytics?.overview?.onlineDevices || 0} online`}
            />
            <StatCard
              label="Active Policies"
              value={(analytics?.overview?.totalWebsitePolicies || 0) + (analytics?.overview?.totalAppPolicies || 0)}
              icon="🔒"
              color="green"
              subtitle="Website + App rules"
            />
            <StatCard
              label="Pending Requests"
              value={(analytics?.overview?.pendingUnlocks || 0) + (analytics?.overview?.pendingEmergency || 0)}
              icon="🔔"
              color="orange"
              subtitle="Requires your attention"
            />
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Quick Actions</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <a
                href="/family-guardian/children"
                className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 text-2xl dark:from-purple-900 dark:to-purple-800">
                  ➕
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Add Child</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Create a new profile</p>
                </div>
              </a>

              <a
                href="/family-guardian/devices"
                className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 text-2xl dark:from-blue-900 dark:to-blue-800">
                  📲
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Connect Device</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Pair a new device</p>
                </div>
              </a>

              <a
                href="/family-guardian/policies"
                className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-green-200 text-2xl dark:from-green-900 dark:to-green-800">
                  🛡️
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Manage Policies</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Set website & app rules</p>
                </div>
              </a>

              <a
                href="/family-guardian/unlock-requests"
                className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 text-2xl dark:from-amber-900 dark:to-amber-800">
                  🔓
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Review Requests</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {analytics?.overview?.pendingUnlocks || 0} pending
                  </p>
                </div>
              </a>
            </div>
          </div>

          {/* Children Overview */}
          {analytics?.children && analytics.children.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Children Overview</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {analytics.children.map((child: any) => (
                  <div
                    key={child.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-sm font-bold text-white">
                        {child.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{child.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Age {child.age}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">
                        Daily Limit: <strong className="text-slate-700 dark:text-slate-200">{child.screenTimeLimitDaily}m</strong>
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        Study Goal: <strong className="text-slate-700 dark:text-slate-200">{child.studyGoalDaily}m</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {analytics?.children?.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 p-12 text-center dark:border-slate-700 dark:bg-slate-900/50">
              <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                Welcome to Family Guardian!
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Start by creating a child profile, then connect devices and set up screen time policies.
              </p>
              <div className="mt-6 flex justify-center gap-4">
                <a
                  href="/family-guardian/children"
                  className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md"
                >
                  Create Child Profile
                </a>
                <a
                  href="/family-guardian/devices"
                  className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:shadow-md dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                >
                  Connect a Device
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </FamilyGuardianLayout>
  )
}

