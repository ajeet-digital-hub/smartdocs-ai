"use client"

import StatusBadge from "./StatusBadge"

interface Device {
  id: string
  name: string
  deviceType: string
  status: string
  connectionStatus: string
  policySyncStatus: string
  lastSeen?: string
  childId?: string
  capabilities?: string[]
}

interface DeviceCardProps {
  device: Device
  childName?: string
  onRename?: () => void
  onAssign?: () => void
  onSync?: () => void
  onRevoke?: () => void
  onView?: () => void
}

const deviceIcons: Record<string, string> = {
  android: "📱",
  ios: "📱",
  "chrome-extension": "🌐",
  "edge-extension": "🌐",
  browser: "🖥️",
  "smart-tv": "📺",
  "android-tv": "📺",
  other: "🔌",
}

const typeLabels: Record<string, string> = {
  android: "Android Phone",
  ios: "iPhone/iPad",
  "chrome-extension": "Chrome Extension",
  "edge-extension": "Edge Extension",
  browser: "Web Browser",
  "smart-tv": "Smart TV",
  "android-tv": "Android TV",
  other: "Other Device",
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return "Never"
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diff = Math.floor((now - date) / 1000)
  if (diff < 60) return "Just now"
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function DeviceCard({ device, childName, onRename, onAssign, onSync, onRevoke, onView }: DeviceCardProps) {
  const icon = deviceIcons[device.deviceType] || "🔌"
  const typeLabel = typeLabels[device.deviceType] || device.deviceType

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-2xl dark:from-slate-800 dark:to-slate-700">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">{device.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{typeLabel}</p>
            {childName && (
              <p className="mt-0.5 text-xs text-purple-600 dark:text-purple-400">
                Assigned to: {childName}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={device.status} />
          <span className="text-xs text-slate-400 dark:text-slate-500">{timeAgo(device.lastSeen)}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <StatusBadge status={device.connectionStatus} />
        <StatusBadge status={device.policySyncStatus || "not-applicable"} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
        {onView && (
          <button onClick={onView} className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
            View Details
          </button>
        )}
        {onRename && (
          <button onClick={onRename} className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
            Rename
          </button>
        )}
        {onAssign && (
          <button onClick={onAssign} className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium text-purple-600 transition-colors hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-950">
            Assign Child
          </button>
        )}
        {onSync && (
          <button onClick={onSync} className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950">
            Sync Policies
          </button>
        )}
        {onRevoke && (
          <button onClick={onRevoke} className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950">
            Revoke
          </button>
        )}
      </div>
    </div>
  )
}

