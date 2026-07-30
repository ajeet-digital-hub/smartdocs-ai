"use client";

import { motion } from "framer-motion";
import { Check, X, Clock, Gift, Shield } from "lucide-react";
import StatusBadge from "./StatusBadge";

export interface UnlockRequest {
  _id: string;
  childId: {
    _id: string;
    name: string;
    avatar?: string;
  };
  appName: string;
  appIcon?: string;
  reason: string;
  status: "pending" | "approved" | "denied";
  createdAt: string;
  approvedDurationMinutes?: number;
}

interface UnlockRequestCardProps {
  request: UnlockRequest;
  onApprove: (duration: number) => void;
  onReject: () => void;
  isProcessing: boolean;
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function UnlockRequestCard({ request, onApprove, onReject, isProcessing }: UnlockRequestCardProps) {
  const { childId, appName, appIcon, reason, status, createdAt, approvedDurationMinutes } = request;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-[#1F2937] bg-[#111827] p-5 shadow-lg"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center text-2xl">
            {childId.avatar || "👶"}
          </div>
          <div>
            <h3 className="font-semibold text-white">{childId.name}</h3>
            <p className="text-sm text-gray-400">
              Requested access to: <span className="font-medium text-gray-300">{appIcon} {appName}</span>
            </p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-4 rounded-lg bg-gray-800 p-3">
        <p className="text-sm text-gray-300 italic">"{reason}"</p>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span>Requested {timeAgo(createdAt)}</span>
        </div>
        {status === "approved" && (
          <div className="flex items-center gap-1 text-green-400">
            <Gift size={14} />
            <span>Approved for {approvedDurationMinutes} min</span>
          </div>
        )}
      </div>

      {status === "pending" && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-800 pt-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onApprove(15)}
            disabled={isProcessing}
            className="flex-1 rounded-lg bg-green-600/20 px-4 py-2 text-sm font-medium text-green-400 transition-colors hover:bg-green-600/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Check className="mr-2 inline" size={16} /> Approve (15 min)
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onApprove(60)}
            disabled={isProcessing}
            className="flex-1 rounded-lg bg-sky-600/20 px-4 py-2 text-sm font-medium text-sky-400 transition-colors hover:bg-sky-600/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Shield className="mr-2 inline" size={16} /> Approve (1 hour)
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReject}
            disabled={isProcessing}
            className="flex-1 rounded-lg bg-red-600/20 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-600/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="mr-2 inline" size={16} /> Reject
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}