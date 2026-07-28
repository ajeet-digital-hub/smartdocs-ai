"use client"

import { useState, useEffect } from "react"
import FamilyGuardianLayout from "../components/FamilyGuardianLayout"
import LoadingState from "../components/LoadingState"
import StatCard from "../components/StatCard"
import ChildSelector from "../components/ChildSelector"
import { getAnalytics } from "@/lib/family-guardian-api"

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [selectedChildId, setSelectedChildId] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)

  async function loadData() {
    setLoading(true)
    const res = await getAnalytics({ childId: selectedChildId, period: "today" })
    if (res.ok && res.data?.analytics) setAnalytics(res.data.analytics)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [selectedChildId])

  return (
    <FamilyGuardianLayout title="Analytics" subtitle="View screen time and activity insights">
      {loading ? <LoadingState /> : (
        <div className="space-y-6">
          <div className="w-48">
            <ChildSelector selectedChildId={selectedChildId} onSelect={setSelectedChildId} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Children" value={analytics?.overview?.totalChildren || 0} icon="👶" color="purple" />
            <StatCard label="Total Devices" value={analytics?.overview?.totalDevices || 0} icon="📱" color="blue" />
            <StatCard label="Online Now" value={analytics?.overview?.onlineDevices || 0} icon="🟢" color="green" />
            <StatCard label="Today's Activities" value={analytics?.overview?.todayActivities || 0} icon="📊" color="orange" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Pending Unlocks" value={analytics?.overview?.pendingUnlocks || 0} icon="🔓" color="red" />
            <StatCard label="Pending Emergency" value={analytics?.overview?.pendingEmergency || 0} icon="🆘" color="pink" />
            <StatCard label="Active Schedules" value={analytics?.overview?.totalSchedules || 0} icon="⏰" color="indigo" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <StatCard label="Website Policies" value={analytics?.overview?.totalWebsitePolicies || 0} icon="🌐" color="teal" />
            <StatCard label="App Policies" value={analytics?.overview?.totalAppPolicies || 0} icon="📱" color="teal" />
          </div>

          {analytics?.children?.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 p-10 text-center dark:border-slate-700 dark:bg-slate-900/50">
              <p className="text-sm text-slate-500 dark:text-slate-400">No device data available yet. Connect devices and set up policies to see analytics.</p>
            </div>
          )}
        </div>
      )}
    </FamilyGuardianLayout>
  )
}
