"use client"

import { useState, useEffect } from "react"
import FamilyGuardianLayout from "../components/FamilyGuardianLayout"
import LoadingState from "../components/LoadingState"
import EmptyState from "../components/EmptyState"
import DeviceCard from "../components/DeviceCard"
import { getDevices, initiatePairing, revokeDevice, syncDevicePolicies, getChildren, renameDevice, assignChildToDevice } from "@/lib/family-guardian-api"

export default function DevicesPage() {
  const [devices, setDevices] = useState<any[]>([])
  const [children, setChildren] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showPair, setShowPair] = useState(false)
  const [pairForm, setPairForm] = useState({ childId: "", deviceType: "browser", deviceName: "" })
  const [pairingResult, setPairingResult] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  async function loadData() {
    setLoading(true)
    const [devRes, childRes] = await Promise.all([getDevices(), getChildren()])
    if (devRes.ok && devRes.data?.devices) setDevices(devRes.data.devices)
    if (childRes.ok && childRes.data?.children) setChildren(childRes.data.children)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  async function handlePair(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setPairingResult(null)
    const res = await initiatePairing({
      childId: pairForm.childId || undefined,
      deviceType: pairForm.deviceType,
      deviceName: pairForm.deviceName,
    })
    if (res.ok && res.data) {
      setPairingResult(res.data)
    } else {
      alert(res.error || "Failed to initiate pairing.")
    }
    setSaving(false)
  }

  async function handleRevoke(deviceId: string) {
    if (!confirm("Revoke this device? It will be disconnected from your family.")) return
    const res = await revokeDevice(deviceId)
    if (res.ok) {
      await loadData()
    } else {
      alert(res.error || "Failed to revoke device.")
    }
  }

  async function handleSync(deviceId: string) {
    const res = await syncDevicePolicies(deviceId)
    if (res.ok) {
      await loadData()
    } else {
      alert(res.error || "Failed to sync policies.")
    }
  }

  async function handleRename(deviceId: string, name: string) {
    const res = await renameDevice(deviceId, name)
    if (res.ok) {
      await loadData()
    } else {
      alert(res.error || "Failed to rename device.")
    }
  }

  async function handleAssign(deviceId: string, childId: string) {
    const res = await assignChildToDevice(deviceId, childId)
    if (res.ok) {
      await loadData()
    } else {
      alert(res.error || "Failed to assign child.")
    }
  }

  const getChildName = (childId: string) => {
    const child = children.find((c) => c.id === childId)
    return child ? child.name : undefined
  }

  const deviceTypes = [
    { value: "android", label: "Android Phone" },
    { value: "ios", label: "iPhone/iPad" },
    { value: "chrome-extension", label: "Chrome Extension" },
    { value: "edge-extension", label: "Edge Extension" },
    { value: "browser", label: "Web Browser" },
    { value: "smart-tv", label: "Smart TV" },
    { value: "android-tv", label: "Android TV" },
  ]

  return (
    <FamilyGuardianLayout
      title="Connected Devices"
      subtitle="Manage devices connected to your Family Guardian"
    >
      {loading ? (
        <LoadingState />
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => { setShowPair(true); setPairingResult(null) }}
              className="cursor-pointer rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md"
            >
              + Connect New Device
            </button>
          </div>

          {/* Pairing Modal */}
          {showPair && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              {pairingResult ? (
                <div className="text-center">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 text-3xl dark:from-purple-900 dark:to-pink-900">
                    📲
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Device Pairing Initiated</h3>
                  <div className="mt-6 rounded-xl bg-slate-50 p-6 dark:bg-slate-800">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Pairing Code</p>
                    <p className="mt-2 text-3xl font-bold tracking-widest text-purple-600 dark:text-purple-400">
                      {pairingResult.pairingCode}
                    </p>
                    <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                      This code expires in 15 minutes. Enter it on the device to complete pairing.
                    </p>
                  </div>
                  <div className="mt-6 flex justify-center gap-3">
                    <button
                      onClick={() => { setShowPair(false); setPairingResult(null) }}
                      className="cursor-pointer rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Connect New Device</h3>
                  <form onSubmit={handlePair} className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Device Name</label>
                      <input
                        type="text"
                        value={pairForm.deviceName}
                        onChange={(e) => setPairForm({ ...pairForm, deviceName: e.target.value })}
                        placeholder="e.g. Rahul's Phone"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Device Type</label>
                      <select
                        value={pairForm.deviceType}
                        onChange={(e) => setPairForm({ ...pairForm, deviceType: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                      >
                        {deviceTypes.map((dt) => (
                          <option key={dt.value} value={dt.value}>{dt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Assign to Child <span className="text-slate-400">(optional)</span>
                      </label>
                      <select
                        value={pairForm.childId}
                        onChange={(e) => setPairForm({ ...pairForm, childId: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                      >
                        <option value="">Not assigned yet</option>
                        {children.map((child) => (
                          <option key={child.id} value={child.id}>
                            {child.name} (Age {child.age})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={saving}
                        className="cursor-pointer rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
                      >
                        {saving ? "Generating Code..." : "Generate Pairing Code"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPair(false)}
                        className="cursor-pointer rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* Devices List */}
          {devices.length === 0 && !showPair ? (
            <EmptyState
              icon="📱"
              title="No devices connected"
              description="Connect your first device to start managing screen time across platforms."
              action={{ label: "Connect Device", onClick: () => setShowPair(true) }}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {devices.map((device) => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  childName={getChildName(device.childId)}
                  onView={() => {}}
                  onRename={() => {
                    const name = prompt("Rename device:", device.name)
                    if (name && name.trim()) handleRename(device.id, name.trim())
                  }}
                  onAssign={() => {
                    const childId = prompt("Enter child ID to assign:")
                    if (childId) handleAssign(device.id, childId)
                  }}
                  onSync={() => handleSync(device.id)}
                  onRevoke={() => handleRevoke(device.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </FamilyGuardianLayout>
  )
}

