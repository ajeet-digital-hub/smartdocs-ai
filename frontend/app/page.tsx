"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  FileText,
  FileSearch,
  ScanText,
  Image as ImageIcon,
  PenLine,
  Zap,
  Shield,
  Check,
  Sparkles,
  File,
  Bot,
} from "lucide-react";
import FloatingNovaAI from "@/components/FloatingNovaAI";
import { PLANS } from "@/lib/plan-config";
import { getPopularServices } from "./services/data/services";

// ─────────────────────────────────────────────────────────────
// SmartDocs AI — Intelligent Paper & Workspace
// Premium light theme: warm off-white base, restrained indigo
// accent, generous whitespace, subtle depth.
// ─────────────────────────────────────────────────────────────

const planPrice = (id: "free" | "basic" | "pro" | "pro_plus"): number => {
  const plan = PLANS.find((p) => p.id === id);
  return plan ? plan.price : 0;
};

// Capability strip under the Agent card (minimal, not big cards).
const capabilities = [
  { label: "Documents", icon: FileText },
  { label: "PDF", icon: File },
  { label: "Images", icon: ImageIcon },
  { label: "OCR", icon: ScanText },
  { label: "Writing", icon: PenLine },
  { label: "Automation", icon: Zap },
];

// Feature story bullets (left column).
const featureBullets = [
  {
    title: "Understand documents",
    desc: "Ask questions about any PDF, DOCX or report and get cited answers.",
  },
  {
    title: "Extract information",
    desc: "Pull names, dates, tables and key points out of messy files.",
  },
  {
    title: "Transform content",
    desc: "Summarize, translate, rewrite and reformat anything in seconds.",
  },
  {
    title: "Automate repetitive tasks",
    desc: "Chain everyday workflows and let the agent handle the busywork.",
  },
];

// Family Guardian stats — illustrative presentation of the feature.
const familyStats = [
  { label: "Children protected", value: "3" },
  { label: "Devices connected", value: "5" },
  { label: "Blocked attempts", value: "24" },
];

export default function Home() {
  const [templates, setTemplates] = useState<
    { templateId: string; name: string; slug: string; category: string; thumbnail?: string }[]
  >([]);
  const agentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/templates?limit=4&sort=popular")
      .then((res) => res.json())
      .then((data) => {
        if (mounted && data.success) {
          setTemplates(
            (data.templates || []).slice(0, 4).map((t: Record<string, unknown>) => ({
              templateId: String(t.templateId || t.id || ""),
              name: String(t.name || ""),
              slug: String(t.slug || ""),
              category: String(t.categoryName || t.category || ""),
              thumbnail: typeof t.thumbnail === "string" ? t.thumbnail : undefined,
            }))
          );
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const scrollToAgent = () => {
    agentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const featuredTools = getPopularServices().slice(0, 6);

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-slate-900">
      {/* ══════════════════ HERO ══════════════════ */}
      <section className="relative overflow-hidden border-b border-slate-200/70 bg-[#f7f7f5]">
        {/* Very subtle radial texture — stays professional & readable */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[-20%] h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-slate-200/25 blur-[120px]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/40 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 pb-14 pt-16 text-center sm:px-6 sm:pt-24 sm:pb-20">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 shadow-sm backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            SmartDocs AI
          </div>

          {/* Headline */}
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Your AI workspace for documents,
            <br className="hidden sm:block" /> images &amp; everyday work.
          </h1>

          {/* Supporting text */}
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-500 sm:text-lg">
            Ask anything. Create, analyze, convert and automate with SmartDocs AI.
          </p>

          {/* AI Agent workspace — the product itself */}
          <div ref={agentRef} id="smartdocs-agent" className="mx-auto mt-10 max-w-3xl scroll-mt-24">
            <FloatingNovaAI variant="hero" placeholder="Ask anything..." />
          </div>

          {/* Capability strip */}
          <div className="mx-auto mt-10 max-w-3xl px-4 sm:px-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              What your AI Agent can do
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              {capabilities.map(({ label, icon: Icon }) => (
                <div key={label} className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                  <Icon className="h-4 w-4 text-indigo-600" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ AI WORKSPACE ══════════════════ */}
      <section className="px-4 py-20 sm:px-6 sm:py-28" id="ai-tools">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
                AI Workspace
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                One assistant. Hundreds of ways to get work done.
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-500 sm:text-lg">
                From documents and PDFs to images and automation, SmartDocs AI brings your
                everyday tools into one intelligent workspace.
              </p>
            </div>
            <Link
              href="/ai-tools"
              className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
            >
              Explore all AI tools
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Compact tool cards — real services, not dominant */}
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredTools.map((service) => (
              <Link
                key={service.id}
                href="/ai-tools"
                className="group flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-lg ring-1 ring-slate-200/60">
                  <span className="text-base">{service.icon}</span>
                </div>
                <h3 className="mt-4 text-sm font-semibold text-slate-900">{service.name}</h3>
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
                  {service.description}
                </p>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-indigo-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  Explore <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ FEATURE STORY ══════════════════ */}
      <section className="border-y border-slate-200/70 bg-white px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          {/* Left — narrative */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
              One workspace
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Your work, with less busywork.
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-slate-500">
              Stop jumping between tools. SmartDocs AI understands your documents, extracts the
              details that matter and turns ideas into finished work.
            </p>

            <ul className="mt-8 space-y-5">
              {featureBullets.map((item) => (
                <li key={item.title} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-slate-500">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Right — stylized workspace preview (reuses real service icons) */}
          <div className="relative">
            <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-br from-indigo-50/60 to-transparent" />
            <div className="relative rounded-2xl border border-slate-200/80 bg-[#f7f7f5] p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200/70 pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">SmartDocs Assistant</p>
                    <p className="flex items-center gap-1 text-[11px] text-emerald-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
                  Working
                </span>
              </div>

              <div className="mt-5 space-y-2.5">
                {[
                  { icon: Bot, text: "Summarize the Q3 report and list key action items", role: "You" },
                  { icon: FileSearch, text: "Extracted 3 action items from Q3 report.", role: "Agent" },
                  { icon: File, text: "Turned the meeting notes into a one-page brief.", role: "Agent" },
                  { icon: Zap, text: "Scheduled the follow-ups for the team.", role: "Agent" },
                ].map((row, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2.5 ${row.role === "You" ? "justify-end" : ""}`}
                  >
                    {row.role === "Agent" && (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-slate-200">
                        <row.icon className="h-3 w-3 text-indigo-600" />
                      </div>
                    )}
                    <div
                      className={`rounded-xl px-3 py-2 text-xs leading-relaxed ${
                        row.role === "You"
                          ? "rounded-br-sm bg-slate-900 text-white"
                          : "rounded-bl-sm bg-white text-slate-600 ring-1 ring-slate-200/80"
                      }`}
                    >
                      {row.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2.5">
                <span className="text-sm text-slate-400">Ask anything...</span>
                <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-white">
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ TEMPLATES ══════════════════ */}
      <section className="px-4 py-20 sm:px-6 sm:py-28" id="templates">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
                Templates
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Start with a template. Finish faster.
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-500 sm:text-lg">
                Professional templates for business, documents and everyday work.
              </p>
            </div>
            <Link
              href="/templates"
              className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
            >
              Browse templates
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {templates.length > 0 ? (
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {templates.map((t) => (
                <Link
                  key={t.templateId}
                  href={`/templates/${t.slug}`}
                  className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                >
                  <div className="flex aspect-[4/3] w-full items-center justify-center bg-slate-50">
                    {t.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.thumbnail} alt={t.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <FileText className="h-8 w-8 text-slate-300" />
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{t.category}</p>
                    <h3 className="mt-1 truncate text-sm font-semibold text-slate-900">{t.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
                  <div className="aspect-[4/3] bg-slate-100" />
                  <div className="space-y-2 p-4">
                    <div className="h-2.5 w-1/3 rounded bg-slate-100" />
                    <div className="h-4 w-3/4 rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════ FAMILY GUARDIAN ══════════════════ */}
      <section className="border-y border-slate-200/70 bg-[#f1f0ee] px-4 py-20 sm:px-6 sm:py-28" id="family-guardian">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <Shield className="h-3.5 w-3.5 text-indigo-600" /> Family Guardian
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                SmartDocs AI for your family, too.
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-slate-500">
                Family Guardian helps parents manage screen time, apps, websites and digital
                routines — all in one place.
              </p>
              <Link
                href="/family-guardian"
                className="group mt-8 inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition-all hover:border-slate-400 hover:bg-slate-50"
              >
                Explore Family Guardian
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Stats surface */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="grid grid-cols-3 gap-4">
                {familyStats.map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-slate-200/70 bg-[#f7f7f5] p-5 text-center">
                    <p className="text-3xl font-bold tracking-tight text-slate-900">{stat.value}</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-xl border border-slate-200/70 bg-[#f7f7f5] p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-900">Screen time today</p>
                  <span className="text-xs text-slate-500">3h 42m of 6h</span>
                </div>
                <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full w-1/2 rounded-full bg-indigo-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ PRICING PREVIEW ══════════════════ */}
      <section className="px-4 py-20 sm:px-6 sm:py-28" id="pricing">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
              Pricing
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Choose the right level of intelligence.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-slate-500 sm:text-lg">
              Start free. Upgrade when your work demands more.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "FREE", price: planPrice("free"), highlight: false },
              { name: "BASIC", price: planPrice("basic"), highlight: false },
              { name: "PRO", price: planPrice("pro"), highlight: false },
              { name: "PRO+", price: planPrice("pro_plus"), highlight: true },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-300 ${
                  plan.highlight
                    ? "border-indigo-300 bg-white shadow-sm ring-1 ring-indigo-100"
                    : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-md"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                    Premium
                  </span>
                )}
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900">{plan.name}</h3>
                <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                  ₹{plan.price}
                  <span className="text-sm font-medium text-slate-400">/month</span>
                </p>
                <Link
                  href="/pricing"
                  className={`mt-8 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
                    plan.highlight
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  View plan <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/pricing"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
            >
              Compare all plans
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════ FINAL CTA ══════════════════ */}
      <section className="border-t border-slate-200/70 bg-white px-4 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Ready to work smarter?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-500 sm:text-lg">
            Ask SmartDocs AI to create, analyze, transform or automate your next task.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={scrollToAgent}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-500/20 transition-all hover:bg-indigo-700"
            >
              <Sparkles className="h-4 w-4" /> Ask SmartDocs AI
            </button>
            <Link
              href="/ai-tools"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50"
            >
              Explore AI Tools <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════ FOOTER ══════════════════ */}
      <footer className="border-t border-slate-200/70 bg-[#f7f7f5] px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 md:grid-cols-6">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2.5 text-xl font-bold text-slate-900">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
                  S
                </div>
                SmartDocs AI
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
                Your intelligent workspace for documents, images and everyday work.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Product</h4>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
                <li><Link href="/ai-tools" className="hover:text-slate-900">AI Tools</Link></li>
                <li><Link href="/services" className="hover:text-slate-900">Services</Link></li>
                <li><Link href="/templates" className="hover:text-slate-900">Templates</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Family</h4>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
                <li><Link href="/family-guardian" className="hover:text-slate-900">Family Guardian</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Company</h4>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
                <li><Link href="/pricing" className="hover:text-slate-900">Pricing</Link></li>
                <li><Link href="/home/subscription" className="hover:text-slate-900">Subscription</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Account</h4>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
                <li><Link href="/home/profile" className="hover:text-slate-900">Profile</Link></li>
                <li><Link href="/home/settings" className="hover:text-slate-900">Settings</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200/70 pt-6 text-sm text-slate-500 sm:flex-row">
            <p>© 2026 SmartDocs AI. All rights reserved.</p>
            <nav className="flex items-center gap-6" aria-label="Footer navigation">
              <Link href="/login" className="hover:text-slate-900">Login</Link>
              <Link href="/signup" className="hover:text-slate-900">Sign Up</Link>
              <Link href="/pricing" className="hover:text-slate-900">Support</Link>
            </nav>
          </div>
        </div>
      </footer>
    </main>
  );
}
