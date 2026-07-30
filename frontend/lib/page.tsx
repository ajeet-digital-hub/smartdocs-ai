"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PricingCard from "@/components/pricing/PricingCard";
import FeatureComparison from "@/components/pricing/FeatureComparison";
import { PLANS, Plan } from "@/lib/subscription/plan-config";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function PricingPage() {
  const { data: session } = useSession();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);

  useEffect(() => {
    // In a real app, you'd fetch the user's current subscription from an API
    // For now, we'll simulate a 'free' user
    if (session?.user?.id) {
      // Assume fetching user's actual plan from backend
      // const userPlan = await api.getCurrentSubscription();
      setCurrentPlan(PLANS.find(p => p.id === 'free') || null); // Placeholder
    } else {
      setCurrentPlan(null);
    }
  }, [session]);

  const monthlyPlans = PLANS.filter(p => p.billingCycle === "monthly");
  // const yearlyPlans = PLANS.filter(p => p.billingCycle === "yearly"); // For future implementation

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-950 to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white"
        >
          Simple, Transparent Pricing
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-4 text-xl text-gray-300 max-w-2xl mx-auto"
        >
          Choose the perfect plan for your AI-powered productivity needs.
        </motion.p>

        {/* Billing Cycle Toggle (Future) */}
        {/* <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-full bg-gray-800 p-1">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                billingCycle === "monthly" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                billingCycle === "yearly" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Annually (Save 20%)
            </button>
          </div>
        </div> */}

        {/* Pricing Cards */}
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {monthlyPlans.map((plan, index) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={currentPlan?.id === plan.id}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Feature Comparison (Optional) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 text-left"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white mb-8 text-center">
            Detailed Feature Comparison
          </h2>
          <FeatureComparison plans={PLANS} />
        </motion.div>

        {/* CTA for logged out users */}
        {!session && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-16 text-center">
            <p className="text-lg text-gray-300">Ready to boost your productivity?</p>
            <Link href="/register" className="mt-4 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-lg">
              Get Started for Free
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}