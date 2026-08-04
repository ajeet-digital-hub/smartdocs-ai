"use client";

/**
 * HomeAICommandCenter
 *
 * The central SmartDocs AI Agent command center for the homepage.
 *
 * Features:
 *  - Greeting + first-time onboarding (name + intent + tone)
 *  - "Do it for me" mode (AI decides the workflow)
 *  - Drag & drop upload ("Drop files here or ask me anything")
 *  - Quick actions (Summarize, Translate, Extract, OCR, Create, Analyze,
 *    App & Website Blocking, Family Guardian, Explore All Services)
 *  - Chat with message slide/fade animations + typing indicator
 *  - Session context / memory (follow-up questions reference last document)
 *  - Avatar states (idle / thinking / processing / success)
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import {
  Loader,
  UploadCloud,
  File as FileIcon,
  X,
  Send,
  User,
  Bot,
  Mic,
  Sparkles,
} from "lucide-react";
import AIAssistantAvatar from "@/components/AIAssistantAvatar";

// ── Types ─────────────────────────────────────────────
type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  canRetry?: boolean;
  isError?: boolean;
  confirmation?: {
    messageId: string;
  };
  sources?: { pageNumber: number }[];
};

type AvatarState = "idle" | "thinking" | "processing" | "success";
type VoiceState = "idle" | "listening" | "processing" | "speaking" | "stopped" | "error";

// ── Onboarding storage ────────────────────────────────
const ONBOARDING_KEY = "sd_ai_onboarding_v1";

type OnboardingData = {
  name: string;
  intent: string;
  tone: string;
  assistantName: string;
};

function loadOnboarding(): OnboardingData | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(ONBOARDING_KEY);
    if (!saved) return null;
    const data = JSON.parse(saved);
    if (data?.name) {
      return {
        name: data.name,
        intent: data.intent || "",
        tone: data.tone || "",
        assistantName: data.assistantName || "Nova",
      };
    }
  } catch {
    // ignore corrupt storage
  }
  return null;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionErrorEventLike {
  error?: string;
  message?: string;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  continuous: boolean;
  onaudiostart: (() => void) | null;
}

// ── Quick actions ─────────────────────────────────────
const QUICK_ACTIONS: {
  label: string;
  emoji: string;
  prompt: string;
  href?: string;
  needsFile?: boolean;
}[] = [
  { label: "Summarize Document", emoji: "📄", prompt: "Summarize this document and highlight the key findings.", needsFile: true },
  { label: "Translate Document", emoji: "🌐", prompt: "Translate this document to Hindi.", needsFile: true },
  { label: "Extract Information", emoji: "🔍", prompt: "Extract the key information from this document.", needsFile: true },
  { label: "Scan Image / OCR", emoji: "🖼️", prompt: "Extract the text from this image using OCR.", needsFile: true },
  { label: "Create Document", emoji: "✍️", prompt: "Create a professional document for me." },
  { label: "Analyze Document", emoji: "📊", prompt: "Analyze this document and share insights, risks and deadlines.", needsFile: true },
  { label: "App & Website Blocking", emoji: "🚫", prompt: "Help me set up app and website blocking for my family.", href: "/dashboard/family-guardian/blocking" },
  { label: "Family Guardian", emoji: "👨‍👩‍👧", prompt: "Help me manage screen time and study goals for my children.", href: "/dashboard/family-guardian" },
  { label: "Explore All Services", emoji: "🚀", prompt: "", href: "/services" },
];

// ── Onboarding options ────────────────────────────────
const INTENT_OPTIONS = [
  { emoji: "📄", label: "Documents" },
  { emoji: "🤖", label: "AI Assistant" },
  { emoji: "🖼️", label: "Images & OCR" },
  { emoji: "🌐", label: "Translation" },
  { emoji: "🛡️", label: "Family Guardian" },
  { emoji: "✨", label: "Everything" },
];

const TONE_OPTIONS = [
  { label: "Fast & Direct" },
  { label: "Smart & Detailed" },
  { label: "Friendly" },
  { label: "Let AI Decide" },
];

export default function HomeAICommandCenter() {
  const router = useRouter();

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [documentId, setDocumentId] = useState<string | undefined>();
  const [avatarState, setAvatarState] = useState<AvatarState>("idle");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doItForMe, setDoItForMe] = useState(true);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const isVoiceModeRef = useRef(false);
  const handleSubmitRef = useRef<((e?: React.FormEvent, voiceInput?: string, fromVoice?: boolean) => Promise<void>) | undefined>(undefined);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Onboarding
  const [onboarded, setOnboarded] = useState(false);
  const [step, setStep] = useState<"name" | "intent" | "tone" | "done">("name");
  const [name, setName] = useState("");
  const [intent, setIntent] = useState<string>("");
  const [tone, setTone] = useState<string>("");
  const [assistantName, setAssistantName] = useState("Nova");
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    const saved = loadOnboarding();
    if (!saved) return;
    // Defer state application to avoid cascading-render lint and
    // a hydration mismatch between server (onboarding) and client.
    requestAnimationFrame(() => {
      setName(saved.name);
      setAssistantName(saved.assistantName);
      setTone(saved.tone);
      setIntent(saved.intent);
      setOnboarded(true);
      setStep("done");
    });
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  // --- Voice Assistant Logic ---
  const stopSpeech = useCallback(() => {
    try {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    } catch {
      // ignore
    }
  }, []);

  const pickVoice = useCallback((lang: string): SpeechSynthesisVoice | undefined => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return undefined;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return undefined;
    const exact = voices.find(v => v.lang.toLowerCase() === lang.toLowerCase() && v.localService);
    if (exact) return exact;
    const prefix = lang.split("-")[0].toLowerCase();
    const anyLang = voices.find(v => v.lang.toLowerCase().startsWith(prefix));
    return anyLang || voices[0];
  }, []);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    stopSpeech();
    const utterance = new SpeechSynthesisUtterance(text);
    // Handle Hindi/Hinglish responses naturally instead of forcing English.
    const hasDevanagari = /[\u0900-\u097F]/.test(text);
    const lang = hasDevanagari ? "hi-IN" : "en-US";
    const voice = pickVoice(lang);
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang || lang;
    utterance.rate = 0.98;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.onstart = () => setVoiceState("speaking");
    utterance.onend = () => setVoiceState("idle");
    utterance.onerror = () => setVoiceState("idle");
    window.speechSynthesis.speak(utterance);
  }, [stopSpeech, pickVoice]);

  const handleVoice = useCallback(() => {
    if (typeof window === "undefined") return;

    // Exit voice mode explicitly (stop mic, recognition, and any speech).
    if (isVoiceModeRef.current) {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      isVoiceModeRef.current = false;
      setIsVoiceMode(false);
      setVoiceState("idle");
      stopSpeech();
      return;
    }

    // Voice can ONLY start from an explicit user action (button click).
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      setError("Voice input is not supported by your browser.");
      return;
    }

    setError(null);
    isVoiceModeRef.current = true;
    setIsVoiceMode(true);

    if (!recognitionRef.current) {
      recognitionRef.current = new SR();
    }
    const recognition = recognitionRef.current;
    // Prefer Hindi speech recognition when the browser locale is Hindi;
    // otherwise default to English (never force en-US for Hindi users).
    const browserLang =
      typeof navigator !== "undefined"
        ? navigator.language || "en-US"
        : "en-US";
    recognition.lang = browserLang.toLowerCase().startsWith("hi") ? "hi-IN" : "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onaudiostart = () => {
      setVoiceState("listening");
    };

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      if (!event.results) return;
      const transcript = Array.from(event.results)
        .slice(event.resultIndex)
        .map(result => result?.[0]?.transcript)
        .join('')
        .trim();
      if (!transcript) return;

      // In voice mode, submit exactly what the user spoke (no wake word needed).
      if (event.results?.[event.resultIndex]?.isFinal) {
        recognition.stop();
        setInput(transcript);
        handleSubmitRef.current?.(undefined, transcript, true);
      }
    };

    recognition.onerror = (event) => {
      const err = event?.error;
      // Silent speech and manual abort are not real failures — stop quietly.
      if (err === "no-speech" || err === "aborted") {
        setVoiceState("stopped");
        return;
      }
      setVoiceState("error");
      if (err === "not-allowed" || err === "service-not-allowed") {
        setError("Microphone access is required for voice input. Please allow the microphone and try again.");
      } else {
        setError("Voice recognition could not understand the audio. Please try again.");
      }
    };
    recognition.onend = () => {
      // Do not clobber SPEAKING/PROCESSING when recognition naturally ends.
      setVoiceState(v => (v === "speaking" || v === "processing" ? v : "stopped"));
    };
    recognition.start();
  }, [stopSpeech]);

  // Cleanup on unmount: stop mic + speech.
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      try {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
      } catch {
        // ignore
      }
    };
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setShowUploadMenu(true);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  const saveOnboarding = (next: Partial<{ name: string; intent: string; tone: string; assistantName: string }>) => {
    try {
      localStorage.setItem(
        ONBOARDING_KEY,
        JSON.stringify({ name, intent, tone, assistantName, ...next })
      );
    } catch {
      // ignore
    }
  };

  const handleQuickAction = (action: (typeof QUICK_ACTIONS)[number]) => {
    if (action.href) {
      router.push(action.href);
      return;
    }
    if (action.needsFile && !file) {
      setError("Please upload a document first, then try that action again.");
      // Focus the dropzone visually by scrolling to it
      document.getElementById("ai-dropzone")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setInput(action.prompt);
  };

  const handleActionConfirmation = async (
    confirmation: NonNullable<ChatMessage["confirmation"]>
  ) => {
    // Disable the buttons on the original message
    setMessages((prev) =>
      prev.map((m) =>
        m.confirmation?.messageId === confirmation.messageId
          ? { ...m, confirmation: undefined }
          : m
      )
    );

    // Add a user message to the chat
    setMessages((prev) => [...prev, { role: "user", content: "Confirm" }]);
    setIsLoading(true);
    setAvatarState("processing");

    try {
      const res = await fetch("/api/ai/actions/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmationId: confirmation.messageId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "The action could not be completed.");
      }
      setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
      setAvatarState("success");
      setTimeout(() => setAvatarState("idle"), 1400);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setMessages((prev) => [...prev, { role: "assistant", content: message, isError: true }]);
      setAvatarState("idle");
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionCancellation = (
    confirmation: NonNullable<ChatMessage["confirmation"]>
  ) => {
    setMessages((prev) => prev.map((m) => m.confirmation?.messageId === confirmation.messageId ? { ...m, confirmation: undefined } : m));
    setMessages((prev) => [...prev, { role: "user", content: "Cancel" }]);
    setMessages((prev) => [...prev, { role: "assistant", content: "Action cancelled." }]);
  };

  const handleSubmit = useCallback(
    async (e?: React.FormEvent, voiceInput?: string, fromVoice = false) => {
      e?.preventDefault();
    const trimmed = voiceInput || input.trim();
    if (!trimmed && !file) {
      setError("Tell me what you want to do, or upload a file.");
      return;
    }
    // If the last message was an error with a retry, this is a retry action.
    // We need to resubmit the original user message that caused the error.
    const lastMessage = messages[messages.length - 1];
    const isRetry = lastMessage?.isError && lastMessage?.canRetry;
    const originalUserMessage = isRetry
      ? messages.findLast((m) => m.role === "user")?.content
      : trimmed;

    if (!originalUserMessage) {
      return;
    }
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    setAvatarState("thinking");
    // Voice requests drive the voice state machine; text requests stay idle.
    if (fromVoice) {
      setVoiceState("processing");
    } else {
      // Normal text / Retry must never appear as listening or speaking.
      setVoiceState("idle");
    }

    if (isRetry) {
      // On retry, remove the previous error message from the chat
      setMessages((prev) => prev.slice(0, -1));
    } else {
      // On a new submission, add the user's message and clear the input
      setMessages((prev) => [...prev, { role: "user", content: originalUserMessage }]);
      setInput("");
    }

    try {
      // 1. Upload file if present
      let docId = documentId;
      if (file) {
        setAvatarState("processing");
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch("/api/documents/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.ok) {
          throw new Error(uploadData.error || "File upload failed.");
        }
        docId = uploadData.document.id;
        setDocumentId(docId);
        setFile(null);
        setShowUploadMenu(false);
        // Show assistant acknowledgement for the document
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `I found a document ("${uploadData.document.originalName}"). What would you like me to do? I can summarize it, translate it, extract data, answer questions, or analyze it.`,
          },
        ]);
        if (!originalUserMessage) {
          setIsLoading(false);
          setAvatarState("success");
          setTimeout(() => setAvatarState("idle"), 1200);
          return;
        }
      }

      // 2. Build the message with context memory
      const contextPrefix =
        messages.length > 0 || file || documentId
          ? "Context: "
          : "";
      const contextHint = documentId
        ? " (The user's current document is already uploaded — refer to it when needed.)"
        : "";
      const effectiveMessage = doItForMe
        ? `Automatically determine and run the best workflow for this request. Do it for me, choosing the right tools and order. Request: "${originalUserMessage}"${contextHint}`
        : `${contextPrefix}${originalUserMessage}${contextHint}`;

      // 3. Call the AI Agent
      const chatRes = await fetch("/api/ai/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: effectiveMessage, documentId: docId }),
      });

      const chatData = await chatRes.json();
      if (!chatRes.ok || !chatData.success) {
        if (chatData.upgradeUrl) {
          throw new Error(`This feature requires a higher plan. Please upgrade your account.`);
        } else if (
          ["AI_CONFIG_MISSING", "AI_CONFIG_INVALID", "AI_CONFIG_NO_ACCESS"].includes(chatData.code)
        ) {
          // Real configuration problem (missing/invalid key, no model access).
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "The AI assistant is currently unavailable due to a configuration issue. Please try again in a few moments.",
              isError: true,
              canRetry: true,
            },
          ]);
        } else if (chatData.code === "AI_RATE_LIMIT_EXCEEDED") {
          // Provider busy / usage limit reached — not a configuration problem.
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "AI is temporarily busy due to usage limits. Please try again in a moment.",
              isError: true,
              canRetry: true,
            },
          ]);
        } else if (chatRes.status === 503) {
          // Any other transient provider failure (timeout, unavailable, etc.).
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "The AI service is temporarily unavailable. Please try again in a few moments.",
              isError: true,
              canRetry: true,
            },
          ]);
        } else {
          throw new Error(chatData.error || "The AI agent could not complete the request.");
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: chatData.message,
            confirmation: chatData.confirmation,
            sources: chatData.sources,
          },
        ]);
        // Speak ONLY if this request originated from explicit Voice Mode.
        // Normal text chat and Retry never trigger TTS or the microphone.
        if (fromVoice) {
          setAvatarState("success");
          speak(chatData.message);
        } else {
          setAvatarState("success");
          setTimeout(() => setAvatarState("idle"), 1400);
        }
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: message, isError: true },
      ]);
      setAvatarState("idle");
    } finally {
      setIsLoading(false);
    }
    },
    [messages, input, file, documentId, doItForMe, isLoading, speak]
  );

  // Keep handleSubmitRef in sync so the speech-recognition callback can
  // invoke handleSubmit without stale closures / dependency issues.
  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  }, [handleSubmit]);

  // ── Onboarding flow ────────────────────────────────
  if (!onboarded) {
    return (
      <div className="w-full mx-auto max-w-3xl">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 sm:p-10 shadow-2xl shadow-purple-500/10 animate-slide-up-fade">
          {/* Decorations */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
          </div>

          <div className="relative flex flex-col items-center text-center">
            <AIAssistantAvatar size={150} state={step === "tone" ? "thinking" : "idle"} />

            {step === "name" && (
              <>
                <h2 className="mt-6 text-2xl sm:text-3xl font-bold text-white">
                  Hi! I&apos;m your SmartDocs AI Assistant
                </h2>
                <p className="mt-3 text-slate-300">
                  Before we get started, what should I call you?
                </p>
                <div className="mt-8 flex w-full max-w-md flex-col gap-3">
                  <input
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && nameInput.trim()) {
                        setName(nameInput.trim());
                        setStep("intent");
                      }
                    }}
                    placeholder="Your first name…"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30"
                  />
                  <button
                    onClick={() => {
                      if (!nameInput.trim()) return;
                      setName(nameInput.trim());
                      setStep("intent");
                    }}
                    className="rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 px-6 py-3 font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:scale-105 hover:shadow-purple-500/40"
                  >
                    Continue →
                  </button>
                </div>
              </>
            )}

            {step === "intent" && (
              <>
                <h2 className="mt-6 text-2xl font-bold text-white">
                  Nice to meet you, {name}! 👋
                </h2>
                <p className="mt-3 text-slate-300">What brings you to SmartDocs AI?</p>
                <div className="mt-6 grid w-full max-w-xl grid-cols-2 gap-3 sm:grid-cols-3">
                  {INTENT_OPTIONS.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => {
                        setIntent(opt.label);
                        setStep("tone");
                      }}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-all hover:border-purple-400/50 hover:bg-purple-500/10 hover:scale-105"
                    >
                      <span className="mr-2">{opt.emoji}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === "tone" && (
              <>
                <h2 className="mt-6 text-2xl font-bold text-white">
                  How would you like me to work with you?
                </h2>
                <div className="mt-6 grid w-full max-w-xl gap-3 sm:grid-cols-2">
                  {TONE_OPTIONS.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => {
                        setTone(opt.label);
                        setStep("done");
                        setOnboarded(true);
                        saveOnboarding({ tone: opt.label });
                        setMessages((prev) => [
                          ...prev,
                          {
                            role: "assistant",
                            content: `Nice to meet you, ${name || "friend"}! 👋 I'm ${assistantName}, your personal SmartDocs AI assistant. What should we get done today?`,
                          },
                        ]);
                      }}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-all hover:border-purple-400/50 hover:bg-purple-500/10 hover:scale-105"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Main command center ────────────────────────────
  return (
    <div className="w-full mx-auto max-w-5xl">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl shadow-purple-500/10 animate-slide-up-fade">
        {/* Header with avatar + greeting */}
        <div className="relative border-b border-white/10 p-5 sm:p-6">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-purple-500/15 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
          </div>

          <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            <AIAssistantAvatar size={96} state={avatarState} />
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Hi {name || "there"}{" "}
                <span className="inline-block">👋</span>
              </h2>
              <p className="mt-1 text-sm text-slate-300">
                {assistantName} — your AI assistant.{" "}
                <span className="text-slate-400">
                  Tell me what you want to do, or choose an option below.
                </span>
              </p>
              {intent && (
                <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs text-purple-200">
                  <Sparkles className="h-3 w-3" />
                  Focus: {intent} · Tone: {tone || "Let AI Decide"}
                </p>
              )}
            </div>
          </div>

          {/* Do it for me toggle */}
          <div className="relative mt-4 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => setDoItForMe((v) => !v)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                doItForMe
                  ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg shadow-purple-500/25"
                  : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              Do it for me
              <span
                className={`relative h-5 w-9 rounded-full transition-colors ${
                  doItForMe ? "bg-white/30" : "bg-slate-600"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                    doItForMe ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </span>
            </button>
            <span className="text-xs text-slate-400">
              {doItForMe
                ? "✨ I'll automatically pick the right tools & workflow."
                : "I'll only do exactly what you ask."}
            </span>
          </div>
        </div>

        {/* Chat area */}
        <div className="min-h-[12rem] max-h-[24rem] overflow-y-auto px-5 py-4 sm:px-6 space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bot className="h-8 w-8 text-purple-400/70" />
              <p className="mt-2 text-sm text-slate-400">
                Tell me what you want to do, or upload a file to get started.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 animate-message-in ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.isError
                    ? "border border-red-500/30 bg-red-500/10 text-red-300"
                    : msg.role === "user"
                      ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-br-md"
                      : "border border-white/10 bg-white/5 text-slate-200 rounded-bl-md"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.sources && msg.sources.length > 0 && (
                  <p className="mt-2 text-xs text-purple-300">
                    Sources: Page {msg.sources.map((s) => s.pageNumber).join(", ")}
                  </p>
                )}
                {msg.canRetry && (
                  <button
                    onClick={handleSubmit}
                    className="mt-2 rounded-md border border-slate-500/50 bg-slate-600/50 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-slate-500/50"
                  >
                    Retry
                  </button>
                )}
                {msg.confirmation && (
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => handleActionConfirmation(msg.confirmation!)}
                      className="rounded-md bg-green-600/80 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-green-500"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleActionCancellation(msg.confirmation!)}
                      className="rounded-md border border-slate-500/50 bg-slate-600/50 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-slate-500/50"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-600 flex items-center justify-center">
                  <User className="h-4 w-4 text-slate-300" />
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex items-start gap-3 animate-fade-in">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-slate-400 animate-typing-dot" />
                  <span className="h-2 w-2 rounded-full bg-slate-400 animate-typing-dot" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 rounded-full bg-slate-400 animate-typing-dot" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          {error && !messages.some(m => m.isError) && (
            <div
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 animate-fade-in">
              <p>{error}</p>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Upload + form */}
        <div className="border-t border-white/10 px-5 py-4 sm:px-6">
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Tell me what you want to do, or upload a file…"
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-20 text-white placeholder-slate-500 outline-none transition-colors focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30"
              rows={2}
            />
            <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
              <button
                type="button"
                onClick={handleVoice}
                aria-pressed={isVoiceMode}
                className={`group relative rounded-lg p-2 transition-all ${
                  voiceState === "listening"
                    ? "bg-red-500/20 text-red-400 animate-pulse"
                    : voiceState === "speaking"
                      ? "bg-cyan-500/20 text-cyan-300"
                      : isVoiceMode
                        ? "bg-purple-500/20 text-purple-300"
                        : "text-slate-400 hover:bg-white/10 hover:text-purple-300"
                }`}
                title={
                  voiceState === "listening"
                    ? "Listening — click to stop"
                    : voiceState === "speaking"
                      ? "Speaking — click to stop voice mode"
                      : isVoiceMode
                        ? "Voice mode active — click to exit"
                        : "Activate Voice Assistant"
                }
              >
                <Mic className="h-5 w-5" />
                {isVoiceMode && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-400" />
                )}
              </button>
              <button
                type="submit"
                disabled={isLoading || (!input.trim() && !file)}
                className="rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 p-2 text-white shadow-lg shadow-purple-500/25 transition-all hover:scale-105 hover:shadow-purple-500/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                aria-label="Send message"
              >
                {isLoading ? <Loader className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </button>
            </div>
          </form>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            id="ai-dropzone"
            className={`mt-3 cursor-pointer rounded-xl border-2 border-dashed p-3 text-center transition-all ${
              isDragActive
                ? "border-purple-400 bg-purple-500/10"
                : "border-slate-600 hover:border-purple-500"
            }`}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className="flex items-center justify-center gap-2 text-purple-300">
                <FileIcon className="h-5 w-5" />
                <span className="truncate text-sm">{file.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setShowUploadMenu(false);
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                <UploadCloud className="h-5 w-5" />
                <span>{isDragActive ? "Drop the file here…" : "Drop files here or ask me anything"}</span>
              </div>
            )}
          </div>

          {/* Upload context menu */}
          {showUploadMenu && file && (
            <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 animate-slide-up-fade">
              <p className="text-sm font-medium text-white">
                I found a document. What would you like me to do?
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {[
                  "Summarize",
                  "Translate",
                  "Extract Data",
                  "Ask Questions",
                  "Analyze",
                  "Create Output",
                ].map((action) => (
                  <button
                    key={action}
                    onClick={() => {
                      setInput(
                        action === "Summarize"
                          ? "Summarize this document"
                          : action === "Translate"
                            ? "Translate this document to English"
                            : action === "Extract Data"
                              ? "Extract the key data from this document"
                              : action === "Ask Questions"
                                ? "Answer questions about this document"
                                : action === "Analyze"
                                  ? "Analyze this document and highlight insights"
                                  : "Create an output document from this file"
                      );
                      setShowUploadMenu(false);
                    }}
                    className="rounded-lg bg-gray-700/60 px-3 py-1.5 text-xs font-medium text-slate-200 transition-all hover:bg-gray-600"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-8">
        <p className="mb-3 text-center text-sm text-slate-400">
          Or pick a quick action to get started:
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              onClick={() => handleQuickAction(action)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition-all hover:-translate-y-0.5 hover:border-purple-400/40 hover:bg-purple-500/10 hover:text-white hover:shadow-lg hover:shadow-purple-500/10"
            >
              <span>{action.emoji}</span>
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
