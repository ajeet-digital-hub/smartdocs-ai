"use client"

import { useState, useMemo } from "react"
import Link from "next/link"

type Service = {
  id: string
  name: string
  description: string
  category: string
  initials: string
}

const categories = [
  "All Services",
  "AI Services",
  "Document AI",
  "PDF Tools",
  "OCR & Image Processing",
  "Translation Services",
  "Summarization",
  "Security",
]

const services: Service[] = [
  { id: "1", name: "AI Writer", description: "AI Services workspace for faster professional results.", category: "AI Services", initials: "AS" },
  { id: "2", name: "AI Workflow Assistant", description: "AI Services workspace for faster professional results.", category: "AI Services", initials: "AS" },
  { id: "3", name: "Document Classifier", description: "Document AI workspace for faster professional results.", category: "Document AI", initials: "DA" },
  { id: "4", name: "PDF Merger", description: "Merge, split and compress PDFs in seconds.", category: "PDF Tools", initials: "PT" },
  { id: "5", name: "OCR Scanner", description: "Extract text from scanned documents and images.", category: "OCR & Image Processing", initials: "OI" },
  { id: "6", name: "Language Translator", description: "Translate documents across 50+ languages instantly.", category: "Translation Services", initials: "TS" },
  { id: "7", name: "Text Summarizer", description: "Summarize long documents into key points automatically.", category: "Summarization", initials: "SM" },
  { id: "8", name: "Contract Analyzer", description: "Document AI workspace for faster professional results.", category: "Document AI", initials: "DA" },
  { id: "family-guardian", name: "Family Guardian", description: "Organize family documents and keep important information protected.", category: "Security", initials: "FG" },
]

export default function EnterpriseCatalog() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("All Services")

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesCategory =
        activeCategory === "All Services" || service.category === activeCategory
      const q = searchQuery.trim().toLowerCase()
      const matchesSearch =
        q.length === 0 ||
        service.name.toLowerCase().includes(q) ||
        service.description.toLowerCase().includes(q) ||
        service.category.toLowerCase().includes(q)
      return matchesCategory && matchesSearch
    })
  }, [searchQuery, activeCategory])

  return (
    <section className="overflow-hidden rounded-3xl bg-[#0B0E17] p-6 sm:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header label */}
        <div className="text-[13px] font-bold tracking-[0.28em] text-purple-400">
          ENTERPRISE CATALOG
        </div>

        {/* Title row + search */}
        <div className="mb-7 mt-4 flex flex-wrap items-center justify-between gap-5">
          <p className="m-0 text-base text-slate-400">
            Create, automate, analyze, and scale with professional AI tools.
          </p>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search services..."
            className="w-full max-w-[320px] rounded-xl border border-purple-500 bg-[#12101C] px-4 py-3 text-sm text-white outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30"
          />
        </div>

        {/* Category pills */}
        <div className="mb-4 flex gap-2.5 overflow-x-auto pb-3">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-150 ${
                activeCategory === cat
                  ? "bg-purple-500 text-white"
                  : "bg-[#1A1D2B] text-[#C6C9D4] hover:bg-[#252838]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Count */}
        <p className="mb-5 text-sm text-[#8B90A0]">
          {filteredServices.length} service{filteredServices.length !== 1 ? "s" : ""} available
        </p>

        {/* Cards grid */}
        {filteredServices.length === 0 ? (
          <div className="rounded-2xl bg-[#12101C] px-5 py-16 text-center text-sm text-[#8B90A0]">
            No services found for &ldquo;{searchQuery}&rdquo;.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredServices.map((service) => (
              <Link
                key={service.id}
                href={`/dashboard/tools/${service.id}`}
                className="group block rounded-2xl border border-[#201D2E] bg-[#12101C] p-6 transition-all duration-150 hover:-translate-y-0.5 hover:border-purple-500"
              >
                {/* Initials badge */}
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#3A1D5C] text-[13px] font-bold text-[#D8B4FE]">
                  {service.initials}
                </div>

                {/* Name */}
                <h3 className="mb-2 text-[19px] font-bold text-white">
                  {service.name}
                </h3>

                {/* Description */}
                <p className="mb-4 text-sm leading-relaxed text-[#9CA3AF]">
                  {service.description}
                </p>

                {/* Category tag */}
                <span className="text-[13.5px] font-semibold text-purple-400">
                  {service.category}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
