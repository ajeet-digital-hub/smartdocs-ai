"use client";

/**
 * AppBlockingSection
 *
 * Clearly visible "App & Website Blocking" service on the homepage.
 * Renders real applications from the shared catalog (frontend/data/application-catalog.ts)
 * with status (Allow / Limited / Scheduled / Blocked), schedule and daily-limit options.
 *
 * This is a preview section — full management lives under Family Guardian →
 * App Blocking. Policy changes here are stored per-browser for the demo and
 * link through to the real management UI.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import { APPLICATION_CATALOG, CATEGORY_LABELS } from "@/data/application-catalog";

type AppStatus = "ALLOWED" | "LIMITED" | "SCHEDULED" | "BLOCKED";

const STATUS_META: Record<
  AppStatus,
  { label: string; badge: string; btn: string; activeBtn: string }
> = {
  ALLOWED: {
    label: "Allow",
    badge: "bg-emerald-500/15 text-emerald-400",
    btn: "bg-gray-700/60 text-gray-300 hover:bg-gray-600/70",
    activeBtn: "bg-emerald-500/20 text-emerald-300",
  },
  LIMITED: {
    label: "Limited",
    badge: "bg-amber-500/15 text-amber-400",
    btn: "bg-gray-700/60 text-gray-300 hover:bg-gray-600/70",
    activeBtn: "bg-amber-500/20 text-amber-300",
  },
  SCHEDULED: {
    label: "Scheduled",
    badge: "bg-sky-500/15 text-sky-400",
    btn: "bg-gray-700/60 text-gray-300 hover:bg-gray-600/70",
    activeBtn: "bg-sky-500/20 text-sky-300",
  },
  BLOCKED: {
    label: "Blocked",
    badge: "bg-red-500/15 text-red-400",
    btn: "bg-gray-700/60 text-gray-300 hover:bg-gray-600/70",
    activeBtn: "bg-red-500/20 text-red-300",
  },
};

const PREVIEW_APP_IDS = [
  "youtube",
  "instagram",
  "whatsapp",
  "facebook",
  "tiktok",
  "games",
  "chrome",
  "netflix",
];

export default function AppBlockingSection() {
  const [policies, setPolicies] = useState<Record<string, AppStatus>>({});

  const previewApps = useMemo(
    () =>
      APPLICATION_CATALOG.filter((app) => PREVIEW_APP_IDS.includes(app.appId)),
    []
  );

  const setStatus = (appId: string, status: AppStatus) => {
    setPolicies((prev) => ({ ...prev, [appId]: status }));
  };

  const handleDailyLimit = (appId: string, appName: string) => {
    const raw = window.prompt(
      `Set daily limit for ${appName} (minutes):`,
      "60"
    );
    if (raw && !isNaN(parseInt(raw, 10))) {
      setStatus(appId, "LIMITED");
    }
  };

  const handleSchedule = (appId: string, appName: string) => {
    window.prompt(
      `Schedule blocking for ${appName} (e.g. "09:00 - 17:00 weekdays"):`,
      "09:00 - 17:00 weekdays"
    );
    setStatus(appId, "SCHEDULED");
  };

  return (
    <section
      id="app-blocking"
      className="relative overflow-hidden px-4 sm:px-6 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-purple-200">
              🚫 App & Website Blocking
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Control access to apps &amp; websites
            </h2>
            <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400">
              Set schedules and daily limits for YouTube, Instagram, WhatsApp,
              TikTok, Netflix, games and more — right from Family Guardian.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/family-guardian/blocking"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:scale-105"
            >
              Manage Applications
            </Link>
            <Link
              href="/dashboard/family-guardian/policies"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:scale-105"
            >
              Manage Websites
            </Link>
            <Link
              href="/dashboard/family-guardian/schedules"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:scale-105 hover:shadow-purple-500/40"
            >
              Create Schedule
            </Link>
          </div>
        </div>

        {/* App cards */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {previewApps.map((app, i) => {
            const status = policies[app.appId] || (app.defaultBlocked ? "BLOCKED" : "ALLOWED");
            const meta = STATUS_META[status];
            return (
              <div
                key={app.appId}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10 dark:border-slate-800 dark:bg-slate-900"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-2xl dark:bg-slate-800">
                    {app.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="truncate font-semibold text-slate-900 dark:text-white">
                      {app.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {CATEGORY_LABELS[app.category] || app.category}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.badge}`}
                  >
                    {meta.label}
                  </span>
                </div>

                {/* Status actions */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setStatus(app.appId, "ALLOWED")}
                    className={`rounded-lg py-2 text-xs font-semibold transition-all ${
                      status === "ALLOWED" ? meta.activeBtn : meta.btn
                    }`}
                  >
                    Allow
                  </button>
                  <button
                    onClick={() => handleDailyLimit(app.appId, app.name)}
                    className={`rounded-lg py-2 text-xs font-semibold transition-all ${
                      status === "LIMITED" ? meta.activeBtn : meta.btn
                    }`}
                  >
                    Limited
                  </button>
                  <button
                    onClick={() => handleSchedule(app.appId, app.name)}
                    className={`rounded-lg py-2 text-xs font-semibold transition-all ${
                      status === "SCHEDULED" ? meta.activeBtn : meta.btn
                    }`}
                  >
                    Scheduled
                  </button>
                  <button
                    onClick={() => setStatus(app.appId, "BLOCKED")}
                    className={`rounded-lg py-2 text-xs font-semibold transition-all ${
                      status === "BLOCKED" ? meta.activeBtn : meta.btn
                    }`}
                  >
                    Blocked
                  </button>
                </div>

                {status === "LIMITED" && (
                  <p className="mt-3 rounded-lg bg-amber-500/10 px-3 py-1.5 text-center text-xs font-medium text-amber-400">
                    ⏱️ 60 min/day (default) — set via Manage Applications
                  </p>
                )}
                {status === "SCHEDULED" && (
                  <p className="mt-3 rounded-lg bg-sky-500/10 px-3 py-1.5 text-center text-xs font-medium text-sky-400">
                    🗓️ Weekdays 09:00–17:00 — set via Manage Applications
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-500">
          {APPLICATION_CATALOG.length}+ apps available in the full catalog.
          Policy changes sync across family devices through Family Guardian.
        </p>
      </div>
    </section>
  );
}

