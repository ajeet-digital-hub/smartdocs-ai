"use client";

import React, { useRef, useState } from "react";

interface AvatarUploaderProps {
  current?: string;
  onUploaded?: (url: string) => void;
  onRemoved?: () => void;
}

export default function AvatarUploader({ current, onUploaded, onRemoved }: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(current);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file type
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Invalid file type. Please upload JPEG, PNG, or WebP.");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("File too large. Maximum size is 5MB.");
      return;
    }

    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("avatar", file);

      const res = await fetch("/api/account/avatar", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (!data.ok) {
        throw new Error(data.error || "Failed to upload avatar");
      }

      setPreview(data.photoUrl);
      onUploaded?.(data.photoUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(undefined);
    onRemoved?.();
  };

  return (
    <div>
      <div
        style={{
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: preview
            ? `url(${preview}) center/cover`
            : "linear-gradient(135deg, #8B2E3F, #5C1A2A)",
          color: "#fff",
          fontSize: "36px",
          fontWeight: 700,
        }}
      >
        {!preview && "📷"}
      </div>

      <div style={{ marginTop: "12px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: "none" }}
          onChange={onFile}
        />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{
            padding: "8px 16px",
            background: "#F5F0E8",
            color: "#4A3F34",
            border: "1px solid #E5DCC8",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            opacity: uploading ? 0.6 : 1,
          }}
        >
          {uploading ? "Uploading..." : "Upload Photo"}
        </button>
        {preview && (
          <button
            onClick={handleRemove}
            style={{
              padding: "8px 16px",
              background: "#FFF5F5",
              color: "#C53030",
              border: "1px solid #FED7D7",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Remove
          </button>
        )}
      </div>

      {error && (
        <p style={{ marginTop: "8px", fontSize: "12px", color: "#C53030" }}>{error}</p>
      )}
      <p style={{ marginTop: "4px", fontSize: "11px", color: "#8A7F72" }}>
        JPEG, PNG, or WebP. Max 5MB.
      </p>
    </div>
  );
}

