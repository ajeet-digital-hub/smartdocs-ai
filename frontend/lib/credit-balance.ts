import { PlanId, getPlan } from "./plan-config";

/**
 * Credit Balance Model
 *
 * Monthly Credits: Allocated at the start of each billing cycle.
 * Recharge Credits: Purchased by the user when monthly credits are exhausted.
 *
 * Credit Consumption Priority:
 * 1. Monthly plan credits are consumed first.
 * 2. Recharge credits are consumed second.
 *
 * This prevents double-charging and maintains a clear ledger.
 */

export interface CreditBalance {
  /** Credits from the monthly plan allocation */
  monthlyCredits: number;
  /** Credits remaining from the monthly allocation this period */
  monthlyCreditsUsed: number;
  /** Credits purchased via recharge packs */
  rechargeCredits: number;
  /** Credits consumed from recharge balance */
  rechargeCreditsUsed: number;
  /** Total available credits (monthly remaining + recharge remaining) */
  availableCredits: number;
  /** Total credits consumed this month */
  totalConsumed: number;
}

/**
 * Calculate the available credit balance for a user.
 *
 * @param planId - The user's current plan
 * @param monthlyCreditsUsed - Credits consumed from monthly allocation this period
 * @param rechargeCredits - Total recharge credits purchased
 * @param rechargeCreditsUsed - Recharge credits consumed so far
 * @returns CreditBalance object
 */
export function calculateCreditBalance(
  planId: PlanId,
  monthlyCreditsUsed: number,
  rechargeCredits: number,
  rechargeCreditsUsed: number
): CreditBalance {
  const plan = getPlan(planId);
  const monthlyCredits = plan?.limits.aiCreditsMonthly ?? 0;

  const monthlyRemaining = Math.max(0, monthlyCredits - monthlyCreditsUsed);
  const rechargeRemaining = Math.max(0, rechargeCredits - rechargeCreditsUsed);
  const availableCredits = monthlyRemaining + rechargeRemaining;

  return {
    monthlyCredits,
    monthlyCreditsUsed,
    rechargeCredits,
    rechargeCreditsUsed,
    availableCredits,
    totalConsumed: monthlyCreditsUsed + rechargeCreditsUsed,
  };
}

/**
 * Determine if a credit operation can be performed.
 *
 * Credit consumption order:
 * 1. Deduct from monthly credits first
 * 2. Then from recharge credits
 *
 * @param balance - Current credit balance
 * @param cost - Credits required for the operation
 * @returns true if sufficient credits are available
 */
export function hasSufficientCredits(balance: CreditBalance, cost: number): boolean {
  return balance.availableCredits >= cost;
}

/**
 * Calculate how credits would be split between monthly and recharge
 * for a given operation cost.
 *
 * @param balance - Current credit balance  
 * @param cost - Credits required
 * @returns Allocation between monthly and recharge credits
 */
export function allocateCreditConsumption(
  balance: CreditBalance,
  cost: number
): { fromMonthly: number; fromRecharge: number } {
  const monthlyRemaining = Math.max(0, balance.monthlyCredits - balance.monthlyCreditsUsed);

  if (cost <= monthlyRemaining) {
    return { fromMonthly: cost, fromRecharge: 0 };
  }

  return {
    fromMonthly: monthlyRemaining,
    fromRecharge: cost - monthlyRemaining,
  };
}

/**
 * Recharge Pack Definitions
 *
 * These packs allow users to purchase additional AI credits.
 * Payment gateway integration is pending; this defines the architecture only.
 */
export interface RechargePack {
  id: string;
  name: string;
  price: number; // INR
  credits: number;
  description: string;
}

export const RECHARGE_PACKS: RechargePack[] = [
  {
    id: "recharge_micro",
    name: "AI Micro Recharge",
    price: 49,
    credits: 100,
    description: "Small credit boost for occasional use",
  },
  {
    id: "recharge_standard",
    name: "AI Recharge",
    price: 99,
    credits: 250,
    description: "Standard credit pack for regular users",
  },
  {
    id: "recharge_power",
    name: "AI Power Recharge",
    price: 199,
    credits: 600,
    description: "Power pack for heavy AI users",
  },
  {
    id: "recharge_mega",
    name: "AI Mega Recharge",
    price: 399,
    credits: 1500,
    description: "Best value for power users",
  },
];

/**
 * Get a recharge pack by ID.
 */
export function getRechargePack(packId: string): RechargePack | undefined {
  return RECHARGE_PACKS.find((p) => p.id === packId);
}
