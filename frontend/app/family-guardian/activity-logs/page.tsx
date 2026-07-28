"use client"

import { useState, useEffect } from "react"
import FamilyGuardianLayout from "../components/FamilyGuardianLayout"
import LoadingState from "../components/LoadingState"
import EmptyState from "../components/EmptyState"
import ChildSelector from "../components/ChildSelector"
import { getActivityLogs } from "@/lib/family-guardian-api"

const actionLabels: Record<string, string> = {
  child_created: "Child profile created",
  device_paired: "Device paired",
  device_revoked: "Device revoked",
  unlock_approved: "Unlock request approved",
  unlock_denied: "Unlock request denied",
  emergency_access_approved: "Emergency access granted",
  emergency_access_denied: "Emergency access denied",
}

const actionIcons: Record<string, string> = {
  child_created: "👶",
  device_paired: "📱",
  device_revoked: "🔌",
  unlock_approved: "🔓",
  unlock_denied: "🔒",
  emergency_access_approved: "🆘",
  emergency_access_denied: "⛔",
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [selectedChildId, setSelectedChildId] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const limit = 20

  async function loadData() {
    setLoading(true)
    const res = await getActivityLogs({ childId: selectedChildId, limit: String(limit), offset: String(page * limit) })
    if (res.ok && res.data) {
      setLogs(res.data.logs || [])
      setTotal(res.data.total || 0)
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [selectedChildId, page])

  const totalPages = Math.ceil(total / limit)

  return (
    <FamilyGuardianLayout title="Activity Logs" subtitle="Audit trail of all Family Guardian actions">
      {loading ? <LoadingState /> : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="w-48">
              <ChildSelector selectedChildId={selectedChildId} onSelect={setSelectedChildId} />
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">{total} total entries</span>
          </div>

          {logs.length === 0 ? (
            <EmptyState icon="📋" title="No activity logs" description="Activity will appear here as you use Family Guardian features." />
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-lg dark:bg-slate-800">
                    {actionIcons[log.action] || "📝"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {actionLabels[log.action] || log.details || log.action}
                    </p>
                    {log.details && log.details !== actionLabels[log.action] && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{log.details}</p>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : "Unknown"}
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
                className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800">
                Previous
              </button>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Page {page + 1} of {totalPages}
              </span>
              <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}
                className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800">
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </FamilyGuardianLayout>
  )
}
