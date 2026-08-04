"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Heart, Lock, Sparkles, Star, TrendingUp, FileText, Eye, Check } from "lucide-react";
import TemplatePreviewCanvas, { PreviewLayer } from "./TemplatePreviewCanvas";

export interface TemplateCardData {
  templateId: string;
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  categoryName: string;
  tags: string[];
  fileType: string;
  isPremium: boolean;
  requiredPlan: string;
  premiumTier: string | null;
  isFeatured: boolean;
  isPopular: boolean;
  isNew: boolean;
  thumbnail: string;
  preview: string;
  width: number;
  height: number;
  layers?: PreviewLayer[];
  usageCount: number;
  favoriteCount: number;
  hasAccess: boolean;
  createdAt?: string;
}

interface TemplateCardProps {
  template: TemplateCardData;
  isFavorite?: boolean;
  onToggleFavorite?: (template: TemplateCardData) => void;
  onUseTemplate?: (template: TemplateCardData) => void;
}

const fileTypeColors: Record<string, string> = {
  PDF: "text-red-400 bg-red-500/10 border-red-500/20",
  DOCX: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  PPTX: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  XLSX: "text-green-400 bg-green-500/10 border-green-500/20",
  IMAGE: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  DESIGN: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
};

export default function TemplateCard({
  template,
  isFavorite = false,
  onToggleFavorite,
  onUseTemplate,
}: TemplateCardProps) {
  const router = useRouter();

  const handleOpenPreview = useCallback(() => {
    router.push(`/templates/${template.slug}`);
  }, [router, template.slug]);

  const handleFavorite = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleFavorite?.(template);
    },
    [onToggleFavorite, template]
  );

  const handleUse = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onUseTemplate) {
        onUseTemplate(template);
      } else {
        router.push(`/templates/${template.slug}`);
      }
    },
    [onUseTemplate, router, template]
  );

  const layers = template.layers?.length ? template.layers : undefined;

  return (
    <article
      onClick={handleOpenPreview}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] transition-all duration-300 hover:-translate-y-1.5 hover:border-purple-400/50 hover:bg-white/[0.06] hover:shadow-2xl hover:shadow-purple-950/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
      role="button"
      tabIndex={0}
      aria-label={`View template ${template.name}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleOpenPreview();
        }
      }}
    >
      {/* ── Preview area ── */}
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-900/40">
        {layers ? (
          <TemplatePreviewCanvas
            layers={layers}
            width={template.width || 800}
            height={template.height || 600}
            maxWidth={360}
            maxHeight={520}
            renderText={false}
            className="transition-transform duration-300 group-hover:scale-105"
          />
        ) : template.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={template.thumbnail}
            alt={template.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
            <FileText className="h-10 w-10 text-slate-600" />
          </div>
        )}

        {/* Top-left badges */}
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
          {template.isPremium && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-0.5 text-[11px] font-bold text-black shadow-lg">
              <Lock className="h-3 w-3" />
              {template.premiumTier || "PRO"}
            </span>
          )}
          {template.isFeatured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-600 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-lg">
              <Star className="h-3 w-3" />
              Featured
            </span>
          )}
          {template.isNew && (
            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500 px-2.5 py-0.5 text-[11px] font-semibold text-black shadow-lg">
              <Sparkles className="h-3 w-3" />
              New
            </span>
          )}
          {template.isPopular && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[11px] font-semibold text-black shadow-lg">
              <TrendingUp className="h-3 w-3" />
              Popular
            </span>
          )}
        </div>

        {/* Favorite button */}
        <button
          onClick={handleFavorite}
          aria-label={isFavorite ? `Remove ${template.name} from favorites` : `Add ${template.name} to favorites`}
          className={`absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all ${
            isFavorite
              ? "bg-rose-500 text-white shadow-lg"
              : "bg-black/40 text-white hover:bg-rose-500/80"
          }`}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
        </button>

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button
            onClick={handleUse}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.03]"
          >
            {template.isPremium && !template.hasAccess ? (
              <>
                <Lock className="h-4 w-4" /> Upgrade to Use
              </>
            ) : (
              <>
                <Check className="h-4 w-4" /> Use Template
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Info ── */}
      <div className="p-3.5">
        <p className="text-[11px] font-medium uppercase tracking-wide text-purple-300/80">
          {template.categoryName || template.category}
        </p>
        <h3 className="mt-1 truncate text-sm font-semibold text-white">{template.name}</h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">
          {template.description}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${fileTypeColors[template.fileType] || fileTypeColors.PDF}`}
            >
              {template.fileType}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
              <Eye className="h-3 w-3" />
              {template.usageCount}
            </span>
          </div>
          <span className="text-[10px] text-slate-500">
            {template.isPremium ? "Premium" : "Free"}
          </span>
        </div>
      </div>
    </article>
  );
}

