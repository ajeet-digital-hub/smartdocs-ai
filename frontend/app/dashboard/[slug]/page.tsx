"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";

type UserData = {
  name: string;
  email: string;
  avatar?: string;
};

export default function DashboardSlugPage() {
  const { slug } = useParams();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setTimeout(() => {
      const u = localStorage.getItem("sd_user");
      if (!u) {
        setUser({ name: "Guest", email: "guest@smartdocs.ai" });
        setLoading(false);
        return;
      }
      setUser({ name: u.includes("@") ? u.split("@")[0] : u, email: u });
      setLoading(false);
    }, 0);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="rounded-3xl bg-white px-6 py-4 shadow-lg ring-1 ring-black/5 dark:bg-slate-900">
          Loading...
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div>
      <DashboardLayout user={user} />
      {slug && (
        <div className="mt-4 p-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg">
          User ID: {slug}
        </div>
      )}
    </div>
  );
}
