"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Service, Category } from "../types";
import ServiceCard from "./ServiceCard";
import SearchBar from "./SearchBar";
import CategorySidebar from "./CategorySidebar";
import TrendingSection from "./TrendingSection";
import FavoritesSection from "./FavoritesSection";
import RecentlyUsed, { addRecentlyUsed } from "./RecentlyUsed";
import LoadingSkeleton from "./LoadingSkeleton";
import ThemeToggle from "./ThemeToggle";
import {
  getServices,
  getCategories,
  getTrendingServices,
  getPopularServices,
  getNewServices,
  getRecentlyUsed,
  getFavoriteServices,
  addFavorite,
  removeFavorite,
  trackLaunch,
} from "@/lib/api";

// Local data fallback when backend API is unavailable
import {
  services as localServices,
  getCategories as getLocalCategories,
  getPopularServices as getLocalPopular,
  getTrendingServices as getLocalTrending,
  getNewServices as getLocalNew,
} from "../data/services";
import { categories as localCategories } from "../data/categories";

const FAVORITES_KEY = "sd-service-favorites";

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // API state
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [trendingServices, setTrendingServices] = useState<Service[]>([]);
  const [popularServices, setPopularServices] = useState<Service[]>([]);
  const [newServices, setNewServices] = useState<Service[]>([]);
  const [recentlyUsedServices, setRecentlyUsedServices] = useState<Service[]>([]);
  const [favoriteServices, setFavoriteServices] = useState<Service[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  // Check if user is logged in via NextAuth
  const { data: session } = useSession()
  const isLoggedIn = useMemo(() => {
    return !!session?.user?.email;
  }, [session]);

  // Fetch all data on mount (stable deps to avoid infinite loop)
  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      setApiError(null);
      try {
        const [servicesRes, categoriesRes, trendingRes, popularRes, newRes] = await Promise.all([
          getServices().catch(() => ({ ok: false, data: undefined })),
          getCategories().catch(() => ({ ok: false, data: undefined })),
          getTrendingServices().catch(() => ({ ok: false, data: undefined })),
          getPopularServices().catch(() => ({ ok: false, data: undefined })),
          getNewServices().catch(() => ({ ok: false, data: undefined })),
        ]);

        let loadedServices: Service[] = [];
        if (servicesRes.ok && servicesRes.data?.services?.length) {
          loadedServices = servicesRes.data.services;
        } else {
          // Fallback to local data when API returns empty or fails
          loadedServices = localServices as Service[];
        }
        setAllServices(loadedServices);

        if (categoriesRes.ok && categoriesRes.data?.categories?.length) {
          setCategories(categoriesRes.data.categories);
        } else {
          // Fallback to local categories
          setCategories(localCategories as Category[]);
        }

        if (trendingRes.ok && trendingRes.data?.services?.length) {
          setTrendingServices(trendingRes.data.services);
        } else {
          setTrendingServices(getLocalTrending() as Service[]);
        }

        if (popularRes.ok && popularRes.data?.services?.length) {
          setPopularServices(popularRes.data.services);
        } else {
          setPopularServices(getLocalPopular() as Service[]);
        }

        if (newRes.ok && newRes.data?.services?.length) {
          setNewServices(newRes.data.services);
        } else {
          setNewServices(getLocalNew() as Service[]);
        }

        if (isLoggedIn) {
          const recentRes = await getRecentlyUsed();
          if (recentRes.ok && recentRes.data) {
            setRecentlyUsedServices(recentRes.data.services);
          }
        }

        // Load favorites after services are loaded
        if (isLoggedIn) {
          const favRes = await getFavoriteServices();
          if (favRes.ok && favRes.data?.services) {
            const favIds = favRes.data.services.map((s: Service) => s.id);
            setFavorites(favIds);
            setFavoriteServices(favRes.data.services);
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(favIds));
          }
        } else {
          try {
            const stored = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]") as string[];
            setFavorites(stored);
            if (loadedServices.length > 0) {
              setFavoriteServices(loadedServices.filter((s) => stored.includes(s.id)));
            }
          } catch {
            setFavorites([]);
          }
        }
      } catch (err) {
        setApiError("Failed to load services. Please try again.");
        console.error("Failed to fetch services:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [isLoggedIn]);

  // Refresh recently used
  const refreshRecentlyUsed = useCallback(async () => {
    if (isLoggedIn) {
      const res = await getRecentlyUsed();
      if (res.ok && res.data) {
        setRecentlyUsedServices(res.data.services);
      }
    }
  }, [isLoggedIn]);

  // Scroll to top button
  useEffect(() => {
    const handler = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const toggleFavorite = useCallback(
    async (id: string) => {
      const isFav = favorites.includes(id);
      setFavorites((prev) => (isFav ? prev.filter((f) => f !== id) : [...prev, id]));

      if (isLoggedIn) {
        const res = isFav ? await removeFavorite(id) : await addFavorite(id);
        if (!res.ok) {
          setFavorites((prev) => (isFav ? [...prev, id] : prev.filter((f) => f !== id)));
        }
      } else {
        const next = isFav
          ? favorites.filter((f) => f !== id)
          : [...favorites, id];
        try {
          localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
      }
    },
    [favorites, isLoggedIn]
  );

  const handleQuickLaunch = useCallback(
    async (service: Service) => {
      if (isLoggedIn) {
        await trackLaunch(service.id).catch(() => {});
      }
      addRecentlyUsed(service.id);
      window.dispatchEvent(new Event("recently-used-update"));
      refreshRecentlyUsed();
      window.location.href = service.route || `/dashboard/tools/${service.id}`;
    },
    [isLoggedIn, refreshRecentlyUsed]
  );

  // Filtered services based on search + category
  const filteredServices = useMemo(() => {
    let result = allServices;
    if (activeCategory !== "All") {
      result = result.filter(
        (s) => s.category === activeCategory || s.categoryName === activeCategory
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          s.shortDescription?.toLowerCase().includes(q) ||
          s.category?.toLowerCase().includes(q) ||
          s.categoryName?.toLowerCase().includes(q) ||
          s.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [allServices, activeCategory, searchQuery]);

  // Helper to convert Service to card-compatible object
  const toCardService = (s: Service) => ({
    id: s.id,
    name: s.name,
    description: s.shortDescription || s.description || "",
    category: s.categoryName || s.category || "",
    icon: s.icon || "🔧",
    tags: s.tags || [],
    popular: s.popular,
    trending: s.trending,
    new: s.new,
    route: s.route,
  });

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 pb-4 pt-6 sm:pb-6 sm:pt-10">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-pink-500/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                All Services
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-purple-200/80 sm:text-base">
                Discover AI-powered tools to transform your documents, images, and workflows.
              </p>
            </div>
            <ThemeToggle />
          </div>
            <div className="mt-4 sm:mt-6">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              resultsCount={filteredServices.length}
              totalCount={allServices.length}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar */}
          <div className="w-full shrink-0 lg:w-64">
            <div className="sticky top-6">
              <CategorySidebar
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                totalCount={allServices.length}
              />
            </div>
          </div>

          {/* Main area */}
          <div className="min-w-0 flex-1">
            {apiError && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
                {apiError}
              </div>
            )}

            {!searchQuery && activeCategory === "All" ? (
              <div className="space-y-8">
                <RecentlyUsed
                  services={recentlyUsedServices}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                  onQuickLaunch={handleQuickLaunch}
                  toCardService={toCardService}
                />
                <TrendingSection
                  title="Trending Services"
                  services={trendingServices}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                  onQuickLaunch={handleQuickLaunch}
                  toCardService={toCardService}
                />
                <TrendingSection
                  title="Popular Services"
                  services={popularServices}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                  onQuickLaunch={handleQuickLaunch}
                  toCardService={toCardService}
                />
                <TrendingSection
                  title="Newly Added"
                  services={newServices}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                  onQuickLaunch={handleQuickLaunch}
                  toCardService={toCardService}
                />
                <FavoritesSection
                  services={favoriteServices}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                  onQuickLaunch={handleQuickLaunch}
                  toCardService={toCardService}
                />
                <section>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                      All Services
                    </h2>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {allServices.length} total
                    </span>
                  </div>
                  {allServices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl dark:bg-slate-800">
                        📦
                      </div>
                      <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
                        No services available
                      </h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Services will appear here once they are added.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {allServices.map((service) => (
                        <ServiceCard
                          key={service.id}
                          service={toCardService(service)}
                          isFavorite={favorites.includes(service.id)}
                          onToggleFavorite={toggleFavorite}
                          onQuickLaunch={() => handleQuickLaunch(service)}
                        />
                      ))}
                    </div>
                  )}
                </section>
              </div>
            ) : (
              /* Filtered results */
              <div>
                {filteredServices.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-4xl dark:bg-slate-800">
                      🔍
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                      No services found
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Try adjusting your search or filter.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setActiveCategory("All");
                      }}
                      className="cursor-pointer mt-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:shadow-md"
                    >
                      Clear all filters
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {activeCategory === "All" ? "All Services" : activeCategory}
                      </h2>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {filteredServices.length} results
                      </span>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {filteredServices.map((service) => (
                        <ServiceCard
                          key={service.id}
                          service={toCardService(service)}
                          isFavorite={favorites.includes(service.id)}
                          onToggleFavorite={toggleFavorite}
                          onQuickLaunch={() => handleQuickLaunch(service)}
                        />
                      ))}
                    </div>
                    <p className="border-t border-slate-100 pt-4 text-center text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500">
                      Showing {filteredServices.length} of {allServices.length} services
                      {activeCategory !== "All" && ` in ${activeCategory}`}
                      {searchQuery && ` matching "${searchQuery}"`}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scroll to top */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="cursor-pointer fixed bottom-6 left-6 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-2xl shadow-purple-500/30 transition-all hover:scale-105 hover:shadow-purple-500/50"
          aria-label="Scroll to top"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  );
}

// Re-export addRecentlyUsed for other components
export { addRecentlyUsed };
