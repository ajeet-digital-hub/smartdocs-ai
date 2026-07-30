"use client";

import { LucideProps } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType<LucideProps> | string; // Allow string for now
  color: "purple" | "red" | "green" | "orange";
}

const colorClasses = {
  purple: "text-[#A78BFA]",
  red: "text-[#F87171]",
  green: "text-[#34D399]",
  orange: "text-[#FBBF24]",
};

export default function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-[#1F2937] bg-[#111827] p-5 shadow-lg">
      <div className="flex items-center gap-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-800 ${colorClasses[color]}`}>
          {typeof Icon === 'string' ? (
            <span className="text-xl">{Icon}</span>
          ) : (
            <Icon size={20} />
          )}
        </div>
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}