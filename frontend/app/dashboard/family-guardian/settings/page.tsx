"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as familyGuardianApi from "@/lib/family-guardian-api";

export default function FamilySettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [familyName, setFamilyName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function fetchFamily() {
    try {
      const data = await familyGuardianApi.getFamily();
      if (data.ok) {
        setFamilyName(data.family.name || "My Family");
      }
    } catch {
      setError("Failed to load family settings");
    }
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status !== "authenticated") return;
    fetchFamily();
  }, [status, router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!familyName.trim()) {
      setError("Family name is required");
      return;
    }
    setSaving(true);
    try {
      const res = await familyGuardianApi.updateFamily({ familyName: familyName.trim() });
      if (!res.ok) throw new Error(res.error || "Failed to save");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <Link href="/dashboard/family-guardian" className="text-slate-400 hover:text-white text-sm mb-2 inline-block">
            ← Back to Family Guardian
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Family Settings</h1>
          <p className="text-slate-400 mt-1">Manage your family profile</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
        )}
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
            Settings saved successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
          <div className="mb-6">
            <label className="block text-sm text-slate-400 mb-2">Family Name</label>
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-purple-500"
              placeholder="Your family name"
            />
          </div>

          <div className="mb-6 p-4 rounded-lg bg-white/5">
            <h3 className="text-white font-semibold mb-2">Account Info</h3>
            <p className="text-slate-400 text-sm">
              Logged in as: <span className="text-white">{session?.user?.email}</span>
            </p>
            <p className="text-slate-400 text-sm">
              Name: <span className="text-white">{session?.user?.fullName || session?.user?.name}</span>
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-sm disabled:opacity-50 cursor-pointer"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </form>
      </div>
    </div>
  );
}
