"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PairDeviceModal from "../../components/PairDeviceModal";

interface Device {
  name: string;
  type: string;
  deviceId?: string;
  pairedAt?: string;
  lastSeenAt?: string;
  status: "online" | "offline" | "locked" | "unlocked";
}

interface ChildData {
  _id: string;
  name: string;
  age: number;
  dateOfBirth?: string;
  avatar?: string;
  devices: Device[];
  currentStatus: string;
  points: number;
  studyStreak: number;
}

export default function ChildDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [child, setChild] = useState<ChildData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAge, setEditAge] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPairModal, setShowPairModal] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status !== "authenticated") return;
    fetchChild();
  }, [status, router]);

  async function fetchChild() {
    try {
      setLoading(true);
      const res = await fetch(`/api/family/children/${params.id}`);
      const data = await res.json();
      if (data.ok) {
        setChild(data.child);
        setEditName(data.child.name);
        setEditAge(String(data.child.age));
      } else {
        setError(data.error || "Child not found");
      }
    } catch {
      setError("Failed to load child");
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Back */}
        <Link href="/dashboard/family-guardian/children" className="text-slate-400 hover:text-white text-sm mb-6 inline-block">
          ← Back to Children
        </Link>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
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
                      min="1"
                      max="18"
                      required
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
                  <p className="text-slate-400">Age {child.age}</p>
                </>
              )}
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-all cursor-pointer"
              >
                Edit
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
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
          </div>
        </div>

{/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Link
            href={`/dashboard/family-guardian/schedules?childId=${child._id}`}
            className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 hover:bg-white/10 transition-all text-center"
          >
            <div className="text-2xl mb-2">📅</div>
            <div className="text-white font-medium text-sm">Schedules</div>
          </Link>
          <Link
            href={`/dashboard/family-guardian/blocking?childId=${child._id}`}
            className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 hover:bg-white/10 transition-all text-center"
          >
            <div className="text-2xl mb-2">🚫</div>
            <div className="text-white font-medium text-sm">App & Website Blocking</div>
          </Link>
          <Link
            href={`/dashboard/family-guardian/rewards?childId=${child._id}`}
            className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 hover:bg-white/10 transition-all text-center"
          >
            <div className="text-2xl mb-2">⭐</div>
            <div className="text-white font-medium text-sm">Rewards</div>
          </Link>
          <button
            onClick={() => setShowPairModal(true)}
            className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 hover:bg-white/10 transition-all text-center cursor-pointer"
          >
            <div className="text-2xl mb-2">📱</div>
            <div className="text-white font-medium text-sm">Pair Device</div>
          </button>
        </div>

        {/* Paired Devices Section */}
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>📱</span> Paired Devices
            </h2>
            <button
              onClick={() => setShowPairModal(true)}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-xs font-medium hover:shadow-lg transition-all cursor-pointer"
            >
              + Pair New Device
            </button>
          </div>
          {child.devices && child.devices.length > 0 ? (
            <div className="space-y-2">
              {child.devices.map((device, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {device.type === "browser" ? "🌐" : device.type === "android" ? "📱" : device.type === "ios" ? "📱" : "💻"}
                    </span>
                    <div>
                      <div className="text-white text-sm font-medium">{device.name}</div>
                      <div className="text-slate-500 text-xs capitalize">{device.type}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      device.status === "online" ? "bg-green-400" :
                      device.status === "locked" ? "bg-red-400" :
                      "bg-slate-400"
                    }`} />
                    <span className={`text-xs capitalize ${
                      device.status === "online" ? "text-green-400" :
                      device.status === "locked" ? "text-red-400" :
                      "text-slate-400"
                    }`}>
                      {device.status}
                    </span>
                    {device.lastSeenAt && (
                      <span className="text-[10px] text-slate-600">
                        Last seen: {new Date(device.lastSeenAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📱</div>
              <p className="text-slate-400 text-sm mb-3">No devices paired yet</p>
              <p className="text-slate-500 text-xs mb-4">
                Pair a device to start enforcing app and website blocking policies
              </p>
              <button
                onClick={() => setShowPairModal(true)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-sm font-medium hover:shadow-lg transition-all cursor-pointer"
              >
                Pair Device
              </button>
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
