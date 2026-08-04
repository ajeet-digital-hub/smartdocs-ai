"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Undo2, Redo2, Layers, Type, Square, Trash2, Copy, Loader } from "lucide-react";

interface EditorLayer {
  id: string;
  type: "text" | "image" | "shape" | "background" | "logo" | "icon";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  zIndex: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic layer props from DB
  props: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic layer style from DB
  style: Record<string, any>;
}

interface DesignData {
  _id: string;
  name: string;
  width: number;
  height: number;
  layers: EditorLayer[];
  fonts: string[];
  templateId?: string;
}

const FONTS = ["Inter", "Arial", "Georgia", "Times New Roman", "Roboto", "Poppins", "Playfair Display", "Courier New", "Segoe UI", "Noto Sans"];

export default function TemplateEditor() {
  const params = useParams();
  const router = useRouter();
  const designId = params?.id as string;

  const [design, setDesign] = useState<DesignData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<EditorLayer[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showLayerPanel, setShowLayerPanel] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

useEffect(() => {
    if (!designId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/templates/design/${designId}`);
        const data = await res.json();
        if (!data.ok) throw new Error(data.error || "Design not found");
        if (cancelled) return;
        setDesign(data.design);
        setHistory([JSON.parse(JSON.stringify(data.design.layers))]);
        setHistoryIndex(0);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load design");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [designId]);

  const pushHistory = useCallback((newLayers: EditorLayer[]) => {
    setHistory((prev) => {
      const next = prev.slice(0, historyIndex + 1);
      next.push(JSON.parse(JSON.stringify(newLayers)));
      if (next.length > 50) next.shift();
      return next;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 49));
  }, [historyIndex]);

  const updateLayers = useCallback((newLayers: EditorLayer[], record = true) => {
    if (!design) return;
    setDesign({ ...design, layers: newLayers });
    if (record) pushHistory(newLayers);
  }, [design, pushHistory]);

  const getSelectedLayer = () => {
    if (!design || !selectedLayer) return null;
    return design.layers.find((l) => l.id === selectedLayer) || null;
  };

  const selectLayer = (id: string | null) => {
    setSelectedLayer(id);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic prop values from user input
  const updateLayerProp = (prop: string, value: any) => {
    if (!design || !selectedLayer) return;
    const newLayers = design.layers.map((l) =>
      l.id === selectedLayer ? { ...l, props: { ...l.props, [prop]: value } } : l
    );
    updateLayers(newLayers);
  };

  const updateLayerPosition = (x: number, y: number) => {
    if (!design || !selectedLayer) return;
    const newLayers = design.layers.map((l) =>
      l.id === selectedLayer ? { ...l, x, y } : l
    );
    updateLayers(newLayers);
  };

  const updateLayerSize = (w: number, h: number) => {
    if (!design || !selectedLayer) return;
    const newLayers = design.layers.map((l) =>
      l.id === selectedLayer ? { ...l, width: w, height: h } : l
    );
    updateLayers(newLayers);
  };

  const deleteLayer = () => {
    if (!design || !selectedLayer) return;
    const newLayers = design.layers.filter((l) => l.id !== selectedLayer);
    updateLayers(newLayers);
    setSelectedLayer(null);
  };

  const duplicateLayer = () => {
    if (!design || !selectedLayer) return;
    const layer = design.layers.find((l) => l.id === selectedLayer);
    if (!layer) return;
    const newLayer: EditorLayer = {
      ...JSON.parse(JSON.stringify(layer)),
      id: `layer-${Date.now()}`,
      x: layer.x + 20,
      y: layer.y + 20,
      zIndex: Math.max(...design.layers.map((l) => l.zIndex)) + 1,
    };
    const newLayers = [...design.layers, newLayer];
    updateLayers(newLayers);
    setSelectedLayer(newLayer.id);
  };

  const moveLayerUp = () => {
    if (!design || !selectedLayer) return;
    const layer = design.layers.find((l) => l.id === selectedLayer);
    if (!layer) return;
    const newLayers = design.layers.map((l) =>
      l.id === selectedLayer ? { ...l, zIndex: l.zIndex + 1 } : l
    );
    updateLayers(newLayers);
  };

  const moveLayerDown = () => {
    if (!design || !selectedLayer) return;
    const layer = design.layers.find((l) => l.id === selectedLayer);
    if (!layer || layer.zIndex <= 0) return;
    const newLayers = design.layers.map((l) =>
      l.id === selectedLayer ? { ...l, zIndex: l.zIndex - 1 } : l
    );
    updateLayers(newLayers);
  };

  const addTextLayer = () => {
    if (!design) return;
    const newLayer: EditorLayer = {
      id: `layer-${Date.now()}`,
      type: "text",
      x: 50, y: 50, width: 400, height: 50,
      rotation: 0, opacity: 1, visible: true, locked: false,
      zIndex: Math.max(...design.layers.map((l) => l.zIndex), 0) + 1,
      props: { text: "New Text", fontFamily: "Inter", fontSize: 24, fontWeight: "normal", color: "#1e293b", textAlign: "left" },
      style: {},
    };
    updateLayers([...design.layers, newLayer]);
    setSelectedLayer(newLayer.id);
  };

  const addShapeLayer = () => {
    if (!design) return;
    const newLayer: EditorLayer = {
      id: `layer-${Date.now()}`,
      type: "shape",
      x: 50, y: 50, width: 200, height: 200,
      rotation: 0, opacity: 1, visible: true, locked: false,
      zIndex: Math.max(...design.layers.map((l) => l.zIndex), 0) + 1,
      props: { shapeType: "rectangle", color: "#6366f1", borderRadius: 8 },
      style: {},
    };
    updateLayers([...design.layers, newLayer]);
    setSelectedLayer(newLayer.id);
  };

  const handleUndo = () => {
    if (historyIndex <= 0 || !design) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    setDesign({ ...design, layers: JSON.parse(JSON.stringify(history[newIndex])) });
  };

  const handleRedo = () => {
    if (historyIndex >= history.length - 1 || !design) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    setDesign({ ...design, layers: JSON.parse(JSON.stringify(history[newIndex])) });
  };

  const handleSave = async () => {
    if (!design) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/templates/design/${designId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layers: design.layers, name: design.name }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed to save");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent, layerId: string) => {
    if (!design) return;
    const layer = design.layers.find((l) => l.id === layerId);
    if (!layer || layer.locked) return;
    selectLayer(layerId);
    setIsDragging(true);
    setDragOffset({ x: e.clientX - layer.x, y: e.clientY - layer.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedLayer || !design) return;
    const newX = Math.max(0, e.clientX - dragOffset.x);
    const newY = Math.max(0, e.clientY - dragOffset.y);
    updateLayerPosition(newX, newY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const renderCanvas = () => {
    if (!design) return null;
    const scale = Math.min(700 / design.width, 800 / design.height);
    const cw = design.width * scale;
    const ch = design.height * scale;

    return (
      <div
        ref={canvasRef}
        className="relative mx-auto overflow-hidden rounded-xl border border-white/10 bg-white shadow-lg"
        style={{ width: cw, height: ch }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {design.layers
          .filter((l) => l.visible !== false)
          .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
          .map((layer) => {
            const lx = layer.x * scale;
            const ly = layer.y * scale;
            const lw = layer.width * scale;
            const lh = layer.height * scale;
            const isSelected = selectedLayer === layer.id;

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
                  className={`absolute cursor-move ${isSelected ? "ring-2 ring-purple-500" : ""}`}
                  style={{
                    left: lx, top: ly, width: lw, height: lh,
                    backgroundColor: layer.props?.color || "#e2e8f0",
                    borderRadius: layer.props?.borderRadius ? layer.props.borderRadius : 0,
                    transform: `rotate(${layer.rotation || 0}deg)`,
                    opacity: layer.opacity ?? 1,
                    zIndex: layer.zIndex || 0,
                  }}
                  onMouseDown={(e) => handleMouseDown(e, layer.id)}
                  onClick={() => selectLayer(layer.id)}
                />
              );
            }
            if (layer.type === "text") {
              return (
                <div
                  key={layer.id}
                  className={`absolute overflow-hidden cursor-move ${isSelected ? "ring-2 ring-purple-500" : ""}`}
                  style={{
                    left: lx, top: ly, width: lw, height: lh,
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
                  onMouseDown={(e) => handleMouseDown(e, layer.id)}
                  onClick={() => selectLayer(layer.id)}
                >
                  {layer.props?.text || ""}
                </div>
              );
            }
            if (layer.type === "image") {
              return (
                <div
                  key={layer.id}
                  className={`absolute cursor-move ${isSelected ? "ring-2 ring-purple-500" : ""}`}
                  style={{
                    left: lx, top: ly, width: lw, height: lh,
                    transform: `rotate(${layer.rotation || 0}deg)`,
                    opacity: layer.opacity ?? 1,
                    zIndex: layer.zIndex || 0,
                    overflow: "hidden",
                  }}
                  onMouseDown={(e) => handleMouseDown(e, layer.id)}
                  onClick={() => selectLayer(layer.id)}
                >
{layer.props?.src ? (
                    // eslint-disable-next-line @next/next/no-img-element -- dynamic user-uploaded images in canvas
                    <img src={layer.props.src} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 text-xs">Image</div>
                  )}
                </div>
              );
            }
            return null;
          })}
      </div>
    );
  };

  const selected = getSelectedLayer();

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-purple-400" />
      </main>
    );
  }

  if (error || !design) {
    return (
      <main className="min-h-screen bg-slate-950 pt-24 text-center">
        <p className="text-red-300">{error || "Design not found"}</p>
        <button onClick={() => router.push("/templates")} className="mt-4 text-purple-400 hover:underline">Back to Templates</button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 pt-16">
      {/* Top toolbar */}
      <div className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/templates")}
              className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <input
              value={design.name}
              onChange={(e) => setDesign({ ...design, name: e.target.value })}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white outline-none focus:border-purple-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleUndo} disabled={historyIndex <= 0} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white disabled:opacity-40" title="Undo">
              <Undo2 className="h-4 w-4" />
            </button>
            <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white disabled:opacity-40" title="Redo">
              <Redo2 className="h-4 w-4" />
            </button>
            <div className="h-6 w-px bg-white/10" />
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 disabled:opacity-50"
            >
              {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Left toolbar */}
        <div className="w-14 border-r border-white/10 bg-slate-950/50 flex flex-col items-center gap-2 py-4">
          <button onClick={addTextLayer} className="rounded-lg p-2.5 text-slate-400 hover:bg-white/10 hover:text-white transition-all" title="Add Text">
            <Type className="h-5 w-5" />
          </button>
          <button onClick={addShapeLayer} className="rounded-lg p-2.5 text-slate-400 hover:bg-white/10 hover:text-white transition-all" title="Add Shape">
            <Square className="h-5 w-5" />
          </button>
          <button
            onClick={() => setShowLayerPanel(!showLayerPanel)}
            className={`rounded-lg p-2.5 transition-all ${showLayerPanel ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/10 hover:text-white"}`}
            title="Layers"
          >
            <Layers className="h-5 w-5" />
          </button>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-slate-900/50 p-8">
          {renderCanvas()}
        </div>

        {/* Right panel - Properties */}
        <div className="w-72 border-l border-white/10 bg-slate-950/50 overflow-y-auto">
          {/* Layers Panel */}
          {showLayerPanel && (
            <div className="border-b border-white/10 p-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Layers</h3>
              <div className="space-y-1">
                {[...design.layers]
                  .filter((l) => l.type !== "background")
                  .sort((a, b) => b.zIndex - a.zIndex)
                  .map((layer) => (
                    <div
                      key={layer.id}
                      onClick={() => selectLayer(layer.id)}
                      className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs cursor-pointer transition-all ${
                        selectedLayer === layer.id ? "bg-purple-600/20 text-white" : "text-slate-400 hover:bg-white/5"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        layer.type === "text" ? "bg-blue-400" :
                        layer.type === "shape" ? "bg-green-400" :
                        layer.type === "image" ? "bg-amber-400" : "bg-slate-400"
                      }`} />
                      <span className="capitalize">{layer.type}</span>
                      {layer.props?.text && (
                        <span className="truncate text-slate-500">{(layer.props.text as string).substring(0, 20)}</span>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Properties Panel */}
          {selected && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {selected.type} Properties
                </h3>
                <div className="flex items-center gap-1">
                  <button onClick={duplicateLayer} className="rounded p-1 text-slate-400 hover:text-white" title="Duplicate">
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={deleteLayer} className="rounded p-1 text-red-400 hover:text-red-300" title="Delete">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Position */}
              <div className="space-y-2">
                <label className="text-xs text-slate-500">Position</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500">X</span>
                    <input
                      type="number"
                      value={Math.round(selected.x)}
                      onChange={(e) => updateLayerPosition(Number(e.target.value), selected.y)}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white outline-none focus:border-purple-400"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Y</span>
                    <input
                      type="number"
                      value={Math.round(selected.y)}
                      onChange={(e) => updateLayerPosition(selected.x, Number(e.target.value))}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white outline-none focus:border-purple-400"
                    />
                  </div>
                </div>
              </div>

              {/* Size */}
              <div className="space-y-2">
                <label className="text-xs text-slate-500">Size</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500">W</span>
                    <input
                      type="number"
                      value={Math.round(selected.width)}
                      onChange={(e) => updateLayerSize(Number(e.target.value), selected.height)}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white outline-none focus:border-purple-400"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">H</span>
                    <input
                      type="number"
                      value={Math.round(selected.height)}
                      onChange={(e) => updateLayerSize(selected.width, Number(e.target.value))}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white outline-none focus:border-purple-400"
                    />
                  </div>
                </div>
              </div>

              {/* Text Properties */}
              {selected.type === "text" && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500">Content</label>
                    <textarea
                      value={selected.props?.text || ""}
                      onChange={(e) => updateLayerProp("text", e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white outline-none focus:border-purple-400 resize-none"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500">Font</label>
                    <select
                      value={selected.props?.fontFamily || "Inter"}
                      onChange={(e) => updateLayerProp("fontFamily", e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white outline-none focus:border-purple-400"
                    >
                      {FONTS.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500">Size</label>
                    <input
                      type="number"
                      value={selected.props?.fontSize || 24}
                      onChange={(e) => updateLayerProp("fontSize", Number(e.target.value))}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white outline-none focus:border-purple-400"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-xs text-slate-400">
                      <input
                        type="checkbox"
                        checked={selected.props?.fontWeight === "bold"}
                        onChange={(e) => updateLayerProp("fontWeight", e.target.checked ? "bold" : "normal")}
                        className="rounded border-white/20"
                      />
                      Bold
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-400">
                      <input
                        type="checkbox"
                        checked={selected.props?.fontStyle === "italic"}
                        onChange={(e) => updateLayerProp("fontStyle", e.target.checked ? "italic" : "normal")}
                        className="rounded border-white/20"
                      />
                      Italic
                    </label>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500">Alignment</label>
                    <div className="flex gap-1">
                      {(["left", "center", "right"] as const).map((align) => (
                        <button
                          key={align}
                          onClick={() => updateLayerProp("textAlign", align)}
                          className={`flex-1 rounded-lg px-2 py-1.5 text-xs capitalize transition-all ${
                            (selected.props?.textAlign || "left") === align
                              ? "bg-purple-600/30 text-white"
                              : "bg-white/5 text-slate-400 hover:bg-white/10"
                          }`}
                        >
                          {align}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500">Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={selected.props?.color || "#1e293b"}
                        onChange={(e) => updateLayerProp("color", e.target.value)}
                        className="h-8 w-8 rounded-lg border border-white/10 cursor-pointer"
                      />
                      <span className="text-xs text-slate-400">{selected.props?.color || "#1e293b"}</span>
                    </div>
                  </div>
                </>
              )}

              {/* Shape Properties */}
              {selected.type === "shape" && (
                <div className="space-y-2">
                  <label className="text-xs text-slate-500">Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selected.props?.color || "#6366f1"}
                      onChange={(e) => updateLayerProp("color", e.target.value)}
                      className="h-8 w-8 rounded-lg border border-white/10 cursor-pointer"
                    />
                    <span className="text-xs text-slate-400">{selected.props?.color || "#6366f1"}</span>
                  </div>
                  <label className="text-xs text-slate-500">Border Radius</label>
                  <input
                    type="number"
                    value={selected.props?.borderRadius || 0}
                    onChange={(e) => updateLayerProp("borderRadius", Number(e.target.value))}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white outline-none focus:border-purple-400"
                  />
                </div>
              )}

              {/* Opacity */}
              <div className="space-y-2">
                <label className="text-xs text-slate-500">Opacity</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={selected.opacity ?? 1}
                  onChange={(e) => {
                    const newLayers = design.layers.map((l) =>
                      l.id === selectedLayer ? { ...l, opacity: Number(e.target.value) } : l
                    );
                    updateLayers(newLayers);
                  }}
                  className="w-full accent-purple-500"
                />
                <span className="text-xs text-slate-500">{Math.round((selected.opacity ?? 1) * 100)}%</span>
              </div>

              {/* Rotation */}
              <div className="space-y-2">
                <label className="text-xs text-slate-500">Rotation</label>
                <input
                  type="number"
                  value={selected.rotation || 0}
                  onChange={(e) => {
                    const newLayers = design.layers.map((l) =>
                      l.id === selectedLayer ? { ...l, rotation: Number(e.target.value) } : l
                    );
                    updateLayers(newLayers);
                  }}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white outline-none focus:border-purple-400"
                />
              </div>

              {/* Layer Order */}
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <button onClick={moveLayerUp} className="flex-1 rounded-lg bg-white/5 px-2 py-1.5 text-xs text-slate-400 hover:bg-white/10">Bring Forward</button>
                  <button onClick={moveLayerDown} className="flex-1 rounded-lg bg-white/5 px-2 py-1.5 text-xs text-slate-400 hover:bg-white/10">Send Backward</button>
                </div>
              </div>
            </div>
          )}

          {!selected && (
            <div className="p-4 text-center text-sm text-slate-500">
              Select a layer to edit its properties
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
