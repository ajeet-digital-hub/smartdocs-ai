"use client";

/**
 * AIAssistantAvatar
 *
 * A premium, professional, non-sexual female AI assistant illustration.
 * Rendered as an inline SVG (fully vector — zero network cost, retina sharp,
 * perfectly optimized for the web).
 *
 * Animations:
 *  - floating (gentle up/down)
 *  - soft glow / pulse ring behind the avatar
 *  - thinking / processing / success idle states
 */
interface AIAssistantAvatarProps {
  size?: number;
  state?: "idle" | "thinking" | "processing" | "success" | "attention";
  className?: string;
}

export default function AIAssistantAvatar({
  size = 220,
  state = "idle",
  className = "",
}: AIAssistantAvatarProps) {
  const isActive = state === "thinking" || state === "processing";
  const isAttention = state === "attention";

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Nova, your SmartDocs AI assistant — currently ${state}`}
    >
      {/* Soft glow / pulse ring */}
      <div
        className={`absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/40 via-cyan-400/30 to-fuchsia-500/30 blur-2xl ${
          state === "success"
            ? "animate-glow-success"
            : isActive
              ? "animate-glow-active"
              : isAttention
                ? "animate-glow-attention"
                : "animate-glow-idle"
        }`}
      />
      {/* Ring pulse */}
      <div
        className={`absolute inset-4 rounded-full border ${
          isAttention
            ? "border-amber-400/40 animate-ping-slow"
            : isActive
              ? "border-purple-300/30 animate-ping-slow"
              : "border-purple-300/30 animate-pulse-soft"
        }`}
      />

      {/* Floating avatar */}
      <div className="relative animate-float">
        {/* Core SVG illustration */}
        <svg
          width={size * 0.82}
          height={size * 0.82}
          viewBox="0 0 320 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="SmartDocs AI Assistant"
          className="drop-shadow-[0_10px_35px_rgba(168,85,247,0.35)]"
        >
          {/* Hair back layer */}
          <path
            d="M160 58C118 58 92 84 92 126v16c0 42 30 64 68 64s68-22 68-64v-16c0-42-26-68-68-68Z"
            fill="#3b2f5c"
          />
          {/* Neck & shoulders */}
          <path
            d="M138 194h44v22c0 6-5 10-11 10h-22c-6 0-11-4-11-10v-22Z"
            fill="#f2c9a8"
          />
          <path
            d="M96 252c0-30 28-44 64-44s64 14 64 44c0 18-14 26-64 26s-64-8-64-26Z"
            fill="#7c6cf0"
          />
          {/* Blouse detail */}
          <path
            d="M120 252c8-12 24-18 40-18s32 6 40 18c-4 10-18 14-40 14s-36-4-40-14Z"
            fill="#5b4bd0"
          />
          {/* Face */}
          <circle cx="160" cy="140" r="66" fill="#f6cfae" />
          {/* Ears */}
          <circle cx="96" cy="146" r="12" fill="#f2c19a" />
          <circle cx="224" cy="146" r="12" fill="#f2c19a" />
          {/* Hair front layer */}
          <path
            d="M94 126c0-42 30-70 66-70s66 28 66 70c-14-12-28-16-42-14-22 4-36 18-48 34-12-16-26-30-48-34-14-2-28 2-42 14Z"
            fill="#4a3b73"
          />
          {/* Side hair */}
          <path
            d="M94 120c-4 14-4 30-2 44-1-22-1-36 8-48-2-2-4-2-6 4Z"
            fill="#4a3b73"
          />
          <path
            d="M226 120c4 14 4 30 2 44 1-22 1-36-8-48 2-2 4-2 6 4Z"
            fill="#4a3b73"
          />
          {/* Eyebrows */}
          <path
            d="M124 132c6-4 14-5 20-2"
            stroke="#7a5a4a"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M196 132c-6-4-14-5-20-2"
            stroke="#7a5a4a"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Eyes */}
          <circle cx="134" cy="144" r="6" fill="#2b2440" />
          <circle cx="186" cy="144" r="6" fill="#2b2440" />
          <circle cx="136" cy="142" r="2" fill="#ffffff" opacity="0.85" />
          <circle cx="188" cy="142" r="2" fill="#ffffff" opacity="0.85" />
          {/* Nose */}
          <path
            d="M160 150c-1 8 0 12 2 16"
            stroke="#e5a97f"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          {/* Smile */}
          <path
            d="M144 168c10 8 22 8 32 0"
            stroke="#c96f5b"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          {/* Blush */}
          <ellipse cx="120" cy="162" rx="9" ry="5" fill="#f6b8a8" opacity="0.6" />
          <ellipse cx="200" cy="162" rx="9" ry="5" fill="#f6b8a8" opacity="0.6" />
          {/* Glasses (subtle, modern) */}
          <circle cx="134" cy="144" r="13" stroke="#8b5cf6" strokeWidth="2.5" fill="none" />
          <circle cx="186" cy="144" r="13" stroke="#8b5cf6" strokeWidth="2.5" fill="none" />
          <path
            d="M147 142h26"
            stroke="#8b5cf6"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Earring hint */}
          <circle cx="98" cy="152" r="2.5" fill="#c9a3ff" />
          <circle cx="222" cy="152" r="2.5" fill="#c9a3ff" />
        </svg>
      </div>

      {/* Status indicator dot */}
      <div
        className={`absolute bottom-4 right-4 h-5 w-5 rounded-full border-2 border-white dark:border-slate-900 ${
          state === "success"
            ? "bg-emerald-400 animate-pulse"
            : isActive
              ? "bg-cyan-400 animate-pulse"
              : "bg-emerald-400"
        }`}
      />
    </div>
  );
}

