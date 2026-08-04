"use client";

import { useSidebar } from "./SidebarContext";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Smartphone,
  AppWindow,
  Globe,
  Clock,
  BarChart3,
  Bell,
  Settings,
  ShieldCheck,
  Gift,
  HeartPulse,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const sidebarItems = [
  { name: "Dashboard", href: "/dashboard/family-guardian", icon: LayoutDashboard },
  { name: "Family Overview", href: "/dashboard/family-guardian/family", icon: HeartPulse },
  { name: "Children", href: "/dashboard/family-guardian/children", icon: Users },
  { name: "Devices", href: "/dashboard/family-guardian/devices", icon: Smartphone }, // This line was already present, but confirming its correctness.
  { name: "App Blocking", href: "/dashboard/family-guardian/blocking", icon: AppWindow },
  { name: "Website Policies", href: "/dashboard/family-guardian/website-policies", icon: Globe },
  { name: "Schedules", href: "/dashboard/family-guardian/schedules", icon: Clock },
  { name: "Rewards & Goals", href: "/dashboard/family-guardian/rewards", icon: Gift },
  { name: "Safety & Alerts", href: "/dashboard/family-guardian/safety", icon: ShieldCheck },
  { name: "Analytics", href: "/dashboard/family-guardian/analytics", icon: BarChart3 }, // This line was already present, but confirming its correctness.
  { name: "Notifications", href: "/dashboard/family-guardian/notifications", icon: Bell },
  { name: "Unlock Requests", href: "/dashboard/family-guardian/unlock-requests", icon: ShieldCheck },
];

export function Sidebar() {
  const { isOpen, toggleSidebar } = useSidebar();
  const pathname = usePathname();

  const sidebarVariants = {
    open: { width: "256px" },
    closed: { width: "72px" },
  };

  return (
    <motion.aside
      variants={sidebarVariants}
      initial="open"
      animate={isOpen ? "open" : "closed"}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 z-40 h-full border-r border-[#1F2937] bg-[#111827] hidden lg:flex flex-col"
    >
      {/* Logo */}
      <div className="flex h-16 items-center shrink-0 px-4">
        <div className="flex items-center gap-2 w-full">
           <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center text-white font-bold">
             FG
           </div>
           <AnimatePresence>
            {isOpen && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="font-bold text-lg text-white whitespace-nowrap">
                  Family Guardian
              </motion.span>
            )}
           </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {sidebarItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#7C3AED]/10 text-[#A78BFA]"
                  : "text-gray-400 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <item.icon size={20} className="shrink-0" />
              <AnimatePresence>
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Settings & Subscription */}
      <div className="mt-auto space-y-1 border-t border-[#1F2937] px-2 py-4">
        <Link
          href="/dashboard/family-guardian/subscription"
          className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            pathname.startsWith('/dashboard/family-guardian/subscription')
              ? "bg-[#7C3AED]/10 text-[#A78BFA]"
              : "text-gray-400 hover:bg-gray-700 hover:text-white"
          }`}
        >
          <Settings size={20} className="shrink-0" />
          {isOpen && <span className="whitespace-nowrap">Subscription</span>}
        </Link>
      </div>

      {/* Collapse Button */}
      <div className="mt-auto border-t border-[#1F2937] p-2">
        <button
          onClick={toggleSidebar}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          <AnimatePresence>
            {isOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="whitespace-nowrap"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}