"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { services, getPopularServices } from "@/app/services/data/services";
import { categories } from "@/app/services/data/categories";
import type { Service } from "@/app/services/types";

// Map existing category names into the broader tool-discovery groupings requested.
const GROUP_LABELS: Record<string, string> = {
  Documents: "Documents",
  "PDF & Files": "PDF & Files",
  Images: "Images",
  Writing: "Writing",
  Productivity: "Productivity",
  "Other Categories": "Other Categories",
};

// Categorize an existing service into one of the discovery groups based on its category.
function groupForService(service: Service): string {
  const category = (service.categoryName || service.category || "").toLowerCase();
  if (
    ["document suite", "document ai", "language & translation"].some((c) => category.includes(c)) ||
    service.name.toLowerCase().includes("document") ||
    service.name.toLowerCase().includes("resume") ||
    service.name.toLowerCase().includes("cover letter") ||
    service.name.toLowerCase().includes("invoice") ||
    service.name.toLowerCase().includes("proposal") ||
    service.name.toLowerCase().includes("contract") ||
    service.name.toLowerCase().includes("letter")
  ) {
    return "Documents";
  }
  if (
    ["pdf suite", "file tools"].some((c) => category.includes(c)) ||
    category.includes("pdf") ||
    category.includes("file") ||
    service.name.toLowerCase().includes("pdf") ||
    service.name.toLowerCase().includes("convert")
  ) {
    return "PDF & Files";
  }
  if (
    ["image studio", "design studio", "video studio"].some((c) => category.includes(c)) ||
    category.includes("image") ||
    service.name.toLowerCase().includes("image") ||
    service.name.toLowerCase().includes("photo") ||
    service.name.toLowerCase().includes("logo") ||
    service.name.toLowerCase().includes("banner") ||
    service.name.toLowerCase().includes("thumbnail")
  ) {
    return "Images";
  }
  if (
    category.includes("ai assistant") ||
    service.name.toLowerCase().includes("writer") ||
    service.name.toLowerCase().includes("blog") ||
    service.name.toLowerCase().includes("email") ||
    service.name.toLowerCase().includes("content") ||
    service.name.toLowerCase().includes("caption") ||
    service.name.toLowerCase().includes("ad copy")
  ) {
    return "Writing";
  }
  if (
    category.includes("productivity") ||
    service.name.toLowerCase().includes("notes") ||
    service.name.toLowerCase().includes("calendar") ||
    service.name.toLowerCase().includes("task") ||
    service.name.toLowerCase().includes("todo") ||
    service.name.toLowerCase().includes("tracker")
  ) {
    return "Productivity";
  }
  return "Other Categories";
}

const GROUP_ORDER: string[] = [
  "Documents",
  "PDF & Files",
  "Images",
  "Writing",
  "Productivity",
  "Other Categories",
];

const GROUP_DESCRIPTIONS: Record<string, string> = {
  Documents: "Create, edit and format professional documents with AI.",
  "PDF & Files": "Convert, merge, compress and extract from PDFs and files.",
  Images: "Generate, edit and transform images and designs.",
  Writing: "Write, rewrite and improve content across formats.",
  Productivity: "Organize work, notes, schedules and tasks.",
  "Other Categories": "More specialized tools for every workflow.",
};

export default function AIToolsPage() {
  const [query, setQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("All");

  const grouped = useMemo(() => {
    const groups = new Map<string, Service[]>();
    for (const group of GROUP_ORDER) groups.set(group, []);
    for (const service of services) {
      const group = groupForService(service);
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group)!.push(service);
    }
    return groups;
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return services.filter((service) => {
      if (selectedGroup !== "All" && groupForService(service) !== selectedGroup) return false;
      if (!q) return true;
      return (
        service.name.toLowerCase().includes(q) ||
        service.description.toLowerCase().includes(q) ||
        (service.tags || []).some((tag) => tag.toLowerCase().includes(q)) ||
        (service.categoryName || service.category || "").toLowerCase().includes(q)
      );
    });
  }, [query, selectedGroup]);

  const popular = useMemo(() => getPopularServices().slice(0, 8), []);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* ── Header ── */}
      <section className="border-b border-slate-100 bg-white pb-10 pt-24 sm:pt-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">AI Tools</h1>
          <p className="mt-3 max-w-2xl text-base text-slate-500 sm:text-lg">
            Everything you need to create, analyze and transform your work.
          </p>

          {/* Search */}
          <div className="relative mt-8 max-w-xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search AI tools..."
              aria-label="Search AI tools"
              className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-base text-slate-900 placeholder-slate-400 shadow-sm outline-none transition-all focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {/* ── Category Navigation ── */}
        <div className="mb-10 flex flex-wrap gap-2">
          {["All", ...GROUP_ORDER].map((group) => (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                selectedGroup === group
                  ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
              }`}
            >
              {group}
            </button>
          ))}
        </div>

        {/* ── Popular Tools ── */}
        {!query && selectedGroup === "All" && (
          <section className="mb-14">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-slate-900" />
                <h2 className="text-xl font-semibold text-slate-900">Popular Tools</h2>
              </div>
              <Link
                href="/services"
                className="hidden items-center gap-1 text-sm font-semibold text-slate-700 hover:text-slate-900 sm:inline-flex"
              >
                Explore all services <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {popular.map((service) => (
                <Link
                  key={service.id}
                  href={service.route || `/dashboard/tools/${service.id}`}
                  className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-100"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl transition-colors group-hover:bg-slate-900">
                    <span className="text-xl">{service.icon || "🔧"}</span>
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-slate-900">{service.name}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    {service.shortDescription || service.description}
                  </p>
                </Link>
              ))}
            </div>
            <div className="mt-5 text-center sm:hidden">
              <Link
                href="/services"
                className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-slate-900"
              >
                Explore all services <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        )}

        {/* ── Category Sections ── */}
        {query ? (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Search Results</h2>
              <span className="text-xs text-slate-500">{filtered.length} results</span>
            </div>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-20 text-center">
                <Search className="h-10 w-10 text-slate-300" />
                <h3 className="mt-4 text-lg font-semibold text-slate-700">No tools found</h3>
                <p className="mt-1 text-sm text-slate-500">Try a different keyword or browse categories.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {filtered.map((service) => (
                  <Link
                    key={service.id}
                    href={service.route || `/dashboard/tools/${service.id}`}
                    className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-100"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl">
                      {service.icon || "🔧"}
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-slate-900">{service.name}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      {service.shortDescription || service.description}
                    </p>
                    <span className="mt-3 text-[11px] font-medium text-slate-400">
                      {service.categoryName || service.category || ""}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        ) : selectedGroup === "All" ? (
          <div className="space-y-14">
            {GROUP_ORDER.map((group) => {
              const items = (grouped.get(group) || []).slice(0, 8);
              if (items.length === 0) return null;
              return (
                <section key={group} id={group.toLowerCase().replace(/\s+/g, "-")}>
                  <div className="mb-5 flex items-end justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        {GROUP_LABELS[group]}
                      </p>
                      <h2 className="mt-1 text-xl font-semibold text-slate-900">{group}</h2>
                      <p className="mt-1 text-sm text-slate-500">{GROUP_DESCRIPTIONS[group]}</p>
                    </div>
                    <Link
                      href="/services"
                      className="hidden items-center gap-1 text-sm font-semibold text-slate-700 hover:text-slate-900 sm:inline-flex"
                    >
                      View all <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {items.map((service) => (
                      <Link
                        key={service.id}
                        href={service.route || `/dashboard/tools/${service.id}`}
                        className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-100"
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl">
                          {service.icon || "🔧"}
                        </div>
                        <h3 className="mt-4 text-sm font-semibold text-slate-900">{service.name}</h3>
                        <p className="mt-1 text-xs leading-relaxed text-slate-500">
                          {service.shortDescription || service.description}
                        </p>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <section>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {GROUP_LABELS[selectedGroup]}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">{selectedGroup}</h2>
                <p className="mt-1 text-sm text-slate-500">{GROUP_DESCRIPTIONS[selectedGroup]}</p>
              </div>
              <span className="text-xs text-slate-500">
                {(grouped.get(selectedGroup) || []).length} tools
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {(grouped.get(selectedGroup) || []).map((service) => (
                <Link
                  key={service.id}
                  href={service.route || `/dashboard/tools/${service.id}`}
                  className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-100"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl">
                    {service.icon || "🔧"}
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-slate-900">{service.name}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    {service.shortDescription || service.description}
                  </p>
                  <span className="mt-3 text-[11px] font-medium text-slate-400">
                    {service.categoryName || service.category || ""}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── Categories Strip (from existing category data) ── */}
      <section className="border-t border-slate-100 bg-slate-50 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-xl font-semibold text-slate-900">Browse Categories</h2>
          <p className="mt-1 text-sm text-slate-500">
            Jump into any category to explore the tools available.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {categories.slice(0, 20).map((category) => (
              <Link
                key={category.id}
                href={`/services?category=${encodeURIComponent(category.name)}`}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition-all hover:border-slate-300 hover:shadow-sm"
              >
                <span className="text-xl">{category.icon || "🧰"}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{category.name}</p>
                  <p className="text-[11px] text-slate-400">{category.count || 0} tools</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-6">
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800"
            >
              View all services <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

