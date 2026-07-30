"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PLANS, getPlan, Plan } from "@/lib/plan-config";

interface SubscriptionData {
  currentPlan: Plan & { id: string };
  status: string;
  expiry: string | null;
  subscription: any;
}

export default function SubscriptionDashboardPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (authStatus !== "authenticated") return;

    async function fetchSubscription() {
      try {
        const res = await fetch("/api/subscription");
        if (!res.ok) throw new Error("Failed to load");
        const json = await res.json();
        if (json.ok) {
          setData(json);
        } else {
          setError(json.error || "Failed to load subscription");
        }
      } catch (err) {
        setError("Failed to load subscription data");
      } finally {
        setLoading(false);
      }
    }
    fetchSubscription();
  }, [authStatus, router]);

  if (authStatus === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#141018" }}>
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const currentPlanId = data?.currentPlan?.id || "free";
  const currentPlan = getPlan(currentPlanId as any);
  const isActive = data?.status === "ACTIVE";
  const expiryDate = data?.expiry ? new Date(data.expiry).toLocaleDateString() : null;

  return (
    <div className="min-h-screen" style={{ background: "#141018" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Subscription & Billing</h1>
          <p className="text-slate-400 mt-1">Manage your plan and payment details</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Current Plan Card */}
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Current Plan</p>
              <h2 className="text-2xl font-bold text-white mt-1">
                {currentPlan?.name || "Free"} Plan
              </h2>
              <div className="flex items-center gap-3 mt-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                    isActive
                      ? "bg-green-500/10 text-green-400 border border-green-500/20"
                      : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-green-400" : "bg-yellow-400"}`} />
                  {isActive ? "Active" : data?.status || "Unknown"}
                </span>
                {currentPlan?.price !== undefined && currentPlan.price > 0 && (
                  <span className="text-sm text-slate-400">₹{currentPlan.price}/month</span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href="/pricing"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-sm font-semibold hover:shadow-lg transition-all"
              >
                {currentPlanId === "free" ? "Upgrade Plan" : "Change Plan"}
              </Link>
            </div>
          </div>

          {expiryDate && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-sm text-slate-400">
                {isActive ? "Expires:" : "Expired:"} <span className="text-white">{expiryDate}</span>
              </p>
            </div>
          )}
        </div>

        {/* Plan Details */}
        {currentPlan && (
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Plan Features</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                <span className="text-lg">📦</span>
                <div>
                  <p className="text-sm text-slate-400">Storage</p>
                  <p className="text-sm font-semibold text-white">{currentPlan.limits.storageGB} GB</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                <span className="text-lg">🤖</span>
                <div>
                  <p className="text-sm text-slate-400">AI Credits / month</p>
                  <p className="text-sm font-semibold text-white">{currentPlan.limits.aiCreditsMonthly}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                <span className="text-lg">💬</span>
                <div>
                  <p className="text-sm text-slate-400">Chat History</p>
                  <p className="text-sm font-semibold text-white">
                    {currentPlan.limits.maxChatHistoryDays === "unlimited"
                      ? "Unlimited"
                      : `${currentPlan.limits.maxChatHistoryDays} Day(s)`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                <span className="text-lg">🛡️</span>
                <div>
                  <p className="text-sm text-slate-400">Family Guardian</p>
                  <p className="text-sm font-semibold text-white">
                    {currentPlan.features.includes("FAMILY_GUARDIAN_ACCESS") ? "✅ Included" : "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Available Plans */}
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Available Plans</h3>
          <div className="space-y-3">
            {PLANS.filter(p => p.id !== "enterprise").map((plan) => {
              const isCurrent = plan.id === currentPlanId;
              return (
                <div
                  key={plan.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    isCurrent ? "bg-purple-500/10 border border-purple-500/20" : "bg-white/5"
                  }`}
                >
                  <div>
                    <p className="font-semibold text-white">
                      {plan.name}
                      {plan.isPopular && <span className="ml-2 text-xs text-purple-400">Most Popular</span>}
                    </p>
                    <p className="text-sm text-slate-400">
                      {plan.price === 0 ? "Free" : `₹${plan.price}/month`} — {plan.limits.storageGB}GB, {plan.limits.aiCreditsMonthly} AI credits
                    </p>
                  </div>
                  {isCurrent ? (
                    <span className="text-xs font-semibold text-purple-400">Current</span>
                  ) : (
                    <Link
                      href={`/pricing?plan=${plan.id}`}
                      className="px-4 py-2 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors"
                    >
                      {plan.price === 0 ? "Get Started" : "Upgrade"}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Manage Subscription</h3>
          <p className="text-sm text-slate-400 mb-4">
            Need help with your subscription? Contact our support team.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link
              href="/pricing"
              className="px-4 py-2 rounded-lg border border-white/20 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
            >
              View All Plans
            </Link>
            <a
              href="mailto:support@smartdocs.ai"
              className="px-4 py-2 rounded-lg border border-white/20 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
