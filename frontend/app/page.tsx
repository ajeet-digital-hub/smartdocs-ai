"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FileText,
  Image as ImageIcon,
  ArrowRight,
  File,
  ScanText,
  Shield,
  Bot,
  FileUp,
  Languages,
  Magnet,
  ChevronRight,
  Check,
} from "lucide-react";
import FloatingNovaAI from "@/components/FloatingNovaAI";

const popularServices = [
  { label: "Document AI", href: "/services?search=document", icon: FileText, desc: "Create & edit documents with AI" },
  { label: "PDF Tools", href: "/services?search=pdf", icon: File, desc: "Convert, merge & compress PDFs" },
  { label: "OCR Scanner", href: "/services?search=ocr", icon: ScanText, desc: "Extract text from images & scans" },
  { label: "Image Tools", href: "/services?search=image", icon: ImageIcon, desc: "Edit, enhance & transform images" },
  { label: "AI Chat", href: "/ai-tools", icon: Bot, desc: "Conversational AI assistant" },
  { label: "Document Conversion", href: "/services?search=convert", icon: FileUp, desc: "Convert between any formats" },
  { label: "Document Translation", href: "/services?search=translate", icon: Languages, desc: "Translate docs into 100+ languages" },
  { label: "Automation", href: "/services?search=automation", icon: Magnet, desc: "Automate repetitive AI workflows" },
];

const familyGuardianFeatures = [
  "Monitor children's screen time & app usage",
  "Block apps & websites instantly",
  "Set schedules & daily limits",
  "Manage unlock requests & safety alerts",
];

const pricingPlans = [
  {
    name: "FREE",
    price: "₹0/month",
    features: ["AI Chat Limited", "1 Hour Chat History", "Temporary Files Auto Delete"],
    cta: "Start Free",
    highlight: false,
  },
  {
name: "BASIC",
    price: "₹49/month",
    features: [
      "AI Chat Unlimited",
      "Chat History 7 Days",
      "PDF Tools",
      "OCR Scanner",
      "Photo Tool",
      "Basic Image Analysis",
      "2 GB Storage",
      "500 AI Credits/month",
      "Standard Support",
    ],
    cta: "Choose Basic",
    highlight: false,
  },
  {
    name: "PRO",
    price: "₹499/month",
    features: [
      "Advanced AI",
      "Document AI",
      "Automation Features",
      "Family Guardian Access",
      "Advanced Photo AI",
      "Document Conversion",
      "Unlimited Chat History",
      "OCR",
      "Document Translation",
      "10 GB Storage",
      "2000 AI Credits/month",
      "Priority Support",
    ],
    cta: "Choose Pro",
    highlight: true,
  },
  {
    name: "PRO+",
    price: "₹999/month",
    features: [
      "Premium AI Features",
      "More AI Credits",
      "Team Features",
      "Priority Support",
      "50 GB Storage",
      "Everything in Pro",
    ],
    cta: "Go Pro+",
    highlight: false,
    premium: true,
  },
];

export default function Home() {
  const [templates, setTemplates] = useState<
    { templateId: string; name: string; slug: string; category: string; thumbnail?: string }[]
  >([]);

  useEffect(() => {
    let mounted = true;
    fetch("/api/templates?limit=8&sort=popular")
      .then((res) => res.json())
      .then((data) => {
        if (mounted && data.success) {
          setTemplates(
            (data.templates || []).slice(0, 8).map((t: Record<string, unknown>) => ({
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

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* ── HERO: SMARTDOCS ASSISTANT ─────────────────────── */}
      <section className="relative overflow-hidden border-b border-slate-100 bg-white pb-16 pt-24 sm:pb-20 sm:pt-32">
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Your AI workspace for documents, images &amp; everyday work.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-500 sm:text-xl">
            Ask anything. Create, analyze, convert and automate with SmartDocs AI.
          </p>

          {/* Primary AI input */}
          <div className="mx-auto mt-10 max-w-3xl">
            <FloatingNovaAI variant="hero" placeholder="Ask anything..." />
          </div>
        </div>
      </section>

      {/* ── POPULAR AI TOOLS / SERVICES ───────────── */}
      <section className="px-4 py-16 sm:px-6 sm:py-20" id="popular-tools">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-600">
                AI Services
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                Popular AI Tools &amp; Services
              </h2>
              <p className="mt-2 max-w-xl text-slate-500">
                260+ professional tools to transform your documents, images, and workflows.
              </p>
            </div>
            <Link
              href="/services"
              className="hidden items-center gap-1 text-sm font-semibold text-purple-600 hover:text-purple-700 sm:inline-flex"
            >
              Explore all services <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {popularServices.map(({ label, href, icon: Icon, desc }) => (
              <Link
                key={label}
                href={href}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-purple-100 group-hover:text-purple-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-slate-900">{label}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{desc}</p>
              </Link>
            ))}
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Link
              href="/services"
              className="inline-flex items-center gap-1 text-sm font-semibold text-purple-600 hover:text-purple-700"
            >
              Explore all services <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── POPULAR TEMPLATES ───────────────────── */}
      <section className="border-y border-slate-100 bg-slate-50 px-4 py-16 sm:px-6 sm:py-20" id="templates">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-600">
                Templates
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                Popular Templates
              </h2>
              <p className="mt-2 max-w-xl text-slate-500">
                Create faster with professionally designed templates.
              </p>
            </div>
            <Link
              href="/templates"
              className="hidden items-center gap-1 text-sm font-semibold text-purple-600 hover:text-purple-700 sm:inline-flex"
            >
              Browse all templates <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {templates.length > 0 ? (
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
              {templates.map((t) => (
                <Link
                  key={t.templateId}
                  href={`/templates/${t.slug}`}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100"
                >
                  <div className="flex aspect-[4/5] w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                    {t.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.thumbnail} alt={t.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <FileText className="h-10 w-10 text-slate-400" />
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-purple-500">
                      {t.category}
                    </p>
                    <h3 className="mt-1 truncate text-sm font-semibold text-slate-900">{t.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="aspect-[4/5] bg-slate-200" />
                  <div className="space-y-2 p-4">
                    <div className="h-2.5 w-1/3 rounded bg-slate-200" />
                    <div className="h-4 w-3/4 rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 text-center sm:hidden">
            <Link
              href="/templates"
              className="inline-flex items-center gap-1 text-sm font-semibold text-purple-600 hover:text-purple-700"
            >
              Browse all templates <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAMILY GUARDIAN ─────────────────────── */}
      <section className="px-4 py-16 sm:px-6 sm:py-20" id="family-guardian">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 text-white">
          <div className="grid lg:grid-cols-2">
            <div className="p-8 sm:p-12 lg:p-14">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-purple-200">
                <Shield className="h-4 w-4" /> Family Guardian
              </p>
              <h2 className="mt-5 text-2xl font-bold sm:text-3xl lg:text-4xl">
                Manage your family&apos;s digital safety
              </h2>
              <p className="mt-4 max-w-md text-slate-400">
                Monitor, protect and guide your family&apos;s digital experience in real time.
                Screen time limits, app blocking, website policies, schedules and more.
              </p>
              <ul className="mt-6 space-y-3">
                {familyGuardianFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-slate-300">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-purple-300">
                      <Check className="h-3 w-3" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/family-guardian"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition-all hover:shadow-xl hover:brightness-95"
              >
                Open Family Guardian <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {/* Visual panel */}
            <div className="relative border-t border-white/10 bg-slate-950/60 p-8 sm:p-12 lg:border-l lg:border-t-0">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(124,58,237,0.25),transparent_45%)]" />
              <div className="relative space-y-4">
                {[
                  { label: "Children protected", value: "3", color: "text-purple-300" },
                  { label: "Devices connected", value: "5", color: "text-cyan-300" },
                  { label: "Blocked attempts today", value: "24", color: "text-rose-300" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4"
                  >
                    <span className="text-sm text-slate-300">{stat.label}</span>
                    <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm font-medium text-slate-200">Screen time today</p>
                  <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400" />
                  </div>
                  <p className="mt-2 text-xs text-slate-400">3h 42m of 6h recommended</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING CTA ─────────────────────────── */}
      <section className="border-t border-slate-100 px-4 py-16 sm:px-6 sm:py-20" id="pricing">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm text-slate-600 shadow-sm">
              💰 Simple, Transparent Pricing
            </p>
            <h2 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">
              Choose your SmartDocs AI plan
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-slate-500">
              Start for free, upgrade when you need more power. All plans include core AI features.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-300 ${
                  plan.highlight
                    ? "border-purple-400 bg-slate-900 text-white shadow-xl shadow-purple-200"
                    : "border-slate-200 bg-white text-slate-900 hover:shadow-lg hover:shadow-slate-100"
                } ${plan.premium ? "ring-2 ring-purple-300" : ""}`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                    Most Popular
                  </span>
                )}
                {plan.premium && (
                  <span className="absolute -top-3 right-4 rounded-full bg-amber-400 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-900 shadow">
                    Best Value
                  </span>
                )}
                <h3 className={`text-lg font-bold ${plan.highlight ? "text-white" : "text-slate-900"}`}>
                  {plan.name}
                </h3>
                <p className={`mt-2 text-3xl font-extrabold ${plan.highlight ? "text-white" : "text-slate-900"}`}>
                  {plan.price}
                </p>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check
                        className={`mt-0.5 h-4 w-4 shrink-0 ${plan.highlight ? "text-cyan-400" : "text-purple-500"}`}
                      />
                      <span className={plan.highlight ? "text-slate-300" : "text-slate-600"}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/pricing"
                  className={`mt-8 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
                    plan.highlight
                      ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg shadow-purple-500/30 hover:brightness-110"
                      : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {plan.cta} <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-slate-50 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 md:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2.5 text-xl font-bold text-slate-900">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                  S
                </div>
                SmartDocs AI
              </Link>
              <p className="mt-4 max-w-xs text-sm text-slate-500">
                AI-powered document, image &amp; design platform for professionals and families.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Products</h4>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
                <li><Link href="/services" className="hover:text-slate-900">All Services</Link></li>
                <li><Link href="/templates" className="hover:text-slate-900">Templates</Link></li>
                <li><Link href="/workspace" className="hover:text-slate-900">Workspace</Link></li>
                <li><Link href="/ai-tools" className="hover:text-slate-900">AI Tools</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Company</h4>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
                <li><Link href="/family-guardian" className="hover:text-slate-900">Family Guardian</Link></li>
                <li><Link href="/pricing" className="hover:text-slate-900">Pricing</Link></li>
                <li><Link href="/home/subscription" className="hover:text-slate-900">Subscription &amp; Billing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Legal</h4>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
                <li><Link href="/home/profile" className="hover:text-slate-900">Account</Link></li>
                <li><Link href="/home/settings" className="hover:text-slate-900">Privacy &amp; Settings</Link></li>
                <li><Link href="/pricing" className="hover:text-slate-900">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 text-sm text-slate-500 sm:flex-row">
            <p>© 2026 SmartDocs AI. All Rights Reserved.</p>
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
