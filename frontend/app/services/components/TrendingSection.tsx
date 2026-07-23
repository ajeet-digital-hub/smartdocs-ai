"use client";

import { Service } from "../types";
import ServiceCard from "./ServiceCard";

interface TrendingSectionProps {
  title: string;
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

export default function TrendingSection({
  title,
  services,
  favorites,
  onToggleFavorite,
  onQuickLaunch,
  toCardService,
}: TrendingSectionProps) {
  if (!services || services.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {services.length} services
        </span>
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
