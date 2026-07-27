"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ChildAnalytics {
  childId: string;
  name: string;
  age: number;
  avatar?: string;
  currentStatus: string;
  points: number;
  studyStreak: number;
  schedules: number;
  blockedWebsites: number;
  totalUnlockRequests: number;
  pendingUnlockRequests: number;
  totalRewards: number;
  studyMinutes: number;
  completedRewards: number;
}

interface AnalyticsData {
  totalChildren: number;
  activeSchedules: number;
  blockedWebsites: number;
  pendingUnlocks: number;
  activeRewards: number;
  completedRewards: number;
  totalStudyMinutes: number;
  recentActivity: number;
  children: ChildAnalytics[];
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);

  async function fetchAnalytics() {
    try {
      const res = await fetch("/api/family/analytics");
      const data = await res.json();
      if (data.ok) setAnalytics(data.analytics);
    } catch {
      setError("Failed to load analytics");
    }
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status !== "authenticated") return;
    fetchAnalytics();
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#141018" }}>
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  const formatMinutes = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="min-h-screen" style={{ background: "#141018" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <Link href="/dashboard/family-guardian" className="text-slate-400 hover:text-white text-sm mb-2 inline-block">
            ← Back to Family Guardian
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Analytics</h1>
          <p className="text-slate-400 mt-1">Activity and screen time analytics</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
        )}

        {/* Note about analytics */}
        <div className="mb-6 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm">
          <strong>Note:</strong> Analytics data is based on backend policies, unlock requests, and reward goals. 
          Real screen time data requires browser extension or device app integration. This dashboard shows 
          policy-based metrics and activity logs.
        </div>

        {!analytics ? (
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-12 text-center">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Data Yet</h3>
            <p className="text-slate-400">Analytics will appear once you add children and configure policies.</p>
          </div>
        ) : (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
                <div className="text-2xl font-bold text-white">{analytics.totalChildren}</div>
                <div className="text-xs text-slate-400">Children</div>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
                <div className="text-2xl font-bold text-cyan-400">{analytics.activeSchedules}</div>
                <div className="text-xs text-slate-400">Schedules</div>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
                <div className="text-2xl font-bold text-red-400">{analytics.blockedWebsites}</div>
                <div className="text-xs text-slate-400">Blocked Sites</div>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">{analytics.pendingUnlocks}</div>
                <div className="text-xs text-slate-400">Pending Unlocks</div>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{formatMinutes(analytics.totalStudyMinutes)}</div>
                <div className="text-xs text-slate-400">Total Study Time</div>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{analytics.recentActivity}</div>
                <div className="text-xs text-slate-400">7-Day Activity</div>
              </div>
            </div>

            {/* Per-Child Analytics */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Per Child Breakdown</h2>
              {analytics.children.map((child) => {
                const isSelected = selectedChild === child.childId;
                return (
                  <div
                    key={child.childId}
                    className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden"
                  >
                    <button
                      onClick={() => setSelectedChild(isSelected ? null : child.childId)}
                      className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-white font-bold">
                          {child.avatar || child.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-left">
                          <h3 className="text-white font-semibold">{child.name}</h3>
                          <p className="text-slate-400 text-sm">Age {child.age} • {child.currentStatus}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-green-400">{formatMinutes(child.studyMinutes)} study</span>
                        <span className="text-slate-400">{child.points} pts</span>
                        <span className={`transition-transform ${isSelected ? "rotate-180" : ""}`}>▼</span>
                      </div>
                    </button>

                    {isSelected && (
                      <div className="px-4 pb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-white/5 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-cyan-400">{child.schedules}</div>
                          <div className="text-xs text-slate-400">Schedules</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-red-400">{child.blockedWebsites}</div>
                          <div className="text-xs text-slate-400">Blocked Sites</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-yellow-400">{child.pendingUnlockRequests}</div>
                          <div className="text-xs text-slate-400">Pending</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-purple-400">{child.completedRewards}</div>
                          <div className="text-xs text-slate-400">Rewards Done</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
