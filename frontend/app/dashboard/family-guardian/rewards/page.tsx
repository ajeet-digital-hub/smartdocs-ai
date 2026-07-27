"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface RewardGoal {
  _id: string;
  childId: { _id: string; name: string; age: number; avatar?: string } | string;
  title: string;
  description?: string;
  requiredMinutes?: number;
  requiredTask?: string;
  rewardType: string;
  rewardTarget?: string;
  rewardDurationMinutes: number;
  progressMinutes: number;
  taskCompleted: boolean;
  status: string;
  remainingRewardMinutes: number;
  startDate: string;
  endDate?: string;
}

interface Child {
  _id: string;
  name: string;
  age: number;
}

const REWARD_TYPE_ICONS: Record<string, string> = {
  screen_time: "⏰",
  entertainment: "🎬",
  custom: "⭐",
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-500/20 text-green-400",
  completed: "bg-cyan-500/20 text-cyan-400",
  expired: "bg-slate-500/20 text-slate-400",
};

export default function RewardsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const childIdParam = searchParams.get("childId");

  const [rewards, setRewards] = useState<RewardGoal[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formChildId, setFormChildId] = useState(childIdParam || "");
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formReqMin, setFormReqMin] = useState("60");
  const [formReqTask, setFormReqTask] = useState("");
  const [formRewardType, setFormRewardType] = useState("screen_time");
  const [formRewardTarget, setFormRewardTarget] = useState("");
  const [formRewardMin, setFormRewardMin] = useState("30");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status !== "authenticated") return;
    fetchData();
  }, [status, router]);

  async function fetchData() {
    try {
      setLoading(true);
      const [rewardsRes, childrenRes] = await Promise.all([
        fetch("/api/family/rewards"),
        fetch("/api/family/children"),
      ]);
      const rewardsData = await rewardsRes.json();
      const childrenData = await childrenRes.json();
      if (rewardsData.ok) setRewards(rewardsData.rewards);
      if (childrenData.ok) setChildren(childrenData.children);
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  function getChildName(reward: RewardGoal): string {
    if (typeof reward.childId === "object" && reward.childId) return reward.childId.name;
    const child = children.find((c) => c._id === reward.childId);
    return child?.name || "Unknown";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!formChildId || !formTitle.trim() || !formRewardMin) {
      setError("Please fill required fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/family/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId: formChildId,
          title: formTitle.trim(),
          description: formDesc.trim() || undefined,
          requiredMinutes: formReqMin ? parseInt(formReqMin, 10) : undefined,
          requiredTask: formReqTask.trim() || undefined,
          rewardType: formRewardType,
          rewardTarget: formRewardTarget.trim() || undefined,
          rewardDurationMinutes: parseInt(formRewardMin, 10),
          startDate: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed to create reward");
      setShowForm(false);
      setFormTitle("");
      setFormDesc("");
      setFormReqTask("");
      setFormRewardTarget("");
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create reward");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#141018" }}>
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#141018" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/dashboard/family-guardian" className="text-slate-400 hover:text-white text-sm mb-2 inline-block">
              ← Back to Family Guardian
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Study Rewards</h1>
            <p className="text-slate-400 mt-1">Study First. Earn Screen Time.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            {showForm ? "Cancel" : "+ Create Reward"}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
            <h3 className="text-white font-semibold mb-4">Create Reward Goal</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Child *</label>
                <select value={formChildId} onChange={(e) => setFormChildId(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm" required>
                  <option value="">Select child</option>
                  {children.map((c) => (
                    <option key={c._id} value={c._id}>{c.name} (Age {c.age})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Title *</label>
                <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm" placeholder="e.g. Complete Homework" required />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Required Study Minutes</label>
                <input type="number" value={formReqMin} onChange={(e) => setFormReqMin(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm" placeholder="e.g. 60" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Required Task (optional)</label>
                <input type="text" value={formReqTask} onChange={(e) => setFormReqTask(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm" placeholder="e.g. Complete quiz" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Reward Type</label>
                <select value={formRewardType} onChange={(e) => setFormRewardType(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm">
                  <option value="screen_time">Screen Time</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Reward Target (optional)</label>
                <input type="text" value={formRewardTarget} onChange={(e) => setFormRewardTarget(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm" placeholder="e.g. YouTube" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Reward Duration (minutes) *</label>
                <input type="number" value={formRewardMin} onChange={(e) => setFormRewardMin(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm" placeholder="e.g. 30" required />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Description</label>
                <textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm" placeholder="Optional description" rows={2} />
              </div>
            </div>
            <button type="submit" disabled={submitting} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-sm disabled:opacity-50 cursor-pointer">
              {submitting ? "Creating..." : "Create Reward Goal"}
            </button>
          </form>
        )}

        {rewards.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-12 text-center">
            <div className="text-5xl mb-4">⭐</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Rewards Yet</h3>
            <p className="text-slate-400 mb-6">Create study goals with rewards to motivate your children.</p>
            <button onClick={() => setShowForm(true)} className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold cursor-pointer">
              Create Your First Reward
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {rewards.map((reward) => {
              const progress = reward.requiredMinutes ? Math.round((reward.progressMinutes / reward.requiredMinutes) * 100) : reward.taskCompleted ? 100 : 0;
              return (
                <div key={reward._id} className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 hover:bg-white/10 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{REWARD_TYPE_ICONS[reward.rewardType] || "⭐"}</span>
                      <div>
                        <h3 className="text-white font-semibold">{reward.title}</h3>
                        <p className="text-slate-400 text-sm">
                          {getChildName(reward)} • {reward.rewardDurationMinutes} min reward
                          {reward.rewardTarget && ` for ${reward.rewardTarget}`}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[reward.status] || ""}`}>
                      {reward.status}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Progress: {progress}%</span>
                      {reward.requiredMinutes && <span>{reward.progressMinutes}/{reward.requiredMinutes} min</span>}
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-500"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  {reward.status === "completed" && reward.remainingRewardMinutes > 0 && (
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <span>✅</span>
                      <span>Reward Active: {reward.remainingRewardMinutes} minutes remaining</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
