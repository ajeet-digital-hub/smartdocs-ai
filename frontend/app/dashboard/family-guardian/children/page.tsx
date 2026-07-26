"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Child {
  _id: string;
  name: string;
  age: number;
  dateOfBirth?: string;
  avatar?: string;
  currentStatus: string;
  points: number;
  studyStreak: number;
}

export default function ChildrenPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formAge, setFormAge] = useState("");
  const [formDob, setFormDob] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchChildren() {
    try {
      const res = await fetch("/api/family/children");
      const data = await res.json();
      if (data.ok) setChildren(data.children);
    } catch {
      setError("Failed to load children");
    }
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status !== "authenticated") return;
    fetchChildren();
  }, [status, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const age = parseInt(formAge, 10);
    if (!formName.trim() || isNaN(age) || age < 1 || age > 18) {
      setError("Please enter a valid name and age (1-18)");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/family/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          age,
          dateOfBirth: formDob || undefined,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed to create child");

      setFormName("");
      setFormAge("");
      setFormDob("");
      setShowForm(false);
      await fetchChildren();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create child");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(childId: string, childName: string) {
    if (!confirm(`Delete ${childName}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/family/children/${childId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) {
        setChildren((prev) => prev.filter((c) => c._id !== childId));
      }
    } catch {
      setError("Failed to delete child");
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#141018" }}>
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#141018" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/dashboard/family-guardian" className="text-slate-400 hover:text-white text-sm mb-2 inline-block">
              ← Back to Family Guardian
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Children</h1>
            <p className="text-slate-400 mt-1">Manage child profiles</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            {showForm ? "Cancel" : "+ Add Child"}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Add Child Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
            <h3 className="text-white font-semibold mb-4">New Child Profile</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-purple-500"
                  placeholder="Child's name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Age *</label>
                <input
                  type="number"
                  value={formAge}
                  onChange={(e) => setFormAge(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-purple-500"
                  placeholder="1-18"
                  min="1"
                  max="18"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-slate-400 mb-1">Date of Birth (optional)</label>
                <input
                  type="date"
                  value={formDob}
                  onChange={(e) => setFormDob(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-sm disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Creating..." : "Create Child Profile"}
            </button>
          </form>
        )}

        {/* Children List */}
        {children.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-12 text-center">
            <div className="text-5xl mb-4">👶</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Children Yet</h3>
            <p className="text-slate-400 mb-6">Add your first child to get started.</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold cursor-pointer"
            >
              Add Your First Child
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {children.map((child) => (
              <div
                key={child._id}
                className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 flex items-center justify-between hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-white font-bold text-lg">
                    {child.avatar || child.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <Link href={`/dashboard/family-guardian/children/${child._id}`} className="text-white font-semibold hover:text-purple-400">
                      {child.name}
                    </Link>
                    <p className="text-slate-400 text-sm">
                      Age {child.age}
                      {child.dateOfBirth && ` • Born ${new Date(child.dateOfBirth).toLocaleDateString()}`}
                    </p>
                    <p className="text-xs text-slate-500">
                      {child.points} points • {child.studyStreak} day streak
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/family-guardian/children/${child._id}`}
                    className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs hover:bg-white/20 transition-all"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(child._id, child.name)}
                    className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20 transition-all cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
