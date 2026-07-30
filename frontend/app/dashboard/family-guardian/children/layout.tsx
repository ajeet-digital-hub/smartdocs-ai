"use client";

import { useState, useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import * as familyGuardianApi from "@/lib/family-guardian-api";

interface Child {
  _id: string;
  name: string;
  age: number;
}

export default function ChildProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const childId = params.childId as string;
  const pathname = usePathname();
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("[Layout] useEffect triggered. childId:", childId);
    async function fetchChild() {
      setLoading(true);
      console.log("[Layout] fetchChild started. Loading:", true);
      try {
        const data = await familyGuardianApi.getChild(childId);
        console.log("[Layout] API response for getChild:", data);
        if (data.ok) {
          setChild(data.child);
          console.log("[Layout] Child state set:", data.child);
        }
      } catch (error) {
        console.error("Failed to fetch child details:", error);
      } finally {
        setLoading(false);
      }
    }
    if (childId) {
      fetchChild();
    }
  }, [childId]);

  const tabs = [
    { name: "Overview", href: `/dashboard/family-guardian/children/${childId}/overview` },
    { name: "App Controls", href: `/dashboard/family-guardian/children/${childId}/app-controls` },
    { name: "Devices", href: `/dashboard/family-guardian/children/${childId}/devices` },
    { name: "Schedules", href: `/dashboard/family-guardian/children/${childId}/schedules` },
    { name: "Analytics", href: `/dashboard/family-guardian/children/${childId}/analytics` },
    { name: "Activity Log", href: `/dashboard/family-guardian/children/${childId}/activity` },
  ];

  console.log("[Layout] Rendering. Loading state:", loading, "Child state:", child);
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading child profile...</div>;
  if (!child) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Child not found.</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Link href="/dashboard/family-guardian/children" className="text-gray-400 hover:text-white text-sm mb-4 inline-block">← Back to Children</Link>
        <h1 className="text-3xl font-bold mb-2">{child.name}'s Profile</h1>
        <p className="text-gray-400 mb-6">Age: {child.age}</p>

        <nav className="flex space-x-4 border-b border-gray-700 mb-6">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              href={tab.href}
              className={`py-2 px-4 text-sm font-medium ${
                pathname.startsWith(tab.href)
                  ? "border-b-2 border-purple-500 text-purple-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.name}
            </Link>
          ))}
        </nav>
        <div>{children}</div>
      </div>
    </div>
  );
}