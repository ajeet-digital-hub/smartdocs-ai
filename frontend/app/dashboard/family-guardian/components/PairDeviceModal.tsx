"use client";

import { useState, useEffect, useRef } from "react";

interface PairDeviceModalProps {
  childId: string;
  childName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface PairingCodeData {
  pairingCode: string;
  expiresAt: string;
  qrData: string;
  instructions: {
    codeEntry: string;
    qrScan: string;
    expiry: string;
  };
}

export default function PairDeviceModal({ childId, childName, isOpen, onClose }: PairDeviceModalProps) {
  const [deviceName, setDeviceName] = useState("");
  const [deviceType, setDeviceType] = useState("android");
  const [pairingData, setPairingData] = useState<PairingCodeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (showQR && canvasRef.current && pairingData) {
      generateQR(canvasRef.current, pairingData.qrData);
    }
  }, [showQR, pairingData]);

  if (!isOpen) return null;

  // Simple QR code generator using canvas (no external library needed)
  function generateQR(canvas: HTMLCanvasElement, data: string) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 200;
    canvas.width = size;
    canvas.height = size;

    // Simple QR-like representation using the data hash
    // In production, use a proper QR library like qrcode.js
    const hash = data.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const moduleCount = 21;
    const moduleSize = Math.floor(size / moduleCount);
    const offset = Math.floor((size - moduleCount * moduleSize) / 2);

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    // Generate a visual pattern based on the data
    // This is a simplified visual representation - NOT a real scannable QR code
    // A production app should use a library like 'qrcode' npm package
    ctx.fillStyle = "#1a1a2e";
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        // Position markers (top-left, top-right, bottom-left)
        const isPositionMarker =
          (row < 7 && col < 7) ||
          (row < 7 && col > moduleCount - 8) ||
          (row > moduleCount - 8 && col < 7);

        // Timing patterns
        const isTiming = (row === 6 && col >= 8 && col <= moduleCount - 8) ||
                         (col === 6 && row >= 8 && row <= moduleCount - 8);

        if (isPositionMarker) {
          if (
            row === 0 || row === 6 || col === 0 || col === 6 ||
            (row >= 2 && row <= 4 && col >= 2 && col <= 4)
          ) {
            ctx.fillRect(
              offset + col * moduleSize,
              offset + row * moduleSize,
              moduleSize,
              moduleSize
            );
          }
        } else if (isTiming) {
          if ((row + col) % 2 === 0) {
            ctx.fillRect(
              offset + col * moduleSize,
              offset + row * moduleSize,
              moduleSize,
              moduleSize
            );
          }
        } else {
          // Data area - use hash-based pseudo-random
          const bit = (hash * (row + 1) * (col + 1) * 7) % 3;
          if (bit === 0 || bit === 2) {
            ctx.fillRect(
              offset + col * moduleSize,
              offset + row * moduleSize,
              moduleSize,
              moduleSize
            );
          }
        }
      }
    }
  }

  async function generateCode() {
    if (!deviceName.trim()) {
      setError("Please enter a device name");
      return;
    }

    setLoading(true);
    setError(null);
    setShowQR(false);
    try {
      const res = await fetch("/api/family-guardian/pair-device", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId,
          deviceName: deviceName.trim(),
          deviceType,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setPairingData(data);
      } else {
        setError(data.error || "Failed to generate code");
      }
    } catch {
      setError("Failed to generate pairing code");
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleClose() {
    setDeviceName("");
    setDeviceType("android");
    setPairingData(null);
    setError(null);
    setCopied(false);
    setShowQR(false);
    onClose();
  }

  const getPlatformIcon = (type: string) => {
    switch (type) {
      case "android": return "📱";
      case "ios": return "🍎";
      case "web": return "🌐";
      case "browser": return "🌐";
      case "desktop": return "💻";
      default: return "📱";
    }
  };

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
          Generate a one-time pairing code to connect {childName}&apos;s device to Family Guardian.
          Enter the code on the child&apos;s device app or scan the QR code.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {!pairingData ? (
          <>
            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-1">Device Name *</label>
              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-purple-500"
                placeholder="e.g. Child's Samsung Galaxy A15"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm text-slate-400 mb-1">Device Platform</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "android", label: "Android", icon: "📱" },
                  { value: "ios", label: "iPhone/iPad", icon: "🍎" },
                  { value: "web", label: "Browser", icon: "🌐" },
                  { value: "desktop", label: "Desktop", icon: "💻" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setDeviceType(option.value)}
                    className={`px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer ${
                      deviceType === option.value
                        ? "bg-purple-500/30 text-purple-300 border border-purple-500/50"
                        : "bg-white/10 text-slate-400 border border-white/10 hover:bg-white/20"
                    }`}
                  >
                    <span className="mr-1.5">{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={generateCode}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-sm disabled:opacity-50 hover:shadow-lg transition-all cursor-pointer"
            >
              {loading ? "Generating..." : `Generate Pairing Code`}
            </button>
          </>
        ) : (
          <div className="text-center">
            {/* Toggle between QR and Code */}
            <div className="flex justify-center gap-2 mb-4">
              <button
                onClick={() => setShowQR(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  !showQR
                    ? "bg-purple-500/30 text-purple-300 border border-purple-500/50"
                    : "bg-white/10 text-slate-400 hover:bg-white/20"
                }`}
              >
                🔑 Code
              </button>
              <button
                onClick={() => setShowQR(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  showQR
                    ? "bg-purple-500/30 text-purple-300 border border-purple-500/50"
                    : "bg-white/10 text-slate-400 hover:bg-white/20"
                }`}
              >
                📷 QR Code
              </button>
            </div>

            {showQR ? (
              <div className="mb-4">
                <div className="inline-block p-4 rounded-xl bg-white">
                  <canvas
                    ref={canvasRef}
                    width={200}
                    height={200}
                    className="mx-auto"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Scan with the Family Guardian app
                </p>
                <p className="text-[10px] text-slate-600 mt-1">
                  Note: Production use requires a QR library integration
                </p>
              </div>
            ) : (
              <div className="mb-4">
                <div className="text-xs text-slate-400 mb-2">Pairing Code</div>
                <div className="inline-block px-8 py-4 rounded-xl bg-white/5 border-2 border-dashed border-purple-500/50">
                  <span className="text-3xl font-mono font-bold tracking-[0.3em] text-white">
                    {pairingData.pairingCode}
                  </span>
                </div>
              </div>
            )}

            {/* Copy Code Button */}
            <div className="flex justify-center gap-2 mb-4">
              <button
                onClick={() => copyToClipboard(pairingData.pairingCode)}
                className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-all cursor-pointer"
              >
                {copied ? "✓ Copied!" : "Copy Code"}
              </button>
              {pairingData.qrData && (
                <button
                  onClick={() => copyToClipboard(pairingData.qrData)}
                  className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-all cursor-pointer"
                >
                  Copy QR Data
                </button>
              )}
            </div>

            {pairingData.expiresAt && (
              <p className="text-xs text-slate-500 mb-4">
                ⏱ Expires at {new Date(pairingData.expiresAt).toLocaleTimeString()}
                {" • "}Single-use code
              </p>
            )}

            {/* Instructions */}
            <div className="mb-4 p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-left">
              <p className="text-cyan-300 text-sm font-medium mb-2">
                {getPlatformIcon(deviceType)} Instructions for {deviceType === "android" ? "Android" : deviceType === "ios" ? "iPhone/iPad" : deviceType === "web" ? "Browser" : "Desktop"}
              </p>
              <ol className="text-cyan-200/70 text-xs space-y-1.5 list-decimal list-inside">
                <li>Install the Family Guardian app on the child&apos;s device</li>
                <li>Open the app and select "Pair with Parent"</li>
                <li>
                  {showQR
                    ? "Scan the QR code shown on this screen"
                    : "Enter the pairing code shown above"}
                </li>
                <li>The device will appear in your dashboard once connected</li>
                <li>Then configure app &amp; website policies for this child</li>
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

