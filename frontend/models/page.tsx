"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function AdminSubscriptionsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate fetching data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Admin: Subscriptions</h1>
      {loading ? (
        <div className="text-gray-400">Loading subscriptions data...</div>
      ) : error ? (
        <div className="text-red-400">Error: {error}</div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-gray-300">This panel will allow admins to:</p>
          <ul className="list-disc list-inside text-gray-400 mt-4 space-y-2">
            <li>View all user subscriptions</li>
            <li>Change user plans (upgrade/downgrade)</li>
            <li>Activate/cancel subscriptions</li>
            <li>View usage analytics</li>
            <li>Manage billing cycles</li>
          </ul>
          <div className="mt-8 p-4 bg-gray-800 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Subscription Table (Coming Soon)</h2>
            <p className="text-gray-500">Table to display all subscriptions with filters and actions.</p>
          </div>
          <div className="mt-4 p-4 bg-gray-800 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Plan Manager (Coming Soon)</h2>
            <p className="text-gray-500">Interface to manage available plans and their features.</p>
          </div>
          <div className="mt-4 p-4 bg-gray-800 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Usage Analytics (Coming Soon)</h2>
            <p className="text-gray-500">Dashboard to monitor feature usage across all users.</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}