"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "AI Tools", href: "/ai-tools" },
  { label: "Templates", href: "/templates" },
  { label: "Family Guardian", href: "/family-guardian", auth: true },
  { label: "Pricing", href: "/pricing" },
  { label: "Profile", href: "/home/profile", auth: true },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const isAuth = status === "authenticated";
  const user = session?.user as (Record<string, unknown> & { fullName?: string; name?: string; email?: string }) | null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setTimeout(() => {
      setMobileOpen(false);
      setProfileOpen(false);
    }, 0);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = useCallback(() => {
    setProfileOpen(false);
    signOut({ callbackUrl: "/login" });
  }, []);

  const handleMobileNavClick = useCallback(
    (href: string) => {
      setMobileOpen(false);
      router.push(href);
    },
    [router]
  );

  const userInitial =
    user?.fullName?.charAt(0)?.toUpperCase() ||
    user?.name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "U";
  const displayName = user?.fullName || user?.name || user?.email || "User";

  // Routes that render their own dedicated app shell / header navigation
  // (Family Guardian dashboard, the authenticated /home dashboard, auth pages,
  // and checkout) should NOT also show this global navbar to avoid a double
  // navigation bar. All other routes (/, /ai-tools, /services, /templates,
  // /workspace, /pricing, etc.) use this global navbar.
  const hideOnShell = [
    "/family-guardian",
    "/home",
    "/login",
    "/signup",
    "/checkout",
  ];
  if (hideOnShell.some((prefix) => pathname === prefix || pathname?.startsWith(`${prefix}/`))) {
    return null;
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-sm shadow-black/5 border-b border-slate-200"
          : "bg-white border-b border-slate-200/60"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-xl sm:text-2xl font-bold text-slate-900 cursor-pointer"
        >
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-slate-900 text-white text-sm sm:text-base font-bold shadow-sm">
            S
          </div>
          <span className="text-slate-900">SmartDocs AI</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
          {navLinks
            .filter((link) => !link.auth || (link.auth && isAuth))
            .map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4/5 rounded-full bg-slate-900" />
                  )}
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
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-50 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Login
              </button>
              <Link
                href="/signup"
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-slate-800 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Get Started Free
              </Link>
            </>
          ) : (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-slate-50 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                  {userInitial}
                </div>
                <span className="text-slate-700 text-sm max-w-[120px] truncate">{displayName}</span>
                <svg
                  className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 py-2 z-50">
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-900 truncate">{displayName}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email || ""}</p>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <Link
                      href="/home"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                    >
                      <span className="text-lg">🤖</span>
                      AI Workspace
                    </Link>
                    <Link
                      href="/home/subscription"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                    >
                      <span className="text-lg">💳</span>
                      Subscription & Billing
                    </Link>
                    <Link
                      href="/family-guardian"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Family Guardian
                    </Link>
                    <Link
                      href="/home/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Profile & Settings
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-slate-100 pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden flex flex-col items-center justify-center w-10 h-10 rounded-xl border border-slate-300 text-slate-700 transition-all hover:bg-slate-50 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          <span
            className={`block h-0.5 w-5 rounded-full bg-slate-700 transition-all duration-300 ${
              mobileOpen ? "rotate-45 translate-y-[4.5px]" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 rounded-full bg-slate-700 transition-all duration-300 mt-1 ${
              mobileOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 rounded-full bg-slate-700 transition-all duration-300 mt-1 ${
              mobileOpen ? "-rotate-45 -translate-y-[4.5px]" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 top-[57px] sm:top-[65px] z-40 bg-white transition-all duration-300 lg:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <nav className="flex flex-col items-center justify-start gap-1 px-6 pt-8" aria-label="Mobile navigation">
          {navLinks
            .filter((link) => !link.auth || isAuth)
            .map((link) => {
              const isActive = pathname === link.href;
              return (
                <button
                  key={link.href}
                  onClick={() => handleMobileNavClick(link.href)}
                  className={`w-full rounded-xl px-4 py-3.5 text-center text-base font-medium transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                </button>
              );
            })}

          <hr className="my-4 w-3/4 border-slate-200" />

          {!isAuth ? (
            <div className="flex w-full flex-col gap-3 px-4 pt-2">
              <button
                onClick={() => handleMobileNavClick("/login")}
                className="w-full rounded-xl border border-slate-300 px-5 py-3.5 text-center text-base font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-50 cursor-pointer"
              >
                Login
              </button>
              <button
                onClick={() => handleMobileNavClick("/signup")}
                className="w-full rounded-xl bg-slate-900 px-5 py-3.5 text-center text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-slate-800 cursor-pointer"
              >
                Get Started Free
              </button>
            </div>
          ) : (
            <div className="flex w-full flex-col gap-3 px-4 pt-2">
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                  {userInitial}
                </div>
                <span className="text-center text-sm font-medium text-slate-900">{displayName}</span>
                <span className="text-center text-xs text-slate-500 -mt-1">{user?.email || ""}</span>
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileOpen(false);
                }}
                className="w-full rounded-xl border border-slate-300 px-5 py-3.5 text-center text-base font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-50 cursor-pointer"
              >
                Sign Out
              </button>
              <Link
                href="/home"
                onClick={() => setMobileOpen(false)}
                className="w-full rounded-xl border border-slate-300 px-5 py-3.5 text-center text-base font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-50 cursor-pointer"
              >
                Dashboard
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
