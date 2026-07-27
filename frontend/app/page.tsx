"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

/* ───────────────────────────────────────────
   ScrollReveal component
   ─────────────────────────────────────────── */
function ScrollReveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("revealed");
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}

/* ───────────────────────────────────────────
   Trust Stats
   ─────────────────────────────────────────── */
const trustStats = [
  { value: "50+", label: "AI Tools" },
  { value: "100%", label: "Cloud Based" },
  { value: "24/7", label: "Available" },
  { value: "1", label: "Smart Workspace" },
];

/* ───────────────────────────────────────────
   Tools Data
   ─────────────────────────────────────────── */
const tools = [
  {
    icon: "📸",
    badge: "PP",
    accent: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    title: "Passport Photo Maker",
    description: "Create professional passport size photos.",
    href: "/tools/passport-photo",
  },
  {
    icon: "🪄",
    badge: "BR",
    accent: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
    title: "Background Remover",
    description: "Remove image backgrounds instantly.",
    href: "/tools/background-remover",
  },
  {
    icon: "🖼️",
    badge: "IR",
    accent: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    title: "Image Resize",
    description: "Resize images for any requirement.",
    href: "/tools/image-resize",
  },
  {
    icon: "✂️",
    badge: "IC",
    accent: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    title: "Image Crop",
    description: "Crop and adjust your images easily.",
    href: "/tools/image-crop",
  },
  {
    icon: "🪪",
    badge: "ID",
    accent: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    title: "ID Card Maker",
    description: "Create professional ID cards.",
    href: "/tools/id-card-maker",
  },
  {
    icon: "📄",
    badge: "RB",
    accent: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
    title: "Resume Builder",
    description: "Build modern ATS-friendly resumes.",
    href: "/tools/resume-builder",
  },
  {
    icon: "📱",
    badge: "SM",
    accent: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300",
    title: "Social Media Designer",
    description: "Create posts and banners easily.",
    href: "/tools/social-media-designer",
  },
  {
    icon: "📑",
    badge: "PDF",
    accent: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    title: "PDF Tools",
    description: "Merge, split and compress PDFs.",
    href: "/tools/pdf-tools",
  },
];

/* ───────────────────────────────────────────
   AI Showcase Cards
   ─────────────────────────────────────────── */
const aiShowcaseCards = [
  {
    icon: "📝",
    title: "AI Document Creation",
    description:
      "Generate professional documents, reports, and letters in seconds with intelligent AI assistance.",
    gradient: "from-purple-600 to-pink-500",
    href: "/tools",
  },
  {
    icon: "🎨",
    title: "AI Image Enhancement",
    description:
      "Enhance, restore, and transform images automatically using cutting-edge AI models.",
    gradient: "from-cyan-500 to-blue-600",
    href: "/tools",
  },
  {
    icon: "📄",
    title: "AI PDF Intelligence",
    description:
      "Extract, summarize, and analyze PDF content with powerful AI-driven document understanding.",
    gradient: "from-amber-500 to-orange-600",
    href: "/tools",
  },
];

/* ───────────────────────────────────────────
   Why SmartDocs
   ─────────────────────────────────────────── */
const whyItems = [
  {
    icon: "⚡",
    gradient: "from-amber-400 to-orange-500",
    title: "Fast & Easy",
    description:
      "Create professional documents and designs in minutes, not hours. No learning curve required.",
  },
  {
    icon: "🤖",
    gradient: "from-purple-500 to-pink-500",
    title: "AI Powered",
    description:
      "Use intelligent AI tools to automate repetitive document and design tasks effortlessly.",
  },
  {
    icon: "📱",
    gradient: "from-cyan-400 to-blue-500",
    title: "Works Everywhere",
    description:
      "Access your tools and projects seamlessly across desktop, tablet, and mobile devices.",
  },
];

/* ───────────────────────────────────────────
   How It Works
   ─────────────────────────────────────────── */
const steps = [
  { number: "01", title: "Choose a Tool", desc: "Pick from 50+ AI-powered tools for any task." },
  { number: "02", title: "Upload or Create", desc: "Upload your file or start from scratch instantly." },
  { number: "03", title: "Download & Share", desc: "Get your polished result and share it worldwide." },
];

/* ───────────────────────────────────────────
   Home Page
   ─────────────────────────────────────────── */
export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* ───── HERO ───── */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20 pb-16 sm:pt-28 sm:pb-20">
        {/* Animated gradient background */}
        <div
          className="absolute inset-0 animate-hero-gradient"
          style={{
            background:
              "linear-gradient(135deg, #0B1C33, #2b1620, #1a0b2e, #0f172a, #0B1C33)",
            backgroundSize: "400% 400%",
          }}
        />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Glowing orbs */}
        <div className="pointer-events-none absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-purple-500/20 blur-[120px] animate-float" />
        <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-[150px] animate-float-delayed" />
        <div className="pointer-events-none absolute top-1/3 right-1/3 h-64 w-64 rounded-full bg-pink-500/10 blur-[100px] animate-float-slow" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left content */}
            <div className="flex-1 text-center lg:text-left">
              <ScrollReveal>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-2 text-sm text-purple-200">
                  <span aria-hidden="true">✨</span>
                  All-in-One AI Document & Design Platform
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white">
                  Create. Edit. Design.
                  <span className="mt-2 block text-gradient-cyan-blue-purple">
                    Powered by AI.
                  </span>
                </h1>
              </ScrollReveal>

              <ScrollReveal>
                <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed lg:mx-0">
                  SmartDocs AI helps you create passport photos, ID cards,
                  resumes, social media designs, PDFs and much more — all in
                  one powerful platform.
                </p>
              </ScrollReveal>

              <ScrollReveal>
                <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                  <Link
                    href="/signup"
                    className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-purple-500/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                  >
                    Get Started Free
                    <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                  <Link
                    href="/tools"
                    className="group inline-flex items-center gap-2 rounded-xl border border-white/20 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/40 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                  >
                    Explore Tools
                  </Link>
                </div>
              </ScrollReveal>

              {/* Trust Stats */}
              <ScrollReveal>
                <div className="mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-3">
                  {trustStats.map((stat) => (
                    <div key={stat.label} className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-white">
                        {stat.value}
                      </span>
                      <span className="text-sm text-slate-400">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>

            {/* Right side - Desktop preview */}
            <div className="hidden lg:block flex-1 w-full max-w-lg">
              <ScrollReveal>
                <div className="relative">
                  {/* Main preview card */}
                  <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl">
                    {/* Toolbar */}
                    <div className="flex items-center gap-2 mb-6">
                      <div className="h-3 w-3 rounded-full bg-red-400" />
                      <div className="h-3 w-3 rounded-full bg-yellow-400" />
                      <div className="h-3 w-3 rounded-full bg-green-400" />
                      <span className="ml-3 text-xs text-slate-400">SmartDocs AI Workspace</span>
                    </div>

                    {/* Document preview */}
                    <div className="rounded-xl bg-white/5 border border-white/10 p-4 mb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-sm">
                          📄
                        </div>
                        <div className="flex-1">
                          <div className="h-3 w-32 rounded bg-white/10" />
                          <div className="h-2 w-20 rounded bg-white/5 mt-1" />
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-soft" />
                          AI Processing
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 w-full rounded bg-white/10" />
                        <div className="h-2 w-5/6 rounded bg-white/5" />
                        <div className="h-2 w-4/6 rounded bg-white/5" />
                      </div>
                    </div>

                    {/* Floating cards */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 p-3">
                        <span className="text-lg">📄</span>
                        <p className="mt-1 text-xs font-medium text-purple-200">Resume AI</p>
                      </div>
                      <div className="rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 p-3">
                        <span className="text-lg">📕</span>
                        <p className="mt-1 text-xs font-medium text-cyan-200">PDF Editor</p>
                      </div>
                      <div className="rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-3">
                        <span className="text-lg">🎨</span>
                        <p className="mt-1 text-xs font-medium text-amber-200">Design AI</p>
                      </div>
                      <div className="rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-3">
                        <span className="text-lg">🪪</span>
                        <p className="mt-1 text-xs font-medium text-emerald-200">ID Card</p>
                      </div>
                    </div>
                  </div>

                  {/* Floating glow behind */}
                  <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-purple-600/20 to-cyan-500/20 blur-3xl" />
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ───── EVERYTHING YOU NEED ───── */}
      <section className="relative bg-slate-50 dark:bg-slate-900/50 px-4 sm:px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                Everything You Need
              </h2>
              <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                Powerful tools for documents, images and designs.
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {tools.map((tool, i) => (
              <ScrollReveal key={tool.title}>
                <Link
                  href={tool.href}
                  className="group block rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-xl hover:shadow-purple-100/50 dark:hover:shadow-purple-900/20 cursor-pointer"
                >
                  <div
                    aria-hidden="true"
                    className={`flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold ${tool.accent}`}
                  >
                    {tool.badge}
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">
                    {tool.title}
                  </h3>

                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {tool.description}
                  </p>

                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-purple-600 dark:text-purple-400 transition-all duration-300 group-hover:gap-2">
                    Try Now
                    <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───── AI TOOLS SHOWCASE ───── */}
      <section className="relative px-4 sm:px-6 py-20 sm:py-28 overflow-hidden">
        {/* Dark background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #0B1C33, #1a0b2e, #0f172a, #0B1C33)",
            backgroundSize: "400% 400%",
          }}
        />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/3 left-1/4 h-64 w-64 rounded-full bg-purple-500/10 blur-[100px]" />
          <div className="absolute bottom-1/3 right-1/4 h-64 w-64 rounded-full bg-cyan-500/10 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <ScrollReveal>
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Powerful AI Tools. One Smart Workspace.
              </h2>
              <p className="mt-3 max-w-2xl mx-auto text-purple-200/70">
                Transform the way you create, edit, and manage documents with
                intelligent AI-powered tools.
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {aiShowcaseCards.map((card) => (
              <ScrollReveal key={card.title}>
                <Link
                  href={card.href}
                  className="group block rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 cursor-pointer"
                >
                  <div
                    className={`inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} text-2xl shadow-lg`}
                  >
                    {card.icon}
                  </div>

                  <h3 className="mt-6 text-xl font-semibold text-white">
                    {card.title}
                  </h3>

                  <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                    {card.description}
                  </p>

                  <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-purple-300 transition-all duration-300 group-hover:gap-2">
                    Explore Tool
                    <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───── WHY SMARTDOCS AI ───── */}
      <section className="bg-slate-50 dark:bg-slate-900/50 px-4 sm:px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <ScrollReveal>
            <h2 className="text-center text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Why SmartDocs AI?
            </h2>
          </ScrollReveal>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {whyItems.map((item) => (
              <ScrollReveal key={item.title}>
                <div className="text-center">
                  <div
                    className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} text-2xl text-white shadow-lg`}
                  >
                    {item.icon}
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───── HOW IT WORKS ───── */}
      <section className="px-4 sm:px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal>
            <h2 className="text-center text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Create in Three Simple Steps
            </h2>
          </ScrollReveal>

          <div className="relative mt-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-0">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-1/2 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-0.5 bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 -translate-y-1/2" />

            {steps.map((step, i) => (
              <ScrollReveal key={step.number}>
                <div className="relative flex flex-col items-center text-center md:w-1/3 px-4">
                  <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 text-white text-lg font-bold shadow-xl shadow-purple-500/30">
                    {step.number}
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {step.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───── CTA BANNER ───── */}
      <section className="px-4 sm:px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-red-500 to-rose-500 px-6 sm:px-12 py-16 text-center text-white shadow-2xl">
              {/* Background decoration */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
              </div>

              <div className="relative">
                <h2 className="text-3xl sm:text-4xl font-bold">
                  Start Creating with SmartDocs AI
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-orange-100 text-sm sm:text-base">
                  Turn your ideas into professional documents, images, and
                  designs with the power of AI.
                </p>
                <div className="mt-8 flex justify-center">
                  <Link
                    href="/signup"
                    className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-orange-600 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-white/30 animate-pulse-soft cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    Get Started Free
                    <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer className="border-t border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-center text-sm text-slate-500 dark:text-slate-400 md:flex-row md:text-left">
          <p>© 2026 SmartDocs AI. All rights reserved.</p>

          <nav className="flex justify-center gap-6" aria-label="Footer navigation">
            <Link href="/about" className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer">
              Privacy
            </Link>
            <Link href="/about" className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer">
              Terms
            </Link>
            <Link href="/about" className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer">
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}

