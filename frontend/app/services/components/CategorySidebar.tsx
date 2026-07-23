"use client";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  gradient: string;
  count: number;
  sortOrder?: number;
}

interface CategorySidebarProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  totalCount: number;
}

const fallbackIcons: Record<string, string> = {
  "AI Services": "🤖",
  "Document AI": "📄",
  "PDF Tools": "📕",
  "OCR & Image Processing": "👁️",
  "Translation Services": "🌐",
  Summarization: "📝",
  "Resume Builder": "📋",
  "Cover Letter Generator": "✉️",
  "Business Documents": "🏢",
  "Legal Documents": "⚖️",
  "HR Documents": "👥",
  "Finance & Accounting": "💰",
  "Invoice Generator": "🧾",
  "Contract Generator": "📜",
  "Proposal Generator": "📊",
  Marketing: "📣",
  "Developer Tools": "💻",
  Productivity: "⚡",
  Education: "🎓",
  Healthcare: "🏥",
  Security: "🔒",
  "File Tools": "📁",
  "Video Tools": "🎬",
  "Audio Tools": "🎵",
  "Image Studio": "🎨",
  Design: "✨",
  "Email & Communication": "📧",
  "Travel & Lifestyle": "✈️",
  "Web & SEO": "🌍",
  "Mobile Apps": "📱",
  "Data & Analytics": "📈",
};

export default function CategorySidebar({
  categories,
  activeCategory,
  onCategoryChange,
  totalCount,
}: CategorySidebarProps) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800/80">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        Categories
      </h3>
      <nav className="space-y-0.5">
        <button
          onClick={() => onCategoryChange("All")}
          className={`cursor-pointer flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-all ${
            activeCategory === "All"
              ? "bg-gradient-to-r from-purple-100 to-pink-100 font-semibold text-purple-700 dark:from-purple-950/60 dark:to-pink-950/60 dark:text-purple-300"
              : "font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700/50"
          }`}
        >
          <span className="text-base">🚀</span>
          <span className="flex-1">All Services</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-400">
            {totalCount}
          </span>
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id || cat.name}
            onClick={() => onCategoryChange(cat.name)}
            className={`cursor-pointer flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-all ${
              activeCategory === cat.name
                ? "bg-gradient-to-r from-purple-100 to-pink-100 font-semibold text-purple-700 dark:from-purple-950/60 dark:to-pink-950/60 dark:text-purple-300"
                : "font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700/50"
            }`}
          >
            <span className="text-base">{cat.icon || fallbackIcons[cat.name] || "📦"}</span>
            <span className="flex-1 truncate">{cat.name}</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-400">
              {cat.count}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
