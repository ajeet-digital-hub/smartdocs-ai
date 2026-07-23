"use client";

import { useState, useEffect } from "react";
import { Service } from "../types";
import ServiceCard from "./ServiceCard";

interface RecentlyUsedProps {
  services: Service[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onQuickLaunch: (service: Service) => void;
  toCardService: (s: Service) => {
    id: string;
    name: string;
    description: string;
    category: string;
    icon: string;
    tags: string[];
    popular: boolean;
    trending: boolean;
    new: boolean;
    route?: string;
  };
}

// Local recently used tracking for guest users
const RECENTLY_USED_KEY = "sd-recently-used";

export function addRecentlyUsed(serviceId: string) {
  if (typeof window === "undefined") return;
  try {
    let recent: string[] = JSON.parse(localStorage.getItem(RECENTLY_USED_KEY) || "[]");
    recent = [serviceId, ...recent.filter((id) => id !== serviceId)];
    if (recent.length > 20) recent = recent.slice(0, 20);
    localStorage.setItem(RECENTLY_USED_KEY, JSON.stringify(recent));
  } catch {
    // ignore
  }
}

function getLocalRecentlyUsed(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENTLY_USED_KEY) || "[]");
  } catch {
    return [];
  }
}

export default function RecentlyUsed({
  services,
  favorites,
  onToggleFavorite,
  onQuickLaunch,
  toCardService,
}: RecentlyUsedProps) {
  const [localIds, setLocalIds] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("sd_token") || !!localStorage.getItem("sd_user"));
    if (!isLoggedIn) {
      setLocalIds(getLocalRecentlyUsed());
    }

    const handler = () => {
      if (!isLoggedIn) {
        setLocalIds(getLocalRecentlyUsed());
      }
    };
    window.addEventListener("recently-used-update", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("recently-used-update", handler);
      window.removeEventListener("storage", handler);
    };
  }, [isLoggedIn]);

  // For logged-in users, use API services. For guests, filter by local IDs.
  const displayServices = isLoggedIn
    ? services
    : services.filter((s) => localIds.includes(s.id));

  if (displayServices.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Recently Used
          </h2>
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
            {displayServices.length}
          </span>
        </div>
        {!isLoggedIn && (
          <span className="text-[11px] text-slate-400">Local browser storage</span>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayServices.map((service) => (
          <ServiceCard
            key={service.id}
            service={toCardService(service)}
            isFavorite={favorites.includes(service.id)}
            onToggleFavorite={onToggleFavorite}
            onQuickLaunch={() => onQuickLaunch(service)}
          />
        ))}
      </div>
    </section>
  );
}
