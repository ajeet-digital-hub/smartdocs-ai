"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { WelcomeAnimation } from "../../family-guardian/components/WelcomeAnimation";
import * as familyGuardianApi from "@/lib/family-guardian-api";

interface Child {
  _id: string;
  name: string;
  age: number;
  avatar?: string;
}

export default function FamilyGuardianDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      const hasSeenWelcome = localStorage.getItem("familyGuardianWelcome");
      if (!hasSeenWelcome) {
        setShowWelcome(true);
      }
    }
  }, [status]);

  const handleWelcomeComplete = () => {
    localStorage.setItem("familyGuardianWelcome", "true");
    setShowWelcome(false);
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>;
  }

  if (showWelcome) {
    return (
      <WelcomeAnimation onComplete={handleWelcomeComplete} />
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Family Guardian</h1>
            <p className="text-gray-300 mt-1">Welcome, {session?.user?.fullName || session?.user?.name || "User"}!</p>
          </div>
          <Link
            href="/dashboard/family-guardian/children"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all"
          >
            Manage Children
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card: Manage Children */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-3">👨‍👩‍👧‍👦 Children</h2>
            <p className="text-gray-400 mb-4">Add, edit, or remove child profiles. Manage their individual settings and devices.</p>
            <div className="mt-auto">
              <Link href="/dashboard/family-guardian/children" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                Manage Children
              </Link> 
            </div>
          </div>

          {/* Card: App & Website Blocking */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-3">🚫 App & Website Blocking</h2>
            <p className="text-gray-400 mb-4">Control access to apps and websites, set schedules, and daily limits.</p>
            <div className="mt-auto">
              <Link href="/dashboard/family-guardian/children" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                Set Policies
              </Link>
            </div>
          </div>

          {/* Card: Settings */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-3">⚙️ Settings</h2>
            <p className="text-gray-400 mb-4">Manage your family account settings, plan, and preferences.</p>
            <div className="mt-auto">
              <Link href="/dashboard/family-guardian/settings" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                Family Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
