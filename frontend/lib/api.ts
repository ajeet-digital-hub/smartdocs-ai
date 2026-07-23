/**
 * Centralized API client for communicating with the backend Express server.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface FetchOptions extends RequestInit {
  params?: Record<string, string | undefined>;
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  // Try to get token from localStorage (set by login flow)
  try {
    // Check NextAuth token first
    const nextAuthToken = localStorage.getItem("next-auth.session-token");
    if (nextAuthToken) return nextAuthToken;

    // Check our custom auth token
    const sdToken = localStorage.getItem("sd_token");
    if (sdToken) return sdToken;

    // Try to parse user object
    const sdUser = localStorage.getItem("sd_user");
    if (sdUser) {
      try {
        const parsed = JSON.parse(sdUser);
        if (parsed.token) return parsed.token;
      } catch {
        // sd_user is just an email string
        return null;
      }
    }

    return null;
  } catch {
    return null;
  }
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<{ ok: boolean; data?: T; error?: string }> {
  const { params, ...fetchOpts } = options;

  // Build URL
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        searchParams.set(key, value);
      }
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  // Build headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOpts.headers as Record<string, string>),
  };

  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...fetchOpts,
      headers,
    });

    const body = await response.json();

    if (!response.ok) {
      return {
        ok: false,
        error: body.error || body.message || `HTTP ${response.status}`,
      };
    }

    return { ok: true, data: body };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}

// ─── Services API ───

export interface Service {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  description: string;
  category: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  categoryGradient: string;
  icon: string;
  image: string | null;
  route: string;
  status: string;
  isActive: boolean;
  isFeatured: boolean;
  popular: boolean;
  trending: boolean;
  new: boolean;
  tags: string[];
  sortOrder: number;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  gradient: string;
  count: number;
  sortOrder: number;
}

// Fetch services with filters
export async function getServices(params?: {
  category?: string;
  categoryId?: string;
  search?: string;
  popular?: string;
  trending?: string;
  new?: string;
  featured?: string;
  page?: string;
  limit?: string;
}) {
  return apiFetch<{
    ok: boolean;
    services: Service[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>("/services", { params });
}

// Fetch categories
export async function getCategories() {
  return apiFetch<{
    ok: boolean;
    categories: Category[];
  }>("/services/categories");
}

// Fetch a single service by slug/id
export async function getServiceBySlug(slug: string) {
  return apiFetch<{
    ok: boolean;
    service: Service;
  }>(`/services/${slug}`);
}

// Fetch trending services
export async function getTrendingServices() {
  return apiFetch<{
    ok: boolean;
    services: Service[];
  }>("/services/trending");
}

// Fetch popular services
export async function getPopularServices() {
  return apiFetch<{
    ok: boolean;
    services: Service[];
  }>("/services/popular");
}

// Fetch new services
export async function getNewServices() {
  return apiFetch<{
    ok: boolean;
    services: Service[];
  }>("/services/new");
}

// Fetch featured services
export async function getFeaturedServices() {
  return apiFetch<{
    ok: boolean;
    services: Service[];
  }>("/services/featured");
}

// Fetch recently used services (auth required)
export async function getRecentlyUsed() {
  return apiFetch<{
    ok: boolean;
    services: Service[];
  }>("/services/recent");
}

// Fetch favorite services (auth required)
export async function getFavoriteServices() {
  return apiFetch<{
    ok: boolean;
    services: Service[];
  }>("/services/favorites");
}

// Search services
export async function searchServices(params: {
  q?: string;
  category?: string;
  categoryId?: string;
  popular?: string;
  trending?: string;
  new?: string;
}) {
  return apiFetch<{
    ok: boolean;
    services: Service[];
    total: number;
  }>("/services/search", { params });
}

// Add favorite (auth required)
export async function addFavorite(serviceId: string) {
  return apiFetch<{ ok: boolean; message: string }>(
    `/services/${serviceId}/favorite`,
    { method: "POST" }
  );
}

// Remove favorite (auth required)
export async function removeFavorite(serviceId: string) {
  return apiFetch<{ ok: boolean; message: string }>(
    `/services/${serviceId}/favorite`,
    { method: "DELETE" }
  );
}

// Track launch (auth required)
export async function trackLaunch(serviceId: string) {
  return apiFetch<{ ok: boolean; message: string }>(
    `/services/${serviceId}/launch`,
    { method: "POST" }
  );
}

// ─── Auth API ───

export async function login(email: string, password: string) {
  return apiFetch<{
    ok: boolean;
    token: string;
    user: { id: number; fullName: string; email: string };
  }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register(data: {
  fullName: string;
  email?: string;
  password: string;
  countryCode?: string;
  phoneNumber?: string;
}) {
  return apiFetch<{
    ok: boolean;
    token: string;
    user: { id: number; fullName: string; email: string };
  }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMe() {
  return apiFetch<{
    ok: boolean;
    user: { id: number; fullName: string; email: string; createdAt: string };
  }>("/auth/me");
}
