"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Plan } from "@/lib/plan-config";
import UpgradeButton from "./UpgradeButton";

interface PricingCardProps {
  plan: Plan;
  isCurrentPlan: boolean;
  delay: number;
}

export default function PricingCard({ plan, isCurrentPlan, delay }: PricingCardProps) {
  const isPopular = plan.isPopular;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`relative flex flex-col rounded-3xl border p-8 shadow-xl transition-all duration-300
        ${isPopular ? "border-purple-500 bg-gradient-to-br from-gray-900 to-gray-800" : "border-gray-700 bg-gray-800"}
        ${isCurrentPlan ? "ring-2 ring-purple-500" : ""}
      `}
    >
      {isPopular && (
        <div className="absolute -top-3 right-0 -mr-3 rounded-full bg-purple-600 px-3 py-1 text-xs font-semibold uppercase text-white shadow-md">
          Most Popular
        </div>
      )}
      <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
      <p className="mt-4 text-gray-400">{plan.name === "Free" ? "Perfect for trying out SmartDocs AI" : `Ideal for ${plan.name.toLowerCase()} users`}</p>

      <div className="mt-6 flex items-baseline">
        <span className="text-5xl font-extrabold text-white">
          {plan.price === 0 ? "Free" : `₹${plan.price}`}
        </span>
        {plan.price !== 0 && <span className="ml-1 text-xl font-semibold text-gray-400">/month</span>}
      </div>

      <ul className="mt-8 space-y-4 text-left flex-1">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-center text-gray-300">
            <Check className="h-5 w-5 text-green-400 mr-2 shrink-0" />
            <span className="text-sm">{feature.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}</span>
          </li>
        ))}
        <li className="flex items-center text-gray-300">
          <Check className="h-5 w-5 text-green-400 mr-2 shrink-0" />
          <span className="text-sm">{plan.limits.storageGB} GB Storage</span>
        </li>
        <li className="flex items-center text-gray-300">
          <Check className="h-5 w-5 text-green-400 mr-2 shrink-0" />
          <span className="text-sm">{plan.limits.aiCreditsMonthly} AI Credits/month</span>
        </li>
        {plan.limits.maxChatHistoryDays !== 'unlimited' && (
          <li className="flex items-center text-gray-300">
            <Check className="h-5 w-5 text-green-400 mr-2 shrink-0" />
            <span className="text-sm">{plan.limits.maxChatHistoryDays} Days Chat History</span>
          </li>
        )}
      </ul>

      <div className="mt-10">
        <UpgradeButton planId={plan.id} isCurrentPlan={isCurrentPlan} />
      </div>
    </motion.div>
  );
}