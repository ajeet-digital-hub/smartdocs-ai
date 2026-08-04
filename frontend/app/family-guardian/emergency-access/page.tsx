"use client"

import { useState, useEffect } from "react"
import FamilyGuardianLayout from "../components/FamilyGuardianLayout"
import LoadingState from "../components/LoadingState"
import EmptyState from "../components/EmptyState"
import StatusBadge from "../components/StatusBadge"
import { getEmergencyRequests, respondToEmergencyRequest } from "@/lib/family-guardian-api"

export default function EmergencyAccessPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  async function loadData() {
    setLoading(true)
    const res = await getEmergencyRequests()
    if (res.ok && res.data?.requests) setRequests(res.data.requests)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  async function handleRespond(requestId: string, action: "approve" | "deny", durationMinutes?: number) {
    setProcessing(requestId)
    const res = await respondToEmergencyRequest(requestId, action, durationMinutes)
    if (res.ok) {
      await loadData()
    } else {
      alert(res.error || "Failed to respond.")
    }
    setProcessing(null)
  }

  return (
    <FamilyGuardianLayout title="Emergency Access" subtitle="Handle emergency access requests from children">
      {loading ? <LoadingState /> : (
        <div className="space-y-6">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            <strong>⚠️ Emergency Access</strong>
            <p className="mt-1">When a child requests emergency access, it means they need temporary access outside of normal schedules. Review each request carefully.</p>
          </div>

          {requests.length === 0 ? (
            <EmptyState icon="🆘" title="No emergency requests" description="Children can request emergency access when they need it urgently." />
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div key={req.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🆘</span>
                        <h3 className="font-semibold text-slate-900 dark:text-white">Emergency Request</h3>
                        <StatusBadge status={req.status} />
                      </div>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{req.reason || "No reason provided"}</p>
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                        Requested {req.createdAt ? new Date(req.createdAt).toLocaleString() : "Unknown"}
                        {req.requestedDurationMinutes && ` · ${req.requestedDurationMinutes} min requested`}
                      </p>
                    </div>
                  </div>
                  {req.status === "pending" && (
                    <div className="mt-4 flex gap-2">
                      <button onClick={() => handleRespond(req.id, "approve", 5)} disabled={processing === req.id}
                        className="cursor-pointer rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
                        5 min
                      </button>
                      <button onClick={() => handleRespond(req.id, "approve", 10)} disabled={processing === req.id}
                        className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                        10 min
                      </button>
                      <button onClick={() => handleRespond(req.id, "approve", 30)} disabled={processing === req.id}
                        className="cursor-pointer rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50">
                        30 min
                      </button>
                      <button onClick={() => handleRespond(req.id, "deny")} disabled={processing === req.id}
                        className="cursor-pointer rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:bg-transparent dark:text-red-400 disabled:opacity-50">
                        Deny
                      </button>
                    </div>
                  )}
                  {req.status !== "pending" && (
                    <div className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                      {req.status === "approved" ? `Approved for ${req.approvedDurationMinutes || "?"} min` : "Denied"}
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
