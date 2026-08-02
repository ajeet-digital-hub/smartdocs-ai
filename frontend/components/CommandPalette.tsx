"use client";

/**
 * CommandPalette — Ctrl+K universal command/search bar.
 *
 * Lets users quickly navigate to any major SmartDocs AI area or search
 * services. Lightweight, keyboard accessible, no external deps.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, CornerDownLeft, X } from "lucide-react";

interface CommandItem {
  id: string;
  label: string;
  hint?: string;
  href: string;
  emoji: string;
  keywords: string[];
}

const COMMANDS: CommandItem[] = [
  { id: "home", label: "Home", hint: "Goto", href: "/", emoji: "🏠", keywords: ["home", "start"] },
  { id: "assistant", label: "AI Assistant", hint: "AI Workspace", href: "/ai-tools", emoji: "🤖", keywords: ["ai", "chat", "assistant", "bot"] },
  { id: "summarize", label: "Summarize Document", hint: "AI Workspace", href: "/ai-tools", emoji: "📄", keywords: ["summary", "summarize", "pdf"] },
  { id: "translate", label: "Translate Document", hint: "AI Workspace", href: "/ai-tools", emoji: "🌐", keywords: ["translate", "translation", "language"] },
  { id: "ocr", label: "OCR / Scan Image", hint: "AI Workspace", href: "/ai-tools", emoji: "🖼️", keywords: ["ocr", "scan", "image", "extract text"] },
  { id: "services", label: "All Services", hint: "Browse", href: "/services", emoji: "🚀", keywords: ["services", "tools", "browse", "all"] },
  { id: "pricing", label: "Pricing", hint: "Plans", href: "/pricing", emoji: "💰", keywords: ["pricing", "plans", "upgrade", "cost"] },
  { id: "family", label: "Family Guardian", hint: "Parental controls", href: "/family-guardian", emoji: "🛡️", keywords: ["family", "guardian", "parent", "block", "screen"] },
  { id: "blocking", label: "App & Website Blocking", hint: "Family Guardian", href: "/dashboard/family-guardian/blocking", emoji: "🚫", keywords: ["block", "apps", "websites", "youtube", "instagram"] },
  { id: "dashboard", label: "Dashboard", hint: "Account", href: "/dashboard", emoji: "📊", keywords: ["dashboard", "account", "profile"] },
  { id: "checkout", label: "Checkout / Upgrade", hint: "Billing", href: "/checkout", emoji: "💳", keywords: ["checkout", "billing", "pay", "upgrade"] },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(true); // Opens as soon as it is mounted
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    window.dispatchEvent(new Event("close-command-palette"));
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close]);

  useEffect(() => {
    if (open) {
      // Component remounts on open, so activeIndex already resets to 0.
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMMANDS;
    return COMMANDS.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.hint?.toLowerCase().includes(q) ||
        c.keywords.some((k) => k.includes(q))
    );
  }, [query]);

  const run = (item: CommandItem) => {
    close();
    router.push(item.href);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 backdrop-blur-sm pt-[15vh] px-4 animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 shadow-2xl shadow-purple-500/20 animate-slide-up-fade">
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIndex((i) => Math.max(i - 1, 0));
              } else if (e.key === "Enter" && filtered[activeIndex]) {
                run(filtered[activeIndex]);
              }
            }}
            placeholder="Search or jump to… (e.g. 'translate my PDF', 'block YouTube')"
            className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm outline-none"
          />
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Close command palette"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto py-2">
          {filtered.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-slate-500">
              No matching commands. Try “summarize”, “translate”, or “blocking”.
            </p>
          )}
          {filtered.map((item, index) => (
            <button
              key={item.id}
              onClick={() => run(item)}
              onMouseEnter={() => setActiveIndex(index)}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                index === activeIndex ? "bg-white/10" : ""
              }`}
            >
              <span className="text-xl">{item.emoji}</span>
              <span className="flex-1">
                <span className="block text-sm font-medium text-white">{item.label}</span>
                {item.hint && <span className="block text-xs text-slate-500">{item.hint}</span>}
              </span>
              {index === activeIndex && (
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <CornerDownLeft className="h-3.5 w-3.5" /> open
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-between border-t border-white/10 px-4 py-2 text-[11px] text-slate-500">
          <span>↑↓ to navigate</span>
          <span>↵ to open</span>
          <span>esc to close</span>
        </div>
      </div>
    </div>
  );
}

