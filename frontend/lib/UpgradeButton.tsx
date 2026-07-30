"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { PlanId } from "@/lib/plan-config";

interface UpgradeButtonProps {
  planId: PlanId;
  isCurrentPlan: boolean;
}

export default function UpgradeButton({ planId, isCurrentPlan }: UpgradeButtonProps) {
  if (isCurrentPlan) {
    return (
      <button
        disabled
        className="w-full rounded-lg bg-gray-700 py-3 text-lg font-semibold text-gray-400 cursor-not-allowed"
      >
        Current Plan
      </button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full rounded-lg bg-purple-600 py-3 text-lg font-semibold text-white shadow-md hover:bg-purple-700 transition-colors"
    >
      {planId === "free" ? "Get Started" : "Upgrade Now"}
    </motion.button>
  );
}