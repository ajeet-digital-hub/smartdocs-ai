"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import * as familyGuardianApi from "@/lib/family-guardian-api";
import { Users, Smartphone, ShieldCheck } from "lucide-react";

interface Stats {
  childrenCount: number;
  devicesCount: number;
  pendingRequests: number;
}

export default function FamilyGuardianWidget() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [childrenRes, devicesRes, requestsRes] = await Promise.all([
          familyGuardianApi.getChildren(),
          familyGuardianApi.getDevices(),
          familyGuardianApi.getUnlockRequests({ status: "pending" }),
        ]);

        if (!childrenRes.ok || !devicesRes.ok || !requestsRes.ok) {
          throw new Error("Failed to load summary data.");
        }

        setStats({
          childrenCount: childrenRes.children.length,
          devicesCount: devicesRes.devices.length,
          pendingRequests: requestsRes.requests.length,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return <div className="rounded-2xl border border-[#1F2937] bg-[#111827] p-6 shadow-lg h-48 animate-pulse"></div>;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
        <p className="text-red-400 text-sm">Could not load Family Guardian summary.</p>
        <p className="text-xs text-red-500/70 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#1F2937] bg-[#111827] p-6 shadow-lg">
      <h2 className="text-xl font-bold text-white">Family Guardian</h2>
      <p className="text-sm text-gray-400 mt-1 mb-4">Your family's digital safety hub.</p>
      <div className="grid grid-cols-3 gap-4 text-center mb-4">
        <div>
          <Users className="mx-auto h-6 w-6 text-purple-400" />
          <p className="mt-1 text-2xl font-bold text-white">{stats?.childrenCount}</p>
          <p className="text-xs text-gray-500">Children</p>
        </div>
        <div>
          <Smartphone className="mx-auto h-6 w-6 text-sky-400" />
          <p className="mt-1 text-2xl font-bold text-white">{stats?.devicesCount}</p>
          <p className="text-xs text-gray-500">Devices</p>
        </div>
        <div>
          <ShieldCheck className="mx-auto h-6 w-6 text-orange-400" />
          <p className="mt-1 text-2xl font-bold text-white">{stats?.pendingRequests}</p>
          <p className="text-xs text-gray-500">Requests</p>
        </div>
      </div>
      <Link href="/dashboard/family-guardian" className="block w-full text-center rounded-lg bg-[#7C3AED] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-500">
        Go to Dashboard
      </Link>
    </div>
  );
}