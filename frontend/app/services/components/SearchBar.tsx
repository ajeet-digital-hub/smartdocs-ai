"use client";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  resultsCount: number;
  totalCount: number;
}

export default function SearchBar({
  value,
  onChange,
  resultsCount,
  totalCount,
}: SearchBarProps) {
  return (
    <div className="relative">
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search services, tools, categories..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white/95 py-3 pl-12 pr-4 text-sm text-slate-900 shadow-sm backdrop-blur-sm placeholder:text-slate-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-slate-600 dark:bg-slate-800/95 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-purple-500"
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      {value && (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          {resultsCount === 0
            ? "No matching services found"
            : `Found ${resultsCount} service${resultsCount !== 1 ? "s" : ""}`}
        </p>
      )}
    </div>
  );
}
