"use client";

import { useState, useEffect, useCallback } from "react";
import * as familyGuardianApi from "@/lib/family-guardian-api";
import UnlockRequestCard, { UnlockRequest } from "@/app/family-guardian/components/UnlockRequestCard";
import LoadingState from "@/app/family-guardian/components/LoadingState";
import EmptyState from "@/app/family-guardian/components/EmptyState";
import { AnimatePresence } from "framer-motion";

export default function UnlockRequestsPage() {
  const [requests, setRequests] = useState<UnlockRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"pending" | "all">("pending");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = filter === "pending" ? { status: "pending" } : {};
      const res = await familyGuardianApi.getUnlockRequests(params);
      if (res.ok) {
        // Assuming the API returns child details populated
        setRequests(res.requests);
      } else {
        setError(res.error || "Failed to load unlock requests.");
      }
    } catch (err) {
      setError("An error occurred while connecting to the server.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleResponse = async (requestId: string, action: "approve" | "deny", duration?: number) => {
    setProcessingId(requestId);
    try {
      const res = await familyGuardianApi.respondToUnlockRequest(requestId, action, duration);
      if (res.success) {
        // Optimistically update the UI
        setRequests(prev => prev.filter(r => r._id !== requestId));
        // Optionally show a success toast
      } else {
        setError(res.error || `Failed to ${action} request.`);
      }
    } catch (err) {
      setError(`An error occurred while trying to ${action} the request.`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Unlock Requests</h1>
        <p className="mt-1 text-gray-400">Review and manage your child's app access requests.</p>
      </div>

      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={() => setFilter("pending")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            filter === "pending" ? "bg-[#7C3AED] text-white" : "bg-[#1F2937] text-gray-300 hover:bg-gray-700"
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            filter === "all" ? "bg-[#7C3AED] text-white" : "bg-[#1F2937] text-gray-300 hover:bg-gray-700"
          }`}
        >
          All
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-400">{error}</div>
      )}

      {loading ? (
        <LoadingState />
      ) : requests.length === 0 ? (
        <EmptyState
          icon="🔓"
          title="No Unlock Requests"
          description={filter === "pending" ? "You're all caught up! There are no pending requests." : "No requests found in this category."}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {requests.map((req) => (
              <UnlockRequestCard
                key={req._id}
                request={req}
                onApprove={(duration) => handleResponse(req._id, "approve", duration)}
                onReject={() => handleResponse(req._id, "deny")}
                isProcessing={processingId === req._id}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}