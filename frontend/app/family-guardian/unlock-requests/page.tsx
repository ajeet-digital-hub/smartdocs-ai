"use client"

import { useState, useEffect } from "react"
import FamilyGuardianLayout from "../components/FamilyGuardianLayout"
import LoadingState from "../components/LoadingState"
import EmptyState from "../components/EmptyState"
import StatusBadge from "../components/StatusBadge"
import { getUnlockRequests, respondToUnlockRequest } from "@/lib/family-guardian-api"

export default function UnlockRequestsPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("pending")
  const [processing, setProcessing] = useState<string | null>(null)

  async function loadData() {
    setLoading(true)
    const res = await getUnlockRequests({ status: filter })
    if (res.ok && res.data?.requests) setRequests(res.data.requests)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [filter])

  async function handleRespond(requestId: string, action: "approve" | "deny", durationMinutes?: number) {
    setProcessing(requestId)
    const res = await respondToUnlockRequest(requestId, action, durationMinutes)
    if (res.ok) {
      await loadData()
    } else {
      alert(res.error || "Failed to respond.")
    }
    setProcessing(null)
  }

  return (
    <FamilyGuardianLayout title="Unlock Requests" subtitle="Review and respond to requests from children to access blocked content">
      {loading ? <LoadingState /> : (
        <div className="space-y-6">
          <div className="flex gap-2">
            {["pending", "approved", "denied"].map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${filter === s ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"}`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {requests.length === 0 ? (
            <EmptyState icon="🔓" title="No unlock requests" description={filter === "pending" ? "No pending requests. Children can request access when blocked." : "No requests in this category."} />
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div key={req.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🔓</span>
                        <h3 className="font-semibold text-slate-900 dark:text-white">{req.targetDomain || req.targetApp || "Content"}</h3>
                        <StatusBadge status={req.status} />
                      </div>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {req.reason || "No reason provided"}
                      </p>
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                        Requested {new Date(req.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {req.status === "pending" && (
                    <div className="mt-4 flex gap-2">
                      <button onClick={() => handleRespond(req.id, "approve", 10)} disabled={processing === req.id}
                        className="cursor-pointer rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50">
                        Allow 10 min
                      </button>
                      <button onClick={() => handleRespond(req.id, "approve", 30)} disabled={processing === req.id}
                        className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50">
                        Allow 30 min
                      </button>
                      <button onClick={() => handleRespond(req.id, "deny")} disabled={processing === req.id}
                        className="cursor-pointer rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:bg-transparent dark:text-red-400 disabled:opacity-50">
                        Deny
                      </button>
                    </div>
                  )}
                  {req.status !== "pending" && (
                    <div className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                      {req.status === "approved" ? `Approved for ${req.approvedDurationMinutes || "?"} minutes` : "Denied"}
                      {req.respondedAt && ` · ${new Date(req.respondedAt).toLocaleString()}`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </FamilyGuardianLayout>
  )
}
