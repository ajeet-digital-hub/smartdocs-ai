"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface WebsitePolicy {
  _id: string;
  childId: { _id: string; name: string; age: number } | string;
  name: string;
  domain: string;
  category: string;
  icon?: string;
  isBlocked: boolean;
  dailyLimitMinutes?: number;
  scheduleBlocks: { startTime: string; endTime: string; daysOfWeek: string[] }[];
}

interface Child {
  _id: string;
  name: string;
  age: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  social: "bg-red-500/20 text-red-400",
  gaming: "bg-orange-500/20 text-orange-400",
  entertainment: "bg-yellow-500/20 text-yellow-400",
  educational: "bg-green-500/20 text-green-400",
  custom: "bg-blue-500/20 text-blue-400",
};

export default function BlockingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const childIdParam = searchParams.get("childId");

  const [loading, setLoading] = useState(true);
  const [policies, setPolicies] = useState<WebsitePolicy[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState(childIdParam || "");
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

  useEffect(() => {
    if (selectedChildId) {
      fetchPolicies();
    } else {
      setPolicies([]);
    }
  }, [selectedChildId]);

  async function fetchPolicies() {
    try {
      // First try to seed defaults if none exist
      await fetch("/api/family/website-policies", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId: selectedChildId }),
      });

      const res = await fetch("/api/family/website-policies");
      const data = await res.json();
      if (data.ok) {
        setPolicies(data.policies.filter((p: WebsitePolicy) => {
          const childId = typeof p.childId === "object" ? p.childId._id : p.childId;
          return childId === selectedChildId;
        }));
      }
    } catch {
      setError("Failed to load policies");
    }
  }

  async function toggleBlock(policyId: string, currentlyBlocked: boolean) {
    try {
      const res = await fetch(`/api/family/website-policies/${policyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBlocked: !currentlyBlocked }),
      });
      const data = await res.json();
      if (data.ok) {
        setPolicies((prev) =>
          prev.map((p) => (p._id === policyId ? { ...p, isBlocked: !currentlyBlocked } : p))
        );
      }
    } catch {
      setError("Failed to update policy");
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
        <div className="mb-8">
          <Link href="/dashboard/family-guardian" className="text-slate-400 hover:text-white text-sm mb-2 inline-block">
            ← Back to Family Guardian
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Website Blocking</h1>
          <p className="text-slate-400 mt-1">Configure which websites and apps are blocked or restricted</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Child Selector */}
        <div className="mb-6">
          <label className="block text-sm text-slate-400 mb-2">Select Child</label>
          <div className="flex flex-wrap gap-2">
            {children.map((child) => (
              <button
                key={child._id}
                onClick={() => setSelectedChildId(child._id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  selectedChildId === child._id
                    ? "bg-purple-500/30 text-purple-300 border border-purple-500/50"
                    : "bg-white/10 text-slate-400 border border-white/10 hover:bg-white/20"
                }`}
              >
                {child.name} (Age {child.age})
              </button>
            ))}
            {children.length === 0 && (
              <p className="text-slate-500 text-sm">No children found. Add a child first.</p>
            )}
          </div>
        </div>

        {/* Note about device blocking */}
        <div className="mb-6 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm">
          <strong>Note:</strong> Website blocking policies are configured here. Actual blocking requires a browser extension or device app.
          This dashboard provides the policy management backend. Extension and app integration can be added later.
        </div>

        {loading ? (
          <div className="text-center text-slate-400 py-12">Loading policies...</div>
        ) : !selectedChildId ? (
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-12 text-center">
            <div className="text-5xl mb-4">👆</div>
            <h3 className="text-xl font-semibold text-white mb-2">Select a Child</h3>
            <p className="text-slate-400">Choose a child above to manage their website blocking policies.</p>
          </div>
        ) : policies.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-12 text-center">
            <div className="text-5xl mb-4">🌐</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Policies Configured</h3>
            <p className="text-slate-400">Default policies will be created when you add websites.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {policies.map((policy) => (
              <div
                key={policy._id}
                className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{policy.icon || "🌐"}</span>
                    <div>
                      <h3 className="text-white font-semibold">{policy.name}</h3>
                      <p className="text-slate-400 text-xs">{policy.domain}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_COLORS[policy.category] || "bg-slate-500/20 text-slate-400"}`}>
                      {policy.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {policy.dailyLimitMinutes && (
                      <span className="text-xs text-slate-400">{policy.dailyLimitMinutes}min/day</span>
                    )}
                    <button
                      onClick={() => toggleBlock(policy._id, policy.isBlocked)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                        policy.isBlocked
                          ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      }`}
                    >
                      {policy.isBlocked ? "Blocked" : "Allowed"}
                    </button>
                  </div>
                </div>
                {policy.scheduleBlocks.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {policy.scheduleBlocks.map((block, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-white/5 text-slate-400 text-xs">
                        Blocked {block.startTime} - {block.endTime}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
