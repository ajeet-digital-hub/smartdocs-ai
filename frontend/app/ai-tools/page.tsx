"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIToolsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm SmartDocs AI Assistant. I can help you create documents, answer questions, analyze content, and more. What would you like to do today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      // Try to use existing AI chat API if available
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          conversationId: "ai-tools-workspace",
        }),
      });

      if (!res.ok) {
        // Fallback: if API doesn't exist, use a simulated response
        throw new Error("API not available");
      }

      const data = await res.json();
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.response || data.message || "I've processed your request.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      // Simulated AI response when API is unavailable
      const simulatedResponse = simulateAIResponse(trimmed);
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: simulatedResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = () => {
    // File upload capability - will be enhanced with actual document AI
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg";
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const fileMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: `📎 Uploaded: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fileMessage]);
      setIsLoading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/ai/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          setMessages((prev) => [
            ...prev,
            {
              id: `assistant-${Date.now()}`,
              role: "assistant",
              content: data.response || `I've received and processed "${file.name}". What would you like to know about it?`,
              timestamp: new Date(),
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: `assistant-${Date.now()}`,
              role: "assistant",
              content: `I received "${file.name}". Upload processing is being set up. For now, you can ask me questions about document creation and editing.`,
              timestamp: new Date(),
            },
          ]);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: `File "${file.name}" noted. Full document AI analysis is coming soon!`,
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fileInput.click();
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-16">
      <div className="mx-auto flex max-w-5xl flex-col h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="border-b border-white/10 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-cyan-400 text-lg">
                🤖
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">SmartDocs AI Workspace</h1>
                <p className="text-xs text-slate-400">
                  {session?.user ? `Logged in as ${session.user.name || session.user.email}` : "Guest mode - limited features"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleFileUpload}
                className="flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span>📎</span>
                <span className="hidden sm:inline">Upload Document</span>
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white"
                    : "bg-white/10 text-slate-200 border border-white/10"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">🤖</span>
                    <span className="text-xs font-semibold text-purple-300">SmartDocs AI</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${msg.role === "user" ? "text-white/60" : "text-slate-500"}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 bg-white/10 border border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🤖</span>
                  <div className="flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-1">Thinking...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-center">
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2 text-sm text-red-400">
                {error}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-white/10 px-4 sm:px-6 py-4">
          <form onSubmit={handleSubmit} className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Ask SmartDocs AI anything..."
                rows={1}
                className="w-full resize-none rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                style={{ minHeight: "44px" }}
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-40 cursor-pointer"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" />
              </svg>
            </button>
          </form>
          <p className="mt-2 text-center text-[10px] text-slate-600">
            SmartDocs AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </main>
  );
}

// Simulated AI response for when the backend API is not available
function simulateAIResponse(input: string): string {
  const lower = input.toLowerCase();

  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
    return "Hello! I'm SmartDocs AI. I'm here to help you with document creation, editing, and analysis. What would you like to work on today?";
  }

  if (lower.includes("resume") || lower.includes("cv")) {
    return "I can help you create a professional resume! Would you like to:\n\n1. Start with a template\n2. Improve an existing resume\n3. Get tips for ATS-friendly formatting\n\nJust let me know your preference!";
  }

  if (lower.includes("document") || lower.includes("create") || lower.includes("write")) {
    return "I can help you create various types of documents:\n\n• Business letters\n• Reports\n• Proposals\n• Cover letters\n• Meeting notes\n• And more!\n\nWhat type of document would you like to create?";
  }

  if (lower.includes("pdf") || lower.includes("convert")) {
    return "I can help with PDF tasks:\n\n• Merge multiple PDFs\n• Split PDF pages\n• Convert PDF to Word/Excel\n• Compress PDF files\n• Extract text from PDFs\n\nWhat PDF task do you need?";
  }

  if (lower.includes("image") || lower.includes("photo") || lower.includes("picture")) {
    return "I can assist with image-related tasks:\n\n• Remove backgrounds\n• Resize images\n• Enhance photo quality\n• Convert image formats\n• Create social media graphics\n\nWhat would you like to do with your image?";
  }

  if (lower.includes("plan") || lower.includes("pricing") || lower.includes("upgrade") || lower.includes("basic") || lower.includes("pro")) {
    return "Check out our pricing plans:\n\n• **Free** — ₹0/month (Basic AI, limited chat)\n• **Basic** — ₹299/month (PDF tools, OCR, 2GB)\n• **Pro** — ₹499/month (Advanced AI, Family Guardian, 10GB)\n• **Pro+** — ₹999/month (Team features, 50GB, priority support)\n\nVisit /pricing to see full details and upgrade!";
  }

  if (lower.includes("help") || lower.includes("what can you")) {
    return "I can help you with:\n\n📄 **Document Creation** — Resumes, letters, reports\n🎨 **Image Editing** — Background removal, resizing\n📑 **PDF Tools** — Merge, split, convert\n🤖 **AI Content** — Writing, analysis, summarization\n🛡️ **Family Guardian** — Parental controls (Pro plan)\n\nWhat would you like help with?";
  }

  if (lower.includes("thank")) {
    return "You're welcome! I'm happy to help. Is there anything else you'd like assistance with?";
  }

  return `I understand you're asking about "${input}". As SmartDocs AI, I can help you with document creation, image editing, PDF tools, and more. Could you provide more details about what you need? Try asking about specific tasks like creating a resume, editing a PDF, or generating content.`;
}
