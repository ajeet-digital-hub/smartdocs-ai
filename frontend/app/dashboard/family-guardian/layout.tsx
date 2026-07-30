"use client";

import { useState, createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/app/family-guardian/components/Sidebar";
import { SidebarProvider, useSidebar } from "@/app/family-guardian/components/SidebarContext";
import Header from "@/app/family-guardian/components/Header";

export default function FamilyGuardianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-[#0B1220] text-gray-300 font-sans">
        <Sidebar />
        <MainContent>{children}</MainContent>
      </div>
    </SidebarProvider>
  );
}

function MainContent({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();

  return (
    <motion.div
      initial={false}
      animate={{
        marginLeft: isOpen ? "256px" : "72px",
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex flex-col"
    >
      <Header />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={usePathname()}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </motion.div>
  );
}