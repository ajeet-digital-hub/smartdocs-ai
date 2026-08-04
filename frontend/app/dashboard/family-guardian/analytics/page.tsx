"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import * as familyGuardianApi from "@/lib/family-guardian-api";
import LoadingState from "@/app/family-guardian/components/LoadingState";
import EmptyState from "@/app/family-guardian/components/EmptyState";
import StatCard from "@/app/family-guardian/components/StatCard";
import { motion } from "framer-motion";
import { Clock, Shield, BookOpen, Lock, Smartphone } from "lucide-react";

interface AnalyticsData {
  totalScreenTime: number;
  mostUsedApps: {
    appName: string;
    usageTime: number;
  }[];
  blockedAttempts: number;
  unlockRequests: number;
  studyProgress: number;
  devicesOnline: number;
  screenTimeByDay: {
    day: string;
    minutes: number;
  }[];
}

export default function ChildAnalyticsPage() {
  const params = useParams();
  const childId = params.childId as string;
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<"day" | "week" | "month">("week");

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      setError(null);
      try {
        const data = await familyGuardianApi.getAnalytics(childId, { period }); // Pass childId directly
        if (data.ok) {
          setAnalyticsData(data.analytics);
        } else {
          setError(data.error || "Failed to load analytics data.");
        }
      } catch (err) {
        setError("Failed to connect to the server.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [childId, period]);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4">{error}</div>;
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Analytics for Child ID: {childId}</h2>

      <div className="mb-6 flex space-x-2">
        <button
          onClick={() => setPeriod("day")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${period === "day" ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
        >
          Daily
        </button>
        <button
          onClick={() => setPeriod("week")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${period === "week" ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
        >
          Weekly
        </button>
        <button
          onClick={() => setPeriod("month")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${period === "month" ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
        >
          Monthly
        </button>
      </div>

      {!analyticsData || (!analyticsData.totalScreenTime && analyticsData.mostUsedApps?.length === 0 && analyticsData.blockedAttempts === 0 && analyticsData.unlockRequests === 0) ? (
        <EmptyState
          icon="📊"
          title="No Analytics Data Yet"
          description="Connect a device and ensure it's reporting usage to see analytics for this child."
        />
      ) : analyticsData ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Total Screen Time"
              value={`${analyticsData.totalScreenTime || 0} min`}
              icon={Clock}
              color="purple"
            />
            <StatCard
              label="Blocked Attempts"
              value={analyticsData.blockedAttempts || 0}
              icon={Shield}
              color="red"
            />
            <StatCard
              label="Unlock Requests"
              value={analyticsData.unlockRequests || 0}
              icon={Lock}
              color="orange"
            />
            <StatCard
              label="Devices Online"
              value={analyticsData.devicesOnline || 0}
              icon={Smartphone}
              color="green"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Screen Time Chart Placeholder */}
            <div className="bg-gray-700 p-4 rounded-lg h-64 flex items-center justify-center text-gray-400">
              Screen Time Chart ({period}) - Data Visualization Coming Soon
            </div>

            {/* Most Used Apps */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Most Used Apps</h3>
              {analyticsData.mostUsedApps && analyticsData.mostUsedApps.length > 0 ? (
                <ul className="space-y-2">
                  {analyticsData.mostUsedApps.map((app: any, index: number) => (
                    <li key={index} className="flex justify-between items-center text-gray-300">
                      <span>{app.appName}</span>
                      <span className="font-medium">{app.usageTime} min</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 text-sm">No app usage data available.</p>
              )}
            </div>

            {/* Activity Timeline Placeholder */}
            <div className="lg:col-span-2 bg-gray-700 p-4 rounded-lg h-48 flex items-center justify-center text-gray-400">
              Device Activity Timeline - Data Visualization Coming Soon
            </div>
          </div>
        </motion.div>
      ) : (
        <p className="text-gray-400">No analytics data available yet. Ensure a device is connected and reporting usage.</p>
      )}
    </div>
  );
}