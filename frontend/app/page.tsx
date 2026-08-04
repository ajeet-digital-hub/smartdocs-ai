"use client";

/**
 * SmartDocs AI — Premium AI Workspace Homepage
 *
 * Brand positioning:
 *   "One AI. Everything you need."
 *   "Tell SmartDocs what you want done. It figures out the rest."
 *
 * Hierarchy:
 *  1. SmartDocs AI branding/navigation (in layout Navbar)
 *  2. Female AI Assistant + AI Command Center
 *  3. Quick actions
 *  4. "What do you want to do?" service launcher
 *  5. Goal Mode — "What are you trying to accomplish?"
 *  6. Family Guardian — integrated protection card
 *  7. App & Website Blocking (clearly visible)
 *  8. How it works + testimonials
 *  9. Pricing preview
 * 10. Custom Plan / Contact Sales CTA
 * 11. Final CTA — "Stop searching for tools."
 * 12. Footer
 */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Star, ArrowRight, Sparkles, Command } from "lucide-react";
import HomeAICommandCenter from "@/components/HomeAICommandCenter";
import AppBlockingSection from "@/components/AppBlockingSection";
import CommandPalette from "@/components/CommandPalette";
import { SMARTDOCS_SERVICES, ServiceCategory } from "@/app/api/ai/chat/service-knowledge";

// ── Scroll reveal ─────────────────────────────────────
function ScrollReveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
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

// ── Service launcher cards ────────────────────────────
const LAUNCHER_CARDS: {
  title: string;
  emoji: string;
  desc: string;
  href: string;
}[] = [
  { title: "Documents", emoji: "📄", desc: "PDF, Word, Excel & more", href: "/services" },
  { title: "AI Assistant", emoji: "🤖", desc: "Chat, summarize, answer", href: "/ai-tools" },
  { title: "Translation", emoji: "🌐", desc: "Multi-language docs", href: "/services" },
  { title: "OCR & Images", emoji: "🖼️", desc: "Extract text from images", href: "/services" },
  { title: "Document Analysis", emoji: "📊", desc: "Insights, risks, deadlines", href: "/services" },
  { title: "App & Website Blocking", emoji: "🚫", desc: "Family screen-time control", href: "/dashboard/family-guardian/blocking" },
  { title: "Family Guardian", emoji: "👨‍👩‍👧", desc: "Protect & guide your kids", href: "/dashboard/family-guardian" },
  { title: "More Services", emoji: "⚙️", desc: "Browse 300+ tools", href: "/services" },
];

// ── Steps ─────────────────────────────────────────────
const steps = [
  { number: "01", title: "Choose a Tool", desc: "Pick from 300+ AI-powered tools for any task." },
  { number: "02", title: "Upload or Create", desc: "Upload your file or start from scratch instantly." },
  { number: "03", title: "Download & Share", desc: "Get your polished result and share it worldwide." },
];

const testimonials = [
  {
    name: "Aarav Sharma",
    role: "Student",
    text: "SmartDocs AI is a lifesaver for my projects. The PDF summary tool alone saves me hours of reading.",
  },
  {
    name: "Priya Singh",
    role: "Freelancer",
    text: "I use it daily to create invoices and convert documents for clients. It's incredibly fast and reliable.",
  },
  {
    name: "Rohan Mehta",
    role: "Business Owner",
    text: "The AI Command Center is genius. I just type what I need, and it figures out the rest. Highly recommended!",
  },
];

export default function Home() {
  const [commandOpen, setCommandOpen] = useState(false);
  const { data: session, status } = useSession();
  const userName = session?.user?.fullName || session?.user?.name || "";

  useEffect(() => {
    const onOpen = () => setCommandOpen(true);
    const onClose = () => setCommandOpen(false);
    window.addEventListener("open-command-palette", onOpen);
    window.addEventListener("close-command-palette", onClose);
    return () => {
      window.removeEventListener("open-command-palette", onOpen);
      window.removeEventListener("close-command-palette", onClose);
    };
  }, []);

  // Build category list from implemented services
  const categories = [
    ...new Set(
      SMARTDOCS_SERVICES.filter((s) => s.implementationStatus === "IMPLEMENTED").map(
        (s) => s.category
      )
    ),
  ];
  const categoryIcons: Record<ServiceCategory, string> = {
    "PDF & Documents": "📄",
    "AI Chat": "💬",
    Translation: "🌐",
    "OCR & Images": "📸",
    "Data & Tables": "📊",
    Conversion: "🔄",
    "Live Information": "📡",
    "Family Guardian": "👨‍👩‍👧‍👦",
  };

  return (
    <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* ── 1. Hero / AI Command Center ─────────────── */}
      <section className="relative overflow-hidden pt-20 pb-16 sm:pt-28 sm:pb-24">
        <div className="absolute inset-0 bg-slate-950" />
        {/* Ambient glow */}
        <div className="pointer-events-none absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-purple-500/20 blur-[120px] animate-float" />
        <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-[150px] animate-float-delayed" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-purple-200">
              <Sparkles className="h-4 w-4" />
              One AI. Everything you need.
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-white">
              Tell SmartDocs what you want done.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
              It figures out the rest — picks the tools, runs the workflow, and
              delivers the result. This is your AI workspace.
              {status === "authenticated" && userName
                ? ` Welcome back, ${userName}.`
                : " Your workspace is ready."}
            </p>
          </div>

          {/* AI Command Center with Female AI Assistant */}
          <div className="mt-10">
            <HomeAICommandCenter />
          </div>

          {/* Ctrl+K hint */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setCommandOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition-all hover:bg-white/10"
            >
              <Command className="h-4 w-4" />
              Press Ctrl K to search everything
            </button>
          </div>
        </div>
      </section>

      {/* ── 2. "What do you want to do?" launcher ──── */}
      <section className="relative bg-slate-50 dark:bg-slate-900/50 px-4 sm:px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                What do you want to do today?
              </h2>
              <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                Pick a card to jump straight in — or let the AI assistant handle it.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
            {LAUNCHER_CARDS.map((card) => (
              <ScrollReveal key={card.title}>
                <Link
                  href={card.href}
                  className="group flex h-full flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-3xl transition-transform duration-300 group-hover:scale-110 dark:bg-slate-800">
                    {card.emoji}
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
                    {card.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {card.desc}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-purple-600 dark:text-purple-400 opacity-0 transition-all duration-300 group-hover:opacity-100">
                    Open <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Service Categories ───────────────────── */}
      <section className="px-4 sm:px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                300+ Tools. One AI Agent.
              </h2>
              <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                From complex document analysis to simple image edits, our AI
                understands your needs and automatically selects the right tool.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((category) => (
              <ScrollReveal key={category}>
                <div className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-3xl transition-transform duration-300 group-hover:scale-110">
                    {categoryIcons[category] || "✨"}
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
                    {category}
                  </h3>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/services"
              className="font-semibold text-purple-600 dark:text-purple-400 hover:underline"
            >
              Explore all services →
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4. App & Website Blocking ───────────────── */}
      <AppBlockingSection />

      {/* ── 5. How it works ─────────────────────────── */}
      <section className="px-4 sm:px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal>
            <h2 className="text-center text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Create in Three Simple Steps
            </h2>
          </ScrollReveal>

          <div className="relative mt-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-0">
            <div className="hidden md:block absolute top-1/2 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-0.5 bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 -translate-y-1/2" />
            {steps.map((step) => (
              <ScrollReveal key={step.number}>
                <div className="relative flex flex-col items-center text-center md:w-1/3 px-4">
                  <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 text-white text-lg font-bold shadow-xl shadow-purple-500/30 mb-6">
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

      {/* ── 6. Testimonials ─────────────────────────── */}
      <section className="bg-slate-50 dark:bg-slate-900/50 px-4 sm:px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl text-center">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Loved by Professionals and Students
            </h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400">
              Don&apos;t just take our word for it. Here&apos;s what our users are saying.
            </p>
          </ScrollReveal>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {testimonials.map((t) => (
              <ScrollReveal key={t.name}>
                <figure className="bg-white dark:bg-slate-800/80 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                  <blockquote className="mt-4 text-slate-600 dark:text-slate-300 text-left">
                    &ldquo;{t.text}&rdquo;
                  </blockquote>
                  <figcaption className="mt-4 text-left">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {t.name}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 text-sm">
                      {t.role}
                    </div>
                  </figcaption>
                </figure>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Pricing Preview ──────────────────────── */}
      <section className="px-4 sm:px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <ScrollReveal>
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                Simple, Transparent Pricing
              </h2>
              <p className="mt-3 text-slate-500 dark:text-slate-400">
                Start free, upgrade when you need more power. All plans include
                core AI features.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid gap-6 md:grid-cols-4">
            {/* Free */}
            <div className="flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Free</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Perfect for trying SmartDocs</p>
              <div className="mt-6 flex items-baseline">
                <span className="text-5xl font-extrabold text-slate-900 dark:text-white">Free</span>
              </div>
              <ul className="mt-8 flex-1 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <li>✓ 100 AI credits/month</li>
                <li>✓ Basic AI features</li>
                <li>✓ 1-hour chat history</li>
              </ul>
              <Link
                href="/signup"
                className="mt-10 w-full rounded-xl border border-slate-300 dark:border-slate-700 py-3 text-center font-semibold text-slate-900 dark:text-white transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Get Started
              </Link>
            </div>

            {/* Pro (highlighted) */}
            <div className="relative flex flex-col rounded-3xl border-2 border-purple-500 bg-gradient-to-br from-slate-900 to-slate-800 p-8 shadow-xl shadow-purple-500/10">
              <div className="absolute -top-3 right-4 rounded-full bg-purple-600 px-3 py-1 text-xs font-semibold text-white">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold text-white">Pro</h3>
              <p className="mt-2 text-sm text-slate-400">For power users</p>
              <div className="mt-6 flex items-baseline">
                <span className="text-5xl font-extrabold text-white">₹499</span>
                <span className="ml-1 text-xl font-semibold text-slate-400">/month</span>
              </div>
              <ul className="mt-8 flex-1 space-y-3 text-sm text-slate-300">
                <li>✓ 2,000 AI credits/month</li>
                <li>✓ Document AI + OCR</li>
                <li>✓ 10 GB storage</li>
                <li>✓ Family Guardian</li>
              </ul>
              <Link
                href="/checkout?plan=pro"
                className="mt-10 w-full rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 py-3 text-center font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:scale-105"
              >
                Upgrade to Pro
              </Link>
            </div>

            {/* Pro+ */}
            <div className="flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Pro+</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Maximum power</p>
              <div className="mt-6 flex items-baseline">
                <span className="text-5xl font-extrabold text-slate-900 dark:text-white">₹999</span>
                <span className="ml-1 text-xl font-semibold text-slate-400">/month</span>
              </div>
              <ul className="mt-8 flex-1 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <li>✓ 10,000 AI credits/month</li>
                <li>✓ 50 GB storage</li>
                <li>✓ Team features</li>
                <li>✓ Priority support</li>
              </ul>
              <Link
                href="/checkout?plan=pro_plus"
                className="mt-10 w-full rounded-xl border border-slate-300 dark:border-slate-700 py-3 text-center font-semibold text-slate-900 dark:text-white transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Upgrade to Pro+
              </Link>
            </div>

            {/* Enterprise */}
            <div className="flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Enterprise</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Custom solutions</p>
              <div className="mt-6 flex items-baseline">
                <span className="text-5xl font-extrabold text-slate-900 dark:text-white">Custom</span>
              </div>
              <ul className="mt-8 flex-1 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <li>✓ Unlimited AI credits</li>
                <li>✓ 1,000 GB storage</li>
                <li>✓ Admin controls</li>
                <li>✓ Multiple families</li>
              </ul>
              <a
                href="mailto:sales@smartdocs.ai"
                className="mt-10 w-full rounded-xl border border-slate-300 dark:border-slate-700 py-3 text-center font-semibold text-slate-900 dark:text-white transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Contact Sales
              </a>
            </div>
          </div>

          {/* Custom Plan CTA (prominent, right after pricing) */}
          <ScrollReveal>
            <div className="relative mt-10 overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-600/20 via-cyan-500/10 to-purple-600/20 p-8 sm:p-10 text-center">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-20 -left-20 h-52 w-52 rounded-full bg-purple-500/20 blur-3xl" />
                <div className="absolute -bottom-20 -right-20 h-52 w-52 rounded-full bg-cyan-400/15 blur-3xl" />
              </div>
              <div className="relative">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  Need a Custom Plan?
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
                  Contact us for enterprise pricing, team accounts, and custom
                  requirements.
                </p>
                <a
                  href="mailto:sales@smartdocs.ai"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 px-8 py-3.5 font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:scale-105 hover:shadow-purple-500/40"
                >
                  Contact Sales
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </ScrollReveal>

          <div className="mt-10 text-center">
            <Link
              href="/pricing"
              className="font-semibold text-purple-600 dark:text-purple-400 hover:underline"
            >
              View full pricing &amp; comparison →
            </Link>
          </div>
        </div>
      </section>

      {/* ── 8. Footer CTA ───────────────────────────── */}
      <section className="px-4 sm:px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-red-500 to-rose-500 px-6 sm:px-12 py-16 text-center text-white shadow-2xl">
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
                    className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-orange-600 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-white/30"
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

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="border-t border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-center text-sm text-slate-500 dark:text-slate-400 md:flex-row md:text-left">
          <p>© 2026 SmartDocs AI. All rights reserved.</p>
          <nav className="flex justify-center gap-6" aria-label="Footer navigation">
            <Link href="/about" className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
              Privacy
            </Link>
            <Link href="/about" className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
              Terms
            </Link>
            <Link href="/about" className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
              Contact
            </Link>
          </nav>
        </div>
      </footer>

      {/* Command Palette */}
      {commandOpen && <CommandPalette />}
    </main>
  );
}

