"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { PLANS, Plan } from "@/lib/plan-config";
import PricingCard from "@/lib/PricingCard";
import FeatureComparison from "@/lib/FeatureComparison";

export default function PricingPage() {
  const { data: session, status } = useSession();
  const [currentPlanId, setCurrentPlanId] = useState<string>("free");

  useEffect(() => {
    async function fetchUserPlan() {
      if (status !== "authenticated") return;
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();
        if (data.ok && data.user) {
          // User might have a subscription reference
          // For now, we check subscriptionStatus
          if (data.user.subscriptionStatus === "ACTIVE" && data.user.currentSubscription) {
            // Fetch the actual subscription to get planId
            const subRes = await fetch(`/api/subscription?userId=${data.user._id || data.user.id}`);
            if (subRes.ok) {
              const subData = await subRes.json();
              if (subData.subscription?.planId) {
                setCurrentPlanId(subData.subscription.planId);
              }
            }
          }
        }
      } catch {
        // Default to free
      }
    }
    fetchUserPlan();
  }, [status]);

  const plansToShow = PLANS.filter(p => p.id !== "enterprise");

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 sm:px-6 pt-24 pb-12 sm:pt-32 sm:pb-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-purple-500/20 blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 h-60 w-60 rounded-full bg-cyan-500/10 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-purple-200">
            <span>💰</span>
            Simple, Transparent Pricing
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white">
            Choose the Perfect Plan for You
          </h1>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            Start for free, upgrade when you need more power. All plans include core AI features.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-4 sm:px-6 pb-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {plansToShow.map((plan, index) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                isCurrentPlan={currentPlanId === plan.id}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="px-4 sm:px-6 pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white">Compare Plans Side by Side</h2>
            <p className="mt-2 text-slate-400">See exactly what each plan includes</p>
          </div>
          <FeatureComparison plans={plansToShow} />
        </div>
      </section>

      {/* FAQ / CTA */}
      <section className="px-4 sm:px-6 pb-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 sm:p-12">
            <h2 className="text-2xl font-bold text-white">Need a Custom Plan?</h2>
            <p className="mt-3 text-slate-400">
              Contact us for enterprise pricing, team accounts, and custom requirements.
            </p>
            <a
              href="mailto:sales@smartdocs.ai"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all"
            >
              Contact Sales
              <span>→</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
