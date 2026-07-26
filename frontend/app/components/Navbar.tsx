"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "AI Tools", href: "/ai-tools" },
  { label: "Pricing", href: "/pricing" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("sd_user");
  });
  const isAuth = Boolean(userEmail);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "sd_user") {
        try {
          const user = localStorage.getItem("sd_user");
          setUserEmail(user);
        } catch {
          setUserEmail(null);
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("sd_user");
    setUserEmail(null);
    router.push("/login");
  }, [router]);

  const handleMobileNavClick = useCallback(
    (href: string) => {
      setMobileOpen(false);
      router.push(href);
    },
    [router]
  );

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-slate-950/90 backdrop-blur-xl shadow-lg shadow-black/10"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-xl sm:text-2xl font-bold text-white cursor-pointer"
        >
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-cyan-400 text-white text-sm sm:text-base font-bold shadow-lg">
            S
          </div>
          <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            SmartDocs AI
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "text-white"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {link.label}
                <span
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-gradient-to-r from-purple-400 to-cyan-400 transition-all duration-300 ${
                    isActive ? "w-4/5" : "w-0 group-hover:w-4/5"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          {!isAuth ? (
            <>
              <button
                onClick={() => router.push("/login")}
                className="rounded-xl border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/10 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
              >
                Login
              </button>
              <Link
                href="/signup"
                className="rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
              >
                Get Started Free
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-300">{userEmail ?? "User"}</span>
              <button
                onClick={handleLogout}
                className="rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-white/10 cursor-pointer"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden flex flex-col items-center justify-center w-10 h-10 rounded-xl border border-white/20 text-white transition-all hover:bg-white/10 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          <span
            className={`block h-0.5 w-5 rounded-full bg-white transition-all duration-300 ${
              mobileOpen ? "rotate-45 translate-y-[4.5px]" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 rounded-full bg-white transition-all duration-300 mt-1 ${
              mobileOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 rounded-full bg-white transition-all duration-300 mt-1 ${
              mobileOpen ? "-rotate-45 -translate-y-[4.5px]" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 top-[57px] sm:top-[65px] z-40 bg-slate-950/95 backdrop-blur-xl transition-all duration-300 lg:hidden ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <nav className="flex flex-col items-center justify-start gap-1 px-6 pt-8" aria-label="Mobile navigation">
          {navLinks.map((link, i) => {
            const isActive = pathname === link.href;
            return (
              <button
                key={link.href}
                onClick={() => handleMobileNavClick(link.href)}
                className={`w-full rounded-xl px-4 py-3.5 text-center text-base font-medium transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
                style={{
                  transitionDelay: mobileOpen ? `${i * 50}ms` : "0ms",
                  opacity: mobileOpen ? 1 : 0,
                  transform: mobileOpen ? "translateY(0)" : "translateY(20px)",
                }}
              >
                {link.label}
              </button>
            );
          })}

          <hr className="my-4 w-3/4 border-slate-700/50" />

          {!isAuth ? (
            <div className="flex w-full flex-col gap-3 px-4 pt-2">
              <button
                onClick={() => handleMobileNavClick("/login")}
                className="w-full rounded-xl border border-white/20 px-5 py-3.5 text-center text-base font-semibold text-white transition-all duration-200 hover:bg-white/10 cursor-pointer"
              >
                Login
              </button>
              <button
                onClick={() => handleMobileNavClick("/signup")}
                className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 px-5 py-3.5 text-center text-base font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:shadow-purple-500/30 cursor-pointer"
              >
                Get Started Free
              </button>
            </div>
          ) : (
            <div className="flex w-full flex-col gap-3 px-4 pt-2">
              <span className="text-center text-sm text-slate-400">
                {userEmail ?? "User"}
              </span>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileOpen(false);
                }}
                className="w-full rounded-xl border border-white/20 px-5 py-3.5 text-center text-base font-semibold text-white transition-all duration-200 hover:bg-white/10 cursor-pointer"
              >
                Logout
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
