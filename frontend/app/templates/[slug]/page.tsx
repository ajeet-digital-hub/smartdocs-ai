"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Lock, Sparkles, Heart, ExternalLink, Loader, FileText, Eye, Star, Tag, User } from "lucide-react";
import TemplatePreviewCanvas from "@/components/TemplatePreviewCanvas";
import type { PreviewLayer } from "@/components/TemplatePreviewCanvas";

interface TemplateDetail {
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
  layers: PreviewLayer[];
  fonts: string[];
  usageCount: number;
  favoriteCount: number;
  hasAccess: boolean;
  author: string;
  createdAt: string;
}

const fileTypeColors: Record<string, string> = {
  PDF: "text-red-400 bg-red-500/10 border-red-500/20",
  DOCX: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  PPTX: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  XLSX: "text-green-400 bg-green-500/10 border-green-500/20",
  IMAGE: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  DESIGN: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
};

export default function TemplatePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const slug = params?.slug as string;

  const [template, setTemplate] = useState<TemplateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [using, setUsing] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);

  const fetchTemplate = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/templates/${slug}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Template not found");
      setTemplate(data.template);
      setFavoriteCount(data.template.favoriteCount || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load template");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { fetchTemplate(); }, [fetchTemplate]); // eslint-disable-line react-hooks/set-state-in-effect

  // Check if already favorited
  useEffect(() => {
    if (!session?.user?.id || !template) return;
    fetch("/api/templates/favorite")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.favoriteIds)) {
          setIsFavorite(data.favoriteIds.includes(template.templateId));
        }
      })
      .catch(() => {});
  }, [session, template]);

  const handleFavorite = useCallback(async () => {
    if (!session?.user?.id) {
      router.push(`/login?callbackUrl=/templates/${slug}`);
      return;
    }
    if (!template) return;
    try {
      const res = await fetch("/api/templates/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: template.templateId }),
      });
      const data = await res.json();
      if (data.success) {
        setIsFavorite(data.favorited);
        setFavoriteCount((prev) => prev + (data.favorited ? 1 : -1));
      }
    } catch { /* non-fatal */ }
  }, [session, router, slug, template]);

  const handleUseTemplate = useCallback(async () => {
    if (!session?.user?.id) {
      router.push(`/login?callbackUrl=/templates/${slug}`);
      return;
    }
    if (!template?.hasAccess) {
      router.push("/pricing");
      return;
    }
    setUsing(true);
    try {
      const res = await fetch("/api/templates/use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: template.templateId }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed to use template");
      router.push(`/templates/editor/${data.designId || data.design?._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to use template");
    } finally {
      setUsing(false);
    }
  }, [session, router, slug, template]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 pt-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-8 w-8 animate-spin text-purple-400" />
          <p className="text-sm text-slate-400">Loading template...</p>
        </div>
      </main>
    );
  }

  if (error || !template) {
    return (
      <main className="min-h-screen bg-slate-950 pt-24">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <FileText className="mx-auto h-12 w-12 text-slate-600" />
          <p className="mt-4 text-lg text-red-300">{error || "Template not found"}</p>
          <p className="mt-1 text-sm text-slate-500">The template you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <button
            onClick={() => router.push("/templates")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-purple-500"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Templates
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 pt-20 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Back button */}
        <button
          onClick={() => router.push("/templates")}
          className="mb-6 flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Templates
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* ── Preview (3 cols) ── */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">Preview</h2>
                <span className="text-xs text-slate-500">{template.width} &times; {template.height}px</span>
              </div>
              <div className="flex items-center justify-center">
                <TemplatePreviewCanvas
                  layers={template.layers || []}
                  width={template.width}
                  height={template.height}
                  maxWidth={700}
                  maxHeight={900}
                  renderText={true}
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* ── Details (2 cols) ── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Main Info Card */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-purple-300/80">
                      {template.categoryName || template.category}
                    </span>
                    {template.isPremium && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 text-[10px] font-bold text-black">
                        <Lock className="h-2.5 w-2.5" />
                        {template.premiumTier || "PRO"}
                      </span>
                    )}
                    {template.isFeatured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                        <Star className="h-2.5 w-2.5" /> Featured
                      </span>
                    )}
                    {template.isNew && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500 px-2 py-0.5 text-[10px] font-semibold text-black">
                        <Sparkles className="h-2.5 w-2.5" /> New
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-white">{template.name}</h1>
                </div>
                <button
                  onClick={handleFavorite}
                  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                    isFavorite
                      ? "bg-rose-500/20 text-rose-400"
                      : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-rose-400"
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
                </button>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                {template.description}
              </p>

              {/* Meta Grid */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/[0.03] px-3 py-2.5">
                  <p className="text-[10px] text-slate-500 uppercase">File Type</p>
                  <span className={`mt-1 inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold ${fileTypeColors[template.fileType] || fileTypeColors.PDF}`}>
                    {template.fileType}
                  </span>
                </div>
                <div className="rounded-xl bg-white/[0.03] px-3 py-2.5">
                  <p className="text-[10px] text-slate-500 uppercase">Dimensions</p>
                  <p className="mt-1 text-sm text-white">{template.width} &times; {template.height}</p>
                </div>
                <div className="rounded-xl bg-white/[0.03] px-3 py-2.5">
                  <p className="text-[10px] text-slate-500 uppercase">Usage</p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-white">
                    <Eye className="h-3.5 w-3.5 text-slate-500" />
                    {template.usageCount} uses
                  </p>
                </div>
                <div className="rounded-xl bg-white/[0.03] px-3 py-2.5">
                  <p className="text-[10px] text-slate-500 uppercase">Favorites</p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-white">
                    <Heart className="h-3.5 w-3.5 text-rose-400" />
                    {favoriteCount}
                  </p>
                </div>
                <div className="rounded-xl bg-white/[0.03] px-3 py-2.5">
                  <p className="text-[10px] text-slate-500 uppercase">Plan</p>
                  <p className="mt-1 text-sm text-white capitalize">
                    {template.isPremium ? "Premium" : "Free"}
                  </p>
                </div>
                <div className="rounded-xl bg-white/[0.03] px-3 py-2.5">
                  <p className="text-[10px] text-slate-500 uppercase">Author</p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-white">
                    <User className="h-3.5 w-3.5 text-slate-500" />
                    {template.author || "SmartDocs AI"}
                  </p>
                </div>
              </div>

              {/* Tags */}
              {template.tags && template.tags.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-slate-500 uppercase mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-[10px] text-slate-400"
                      >
                        <Tag className="h-2.5 w-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Fonts */}
              {template.fonts && template.fonts.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-slate-500 uppercase mb-2">Fonts Used</p>
                  <div className="flex flex-wrap gap-1.5">
                    {template.fonts.map((font) => (
                      <span key={font} className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] text-slate-400">
                        {font}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={handleUseTemplate}
                  disabled={using}
                  className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50"
                >
                  {using ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader className="h-4 w-4 animate-spin" /> Loading...
                    </span>
                  ) : !session ? (
                    <span className="flex items-center justify-center gap-2">
                      <ExternalLink className="h-4 w-4" /> Sign In to Use
                    </span>
                  ) : !template.hasAccess ? (
                    <span className="flex items-center justify-center gap-2">
                      <Lock className="h-4 w-4" /> Upgrade to Use
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles className="h-4 w-4" /> Use This Template
                    </span>
                  )}
                </button>

                {!template.hasAccess && template.isPremium && (
                  <p className="text-xs text-amber-400 text-center">
                    This template requires a {template.premiumTier || "Premium"} plan.
                    <button
                      onClick={() => router.push("/pricing")}
                      className="ml-1 text-amber-300 underline hover:text-amber-200"
                    >
                      Upgrade now
                    </button>
                  </p>
                )}
              </div>
            </div>

            {/* Layer Info Card */}
            {template.layers && template.layers.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
                  <FileText className="h-4 w-4 text-slate-400" />
                  Template Structure
                </h3>
<div className="space-y-1.5">
                  {template.layers
                    .filter((l) => l.type !== "background")
                    .slice(0, 12)
                    .map((layer) => (
                      <div key={layer.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-slate-400 hover:bg-white/[0.02]">
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          layer.type === "text" ? "bg-blue-400" :
                          layer.type === "shape" ? "bg-green-400" :
                          layer.type === "image" ? "bg-amber-400" :
                          layer.type === "background" ? "bg-slate-400" : "bg-purple-400"
                        }`} />
                        <span className="capitalize font-medium">{layer.type}</span>
                        {layer.props?.text && (
                          <span className="truncate text-slate-500 max-w-[200px]">
                            &ldquo;{String(layer.props.text).substring(0, 40)}&rdquo;
                          </span>
                        )}
                        {layer.props?.color && (
                          <span className="inline-flex items-center gap-1 ml-auto">
                            <span className="h-3 w-3 rounded-full border border-white/10" style={{ backgroundColor: String(layer.props.color) }} />
                          </span>
                        )}
                      </div>
                    ))}
                  {template.layers.filter((l) => l.type !== "background").length > 12 && (
                    <p className="text-xs text-slate-500 pt-1">
                      +{template.layers.filter((l) => l.type !== "background").length - 12} more layers
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
