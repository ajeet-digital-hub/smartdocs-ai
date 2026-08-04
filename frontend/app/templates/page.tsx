"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Search, ChevronLeft, ChevronRight, Grid3x3, AlertCircle, RefreshCw, Star, TrendingUp, Crown } from "lucide-react";
import TemplateCard, { TemplateCardData } from "@/components/TemplateCard";

interface CategoryData {
  slug: string;
  name: string;
  count: number;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const FILTERS = [
  { value: "all", label: "All" },
  { value: "free", label: "Free" },
  { value: "premium", label: "Premium" },
  { value: "featured", label: "Featured" },
  { value: "popular", label: "Popular" },
  { value: "new", label: "New" },
];

const SORTS = [
  { value: "popular", label: "Popular" },
  { value: "newest", label: "Newest" },
  { value: "most-used", label: "Most Used" },
  { value: "az", label: "A-Z" },
];

function TemplatesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const [templates, setTemplates] = useState<TemplateCardData[]>([]);
  const [featured, setFeatured] = useState<TemplateCardData[]>([]);
  const [popular, setPopular] = useState<TemplateCardData[]>([]);
  const [premium, setPremium] = useState<TemplateCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("popular");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [showFeatured, setShowFeatured] = useState(true);
  const [showPopular, setShowPopular] = useState(true);

  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Debounce search ──
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [search]);

  // ── Fetch categories ──
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/templates/categories");
      const data = await res.json();
      if (data.success) setCategories(data.categories);
    } catch {
      // non-fatal
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]); // eslint-disable-line react-hooks/set-state-in-effect

  // ── Fetch templates ──
  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "24");
      if (selectedCategory && selectedCategory !== "all") params.set("category", selectedCategory);
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (filter !== "all") params.set("filter", filter);
      params.set("sort", sort);

      const res = await fetch(`/api/templates?${params}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to fetch templates");

      setTemplates(data.templates || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load templates.");
      setTemplates([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategory, debouncedSearch, filter, sort]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]); // eslint-disable-line react-hooks/set-state-in-effect

  // ── Fetch featured & popular (independent queries) ──
  const fetchFeatured = useCallback(async () => {
    try {
      const res = await fetch("/api/templates?filter=featured&limit=8&sort=popular");
      const data = await res.json();
      if (data.success) setFeatured(data.templates || []);
    } catch { /* non-fatal */ }
  }, []);

  const fetchPopular = useCallback(async () => {
    try {
      const res = await fetch("/api/templates?filter=popular&limit=8&sort=popular");
      const data = await res.json();
      if (data.success) setPopular(data.templates || []);
    } catch { /* non-fatal */ }
  }, []);

  const fetchPremium = useCallback(async () => {
    try {
      const res = await fetch("/api/templates?filter=premium&limit=8&sort=popular");
      const data = await res.json();
      if (data.success) setPremium(data.templates || []);
    } catch { /* non-fatal */ }
  }, []);

  useEffect(() => { fetchFeatured(); fetchPopular(); fetchPremium(); }, [fetchFeatured, fetchPopular, fetchPremium]); // eslint-disable-line react-hooks/set-state-in-effect

  // ── Fetch user's favorites ──
  const fetchFavorites = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch("/api/templates/favorite");
      const data = await res.json();
      if (data.success && Array.isArray(data.favoriteIds)) {
        setFavoriteIds(new Set(data.favoriteIds));
      }
    } catch { /* non-fatal */ }
  }, [session]);

  useEffect(() => { fetchFavorites(); }, [fetchFavorites]); // eslint-disable-line react-hooks/set-state-in-effect

  // ── Toggle favorite ──
  const handleToggleFavorite = useCallback(async (template: TemplateCardData) => {
    if (!session?.user?.id) {
      router.push("/login?callbackUrl=/templates");
      return;
    }
    try {
      const res = await fetch("/api/templates/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: template.templateId }),
      });
      const data = await res.json();
      if (data.success) {
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (data.favorited) next.add(template.templateId);
          else next.delete(template.templateId);
          return next;
        });
      }
    } catch { /* non-fatal */ }
  }, [session, router]);

  // ── Use template ──
  const handleUseTemplate = useCallback(async (template: TemplateCardData) => {
    if (!session?.user?.id) {
      router.push(`/login?callbackUrl=/templates/${template.slug}`);
      return;
    }
    if (!template.hasAccess) {
      router.push("/pricing");
      return;
    }
    router.push(`/templates/${template.slug}`);
  }, [session, router]);

  // ── Reset search ──
  const handleReset = useCallback(() => {
    setSearch("");
    setDebouncedSearch("");
    setSelectedCategory("all");
    setFilter("all");
    setSort("popular");
    setPage(1);
    setError(null);
  }, []);

  const isMainActive = selectedCategory !== "all" || debouncedSearch || filter !== "all" || sort !== "popular";

  return (
    <main className="min-h-screen bg-slate-950 pt-20 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* ── Header ── */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            Templates
          </h1>
          <p className="mt-2 text-slate-400 max-w-2xl">
            Create faster with professionally designed templates. Browse {pagination?.total || "hundreds of"} templates across {categories.length} categories.
          </p>
        </div>

        {/* ── Search & Filters ── */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              aria-label="Search templates"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter */}
            <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => { setFilter(f.value); setPage(1); }}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                    filter === f.value
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                  aria-label={`Filter by ${f.label}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              aria-label="Sort templates"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-400"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Category Navigation ── */}
        <div className="mb-6 overflow-x-auto scrollbar-none">
          <div className="flex gap-1.5 min-w-max pb-2">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  selectedCategory === cat.slug
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                }`}
                aria-label={`Category: ${cat.name}`}
              >
                {cat.name}
                {cat.count > 0 && (
                  <span className="ml-1.5 text-[10px] opacity-60">({cat.count})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Error State ── */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              onClick={fetchTemplates}
              className="flex items-center gap-1 rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-200 transition-colors hover:bg-red-500/30"
            >
              <RefreshCw className="h-3 w-3" /> Try Again
            </button>
          </div>
        )}

        {/* ── Featured Section ── */}
        {!isMainActive && featured.length > 0 && showFeatured && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                Featured Templates
              </h2>
              <button
                onClick={() => setShowFeatured(false)}
                className="text-xs text-slate-500 hover:text-white transition-colors"
                aria-label="Hide featured"
              >
                Hide
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {featured.slice(0, 8).map((t) => (
                <TemplateCard
                  key={t.templateId}
                  template={t}
                  isFavorite={favoriteIds.has(t.templateId)}
                  onToggleFavorite={handleToggleFavorite}
                  onUseTemplate={handleUseTemplate}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Popular Section ── */}
        {!isMainActive && popular.length > 0 && showPopular && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                Popular Templates
              </h2>
              <button
                onClick={() => setShowPopular(false)}
                className="text-xs text-slate-500 hover:text-white transition-colors"
                aria-label="Hide popular"
              >
                Hide
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {popular.slice(0, 8).map((t) => (
                <TemplateCard
                  key={t.templateId}
                  template={t}
                  isFavorite={favoriteIds.has(t.templateId)}
                  onToggleFavorite={handleToggleFavorite}
                  onUseTemplate={handleUseTemplate}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Premium Collection ── */}
        {!isMainActive && premium.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                <Crown className="h-5 w-5 text-amber-400" />
                Premium Collection
              </h2>
              <span className="text-xs text-slate-500">Exclusive templates for Pro & Pro+ members</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {premium.slice(0, 8).map((t) => (
                <TemplateCard
                  key={t.templateId}
                  template={t}
                  isFavorite={favoriteIds.has(t.templateId)}
                  onToggleFavorite={handleToggleFavorite}
                  onUseTemplate={handleUseTemplate}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Loading State ── */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
                <div className="aspect-[3/4] bg-slate-800/60" />
                <div className="p-3.5 space-y-2">
                  <div className="h-3 w-1/3 rounded bg-slate-700/50" />
                  <div className="h-4 w-3/4 rounded bg-slate-700/50" />
                  <div className="h-3 w-1/2 rounded bg-slate-700/50" />
                </div>
              </div>
            ))}
          </div>
        ) : templates.length === 0 && !error ? (
          /* ── Empty State ── */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Grid3x3 className="h-12 w-12 text-slate-600" />
            {debouncedSearch ? (
              <>
                <p className="mt-4 text-lg font-medium text-slate-400">
No templates found for &quot;{debouncedSearch}&quot;
                </p>
                <p className="text-sm text-slate-500">Try a different search term or browse categories</p>
              </>
            ) : selectedCategory !== "all" ? (
              <>
                <p className="mt-4 text-lg font-medium text-slate-400">
                  No templates available in this category yet
                </p>
                <p className="text-sm text-slate-500">Check back soon or browse other categories</p>
              </>
            ) : (
              <>
                <p className="mt-4 text-lg font-medium text-slate-400">No templates found</p>
                <p className="text-sm text-slate-500">Try adjusting your search or filters</p>
              </>
            )}
            {(debouncedSearch || selectedCategory !== "all" || filter !== "all") && (
              <button
                onClick={handleReset}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-purple-500"
              >
                <RefreshCw className="h-4 w-4" /> Clear Filters
              </button>
            )}
          </div>
        ) : (
          /* ── Template Grid ── */
          <>
            {pagination && (
              <div className="mb-3 text-sm text-slate-500">
                {pagination.total} template{pagination.total !== 1 ? "s" : ""} found
                {isMainActive && (
                  <button onClick={handleReset} className="ml-2 text-purple-400 hover:text-purple-300 text-xs">
                    Clear filters
                  </button>
                )}
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {templates.map((t) => (
                <TemplateCard
                  key={t.templateId}
                  template={t}
                  isFavorite={favoriteIds.has(t.templateId)}
                  onToggleFavorite={handleToggleFavorite}
                  onUseTemplate={handleUseTemplate}
                />
              ))}
            </div>

            {/* ── Pagination ── */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-400 transition-all hover:bg-white/5 disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                    let pageNum: number;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-all ${
                          page === pageNum
                            ? "bg-purple-600 text-white"
                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                        }`}
                        aria-label={`Page ${pageNum}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="flex items-center gap-1 rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-400 transition-all hover:bg-white/5 disabled:opacity-40"
                  aria-label="Next page"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default function TemplatesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 pt-20 pb-16 flex items-center justify-center text-white">
        Loading templates...
      </div>
    }>
      <TemplatesContent />
    </Suspense>
  );
}
