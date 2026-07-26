"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PairDeviceModal from "../../components/PairDeviceModal";

interface Device {
  _id: string;
  deviceId: string;
  deviceName: string;
  platform: "android" | "ios" | "web";
  status: "online" | "offline" | "pending";
  lastSeen: string;
  appVersion?: string;
}

interface ChildData {
  _id: string;
  name: string;
  age: number;
  dateOfBirth?: string;
  avatar?: string;
  currentStatus: string;
  points: number;
  studyStreak: number;
}

type TabId = "overview" | "devices" | "website-blocking" | "app-controls" | "schedules" | "unlock-requests" | "rewards" | "analytics";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "👤" },
  { id: "devices", label: "Devices", icon: "📱" },
  { id: "website-blocking", label: "Website Blocking", icon: "🚫" },
  { id: "app-controls", label: "App Controls", icon: "📲" },
  { id: "schedules", label: "Schedules", icon: "📅" },
  { id: "unlock-requests", label: "Unlock Requests", icon: "🔓" },
  { id: "rewards", label: "Study & Rewards", icon: "⭐" },
  { id: "analytics", label: "Analytics", icon: "📊" },
];

export default function ChildDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [child, setChild] = useState<ChildData | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAge, setEditAge] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPairModal, setShowPairModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status !== "authenticated") return;
    fetchData();
  }, [status, router]);

  async function fetchData() {
    try {
      setLoading(true);
      const [childRes, devicesRes] = await Promise.all([
        fetch(`/api/family/children/${params.id}`),
        fetch(`/api/family-guardian/devices?childId=${params.id}`),
      ]);
      const childData = await childRes.json();
      const devicesData = await devicesRes.json();
      if (childData.ok) {
        setChild(childData.child);
        setEditName(childData.child.name);
        setEditAge(String(childData.child.age));
      } else {
        setError(childData.error || "Child not found");
      }
      if (devicesData.ok) {
        setDevices(devicesData.devices);
      }
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const age = parseInt(editAge, 10);
    if (!editName.trim() || isNaN(age) || age < 1 || age > 18) {
      setError("Please enter a valid name and age");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/family/children/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), age }),
      });
      const data = await res.json();
      if (data.ok) {
        setChild(data.child);
        setEditing(false);
      } else {
        throw new Error(data.error || "Update failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRevokeDevice(deviceId: string) {
    if (!confirm("Revoke this device? It will no longer be able to connect.")) return;
    try {
      const res = await fetch("/api/family-guardian/revoke-device", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      });
      const data = await res.json();
      if (data.ok) {
        setDevices((prev) => prev.filter((d) => d._id !== deviceId));
      } else {
        setError(data.error || "Failed to revoke device");
      }
    } catch {
      setError("Failed to revoke device");
    }
  }

  function getRelativeTime(dateStr: string): string {
    const now = Date.now();
    const date = new Date(dateStr).getTime();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);

    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    return new Date(dateStr).toLocaleDateString();
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case "online": return "bg-green-400";
      case "offline": return "bg-slate-400";
      case "pending": return "bg-yellow-400";
      default: return "bg-slate-400";
    }
  }

  function getStatusLabel(status: string): string {
    switch (status) {
      case "online": return "🟢 Online";
      case "offline": return "⚫ Offline";
      case "pending": return "🟡 Pending";
      default: return status;
    }
  }

  function getPlatformIcon(platform: string): string {
    switch (platform) {
      case "android": return "📱";
      case "ios": return "🍎";
      case "web": return "🌐";
      default: return "💻";
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#141018" }}>
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#141018" }}>
        <div className="text-center">
          <div className="text-red-400 mb-4">{error || "Child not found"}</div>
          <Link href="/dashboard/family-guardian/children" className="text-purple-400 hover:text-purple-300">
            ← Back to Children
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#141018" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Back */}
        <Link href="/dashboard/family-guardian/children" className="text-slate-400 hover:text-white text-sm mb-4 inline-block">
          ← Back to Children
        </Link>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Profile Header */}
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-white font-bold text-2xl">
              {child.avatar || child.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              {editing ? (
                <form onSubmit={handleUpdate} className="flex gap-2">
                  <div>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={editAge}
                      onChange={(e) => setEditAge(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm w-16"
                      min="1" max="18" required
                    />
                  </div>
                  <button type="submit" disabled={submitting} className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs cursor-pointer">
                    {submitting ? "..." : "Save"}
                  </button>
                  <button type="button" onClick={() => setEditing(false)} className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs cursor-pointer">
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-white">{child.name}</h1>
                  <p className="text-slate-400">
                    Age {child.age}
                    {child.dateOfBirth && ` • Born ${new Date(child.dateOfBirth).toLocaleDateString()}`}
                  </p>
                </>
              )}
            </div>
            {!editing && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">
                  {devices.length} device{devices.length !== 1 ? "s" : ""}
                </span>
                <button
                  onClick={() => setEditing(true)}
                  className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-all cursor-pointer"
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-2xl text-cyan-400 font-bold">{child.points}</div>
              <div className="text-xs text-slate-400">Points</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-2xl text-green-400 font-bold">{child.studyStreak}d</div>
              <div className="text-xs text-slate-400">Study Streak</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-2xl text-purple-400 font-bold capitalize">{child.currentStatus}</div>
              <div className="text-xs text-slate-400">Status</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-2xl text-blue-400 font-bold">{devices.filter((d) => d.status === "online").length}</div>
              <div className="text-xs text-slate-400">Devices Online</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-1 min-w-max pb-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-purple-500/30 text-purple-300 border border-purple-500/50"
                    : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
                }`}
              >
                <span className="mr-1.5">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <button
                  onClick={() => setShowPairModal(true)}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-center cursor-pointer"
                >
                  <div className="text-2xl mb-1">📱</div>
                  <div className="text-white text-sm font-medium">Pair Device</div>
                </button>
                <Link
                  href={`/dashboard/family-guardian/schedules?childId=${child._id}`}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-center block"
                >
                  <div className="text-2xl mb-1">📅</div>
                  <div className="text-white text-sm font-medium">Schedules</div>
                </Link>
                <Link
                  href={`/dashboard/family-guardian/blocking?childId=${child._id}`}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-center block"
                >
                  <div className="text-2xl mb-1">🚫</div>
                  <div className="text-white text-sm font-medium">Blocking</div>
                </Link>
                <Link
                  href={`/dashboard/family-guardian/rewards?childId=${child._id}`}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-center block"
                >
                  <div className="text-2xl mb-1">⭐</div>
                  <div className="text-white text-sm font-medium">Rewards</div>
                </Link>
              </div>

              {/* Device Summary in Overview */}
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span>📱</span> Paired Devices
              </h3>
              {devices.length > 0 ? (
                <div className="space-y-2">
                  {devices.slice(0, 3).map((device) => (
                    <div key={device._id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{getPlatformIcon(device.platform)}</span>
                        <div>
                          <div className="text-white text-sm font-medium">{device.deviceName}</div>
                          <div className="text-slate-500 text-xs capitalize">{device.platform} • v{device.appVersion || "?"}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1.5 justify-end">
                          <span className={`w-2 h-2 rounded-full ${getStatusColor(device.status)}`} />
                          <span className="text-xs text-white">{getStatusLabel(device.status)}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Last sync: {getRelativeTime(device.lastSeen)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {devices.length > 3 && (
                    <button
                      onClick={() => setActiveTab("devices")}
                      className="w-full text-center text-sm text-purple-400 hover:text-purple-300 py-2"
                    >
                      View all {devices.length} devices →
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 bg-white/5 rounded-lg">
                  <p className="text-slate-400 text-sm mb-2">No device connected</p>
                  <button
                    onClick={() => setShowPairModal(true)}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-sm font-medium cursor-pointer"
                  >
                    Connect Device
                  </button>
                </div>
              )}

              {/* Architecture Note */}
              <div className="mt-6 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm">
                <strong>📋 Architecture Note:</strong> This dashboard manages policies (block/allow/schedule).
                Actual enforcement requires the Family Guardian mobile app or browser extension.
                The backend APIs are ready for Android app, iOS app, and browser extension integration.
              </div>
            </div>
          )}

          {/* Devices Tab */}
          {activeTab === "devices" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span>📱</span> Devices ({devices.length})
                </h2>
                <button
                  onClick={() => setShowPairModal(true)}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-sm font-medium hover:shadow-lg transition-all cursor-pointer"
                >
                  + Connect Device
                </button>
              </div>

              {devices.length > 0 ? (
                <div className="space-y-3">
                  {devices.map((device) => (
                    <div key={device._id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{getPlatformIcon(device.platform)}</span>
                        <div>
                          <div className="text-white font-medium">{device.deviceName}</div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <span className="capitalize">{device.platform}</span>
                            <span>•</span>
                            <span>v{device.appVersion || "1.0"}</span>
                            <span>•</span>
                            <span>ID: {device.deviceId.substring(0, 8)}...</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1.5 justify-end mb-1">
                          <span className={`w-2.5 h-2.5 rounded-full ${getStatusColor(device.status)}`} />
                          <span className={`text-sm font-medium ${
                            device.status === "online" ? "text-green-400" :
                            device.status === "pending" ? "text-yellow-400" : "text-slate-400"
                          }`}>
                            {device.status === "online" ? "Online" : device.status === "pending" ? "Pending" : "Offline"}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Last sync: {getRelativeTime(device.lastSeen)}
                        </div>
                        <button
                          onClick={() => handleRevokeDevice(device._id)}
                          className="mt-2 text-[10px] text-red-400 hover:text-red-300 underline"
                        >
                          Revoke device
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">📱</div>
                  <h3 className="text-xl font-semibold text-white mb-2">No Device Connected</h3>
                  <p className="text-slate-400 text-sm mb-4 max-w-sm mx-auto">
                    Connect {child.name}&apos;s device to start enforcing policies,
                    detect installed apps, and track screen time.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => setShowPairModal(true)}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-sm cursor-pointer"
                    >
                      Connect Android Device
                    </button>
                  </div>
                  <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 inline-block">
                    <p className="text-yellow-300 text-xs">
                      ⚠️ Without a connected device, app detection and screen time tracking are unavailable.
                      Install the Family Guardian mobile app on the child&apos;s device.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Website Blocking Tab */}
          {activeTab === "website-blocking" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Website Blocking</h2>
                <Link
                  href={`/dashboard/family-guardian/blocking?childId=${child._id}`}
                  className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 text-sm hover:bg-purple-500/30 transition-all"
                >
                  Manage Websites →
                </Link>
              </div>
              <p className="text-slate-400 text-sm">
                Configure website blocking policies, schedules, and daily limits for {child.name}.
                Click the button above to access the full website blocking dashboard.
              </p>
              {devices.length === 0 && (
                <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-yellow-300 text-xs">
                    ⚠️ No device connected. Policies will be applied when a device is paired.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* App Controls Tab */}
          {activeTab === "app-controls" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">App Controls</h2>
                <Link
                  href={`/dashboard/family-guardian/blocking?childId=${child._id}`}
                  className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 text-sm hover:bg-purple-500/30 transition-all"
                >
                  Manage Apps →
                </Link>
              </div>
              {devices.length > 0 ? (
                <div>
                  <p className="text-slate-400 text-sm mb-4">
                    App controls allow you to block, allow, or set time limits for apps on {child.name}&apos;s device.
                    The "Installed" status is reported by the connected device.
                  </p>
                  <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 mb-4">
                    <p className="text-cyan-300 text-xs">
                      ✅ Device connected — app detection data will appear once the device reports installed apps.
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-slate-400 text-sm mb-4">
                    App controls allow you to manage applications on {child.name}&apos;s device.
                    Connect a device to detect installed apps and enforce policies.
                  </p>
                  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <p className="text-yellow-300 text-sm font-medium mb-2">⏳ Not Connected</p>
                    <p className="text-yellow-200/70 text-xs">
                      Connect {child.name}&apos;s device to:
                    </p>
                    <ul className="text-yellow-200/70 text-xs mt-1 space-y-1 list-disc list-inside">
                      <li>Detect which apps are installed on the device</li>
                      <li>Apply block/allow/time limit policies</li>
                      <li>Track app usage and screen time</li>
                      <li>View real-time device status</li>
                    </ul>
                    <button
                      onClick={() => setShowPairModal(true)}
                      className="mt-3 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-sm font-medium cursor-pointer"
                    >
                      Connect Device Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Schedules Tab */}
          {activeTab === "schedules" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Schedules</h2>
                <Link
                  href={`/dashboard/family-guardian/schedules?childId=${child._id}`}
                  className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 text-sm hover:bg-purple-500/30 transition-all"
                >
                  Manage Schedules →
                </Link>
              </div>
              <p className="text-slate-400 text-sm">
                Manage study time, sleep time, and free time schedules for {child.name}.
              </p>
            </div>
          )}

          {/* Unlock Requests Tab */}
          {activeTab === "unlock-requests" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Unlock Requests</h2>
                <Link
                  href="/dashboard/family-guardian/unlock-requests"
                  className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 text-sm hover:bg-purple-500/30 transition-all"
                >
                  View All →
                </Link>
              </div>
              <p className="text-slate-400 text-sm">
                Review and approve/deny unlock requests from {child.name}.
              </p>
            </div>
          )}

          {/* Rewards Tab */}
          {activeTab === "rewards" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Study & Rewards</h2>
                <Link
                  href={`/dashboard/family-guardian/rewards?childId=${child._id}`}
                  className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 text-sm hover:bg-purple-500/30 transition-all"
                >
                  Manage Rewards →
                </Link>
              </div>
              <p className="text-slate-400 text-sm">
                Manage study goals and screen time rewards for {child.name}.
              </p>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Analytics</h2>
                <Link
                  href="/dashboard/family-guardian/analytics"
                  className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 text-sm hover:bg-purple-500/30 transition-all"
                >
                  View Analytics →
                </Link>
              </div>
              {devices.length > 0 ? (
                <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                  <p className="text-cyan-300 text-xs">
                    ✅ Device connected. Analytics will include device-reported data once available.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-yellow-300 text-xs">
                    ⏳ Connect a device to see screen time and app usage analytics.
                    Currently showing policy-based metrics only.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pair Device Modal */}
      <PairDeviceModal
        childId={child._id}
        childName={child.name}
        isOpen={showPairModal}
        onClose={() => setShowPairModal(false)}
      />
    </div>
  );
}

