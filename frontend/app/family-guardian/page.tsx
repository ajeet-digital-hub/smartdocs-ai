"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link";
import FamilyGuardianLayout from "./components/FamilyGuardianLayout"
import StatCard from "./components/StatCard"
import LoadingState from "./components/LoadingState"
import { WelcomeAnimation } from "./components/WelcomeAnimation"
import { getAnalytics, getAppPolicies, createAppPolicy, getNotifications, getSchedules, createSchedule, updateSchedule, generateFamilyInsight } from "@/lib/family-guardian-api"
import { Shield, Smartphone, UserPlus, Clock, Users, AlertTriangle, Sparkles, BookOpen, Moon, School, MoreHorizontal } from "lucide-react"
import { APPLICATION_CATALOG, AppCatalogEntry } from "@/data/application-catalog"

type AppStatus = "ALLOWED" | "LIMITED" | "BLOCKED"

interface AppWithPolicy extends AppCatalogEntry {
  policyStatus: AppStatus
  policyId?: string
}

const quickRules = [
  { id: "Study Time", label: "Study Time", description: "Blocks social media & games.", icon: BookOpen, blockedCategories: ["social", "gaming"], defaultTime: { days: ["mon", "tue", "wed", "thu", "fri"], startTime: "16:00", endTime: "18:00" } },
  { id: "Sleep Time", label: "Sleep Time", description: "Pauses entertainment apps.", icon: Moon, blockedCategories: ["entertainment", "gaming", "social"], defaultTime: { days: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"], startTime: "21:00", endTime: "07:00" } },
  { id: "School Time", label: "School Time", description: "Limits distracting apps.", icon: School, blockedCategories: ["social", "gaming", "entertainment"], defaultTime: { days: ["mon", "tue", "wed", "thu", "fri"], startTime: "09:00", endTime: "15:00" } },
];

const PREVIEW_APP_IDS = [
  "youtube", "instagram", "whatsapp", "games", "netflix", "tiktok"
];

const AppControlButton = ({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) => (
  <button onClick={onClick} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${isActive ? "bg-purple-600 text-white" : "bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"}`}>{label}</button>
);

export default function FamilyGuardianDashboard() {
  const [showWelcome, setShowWelcome] = useState(true)
  const [analytics, setAnalytics] = useState<any>(null)
  const [appsWithPolicies, setAppsWithPolicies] = useState<AppWithPolicy[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [schedules, setSchedules] = useState<any[]>([]);
  const [ruleSaving, setRuleSaving] = useState<Record<string, boolean>>({});
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(true);
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("fg_welcome_seen")
    if (hasSeenWelcome) setShowWelcome(false)
  }, [])

  function handleWelcomeComplete() {
    localStorage.setItem("fg_welcome_seen", "true")
    setShowWelcome(false)
  }

  const loadDashboardData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [analyticsRes, appPoliciesRes, notificationsRes, schedulesRes] = await Promise.all([
        getAnalytics(),
        getAppPolicies({}),
        getNotifications({ limit: 3 }),
        getSchedules({}),
      ])

      if (analyticsRes.ok && analyticsRes.analytics) {
        setAnalytics(analyticsRes.analytics)
      } else {
        throw new Error(analyticsRes.error || "Failed to load dashboard analytics.")
      }

      if (appPoliciesRes.ok) {
        const policiesMap = new Map(appPoliciesRes.policies.map((p: any) => [p.appId, p]))
        const apps = APPLICATION_CATALOG.filter(app => PREVIEW_APP_IDS.includes(app.appId)).map(app => {
          const policy = policiesMap.get(app.appId)
          return {
            ...app,
            policyStatus: policy ? (policy.state.toUpperCase() as AppStatus) : "ALLOWED",
            policyId: policy?._id,
          }
        })
        setAppsWithPolicies(apps)
      }

      if (notificationsRes.ok) {
        setNotifications(notificationsRes.notifications)
      }

      if (schedulesRes.ok) {
        setSchedules(schedulesRes.schedules);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (showWelcome) return
    loadDashboardData();

setLoadingInsight(true);
    generateFamilyInsight()
      .then(res => {
        if (res.ok && res.insight) {
          setAiInsight(res.insight);
        } else {
          setAiInsight("Could not generate AI insight at this time. Please check back later.");
        }
      })
      .catch(() => setAiInsight("Could not connect to the AI service."))
      .finally(() => setLoadingInsight(false));

  }, [showWelcome, loadDashboardData]);

  const handleAppPolicyChange = async (app: AppWithPolicy, newStatus: AppStatus) => {
    // This is a simplified version. A real implementation would handle 'LIMITED' with a modal for settings.
    try {
const res = await createAppPolicy({
        appId: app.appId,
        appName: app.name,
        status: newStatus,
        category: app.category,
        // For simplicity, we are not handling policy updates (DELETE then CREATE) here.
        // This assumes we are creating a new policy or the backend handles conflicts.
      })
      if (res.ok) {
        await loadDashboardData() // Reload to reflect changes
      } else {
        alert(`Failed to update policy for ${app.name}: ${res.error}`)
      }
    } catch (e) {
      alert(`An error occurred while updating the policy for ${app.name}.`)
    }
  }

  const handleRuleToggle = async (rule: typeof quickRules[0], isEnabled: boolean) => {
    setRuleSaving(p => ({ ...p, [rule.id]: true }));
    try {
      const existingRule = schedules.find(s => s.name === rule.id);
      if (existingRule) {
        // Update existing schedule
        const res = await updateSchedule(existingRule._id, { isActive: isEnabled });
        if (!res.ok) throw new Error(res.error || "Failed to update rule.");
      } else if (isEnabled) {
        // Create new schedule
const res = await createSchedule({
          name: rule.id,
          description: rule.description,
          isActive: true,
          isSystemRule: true, // Mark as a system-generated Quick Rule
          timeBlocks: [rule.defaultTime],
          appCategoryRules: rule.blockedCategories.map(cat => ({ category: cat, state: "blocked" })),
        } as any);
        if (!res.ok) throw new Error(res.error || "Failed to create rule.");
      }
      await loadDashboardData(); // Reload all data to reflect changes
    } catch (e) {
      alert(`Error: ${e instanceof Error ? e.message : "Could not save rule."}`);
    } finally {
      setRuleSaving(p => ({ ...p, [rule.id]: false }));
    }
  };

  return (
    <>
      {showWelcome && <WelcomeAnimation onComplete={handleWelcomeComplete} />}
      <FamilyGuardianLayout
        title="Family Guardian"
        subtitle="Manage your family's digital time and safety from one place."
        actions={
          <div>
            <Link href="/family-guardian/children/new" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md">
              <UserPlus className="h-4 w-4" /> Add Child
            </Link>
          </div>
        }
      >
        {loading ? (
          <LoadingState />
        ) : error && !analytics ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center text-sm text-red-300">
            Something went wrong. Please try again.
          </div>
        ) : (
          <div className="space-y-10">
            {/* Top Summary */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Screen Time" value="2h 35m" icon={Clock} color="blue" subtitle="today" />
              <StatCard label="Children" value={analytics?.overview?.totalChildren || 0} icon={Users} color="purple" subtitle="active" />
              <StatCard label="Devices" value={analytics?.overview?.totalDevices || 0} icon={Smartphone} color="green" subtitle="connected" />
              <StatCard label="Blocked Today" value="12" icon={Shield} color="red" subtitle="attempts" />
            </div>

            {/* Children Section */}
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Children</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(analytics?.children || []).map((c: any) => (
                  <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-xl font-bold text-white">{c.name.charAt(0).toUpperCase()}</div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{c.name}</p>
                          <p className="flex items-center gap-1.5 text-xs text-emerald-500"><span className="h-2 w-2 rounded-full bg-emerald-400"></span> Online</p>
                        </div>
                      </div>
                      <Link href={`/family-guardian/children/${c.id}`} className="rounded-lg bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700">Manage</Link>
                    </div>
                    <div className="mt-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3 text-center">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Today's Screen Time</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">2h 15m</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* App Control Section */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">App Control</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Choose what your children can use.</p>
              <div className="mt-5 space-y-3">
                {appsWithPolicies.map(app => (
                  <div key={app.appId} className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-700 dark:bg-slate-800 gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{app.icon}</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{app.name}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${app.policyStatus === 'BLOCKED' ? 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300' : app.policyStatus === 'LIMITED' ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'}`}>{app.policyStatus}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AppControlButton label="Allow" isActive={app.policyStatus === 'ALLOWED'} onClick={() => handleAppPolicyChange(app, 'ALLOWED')} />
                      <AppControlButton label="Limit" isActive={app.policyStatus === 'LIMITED'} onClick={() => handleAppPolicyChange(app, 'LIMITED')} />
                      <AppControlButton label="Block" isActive={app.policyStatus === 'BLOCKED'} onClick={() => handleAppPolicyChange(app, 'BLOCKED')} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Quick Rules */}
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Quick Rules</h2>
                <div className="space-y-3">
                  {quickRules.map(rule => (
                    <div key={rule.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex items-center gap-3">
                        <rule.icon className="h-5 w-5 text-purple-500" />
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-200">{rule.label}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{rule.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRuleToggle(rule, !(schedules.find(s => s.name === rule.id)?.isActive ?? false))}
                        disabled={ruleSaving[rule.id]}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${schedules.find(s => s.name === rule.id)?.isActive ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${schedules.find(s => s.name === rule.id)?.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h2>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="space-y-3">
                    {notifications.slice(0, 5).map(n => (
                      <div key={n._id} className="flex items-center gap-3 text-sm">
                        <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                        <div className="flex-grow">
                          <p className="font-medium text-slate-800 dark:text-slate-200">{n.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{n.message}</p>
                        </div>
                        <MoreHorizontal className="h-5 w-5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                  <Link href="/family-guardian/activity" className="mt-4 block text-center text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline">View all activity</Link>
                </div>
              </div>
            </div>

            {/* AI Insight */}
            <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-cyan-400/5 p-6 text-center">
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center justify-center gap-2"><Sparkles className="h-5 w-5 text-cyan-400" /> SmartDocs Assistant</h3>
              {loadingInsight ? (
                <p className="text-sm text-slate-400 italic">Analyzing family activity...</p>
              ) : (
                <p className="text-sm text-slate-300 max-w-2xl mx-auto">{aiInsight}</p>
              )}
              <div className="mt-5 flex justify-center gap-3">
                <button className="rounded-xl bg-slate-100 dark:bg-slate-800 px-5 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700">Apply Suggestion</button>
                <button className="rounded-xl border border-purple-400/50 text-purple-300 px-5 py-2 text-sm font-semibold hover:bg-purple-500/10">Ask Assistant</button>
              </div>
            </div>
          </div>
        )}
      </FamilyGuardianLayout>
    </>
  )
}
