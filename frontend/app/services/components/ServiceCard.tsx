"use client";

interface ServiceCardData {
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
}

interface ServiceCardProps {
  service: ServiceCardData;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onQuickLaunch: (service: ServiceCardData) => void;
}

const categoryColors: Record<string, string> = {
  "PDF Suite": "text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400",
  "Document Suite": "text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400",
  "AI Assistant": "text-violet-600 bg-violet-50 dark:bg-violet-950/40 dark:text-violet-400",
  "Image Studio": "text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 dark:text-cyan-400",
  "Video Studio": "text-pink-600 bg-pink-50 dark:bg-pink-950/40 dark:text-pink-400",
  "Audio Studio": "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400",
  Business: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400",
  Marketing: "text-orange-600 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-400",
  Developer: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400",
  Productivity: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400",
  Education: "text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400",
  Healthcare: "text-green-600 bg-green-50 dark:bg-green-950/40 dark:text-green-400",
  Legal: "text-stone-600 bg-stone-50 dark:bg-stone-950/40 dark:text-stone-400",
  Security: "text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400",
};

const defaultCardStyle =
  "text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400";

export default function ServiceCard({
  service,
  isFavorite,
  onToggleFavorite,
  onQuickLaunch,
}: ServiceCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-100/50 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:shadow-purple-900/20">
      <div className="absolute right-3 top-3 z-10 flex gap-1.5">
        {service.new && (
          <span className="inline-flex items-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">New</span>
        )}
        {service.trending && (
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" /></svg>
            Trending
          </span>
        )}
        {service.popular && (
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            Popular
          </span>
        )}
      </div>

      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 text-xl dark:from-purple-950/50 dark:to-pink-950/50">
        {service.icon || "🔧"}
      </div>

      <h3 className="mb-1.5 text-base font-semibold text-slate-900 dark:text-white">{service.name}</h3>

      <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{service.description}</p>

      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium ${categoryColors[service.category] || defaultCardStyle}`}>
        {service.category}
      </span>

      <div className="relative z-10 mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-700/50">
        <button onClick={(e) => { e.preventDefault(); onQuickLaunch(service); }} className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all duration-200 hover:from-purple-700 hover:to-pink-600 hover:shadow-md hover:shadow-purple-300/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 dark:hover:shadow-purple-700/30">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          Launch
        </button>

        <button onClick={(e) => { e.preventDefault(); onToggleFavorite(service.id); }} aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"} className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all duration-200 hover:bg-red-50 hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:hover:bg-red-950/40">
          <svg className={`h-4 w-4 transition-all duration-200 ${isFavorite ? "scale-110 text-red-500" : "scale-100"}`} fill={isFavorite ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
