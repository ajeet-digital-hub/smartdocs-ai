"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Child {
  _id: string;
  name: string;
  age: number;
  avatar?: string;
  currentStatus: string;
  points: number;
  studyStreak: number;
}

interface Analytics {
  totalChildren: number;
  activeSchedules: number;
  blockedWebsites: number;
  pendingUnlocks: number;
  activeRewards: number;
  completedRewards: number;
  totalStudyMinutes: number;
  recentActivity: number;
  children: {
    childId: string;
    name: string;
    age: number;
    avatar?: string;
    currentStatus: string;
    points: number;
    studyStreak: number;
    blockedWebsites: number;
    pendingUnlockRequests: number;
    studyMinutes: number;
  }[];
}

const StatCard = ({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) => (
  <div className="rounded-xl p-5 border border-white/10 bg-white/5 backdrop-blur-sm">
    <div className="flex items-center gap-3 mb-3">
      <span className="text-2xl">{icon}</span>
      <span className="text-sm text-slate-400 font-medium">{label}</span>
    </div>
    <div className={`text-3xl font-bold ${color}`}>{value}</div>
  </div>
);

export default function FamilyGuardianDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status !== "authenticated") return;

    async function fetchData() {
      try {
        setLoading(true);
        const [childrenRes, analyticsRes] = await Promise.all([
          fetch("/api/family/children"),
          fetch("/api/family/analytics"),
        ]);

        if (!childrenRes.ok) throw new Error("Failed to fetch children");
        if (!analyticsRes.ok) throw new Error("Failed to fetch analytics");

        const childrenData = await childrenRes.json();
        const analyticsData = await analyticsRes.json();

        if (childrenData.ok) setChildren(childrenData.children);
        if (analyticsData.ok) setAnalytics(analyticsData.analytics);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#141018" }}>
        <div className="text-white text-lg">Loading Family Guardian...</div>
      </div>
    );
  }


  const statusColors: Record<string, string> = {
    online: "text-green-400",
    offline: "text-slate-400",
    studying: "text-cyan-400",
    sleeping: "text-purple-400",
  };

  const statusLabels: Record<string, string> = {
    online: "Online",
    offline: "Offline",
    studying: "Studying",
    sleeping: "Sleeping",
  };

  return (
    <div className="min-h-screen" style={{ background: "#141018" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Family Guardian</h1>
            <p className="text-slate-400 mt-1">Study First. Earn Screen Time.</p>
          </div>
          <Link
            href="/dashboard/family-guardian/children"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all"
          >
            + Add Child
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Children" value={analytics?.totalChildren || 0} icon="👨‍👩‍👧‍👦" color="text-white" />
          <StatCard label="Active Schedules" value={analytics?.activeSchedules || 0} icon="📅" color="text-cyan-400" />
          <StatCard label="Pending Unlocks" value={analytics?.pendingUnlocks || 0} icon="🔓" color="text-yellow-400" />
          <StatCard label="Study Time" value={`${Math.round((analytics?.totalStudyMinutes || 0) / 60)}h`} icon="📚" color="text-green-400" />
        </div>

        {/* Children Grid */}
        {children.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-12 text-center">
            <div className="text-5xl mb-4">👶</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Children Added Yet</h3>
            <p className="text-slate-400 mb-6">Add your first child profile to start managing screen time.</p>
            <Link
              href="/dashboard/family-guardian/children"
              className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold"
            >
              Add Your First Child
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {children.map((child) => {
              const childAnalytics = analytics?.children?.find((c) => c.childId === child._id);
              return (
                <Link
                  key={child._id}
                  href={`/dashboard/family-guardian/children/${child._id}`}
                  className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 hover:bg-white/10 transition-all group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-white font-bold text-lg">
                      {child.avatar || child.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg">{child.name}</h3>
                      <p className="text-slate-400 text-sm">Age {child.age}</p>
                    </div>
                    <span className={`text-xs font-medium ${statusColors[child.currentStatus] || "text-slate-400"}`}>
                      {statusLabels[child.currentStatus] || child.currentStatus}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white/5 rounded-lg p-2">
                      <div className="text-xs text-slate-400">Points</div>
                      <div className="text-white font-semibold">{child.points || 0}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2">
                      <div className="text-xs text-slate-400">Streak</div>
                      <div className="text-white font-semibold">{child.studyStreak || 0}d</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2">
                      <div className="text-xs text-slate-400">Study</div>
                      <div className="text-white font-semibold">{Math.round((childAnalytics?.studyMinutes || 0) / 60)}h</div>
                    </div>
                  </div>
                  {childAnalytics && childAnalytics.pendingUnlockRequests > 0 && (
                    <div className="mt-3 flex items-center gap-2 text-yellow-400 text-xs">
                      <span>⏳</span>
                      <span>{childAnalytics.pendingUnlockRequests} pending unlock request{childAnalytics.pendingUnlockRequests > 1 ? "s" : ""}</span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/dashboard/family-guardian/schedules" className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 hover:bg-white/10 transition-all text-center">
            <div className="text-2xl mb-2">📅</div>
            <div className="text-white font-medium text-sm">Schedules</div>
          </Link>
          <Link href="/dashboard/family-guardian/blocking" className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 hover:bg-white/10 transition-all text-center">
            <div className="text-2xl mb-2">🚫</div>
            <div className="text-white font-medium text-sm">Website Blocking</div>
          </Link>
          <Link href="/dashboard/family-guardian/unlock-requests" className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 hover:bg-white/10 transition-all text-center">
            <div className="text-2xl mb-2">🔓</div>
            <div className="text-white font-medium text-sm">Unlock Requests</div>
          </Link>
          <Link href="/dashboard/family-guardian/analytics" className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 hover:bg-white/10 transition-all text-center">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-white font-medium text-sm">Analytics</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
