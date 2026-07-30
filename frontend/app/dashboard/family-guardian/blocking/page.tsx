"use client"

import { useState, useEffect, useMemo } from "react";
import * as familyGuardianApi from "@/lib/family-guardian-api";
import { APPLICATION_CATALOG, CATEGORY_COLORS } from "@/data/application-catalog";
import LoadingState from "@/app/family-guardian/components/LoadingState";
import EmptyState from "@/app/family-guardian/components/EmptyState";
import ChildSelector from "@/app/family-guardian/components/ChildSelector";
import StatusBadge from "@/app/family-guardian/components/StatusBadge";
import { motion } from "framer-motion";

interface Child {
  id: string;
  name: string;
  age: number;
}

interface AppPolicy {
  _id?: string;
  appId: string;
  status: "ALLOWED" | "LIMITED" | "SCHEDULED" | "BLOCKED";
  dailyLimitMinutes?: number;
  scheduleBlocks?: any[];
}

export default function AppBlockingPage() {
  const [selectedChildId, setSelectedChildId] = useState<string | undefined>();
  const [policies, setPolicies] = useState<Record<string, AppPolicy>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  useEffect(() => {
    if (selectedChildId) {
      fetchPolicies(selectedChildId);
    } else {
      // Clear policies if no child is selected
      setPolicies({});
      setLoading(false);
    }
  }, [selectedChildId]);

  async function fetchPolicies(childId: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await familyGuardianApi.getAppPolicies({ childId });
      if (res.ok) {
        const policyMap = res.policies.reduce((acc, policy) => {
          acc[policy.appId] = policy;
          return acc;
        }, {} as Record<string, AppPolicy>);
        setPolicies(policyMap);
      } else {
        setError(res.error || "Failed to load policies.");
      }
    } catch (err) {
      setError("An error occurred while connecting to the server.");
    } finally {
      setLoading(false);
    }
  }

  const handlePolicyChange = async (appId: string, newStatus: AppPolicy['status'], details: Partial<AppPolicy> = {}) => {
    if (!selectedChildId) return;

    const existingPolicy = policies[appId];
    const optimisticPolicy: AppPolicy = {
      ...existingPolicy,
      _id: existingPolicy?._id,
      appId,
      status: newStatus,
      ...details,
    };

    // Optimistic UI update
    setPolicies(prev => ({ ...prev, [appId]: optimisticPolicy }));

    try {
      const payload = {
        childId: selectedChildId,
        appId,
        appName: APPLICATION_CATALOG.find(app => app.appId === appId)?.name || "Unknown App",
        category: APPLICATION_CATALOG.find(app => app.appId === appId)?.category || "custom",
        status: newStatus,
        ...details,
      };

      if (existingPolicy?._id) {
        await familyGuardianApi.updateAppPolicy(existingPolicy._id, payload);
      } else {
        await familyGuardianApi.createAppPolicy(payload);
      }
      // Re-fetch to get the latest state from the server, including the new _id
      fetchPolicies(selectedChildId);
    } catch (err) {
      setError(`Failed to save policy for ${appId}.`);
      // Revert optimistic update on failure
      setPolicies(prev => ({ ...prev, [appId]: existingPolicy }));
    }
  };

  const categories = useMemo(() => ["All", ...new Set(APPLICATION_CATALOG.map(app => app.category))], []);

  const filteredApps = useMemo(() => {
    return APPLICATION_CATALOG.filter(app => {
      const matchesCategory = categoryFilter === "All" || app.category === categoryFilter;
      const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [categoryFilter, searchTerm]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">App Blocking</h1>
        <p className="mt-1 text-gray-400">Manage application access and schedules for your children.</p>
      </div>

      <div className="mb-6 max-w-xs">
        <ChildSelector selectedChildId={selectedChildId} onSelect={setSelectedChildId} label="Select a Child to Manage" />
      </div>

      {!selectedChildId ? (
        <EmptyState icon="👨‍👩‍👧‍👦" title="Select a Child" description="Please select a child from the dropdown above to manage their app policies." />
      ) : loading ? (
        <LoadingState />
      ) : error ? (
        <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-400">{error}</div>
      ) : (
        <div>
          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border-gray-700 bg-gray-800 px-4 py-2 text-sm text-white focus:border-purple-500 focus:ring-purple-500 sm:w-1/2"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-lg border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-purple-500 focus:ring-purple-500 sm:w-auto"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          {/* App Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredApps.map(app => {
              const policy = policies[app.appId];
              const status = policy?.status || (app.defaultBlocked ? "BLOCKED" : "ALLOWED");

              return (
                <motion.div
                  key={app.appId}
                  layout
                  className="rounded-2xl border border-[#1F2937] bg-[#111827] p-4 shadow-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{app.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{app.name}</h3>
                      <p className={`text-xs font-medium ${CATEGORY_COLORS[app.category] || 'text-gray-400'}`}>{app.category}</p>
                    </div>
                    <StatusBadge status={status} />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-gray-800 pt-4 text-xs">
                    <button
                      onClick={() => handlePolicyChange(app.appId, "ALLOWED")}
                      className={`rounded-md py-2 font-medium transition-colors ${status === "ALLOWED" ? "bg-green-500/20 text-green-400" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                    >
                      Allow
                    </button>
                    <button
                      onClick={() => handlePolicyChange(app.appId, "BLOCKED")}
                      className={`rounded-md py-2 font-medium transition-colors ${status === "BLOCKED" ? "bg-red-500/20 text-red-400" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                    >
                      Block
                    </button>
                    <button
                      onClick={() => {
                        const newLimit = prompt("Enter daily limit in minutes:", policy?.dailyLimitMinutes?.toString() || "60");
                        if (newLimit && !isNaN(parseInt(newLimit))) {
                          handlePolicyChange(app.appId, "LIMITED", { dailyLimitMinutes: parseInt(newLimit) });
                        }
                      }}
                      className={`rounded-md py-2 font-medium transition-colors ${status === "LIMITED" ? "bg-orange-500/20 text-orange-400" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                    >
                      Limit
                    </button>
                    <button
                      onClick={() => {
                        // In a real app, this would open a schedule modal
                        alert("Schedule UI not implemented yet. Setting a default schedule.");
                        handlePolicyChange(app.appId, "SCHEDULED", {
                          scheduleBlocks: [{ startTime: "09:00", endTime: "17:00", daysOfWeek: ["mon", "tue", "wed", "thu", "fri"] }]
                        });
                      }}
                      className={`rounded-md py-2 font-medium transition-colors ${status === "SCHEDULED" ? "bg-sky-500/20 text-sky-400" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                    >
                      Schedule
                    </button>
                  </div>
                  {status === "LIMITED" && policy?.dailyLimitMinutes && (
                    <p className="mt-2 text-center text-xs text-orange-400">{policy.dailyLimitMinutes} min/day</p>
                  )}
                  {status === "SCHEDULED" && (
                    <p className="mt-2 text-center text-xs text-sky-400">Scheduled</p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}