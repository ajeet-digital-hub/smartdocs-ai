"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Search, ChevronRight, Menu } from "lucide-react";
import { useSession } from "next-auth/react";
import { useSidebar } from "./SidebarContext";
import { NotificationBell } from "@/components/NotificationBell";

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { toggleSidebar } = useSidebar();

  // Create breadcrumbs from the pathname
  const pathSegments = pathname.split('/').filter(Boolean);
  // Expecting paths like /dashboard/family-guardian/children/[id]/overview
  const breadcrumbSegments = pathSegments.slice(2); 

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-[#1F2937] bg-[#111827]/80 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="rounded-full p-2 text-gray-400 hover:bg-gray-700 hover:text-white lg:hidden"
          aria-label="Toggle Sidebar"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumbs */}
        <nav className="hidden items-center gap-2 text-sm font-medium text-gray-400 md:flex">
          <Link href="/dashboard/family-guardian" className="hover:text-white">
            Family Guardian
          </Link>
          {breadcrumbSegments.map((segment, index) => {
            // Don't link the last segment
            if (index === breadcrumbSegments.length - 1) {
              return (
                <div key={segment} className="flex items-center gap-2">
                  <ChevronRight size={16} />
                  <span className="text-white">{capitalize(segment.replace(/-/g, ' '))}</span>
                </div>
              );
            }
            // Don't create links for dynamic IDs
            if (pathSegments[index + 2].match(/^[0-9a-fA-F]{24}$/)) {
              return <ChevronRight key={segment} size={16} />;
            }
            const href = `/dashboard/family-guardian/${breadcrumbSegments.slice(0, index + 1).join('/')}`;
            return (
              <div key={segment} className="flex items-center gap-2">
                <ChevronRight size={16} />
                <Link href={href} className="hover:text-white">
                  {capitalize(segment)}
                </Link>
              </div>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            className="w-40 rounded-lg border border-gray-700 bg-gray-800 py-1.5 pl-9 pr-3 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:w-64"
          />
        </div>

        {/* Notification Bell */}
        <NotificationBell />

        {/* Profile Avatar */}
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#06B6D4]">
          {session?.user?.image ? (
            <img src={session.user.image} alt="User" className="h-full w-full rounded-full object-cover" />
          ) : null}
        </div>
      </div>
    </header>
  );
}