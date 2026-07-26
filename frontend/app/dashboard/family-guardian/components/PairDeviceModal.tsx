"use client";

import { useState } from "react";

interface PairDeviceModalProps {
  childId: string;
  childName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function PairDeviceModal({ childId, childName, isOpen, onClose }: PairDeviceModalProps) {
  const [deviceName, setDeviceName] = useState("");
  const [deviceType, setDeviceType] = useState("browser");
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  async function generateCode() {
    if (!deviceName.trim()) {
      setError("Please enter a device name");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/family-guardian/pair-device", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId, deviceName: deviceName.trim(), deviceType }),
      });
      const data = await res.json();
      if (data.ok) {
        setPairingCode(data.pairingCode);
        setExpiresAt(data.expiresAt);
      } else {
        setError(data.error || "Failed to generate code");
      }
    } catch {
      setError("Failed to generate pairing code");
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard() {
    if (pairingCode) {
      try {
        await navigator.clipboard.writeText(pairingCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Fallback
        const textArea = document.createElement("textarea");
        textArea.value = pairingCode;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  }

  function handleClose() {
    setDeviceName("");
    setDeviceType("browser");
    setPairingCode(null);
    setExpiresAt(null);
    setError(null);
    setCopied(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1a1625] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Pair Device</h2>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white transition-all cursor-pointer text-xl"
          >
            ✕
          </button>
        </div>

        <p className="text-slate-400 text-sm mb-6">
          Generate a pairing code to connect {childName}'s device to Family Guardian.
          Enter the code on the child's device to complete pairing.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {!pairingCode ? (
          <>
            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-1">Device Name *</label>
              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-purple-500"
                placeholder="e.g. Child's iPhone, Home PC"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm text-slate-400 mb-1">Device Type</label>
              <select
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="browser">Browser (Chrome/Edge)</option>
                <option value="android">Android Device</option>
                <option value="ios">iPhone / iPad</option>
                <option value="desktop">Desktop / Laptop</option>
              </select>
            </div>
            <button
              onClick={generateCode}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-sm disabled:opacity-50 hover:shadow-lg transition-all cursor-pointer"
            >
              {loading ? "Generating..." : "Generate Pairing Code"}
            </button>
          </>
        ) : (
          <div className="text-center">
            <div className="mb-4">
              <div className="text-xs text-slate-400 mb-2">Pairing Code</div>
              <div className="inline-block px-8 py-4 rounded-xl bg-white/5 border-2 border-dashed border-purple-500/50">
                <span className="text-3xl font-mono font-bold tracking-[0.3em] text-white">
                  {pairingCode}
                </span>
              </div>
            </div>

            <button
              onClick={copyToClipboard}
              className="mb-4 px-5 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-all cursor-pointer"
            >
              {copied ? "✓ Copied!" : "Copy Code"}
            </button>

            {expiresAt && (
              <p className="text-xs text-slate-500 mb-6">
                Expires at {new Date(expiresAt).toLocaleTimeString()}
              </p>
            )}

            <div className="mb-6 p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <p className="text-cyan-300 text-sm font-medium mb-1">📱 Instructions</p>
              <ol className="text-cyan-200/70 text-xs text-left space-y-1 list-decimal list-inside">
                <li>Install the Family Guardian browser extension or app</li>
                <li>Open the app/extension on the child's device</li>
                <li>Select "Pair with Parent" and enter this code</li>
                <li>The device will appear in your dashboard once paired</li>
              </ol>
            </div>

            <div className="flex gap-2">
              <button
                onClick={generateCode}
                className="flex-1 py-2.5 rounded-xl bg-white/10 text-white font-medium text-sm hover:bg-white/20 transition-all cursor-pointer"
              >
                Regenerate
              </button>
              <button
                onClick={handleClose}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-medium text-sm hover:shadow-lg transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

