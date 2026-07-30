/**
 * Generic API fetch utility and client for general services
 *
 * Note: Specific types for Service and Category are assumed to be defined
 * elsewhere (e.g., in frontend/app/services/types.ts) or are handled as 'any'
 * to avoid introducing new type definitions not directly requested.
 */

interface ApiFetchOptions extends RequestInit {
  params?: Record<string, string>;
}

export async function apiFetch<T>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;
  let url = endpoint;

  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
    ...fetchOptions,
  });

  const contentType = response.headers.get("content-type");

  if (!response.ok || !contentType?.includes("application/json")) {
    const errorText = await response.text();
    console.error(`API Fetch Error: ${response.status} ${response.statusText} on ${url}`);
    console.error(`Response (first 300 chars): ${errorText.substring(0, 300)}`);
    throw new Error(
      `API request failed to ${url} with status ${response.status}. Expected JSON but received ${contentType}.`
    );
  }

  return response.json() as Promise<T>;
}

// ─── General Services API Client ───

export async function getServices() {
  return apiFetch<{ ok: boolean; data: { services: any[] } }>("/api/services");
}

export async function getCategories() {
  return apiFetch<{ ok: boolean; data: { categories: any[] } }>("/api/services/categories");
}

export async function getTrendingServices() {
  return apiFetch<{ ok: boolean; data: { services: any[] } }>("/api/services/trending");
}

export async function getPopularServices() {
  return apiFetch<{ ok: boolean; data: { services: any[] } }>("/api/services/popular");
}

export async function getNewServices() {
  return apiFetch<{ ok: boolean; data: { services: any[] } }>("/api/services/new");
}

export async function getRecentlyUsed() {
  // Assuming this endpoint exists and returns recently used services
  return apiFetch<{ ok: boolean; data: { services: any[] } }>("/api/services/recently-used");
}

export async function getFavoriteServices() {
  // Assuming this endpoint exists and returns favorite services
  return apiFetch<{ ok: boolean; data: { services: any[] } }>("/api/services/favorites");
}

export async function addFavorite(serviceId: string) {
  // Assuming this endpoint exists for adding a favorite
  return apiFetch<{ ok: boolean; message: string }>("/api/services/favorites", {
    method: "POST",
    body: JSON.stringify({ serviceId }),
  });
}

export async function removeFavorite(serviceId: string) {
  // Assuming this endpoint exists for removing a favorite
  return apiFetch<{ ok: boolean; message: string }>(`/api/services/favorites/${serviceId}`, {
    method: "DELETE",
  });
}

export async function trackLaunch(serviceId: string) {
  // Assuming this endpoint exists for tracking service launches
  return apiFetch<{ ok: boolean; message: string }>("/api/services/track-launch", {
    method: "POST",
    body: JSON.stringify({ serviceId }),
  });
}