"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface ScheduleItem {
  _id: string;
  childId: { _id: string; name: string; age: number };
  name: string;
  type: string;
  startTime: string;
  endTime: string;
  daysOfWeek: string[];
  timezone: string;
  isActive: boolean;
}

interface Child {
  _id: string;
  name: string;
  age: number;
}

const SCHEDULE_TYPES = [
  { value: "study", label: "Study Time", icon: "📚", color: "bg-green-500/20 text-green-400" },
  { value: "sleep", label: "Sleep Time", icon: "🌙", color: "bg-purple-500/20 text-purple-400" },
  { value: "school", label: "School Time", icon: "🏫", color: "bg-blue-500/20 text-blue-400" },
  { value: "free", label: "Free Time", icon: "🎮", color: "bg-cyan-500/20 text-cyan-400" },
  { value: "custom", label: "Custom", icon: "📌", color: "bg-yellow-500/20 text-yellow-400" },
];

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export default function SchedulesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const childIdParam = searchParams.get("childId");

  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formChildId, setFormChildId] = useState(childIdParam || "");
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("study");
  const [formStart, setFormStart] = useState("16:00");
  const [formEnd, setFormEnd] = useState("18:00");
  const [formDays, setFormDays] = useState<string[]>(["mon", "tue", "wed", "thu", "fri"]);
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
      const [schedulesRes, childrenRes] = await Promise.all([
        fetch("/api/family/schedules"),
        fetch("/api/family/children"),
      ]);
      const schedulesData = await schedulesRes.json();
      const childrenData = await childrenRes.json();
      if (schedulesData.ok) setSchedules(schedulesData.schedules);
      if (childrenData.ok) setChildren(childrenData.children);
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  function toggleDay(day: string) {
    setFormDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!formChildId || !formName.trim() || formDays.length === 0) {
      setError("Please fill all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/family/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId: formChildId,
          name: formName.trim(),
          type: formType,
          startTime: formStart,
          endTime: formEnd,
          daysOfWeek: formDays,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed to create schedule");
      setShowForm(false);
      setFormName("");
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create schedule");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(scheduleId: string, currentActive: boolean) {
    try {
      const res = await fetch(`/api/family/schedules/${scheduleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      const data = await res.json();
      if (data.ok) await fetchData();
    } catch {
      setError("Failed to update schedule");
    }
  }

  async function handleDelete(scheduleId: string) {
    if (!confirm("Delete this schedule?")) return;
    try {
      const res = await fetch(`/api/family/schedules/${scheduleId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) await fetchData();
    } catch {
      setError("Failed to delete schedule");
    }
  }

  const getTypeInfo = (type: string) => SCHEDULE_TYPES.find((t) => t.value === type) || SCHEDULE_TYPES[4];

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
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Schedules</h1>
            <p className="text-slate-400 mt-1">Manage screen time and study schedules</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            {showForm ? "Cancel" : "+ Add Schedule"}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
            <h3 className="text-white font-semibold mb-4">New Schedule</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Child *</label>
                <select
                  value={formChildId}
                  onChange={(e) => setFormChildId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
                  required
                >
                  <option value="">Select child</option>
                  {children.map((c) => (
                    <option key={c._id} value={c._id}>{c.name} (Age {c.age})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Schedule Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
                  placeholder="e.g. Evening Study"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Type *</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
                >
                  {SCHEDULE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={formStart}
                    onChange={(e) => setFormStart(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">End Time</label>
                  <input
                    type="time"
                    value={formEnd}
                    onChange={(e) => setFormEnd(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">Days of Week *</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      formDays.includes(day)
                        ? "bg-purple-500/30 text-purple-300 border border-purple-500/50"
                        : "bg-white/10 text-slate-400 border border-white/10 hover:bg-white/20"
                    }`}
                  >
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-sm disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Creating..." : "Create Schedule"}
            </button>
          </form>
        )}

        {schedules.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-12 text-center">
            <div className="text-5xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Schedules Yet</h3>
            <p className="text-slate-400 mb-6">Create schedules to manage screen time and study periods.</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold cursor-pointer"
            >
              Create First Schedule
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {schedules.map((sched) => {
              const typeInfo = getTypeInfo(sched.type);
              const childName = typeof sched.childId === "object" ? sched.childId.name : "Unknown";
              return (
                <div key={sched._id} className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 hover:bg-white/10 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${typeInfo.color}`}>
                        {typeInfo.icon} {typeInfo.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${sched.isActive ? "bg-green-500/20 text-green-400" : "bg-slate-500/20 text-slate-400"}`}>
                        {sched.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleActive(sched._id, sched.isActive)}
                        className={`px-2.5 py-1 rounded-lg text-xs cursor-pointer ${sched.isActive ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"}`}
                      >
                        {sched.isActive ? "Pause" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDelete(sched._id)}
                        className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <h3 className="text-white font-semibold">{sched.name}</h3>
                  <p className="text-slate-400 text-sm">
                    {childName} • {sched.startTime} - {sched.endTime} • {sched.timezone}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {sched.daysOfWeek.map((day) => (
                      <span key={day} className="px-2 py-0.5 rounded bg-white/10 text-slate-300 text-xs">
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
