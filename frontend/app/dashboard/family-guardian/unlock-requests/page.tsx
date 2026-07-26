"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UnlockRequest {
  _id: string;
  childId: { _id: string; name: string; age: number; avatar?: string };
  websiteId?: { _id: string; name: string; domain: string };
  websiteName: string;
  websiteDomain: string;
  reason: string;
  type: "normal" | "emergency";
  status: string;
  approvedUntil?: string;
  deniedReason?: string;
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  approved_once: "bg-green-500/20 text-green-400",
  approved_10min: "bg-green-500/20 text-green-400",
  approved_30min: "bg-green-500/20 text-green-400",
  denied: "bg-red-500/20 text-red-400",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  approved_once: "Approved (Once)",
  approved_10min: "Approved (10 min)",
  approved_30min: "Approved (30 min)",
  denied: "Denied",
};

export default function UnlockRequestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<UnlockRequest[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function fetchRequests() {
    try {
      const res = await fetch("/api/family/unlock-requests");
      const data = await res.json();
      if (data.ok) {
        setRequests(data.requests);
        setPendingCount(data.pendingCount);
      }
    } catch {
      setError("Failed to load unlock requests");
    }
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status !== "authenticated") return;
    fetchRequests();
  }, [status, router]);

  async function handleAction(requestId: string, action: string) {
    setProcessingId(requestId);
    setError(null);
    try {
      const res = await fetch(`/api/family/unlock-requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
      const data = await res.json();
      if (data.ok) {
        await fetchRequests();
      } else {
        throw new Error(data.error || "Action failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setProcessingId(null);
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#141018" }}>
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#141018" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <Link href="/dashboard/family-guardian" className="text-slate-400 hover:text-white text-sm mb-2 inline-block">
            ← Back to Family Guardian
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Unlock Requests</h1>
            {pendingCount > 0 && (
              <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-semibold">
                {pendingCount} pending
              </span>
            )}
          </div>
          <p className="text-slate-400 mt-1">Approve or deny requests from children to access blocked websites</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {requests.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-12 text-center">
            <div className="text-5xl mb-4">🔓</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Unlock Requests</h3>
            <p className="text-slate-400">When children request access to blocked websites, requests will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => {
              const isPending = req.status === "pending";
              const childName = typeof req.childId === "object" ? req.childId.name : "Unknown";
              const isEmergency = req.type === "emergency";

              return (
                <div
                  key={req._id}
                  className={`rounded-xl border p-4 transition-all ${
                    isPending
                      ? "border-yellow-500/30 bg-yellow-500/5"
                      : isEmergency
                      ? "border-red-500/30 bg-red-500/5"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-semibold">{childName}</span>
                        {isEmergency && (
                          <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs font-bold">
                            🚨 EMERGENCY
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[req.status] || ""}`}>
                          {STATUS_LABELS[req.status] || req.status}
                        </span>
                      </div>
                      <p className="text-white font-medium">
                        {req.websiteName} <span className="text-slate-400 text-sm">({req.websiteDomain})</span>
                      </p>
                      <p className="text-slate-400 text-sm mt-1">
                        Reason: {req.reason}
                      </p>
                      <p className="text-slate-500 text-xs mt-1">
                        {new Date(req.createdAt).toLocaleString()}
                        {req.approvedUntil && ` • Approved until ${new Date(req.approvedUntil).toLocaleTimeString()}`}
                      </p>
                    </div>

                    {isPending && (
                      <div className="flex flex-col gap-2 ml-4">
                        <button
                          onClick={() => handleAction(req._id, "approved_once")}
                          disabled={processingId === req._id}
                          className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-medium hover:bg-green-500/30 transition-all disabled:opacity-50 cursor-pointer"
                        >
                          Allow Once
                        </button>
                        <button
                          onClick={() => handleAction(req._id, "approved_10min")}
                          disabled={processingId === req._id}
                          className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 text-xs font-medium hover:bg-cyan-500/30 transition-all disabled:opacity-50 cursor-pointer"
                        >
                          10 Minutes
                        </button>
                        <button
                          onClick={() => handleAction(req._id, "approved_30min")}
                          disabled={processingId === req._id}
                          className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-medium hover:bg-blue-500/30 transition-all disabled:opacity-50 cursor-pointer"
                        >
                          30 Minutes
                        </button>
                        <button
                          onClick={() => handleAction(req._id, "denied")}
                          disabled={processingId === req._id}
                          className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/30 transition-all disabled:opacity-50 cursor-pointer"
                        >
                          Deny
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
