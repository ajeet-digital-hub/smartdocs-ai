"use client";

import { Service } from "../types";
import ServiceCard from "./ServiceCard";

interface FavoritesSectionProps {
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

export default function FavoritesSection({
  services,
  favorites,
  onToggleFavorite,
  onQuickLaunch,
  toCardService,
}: FavoritesSectionProps) {
  if (!services || services.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            ⭐ Your Favorites
          </h2>
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-600 dark:bg-red-950/50 dark:text-red-400">
            {services.length}
          </span>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {services.map((service) => (
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
