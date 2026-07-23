"use client";

export default function LoadingSkeleton() {
  const items = Array.from({ length: 8 }, (_, i) => i);
  const cards = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 pb-6 pt-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-10 w-48 animate-pulse rounded-lg bg-white/10"></div>
          <div className="mt-2 h-5 w-96 animate-pulse rounded bg-white/5"></div>
          <div className="mt-6 h-12 w-full animate-pulse rounded-xl bg-white/5"></div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="w-full shrink-0 lg:w-64">
            <div className="space-y-2 rounded-2xl bg-white p-4 dark:bg-slate-800/80">
              {items.map((i) => (
                <div key={i} className="h-10 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-700"></div>
              ))}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {cards.map((i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800/80">
                  <div className="mb-3 h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-700"></div>
                  <div className="mb-2 h-5 w-3/4 rounded bg-slate-100 dark:bg-slate-700"></div>
                  <div className="mb-3 h-4 w-full rounded bg-slate-100 dark:bg-slate-700"></div>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-700">
                    <div className="h-8 w-16 rounded-lg bg-slate-100 dark:bg-slate-700"></div>
                    <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-700"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
