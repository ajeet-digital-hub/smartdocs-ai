"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import PairDeviceModal from "../components/PairDeviceModal";

// ─── Common App Definitions ───
const COMMON_APPS = [
  { id: "youtube", name: "YouTube", icon: "▶️", category: "entertainment", domains: ["youtube.com", "youtu.be"] },
  { id: "instagram", name: "Instagram", icon: "📸", category: "social", domains: ["instagram.com"] },
  { id: "facebook", name: "Facebook", icon: "👤", category: "social", domains: ["facebook.com", "fb.com"] },
  { id: "whatsapp", name: "WhatsApp", icon: "💬", category: "social", domains: ["whatsapp.com"] },
  { id: "tiktok", name: "TikTok", icon: "🎵", category: "social", domains: ["tiktok.com"] },
  { id: "games", name: "Games", icon: "🎮", category: "gaming", domains: ["roblox.com", "minecraft.net", "epicgames.com", "steampowered.com", "fortnite.com"] },
  { id: "snapchat", name: "Snapchat", icon: "👻", category: "social", domains: ["snapchat.com"] },
  { id: "netflix", name: "Netflix", icon: "🎬", category: "entertainment", domains: ["netflix.com"] },
  { id: "discord", name: "Discord", icon: "💬", category: "social", domains: ["discord.com", "discord.gg"] },
  { id: "twitter", name: "X (Twitter)", icon: "🐦", category: "social", domains: ["x.com", "twitter.com"] },
  { id: "reddit", name: "Reddit", icon: "👽", category: "social", domains: ["reddit.com"] },
  { id: "twitch", name: "Twitch", icon: "📺", category: "gaming", domains: ["twitch.tv"] },
  { id: "pinterest", name: "Pinterest", icon: "📌", category: "social", domains: ["pinterest.com"] },
  { id: "telegram", name: "Telegram", icon: "✈️", category: "social", domains: ["telegram.org"] },
  { id: "spotify", name: "Spotify", icon: "🎵", category: "entertainment", domains: ["spotify.com"] },
  { id: "custom", name: "Custom App", icon: "➕", category: "custom", domains: [] },
];

interface AppPolicy {
  _id?: string;
  appId: string;
  name: string;
  icon: string;
  category: string;
  domains: string[];
  isBlocked: boolean;
  isAllowed: boolean;
  scheduleEnabled: boolean;
  scheduleBlocks: { startTime: string; endTime: string; daysOfWeek: string[] }[];
  dailyLimitMinutes: number | null;
}

interface Child {
  _id: string;
  name: string;
  age: number;
  devices: { name: string; type: string; status: string }[];
}

const CATEGORY_COLORS: Record<string, string> = {
  social: "text-red-400 bg-red-500/10",
  gaming: "text-orange-400 bg-orange-500/10",
  entertainment: "text-yellow-400 bg-yellow-500/10",
  educational: "text-green-400 bg-green-500/10",
  custom: "text-blue-400 bg-blue-500/10",
};

const ACTION_BUTTONS = [
  { key: "block", label: "Block", color: "bg-red-500/20 text-red-400 hover:bg-red-500/30" },
  { key: "allow", label: "Allow", color: "bg-green-500/20 text-green-400 hover:bg-green-500/30" },
  { key: "schedule", label: "Schedule", color: "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30" },
  { key: "limit", label: "Time Limit", color: "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30" },
];

export default function BlockingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const childIdParam = searchParams.get("childId");

  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState(childIdParam || "");
  const [error, setError] = useState<string | null>(null);
  const [appPolicies, setAppPolicies] = useState<Record<string, AppPolicy>>({});
  const [showPairModal, setShowPairModal] = useState(false);
  const [showCustomAppForm, setShowCustomAppForm] = useState(false);
  const [customAppName, setCustomAppName] = useState("");
  const [customAppDomain, setCustomAppDomain] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status !== "authenticated") return;
    fetchChildren();
  }, [status, router]);

  useEffect(() => {
    if (selectedChildId) {
      fetchPolicies();
    } else {
      setAppPolicies({});
    }
  }, [selectedChildId]);

  async function fetchChildren() {
    try {
      const res = await fetch("/api/family/children");
      const data = await res.json();
      if (data.ok) setChildren(data.children);
    } catch {
      setError("Failed to load children");
    }
  }

  async function fetchPolicies() {
    try {
      setLoading(true);
      // Seed defaults
      await fetch("/api/family/website-policies", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId: selectedChildId }),
      });

      const res = await fetch("/api/family/website-policies");
      const data = await res.json();
      if (data.ok) {
        const childPolicies = data.policies.filter((p: any) => {
          const cid = typeof p.childId === "object" ? p.childId._id : p.childId;
          return cid === selectedChildId;
        });

        // Build app policies map from existing data
        const policyMap: Record<string, AppPolicy> = {};
        
        // Initialize from common apps
        for (const app of COMMON_APPS) {
          const existing = childPolicies.find((p: any) => 
            p.name.toLowerCase() === app.name.toLowerCase() || app.domains.includes(p.domain)
          );
          
          policyMap[app.id] = {
            appId: app.id,
            name: app.name,
            icon: app.icon,
            category: app.category,
            domains: app.domains,
            isBlocked: existing ? existing.isBlocked : true,
            isAllowed: existing ? !existing.isBlocked : false,
            scheduleEnabled: existing ? existing.scheduleBlocks?.length > 0 : false,
            scheduleBlocks: existing?.scheduleBlocks || [],
            dailyLimitMinutes: existing?.dailyLimitMinutes || null,
            _id: existing?._id,
          };
        }
        setAppPolicies(policyMap);
      }
    } catch {
      setError("Failed to load policies");
    } finally {
      setLoading(false);
    }
  }

  async function updateAppPolicy(appId: string, updates: Partial<AppPolicy>) {
    const app = COMMON_APPS.find((a) => a.id === appId);
    if (!app) return;

    try {
      // Find existing policy or create one
      const existingPolicy = appPolicies[appId];
      const domain = app.domains[0] || customAppDomain;

      let res;
      if (existingPolicy?._id) {
        res = await fetch(`/api/family/website-policies/${existingPolicy._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
      } else {
        res = await fetch("/api/family/website-policies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            childId: selectedChildId,
            name: app.name,
            domain,
            category: app.category,
            icon: app.icon,
            isBlocked: updates.isBlocked ?? true,
            dailyLimitMinutes: updates.dailyLimitMinutes || null,
            scheduleBlocks: updates.scheduleBlocks || [],
          }),
        });
      }

      const data = await res.json();
      if (data.ok) {
        setAppPolicies((prev) => ({
          ...prev,
          [appId]: {
            ...prev[appId],
            ...updates,
            _id: data.policy?._id || data.policy?._id || prev[appId]?._id,
          },
        }));
      }
    } catch {
      setError("Failed to update policy");
    }
  }

  async function toggleBlock(appId: string) {
    const current = appPolicies[appId];
    const newBlocked = !current.isBlocked;
    await updateAppPolicy(appId, {
      isBlocked: newBlocked,
      isAllowed: !newBlocked,
    });
  }

  const selectedChild = children.find((c) => c._id === selectedChildId);
  const pairedDevices = selectedChild?.devices || [];

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#141018" }}>
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#141018" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/family-guardian" className="text-slate-400 hover:text-white text-sm mb-2 inline-block">
            ← Back to Family Guardian
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">App & Website Blocking</h1>
              <p className="text-slate-400 mt-1">
                Block, allow, or schedule access for apps and websites
              </p>
            </div>
            {selectedChildId && (
              <button
                onClick={() => setShowPairModal(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-sm hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
              >
                <span>📱</span> Pair Device
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Child Selector */}
        <div className="mb-6">
          <label className="block text-sm text-slate-400 mb-2">Select Child</label>
          <div className="flex flex-wrap gap-2">
            {children.map((child) => (
              <button
                key={child._id}
                onClick={() => setSelectedChildId(child._id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  selectedChildId === child._id
                    ? "bg-purple-500/30 text-purple-300 border border-purple-500/50"
                    : "bg-white/10 text-slate-400 border border-white/10 hover:bg-white/20"
                }`}
              >
                {child.name} (Age {child.age})
              </button>
            ))}
            {children.length === 0 && (
              <p className="text-slate-500 text-sm">No children found. Add a child first.</p>
            )}
          </div>
        </div>

        {/* Paired Devices Section */}
        {selectedChildId && pairedDevices.length > 0 && (
          <div className="mb-6 p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <span>📱</span> Paired Devices
            </h3>
            <div className="flex flex-wrap gap-2">
              {pairedDevices.map((device, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-xs"
                >
                  <span className={`w-2 h-2 rounded-full ${
                    device.status === "online" ? "bg-green-400" :
                    device.status === "locked" ? "bg-red-400" :
                    "bg-slate-400"
                  }`} />
                  <span className="text-white">{device.name}</span>
                  <span className="text-slate-500 capitalize">{device.type}</span>
                  <span className={`capitalize ${
                    device.status === "online" ? "text-green-400" :
                    device.status === "locked" ? "text-red-400" :
                    "text-slate-400"
                  }`}>{device.status}</span>
                </div>
              ))}
              <button
                onClick={() => setShowPairModal(true)}
                className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 text-xs hover:bg-purple-500/30 transition-all cursor-pointer"
              >
                + Pair Another
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center text-slate-400 py-12">Loading app policies...</div>
        ) : !selectedChildId ? (
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-12 text-center">
            <div className="text-5xl mb-4">👆</div>
            <h3 className="text-xl font-semibold text-white mb-2">Select a Child</h3>
            <p className="text-slate-400">Choose a child above to manage their app and website blocking policies.</p>
          </div>
        ) : (
          <>
            {/* Architecture Note */}
            <div className="mb-6 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm">
              <strong>📋 Device-Control Architecture:</strong> This dashboard manages policies (block/allow/schedule) for apps and websites. 
              Actual enforcement requires the Family Guardian browser extension or mobile app. 
              The architecture is ready for Chrome/Edge extension, Android app, and iOS Screen Time integration.
            </div>

            {/* Common App Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Object.entries(appPolicies).map(([appId, policy]) => (
                <div
                  key={appId}
                  className={`rounded-xl border p-4 transition-all ${
                    policy.isBlocked
                      ? "border-red-500/30 bg-red-500/5"
                      : policy.isAllowed
                      ? "border-green-500/30 bg-green-500/5"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  {/* App Icon & Name */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{policy.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-sm truncate">{policy.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${CATEGORY_COLORS[policy.category] || "bg-slate-500/20 text-slate-400"}`}>
                        {policy.category}
                      </span>
                    </div>
                    {/* Lock/Unlock Toggle */}
                    <button
                      onClick={() => toggleBlock(appId)}
                      className={`p-2 rounded-lg transition-all cursor-pointer ${
                        policy.isBlocked
                          ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      }`}
                      title={policy.isBlocked ? "Click to allow" : "Click to block"}
                    >
                      {policy.isBlocked ? "🔒" : "🔓"}
                    </button>
                  </div>

                  {/* Domains */}
                  {policy.domains.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1">
                      {policy.domains.slice(0, 2).map((d) => (
                        <span key={d} className="px-1.5 py-0.5 rounded bg-white/5 text-slate-500 text-[10px]">
                          {d}
                        </span>
                      ))}
                      {policy.domains.length > 2 && (
                        <span className="text-slate-500 text-[10px]">+{policy.domains.length - 2}</span>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => toggleBlock(appId)}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                        policy.isBlocked
                          ? "bg-red-500/30 text-red-300"
                          : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      }`}
                    >
                      {policy.isBlocked ? "🚫 Blocked" : "Block"}
                    </button>
                    <button
                      onClick={() => updateAppPolicy(appId, { isBlocked: false, isAllowed: true })}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                        policy.isAllowed
                          ? "bg-green-500/30 text-green-300"
                          : "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                      }`}
                    >
                      {policy.isAllowed ? "✅ Allowed" : "Allow"}
                    </button>
                    <button
                      onClick={() => {
                        const newSchedule = !policy.scheduleEnabled;
                        updateAppPolicy(appId, {
                          scheduleEnabled: newSchedule,
                          scheduleBlocks: newSchedule
                            ? [{ startTime: "08:00", endTime: "20:00", daysOfWeek: ["Mon", "Tue", "Wed", "Thu", "Fri"] }]
                            : [],
                        });
                      }}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                        policy.scheduleEnabled
                          ? "bg-cyan-500/30 text-cyan-300"
                          : "bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20"
                      }`}
                    >
                      {policy.scheduleEnabled ? "📅 Scheduled" : "Schedule"}
                    </button>
                    <button
                      onClick={() => {
                        const newLimit = policy.dailyLimitMinutes ? null : 60;
                        updateAppPolicy(appId, { dailyLimitMinutes: newLimit });
                      }}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                        policy.dailyLimitMinutes
                          ? "bg-purple-500/30 text-purple-300"
                          : "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
                      }`}
                    >
                      {policy.dailyLimitMinutes ? `⏱ ${policy.dailyLimitMinutes}m` : "Time Limit"}
                    </button>
                  </div>

                  {/* Schedule Info */}
                  {policy.scheduleEnabled && policy.scheduleBlocks.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/5">
                      <div className="text-[10px] text-slate-500">
                        {policy.scheduleBlocks[0].startTime} - {policy.scheduleBlocks[0].endTime}
                        {policy.scheduleBlocks[0].daysOfWeek.length > 0 && (
                          <> on {policy.scheduleBlocks[0].daysOfWeek.join(", ")}</>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Custom App Form */}
            <div className="mt-4">
              <button
                onClick={() => setShowCustomAppForm(!showCustomAppForm)}
                className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-all cursor-pointer"
              >
                {showCustomAppForm ? "Cancel" : "+ Add Custom App / Website"}
              </button>
              {showCustomAppForm && (
                <div className="mt-3 p-4 rounded-xl border border-white/10 bg-white/5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={customAppName}
                      onChange={(e) => setCustomAppName(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
                      placeholder="App / Website Name"
                    />
                    <input
                      type="text"
                      value={customAppDomain}
                      onChange={(e) => setCustomAppDomain(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
                      placeholder="Domain (e.g. example.com)"
                    />
                  </div>
                  <button
                    onClick={async () => {
                      if (!customAppName.trim() || !customAppDomain.trim()) return;
                      try {
                        const res = await fetch("/api/family/website-policies", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            childId: selectedChildId,
                            name: customAppName.trim(),
                            domain: customAppDomain.trim().toLowerCase(),
                            category: "custom",
                            icon: "🌐",
                            isBlocked: true,
                          }),
                        });
                        const data = await res.json();
                        if (data.ok) {
                          setCustomAppName("");
                          setCustomAppDomain("");
                          setShowCustomAppForm(false);
                          await fetchPolicies();
                        }
                      } catch {
                        setError("Failed to add custom app");
                      }
                    }}
                    disabled={!customAppName.trim() || !customAppDomain.trim()}
                    className="mt-3 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-sm font-medium disabled:opacity-50 cursor-pointer"
                  >
                    Add App
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Pair Device Modal */}
      {selectedChild && (
        <PairDeviceModal
          childId={selectedChild._id}
          childName={selectedChild.name}
          isOpen={showPairModal}
          onClose={() => setShowPairModal(false)}
        />
      )}
    </div>
  );
}
