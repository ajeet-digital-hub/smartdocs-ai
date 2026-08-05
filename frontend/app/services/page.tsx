"use client";

import { useState, useEffect, useCallback, Suspense, FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search as SearchIcon, Loader, Sparkles } from "lucide-react";
import CategorySidebar from "@/components/CategorySidebar";
import ServiceCard from "@/components/ServiceCard";

interface Service {
  id: string;
  name: string;
  shortDescription: string;
  icon: string; // Assuming icon is a string URL or class for now
  route: string;
  categoryName: string;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
  count: number;
}

const examplePrompts = [
  "Remove background",
  "Convert PDF to Word",
  "Create invoice",
  "Translate document",
];

/** Safely parse a fetch response as JSON, returning null on failure. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- API responses are dynamic/untyped.
async function safeJson(response: Response): Promise<any> {
  try {
    const text = await response.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function ServicesPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recommendedServices, setRecommendedServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");

  const activeCategoryId = searchParams.get("category") || null;

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/services/categories");
      const data = await safeJson(res);
      if (res.ok && data?.ok) {
        // Add "All Services" as a virtual category with total count
        const totalServicesCount = data.categories.reduce((sum: number, cat: Category) => sum + cat.count, 0);
        setCategories([
          { id: "all-services", name: "All Services", count: totalServicesCount },
          ...data.categories,
        ]);
      } else {
        setError(data?.error || "Failed to fetch categories. Please check the backend server logs.");
      }
    } catch {
      setError("Network error fetching categories. Is the backend server running?");
    }
  }, []);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      const manualSearch = searchParams.get("search");

      if (activeCategoryId && activeCategoryId !== "all-services") {
        params.append("categoryId", activeCategoryId);
      }
      if (manualSearch) {
        params.append("search", manualSearch);
      }

      const res = await fetch(`/api/services?${params.toString()}`);
      const data = await safeJson(res);

      if (res.ok && data?.ok) {
        setServices(data.services);
      } else {
        setError(data?.error || "Failed to fetch services. Please check the backend server logs.");
        setServices([]);
      }
    } catch {
      setError("Network error fetching services. Is the backend server running?");
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategoryId, searchParams]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional mount-time data fetch; fetchCategories is memoized and stable.
    fetchCategories();
  }, [fetchCategories]); // This is acceptable as fetchCategories is stable

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional data fetch on mount/category change; fetchServices is memoized.
    fetchServices();
  }, [fetchServices, activeCategoryId, searchParams]); // Corrected dependency array

  const handleCategorySelect = (categoryId: string | null) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (categoryId && categoryId !== "all-services") {
      newSearchParams.set("category", categoryId);
    } else {
      newSearchParams.delete("category");
    }
    router.push(`/services?${newSearchParams.toString()}`);
  };

  const handleSearchSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setRecommendedServices([]);
      return;
    }

    setAiLoading(true);
    setError(null);
    setRecommendedServices([]);

    try {
      const res = await fetch(`/api/ai/search/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await safeJson(res);
      if (res.ok && data.ok) {
        setRecommendedServices(data.services || []);
      } else {
        setError(data?.error || "AI search failed. Please try again.");
        setRecommendedServices([]);
      }
    } catch {
      setError("AI search failed. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center mb-2">Services Catalog</h1>

        {/* ── AI-FIRST SEARCH SECTION ── */}
        <section className="mb-10 rounded-3xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-cyan-400/5 p-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-purple-100">
            <Sparkles className="h-4 w-4 text-cyan-300" />
            Tell SmartDocs AI what you want to do
          </div>
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-white">
            What are you trying to do?
          </h2>
          <p className="mt-2 text-slate-400">
            Describe what you need and we&apos;ll show you the right tool.
          </p>

          <form onSubmit={handleSearchSubmit} className="relative mx-auto mt-6 max-w-2xl">
            <input
              type="text"
              placeholder="e.g. remove background, convert PDF to Word…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-5 pr-14 text-white placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
            />
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white" aria-label="Search services">
              <SearchIcon className="h-5 w-5" />
            </button>
          </form>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {examplePrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => setSearchQuery(prompt)}
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm text-slate-300 transition-colors hover:border-cyan-400/40 hover:text-white"
              >
                {prompt}
              </button>
            ))}
          </div>
        </section>

        {/* AI Search Results */}
        {(aiLoading || recommendedServices.length > 0) && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-white mb-4">Recommended for you</h2>
            {aiLoading ? (
              <div className="flex justify-center items-center h-32">
                <Loader className="h-8 w-8 animate-spin text-purple-400" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {recommendedServices.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          <CategorySidebar
            categories={categories}
            activeCategoryId={activeCategoryId}
            onSelectCategory={handleCategorySelect}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Browse All Tools</h2>
              <form onSubmit={(e: FormEvent<HTMLFormElement>) => { e.preventDefault(); router.push(`/services?search=${(e.currentTarget.elements.namedItem('search') as HTMLInputElement).value}`); }} className="relative">
                <input name="search" type="text" defaultValue={searchParams.get("search") || ""} placeholder="Manual search..." className="rounded-lg border border-white/10 bg-white/5 py-1.5 pl-8 pr-3 text-sm text-white placeholder-slate-500 focus:border-purple-400" />
                <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              </form>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader className="h-8 w-8 animate-spin text-purple-400" />
              </div>
            ) : error ? (
              <div className="text-center text-red-400">{error}</div>
            ) : services.length === 0 ? (
              <div className="text-center text-slate-400">No services found for this category or search query.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <Loader className="h-8 w-8 animate-spin text-purple-400" />
    </div>}>
      <ServicesPageInner />
    </Suspense>
  );
}
