"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bot,
  FileSearch,
  FileText,
  Image as ImageIcon,
  Loader,
  Mic,
  Palette,
  Paperclip,
  Send,
  Sparkles,
  StopCircle,
  User,
  X,
} from "lucide-react";
import { motion } from "framer-motion";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
  canRetry?: boolean;
  route?: {
    path: string;
    query?: Record<string, string>;
    label: string;
  };
  result?: { title: string; actions: { label: string; href: string }[] };
};

type VoiceState = "idle" | "listening" | "processing" | "speaking" | "error";
type NovaVariant = "floating" | "hero";

type VoiceRecognition = {
  start: () => void;
  stop: () => void;
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onstart: (() => void) | null;
  onresult: ((event: { results?: ArrayLike<ArrayLike<{ transcript?: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

type FloatingNovaAIProps = {
  variant?: NovaVariant,
  placeholder?: string;
};

const quickActions = [
  { label: "Create Document", icon: FileText },
  { label: "Analyze PDF", icon: FileSearch },
  { label: "Create Design", icon: Palette },
  { label: "Edit Image", icon: ImageIcon },
];

const suggestedPrompts = [
  "Create a professional invoice",
  "Summarize my PDF",
  "Create a social media post",
  "Create a business proposal",
];

/** Safely parse a fetch response as JSON, returning null on failure. */
async function safeJson(response: Response): Promise<any> {
  try {
    const text = await response.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export default function FloatingNovaAI({ variant = "floating", placeholder }: FloatingNovaAIProps) {
  const router = useRouter();
  const ASSISTANT_NAME = "SmartDocs Assistant";
  const isHero = variant === "hero";
  const [isOpen, setIsOpen] = useState(isHero);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const voiceStateRef = useRef<VoiceState>("idle");
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    voiceStateRef.current = voiceState;
  }, [voiceState]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleClose = useCallback(() => {
    speechSynthesis.cancel();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setVoiceState("idle");
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen || isHero) return;
    const handleClick = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };
    const timer = window.setTimeout(() => document.addEventListener("mousedown", handleClick), 0);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [handleClose, isHero, isOpen]);

  const speak = useCallback((text: string) => {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.98;
    utterance.pitch = 1;
    utterance.onend = () => setVoiceState("idle");
    utterance.onerror = () => setVoiceState("idle");
    speechSynthesis.speak(utterance);
  }, []);

  const sendMessage = useCallback(
    async (message: string, fromVoice = false) => {
      const trimmed = message.trim();
      if (!trimmed || isLoading) return;

      setIsLoading(true);
      setMessages((previous) => [...previous, { role: "user", content: trimmed }]);
      setInput("");
      if (fromVoice) setVoiceState("processing");

      try {
        const response = await fetch("/api/ai/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed }),
        });

        // Do not assume the response is JSON.
        const data = await safeJson(response);

        if (!response.ok || !data?.success) {
          if (data?.code === "AI_RATE_LIMIT_EXCEEDED" || response.status === 429) {
            setMessages((previous) => [
              ...previous,
              {
                role: "assistant",
                content: "AI is temporarily busy due to usage limits. Please try again in a moment.",
                isError: true,
                canRetry: true,
              },
            ]);
          } else if (response.status === 503) {
            setMessages((previous) => [
              ...previous,
              {
                role: "assistant",
                content: "The AI service is temporarily unavailable. Please try again in a few moments.",
                isError: true,
                canRetry: true,
              },
            ]);
            setVoiceState("idle");
            return;
          }
          setMessages((previous) => [
            ...previous,
            {
              role: "assistant",
              content: data?.error || "Something went wrong. Please try again.",
              isError: true,
              canRetry: true,
            },
          ]);
          setVoiceState("idle");
          return;
        }

        const assistantResponse: ChatMessage = {
          role: "assistant",
          content: data.message || data.response || "Done.",
        };

        if (data.route?.path) {
          assistantResponse.route = {
            path: data.route.path,
            query: data.route.query,
            label: `Go to ${data.route.path.split("/").pop()?.replace(/-/g, " ")}`,
          };
        }

        setMessages((previous) => [...previous, assistantResponse]);

        if (fromVoice && data.message) {
          setVoiceState("speaking");
          speak(data.message);
        } else {
          setVoiceState("idle");
        }
      } catch (error) {
        const content = error instanceof Error ? error.message : "Something went wrong. Please try again.";
        setMessages((previous) => [...previous, { role: "assistant", content, isError: true, canRetry: true }]);
        setVoiceState("idle");
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, speak]
  );

  const handleSubmit = useCallback(() => {
    void sendMessage(input);
  }, [input, sendMessage]);

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!file || isUploading) return;
      setIsUploading(true);
      setMessages((previous) => [
        ...previous,
        { role: "user", content: `📎 Uploaded: ${file.name}` },
      ]);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch("/api/ai/upload", { method: "POST", body: formData });
        const data = await safeJson(response);
        if (!response.ok || !data?.ok) {
          setMessages((previous) => [
            ...previous,
            { role: "assistant", content: data?.error || "Something went wrong. Please try again.", isError: true },
          ]);
          return;
        }
        setMessages((previous) => [
          ...previous,
          { role: "assistant", content: data.response || "File received. What would you like me to do with it?" },
        ]);
      } catch {
        setMessages((previous) => [
          ...previous,
          { role: "assistant", content: "Something went wrong. Please try again.", isError: true },
        ]);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [isUploading]
  );

  const handleVoice = useCallback(() => {
    const currentVoice = voiceStateRef.current;
    if (currentVoice === "listening" || currentVoice === "speaking") {
      speechSynthesis.cancel();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setVoiceState("idle");
      return;
    }

    const browserWindow = window as unknown as {
      SpeechRecognition?: new () => VoiceRecognition;
      webkitSpeechRecognition?: new () => VoiceRecognition;
    };
    const SpeechRecognitionConstructor = browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition;
    if (!SpeechRecognitionConstructor) {
      setMessages((previous) => [
        ...previous,
        { role: "assistant", content: "Voice input is not supported by your browser.", isError: true },
      ]);
      return;
    }

    const recognition = new SpeechRecognitionConstructor();
    // Keep default English; locale-aware speech is available via the browser setting.
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = () => setVoiceState("listening");
    recognition.onresult = (event: { results?: ArrayLike<ArrayLike<{ transcript?: string }>> }) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      if (transcript) void sendMessage(transcript, true);
    };
    recognition.onerror = () => setVoiceState("idle");
    recognition.onend = () => setVoiceState((current) => (current === "listening" ? "idle" : current));
    recognitionRef.current = recognition;
    recognition.start();
  }, [sendMessage]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const handleRetry = useCallback(() => {
    const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");
    if (!lastUserMessage) return;
    setMessages((previous) => previous.slice(0, -1));
    void sendMessage(lastUserMessage.content);
  }, [messages, sendMessage]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-6 bottom-6 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-purple-500/30 transition-all hover:scale-105 hover:shadow-purple-500/50"
        aria-label={`Open ${ASSISTANT_NAME}`}
      >
        <Sparkles className="h-4 w-4" />
        {ASSISTANT_NAME}
      </button>
    );
  }

  // Conditional theme classes for the hero (clean professional light) vs the floating dark widget.
  const isLight = isHero;
  const panelTheme = isLight
    ? "border-slate-200 bg-white shadow-xl shadow-slate-200/60"
    : "border-white/10 bg-slate-950/80 shadow-2xl shadow-purple-950/40 backdrop-blur-xl";
  const headerBorder = isLight ? "border-slate-200" : "border-white/10";
  const iconBox = isLight
    ? "bg-slate-900 text-white shadow-sm"
    : "bg-gradient-to-br from-purple-500 to-cyan-400 shadow-lg shadow-purple-500/30";
  const statusText = isLight ? "text-emerald-600" : "text-emerald-300";
  const bodyBorder = isLight ? "border-slate-200" : "border-white/10";
  const subtleText = isLight ? "text-slate-500" : "text-slate-500";
  const subText = isLight ? "text-slate-600" : "text-slate-300/80";
  const cardText = isLight ? "text-slate-900" : "text-white";
  const quickBtn = isLight
    ? "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-400 hover:bg-slate-100"
    : "border-white/10 bg-white/[0.04] text-slate-200 hover:border-purple-400/40 hover:bg-purple-500/10";
  const quickIcon = isLight ? "text-slate-500" : "text-purple-300";
  const promptBtn = isLight
    ? "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-400 hover:text-slate-900"
    : "border-white/10 px-2.5 py-1.5 text-[10px] text-slate-300 hover:border-cyan-400/40 hover:text-white";
  const userBubble = isLight
    ? "rounded-br-md bg-slate-900 text-white"
    : "rounded-br-md bg-gradient-to-br from-purple-600 to-indigo-600 text-white";
  const assistantBubble = isLight
    ? "rounded-bl-md border border-slate-200 bg-white text-slate-700"
    : "rounded-bl-md border border-white/10 bg-white/5 text-slate-200";
  const erBubble = isLight
    ? "border border-red-300 bg-red-50 text-red-600"
    : "border border-red-500/30 bg-red-500/10 text-red-300";
  const inputBg = isLight
    ? "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-slate-300"
    : "border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-purple-400 focus:ring-1 focus:ring-purple-500/30";
  const inputBtn = isLight
    ? "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
    : "text-slate-400 hover:bg-white/10 hover:text-purple-300";
  const inputBtnActiveListening = isLight
    ? "animate-pulse bg-red-100 text-red-500"
    : "animate-pulse bg-red-500/20 text-red-400";
  const inputBtnActiveVoice = isLight
    ? "bg-slate-100 text-slate-700"
    : "bg-purple-500/15 text-purple-200";
  const sendBtn = isLight
    ? "bg-slate-900 text-white shadow-sm hover:bg-slate-800"
    : "bg-gradient-to-r from-purple-600 to-cyan-500 p-2 text-white shadow-lg hover:scale-105";
  const voiceHint = isLight ? "text-slate-600" : "text-purple-200";

  return (
    <section
      ref={panelRef}
      aria-label={`${ASSISTANT_NAME} assistant`}
      className={`${isHero ? "w-full" : "fixed right-6 bottom-6 z-50 w-80 sm:w-96"} overflow-hidden rounded-3xl border ${panelTheme} ${isHero ? "" : "animate-slide-up-fade"}`}
    >
      {/* ── Header ── */}
      <div className={`flex items-center justify-between border-b ${headerBorder} ${isHero ? "px-5 py-4" : "px-4 py-3.5"}`}>
        <div className="flex items-center gap-2.5">
          <div className={`flex items-center justify-center rounded-xl ${iconBox} ${isHero ? "h-10 w-10" : "h-9 w-9"}`}>
            <Sparkles className={`${isHero ? "h-5 w-5" : "h-4 w-4"} text-white`} />
          </div>
          <div>
            <p className={`font-semibold ${isHero ? "text-base" : "text-sm"} ${cardText}`}>{ASSISTANT_NAME}</p>
            <p className={`flex items-center gap-1.5 ${isHero ? "text-xs" : "text-[11px]"} ${statusText}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Online
            </p>
          </div>
        </div>
        {!isHero && (
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label={`Close ${ASSISTANT_NAME}`}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── Chat / Greeting Area ── */}
      <div className={`${isHero ? "max-h-[26rem] min-h-[18rem] p-5" : "max-h-[22rem] min-h-[15rem] p-4"} space-y-3 overflow-y-auto`}>
        {messages.length === 0 && !isLoading && (
          <div className="space-y-4">
            {/* Greeting */}
            <div className={`rounded-2xl border p-3.5 ${isLight ? "border-slate-200 bg-slate-50" : "border-purple-400/15 bg-gradient-to-br from-purple-500/15 to-cyan-500/5"}`}>
              <p className={`${isHero ? "text-base" : "text-sm"} font-medium ${cardText}`}>Hi! I'm {ASSISTANT_NAME}.</p>
              <p className={`mt-1 ${isHero ? "text-sm" : "text-xs"} leading-relaxed ${subText}`}>
                Ask anything. I can create documents, analyze PDFs, edit images, convert files, and automate your work.
              </p>
            </div>

            {/* Quick Actions — only for the floating widget; hero stays focused on the input */}
            {!isHero && (
              <div>
                <p className={`mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] ${subtleText}`}>
                  Quick actions
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map(({ label, icon: Icon }) => (
                    <button
                      key={label}
                      onClick={() => sendMessage(`Help me ${label.toLowerCase()}`)}
                      className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left text-[11px] font-medium transition-colors ${quickBtn}`}
                    >
                      <Icon className={`h-3.5 w-3.5 ${quickIcon}`} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Prompts — subtle & secondary */}
            <div>
              <p className={`mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] ${subtleText}`}>
                Try asking
              </p>
              <div className="flex flex-wrap gap-1.5">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className={`rounded-full border px-2.5 py-1.5 text-[10px] transition-colors ${promptBtn}`}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`flex items-start gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.role === "assistant" && (
              <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${iconBox}`}>
                <Sparkles className="h-3 w-3 text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                message.isError
                  ? erBubble
                  : message.role === "user"
                    ? userBubble
                    : assistantBubble
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              {message.canRetry && (
                <button
                  onClick={handleRetry}
                  className={`mt-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors ${isLight ? "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200" : "border-slate-500/50 bg-slate-600/50 text-white hover:bg-slate-500/50"}`}
                >
                  Retry
                </button>
              )}
            </div>
            {message.role === "user" && (
              <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${isLight ? "bg-slate-200" : "bg-slate-600"}`}>
                <User className={`h-3 w-3 ${isLight ? "text-slate-600" : "text-slate-300"}`} />
              </div>
            )}
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-2">
            <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${iconBox}`}>
              <Sparkles className="h-3 w-3 text-white" />
            </div>
            <div className={`rounded-2xl border px-3 py-2 ${isLight ? "border-slate-200 bg-white" : "border-white/10 bg-white/5"}`}>
              <Loader className="h-3.5 w-3.5 animate-spin text-slate-300" />
            </div>
          </div>
        )}
        {isUploading && (
          <div className="flex items-start gap-2">
            <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${iconBox}`}>
              <Sparkles className="h-3 w-3 text-white" />
            </div>
            <div className={`rounded-2xl border px-3 py-2 text-xs ${isLight ? "border-slate-200 bg-white text-slate-600" : "border-white/10 bg-white/5 text-slate-300"}`}>
              Uploading file…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input Area ── */}
      <div className={`border-t ${bodyBorder} ${isHero ? "p-4" : "p-3"}`}>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFileUpload(file);
            }}
            className="hidden"
            aria-label="Upload a file"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={`rounded-lg p-2 transition-all disabled:opacity-40 ${inputBtn}`}
            title="Attach a file"
            aria-label="Attach a file"
          >
            <Paperclip className={`${isHero ? "h-5 w-5" : "h-4 w-4"}`} />
          </button>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Ask anything..."}
            className={`flex-1 resize-none rounded-xl border px-3 outline-none ${isHero ? "py-3 text-base" : "py-2 text-xs"} ${inputBg}`}
            rows={1}
          />
          <button
            onClick={handleVoice}
            className={`rounded-lg p-2 transition-all ${
              voiceState === "listening"
                ? inputBtnActiveListening
                : voiceState === "processing" || voiceState === "speaking"
                  ? inputBtnActiveVoice
                  : inputBtn
            }`}
            title={voiceState === "listening" ? "Stop listening" : "Start voice input"}
            aria-label={voiceState === "listening" ? "Stop listening" : "Start voice input"}
          >
            {voiceState === "listening" ? <StopCircle className="h-4 w-4" /> : <Mic className={`${isHero ? "h-5 w-5" : "h-4 w-4"}`} />}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !input.trim()}
            className={`rounded-lg p-2 text-white transition-all disabled:opacity-40 ${sendBtn}`}
            aria-label="Send message"
          >
            {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : <Send className={`${isHero ? "h-5 w-5" : "h-4 w-4"}`} />}
          </button>
        </div>
        {isHero && messages.length === 0 && (
          <p className={`mt-2.5 text-center text-xs leading-relaxed ${subText}`}>
            Ask me to create a document, analyze a PDF, edit an image, summarize something, or help you with your work...
          </p>
        )}
        {voiceState !== "idle" && (
          <p className={`mt-2 text-[10px] font-medium ${voiceHint}`}>
            {voiceState === "listening"
              ? "Listening…"
              : voiceState === "processing"
                ? "Processing…"
                : "Assistant is speaking…"}
          </p>
        )}
      </div>
    </section>
  );
}
