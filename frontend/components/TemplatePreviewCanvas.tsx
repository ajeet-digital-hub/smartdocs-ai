"use client";

import React, { useMemo } from "react";

export interface PreviewLayer {
  id: string;
  type: "text" | "image" | "shape" | "background" | "logo" | "icon";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
  visible?: boolean;
zIndex?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic layer props from DB
  props?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic layer style from DB
  style?: Record<string, any>;
}

interface TemplatePreviewCanvasProps {
  layers?: PreviewLayer[];
  width?: number;
  height?: number;
  className?: string;
  maxWidth?: number;
  maxHeight?: number;
  renderText?: boolean;
}

/**
 * Renders template layers scaled to fit the container while preserving aspect ratio.
 * Used for both cards and the full preview page.
 */
export default function TemplatePreviewCanvas({
  layers = [],
  width = 800,
  height = 600,
  className = "",
  maxWidth = 500,
  maxHeight = 700,
  renderText = true,
}: TemplatePreviewCanvasProps) {
  const scale = useMemo(() => {
    if (!width || !height) return 1;
    return Math.min(maxWidth / width, maxHeight / height);
  }, [width, height, maxWidth, maxHeight]);

  const w = width * scale;
  const h = height * scale;

  const sorted = useMemo(() => {
    return layers
      .filter((l) => l.visible !== false)
      .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
  }, [layers]);

  return (
    <div
      className={`relative overflow-hidden bg-white ${className}`}
      style={{ width: w, height: h }}
      aria-hidden={!renderText}
    >
      {sorted.map((layer) => {
        if (layer.type === "background") {
          return (
            <div
              key={layer.id}
              className="absolute inset-0"
              style={{ backgroundColor: layer.props?.color || "#ffffff" }}
            />
          );
        }
        if (layer.type === "shape") {
          return (
            <div
              key={layer.id}
              className="absolute"
              style={{
                left: layer.x * scale,
                top: layer.y * scale,
                width: layer.width * scale,
                height: layer.height * scale,
                backgroundColor: layer.props?.color || "#e2e8f0",
                borderRadius: layer.props?.borderRadius ? layer.props.borderRadius * scale : 0,
                transform: `rotate(${layer.rotation || 0}deg)`,
                opacity: layer.opacity ?? 1,
                zIndex: layer.zIndex || 0,
              }}
            />
          );
        }
        if (layer.type === "text") {
          if (!renderText) {
            return (
              <div
                key={layer.id}
                className="absolute"
                style={{
                  left: layer.x * scale,
                  top: layer.y * scale,
                  width: layer.width * scale,
                  height: layer.height * scale,
                  backgroundColor: "#e2e8f0",
                  opacity: 0.6,
                  zIndex: layer.zIndex || 0,
                }}
              />
            );
          }
          return (
            <div
              key={layer.id}
              className="absolute overflow-hidden"
              style={{
                left: layer.x * scale,
                top: layer.y * scale,
                width: layer.width * scale,
                height: layer.height * scale,
                fontFamily: layer.props?.fontFamily || "Inter",
                fontSize: (layer.props?.fontSize || 16) * scale,
                fontWeight: layer.props?.fontWeight || "normal",
                fontStyle: layer.props?.fontStyle || "normal",
                color: layer.props?.color || "#1e293b",
                textAlign: layer.props?.textAlign || "left",
                lineHeight: layer.props?.lineHeight || 1.4,
                transform: `rotate(${layer.rotation || 0}deg)`,
                opacity: layer.opacity ?? 1,
                zIndex: layer.zIndex || 0,
                whiteSpace: "pre-wrap",
              }}
            >
              {layer.props?.text || ""}
            </div>
          );
        }
        if (layer.type === "image") {
          return (
            <div
              key={layer.id}
              className="absolute overflow-hidden"
              style={{
                left: layer.x * scale,
                top: layer.y * scale,
                width: layer.width * scale,
                height: layer.height * scale,
                transform: `rotate(${layer.rotation || 0}deg)`,
                opacity: layer.opacity ?? 1,
                zIndex: layer.zIndex || 0,
              }}
            >
{layer.props?.src ? (
                // eslint-disable-next-line @next/next/no-img-element -- dynamic user image layers in canvas
                <img
                  src={layer.props.src}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-200 text-[10px] text-slate-400">
                  Image
                </div>
              )}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

