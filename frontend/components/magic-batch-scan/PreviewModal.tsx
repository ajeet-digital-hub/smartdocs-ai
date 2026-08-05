"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, FileText, Loader, X } from "lucide-react";
import { ResultDocument } from "./ResultsPanel";

interface PreviewModalProps {
  document: ResultDocument | null;
  onClose: () => void;
  batchId: string;
}

interface PreviewImage {
  id: string;
  url: string;
  originalName: string;
}

export default function PreviewModal({ document, onClose, batchId }: PreviewModalProps) {
  const [images, setImages] = useState<PreviewImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!document) return;

    const fetchImageUrls = async () => {
      setLoading(true);
      try {
        const urls = await Promise.all(
          document.items.map(async (item) => {
const res = await fetch(
              `/api/magic-batch-scan/download?batchId=${batchId}&itemId=${item.id}&format=jpg`
            );
            const data = await res.json();
            if (!data.ok) throw new Error(`Failed to get URL for ${item.originalName}`);
            return { id: item.id, url: data.signedUrl, originalName: item.originalName };
          })
        );
        setImages(urls);
      } catch (error) {
        console.error("Failed to fetch preview images:", error);
        // Handle error state in UI if necessary
      } finally {
        setLoading(false);
      }
    };

fetchImageUrls();
  }, [document, batchId]);

  const handleDownload = (format: "jpg" | "pdf") => {
    if (!document) return;
    let url = `/api/magic-batch-scan/download?batchId=${batchId}`;
    if (format === 'pdf') {
        url += `&groupId=${document.groupId}&format=pdf`;
    } else {
        url += `&itemId=${images[currentIndex].id}&format=jpg`;
    }
    
    // Fetch the signed URL and then trigger download
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          window.open(data.signedUrl, '_blank');
        }
      });
  };

  if (!document) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative flex h-[90vh] w-[90vw] max-w-6xl flex-col rounded-2xl border border-white/10 bg-slate-900 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-purple-300" />
              <div>
                <h2 className="font-semibold text-white">{document.label}</h2>
                <p className="text-xs text-slate-400">{document.imageCount} page(s)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => handleDownload('jpg')} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20">Download JPG</button>
                <button onClick={() => handleDownload('pdf')} className="rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white hover:bg-purple-500">Download PDF</button>
                <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button>
            </div>
          </div>

          {/* Body */}
          <div className="relative flex flex-1 items-center justify-center overflow-hidden p-4">
            {loading ? (
              <Loader className="h-8 w-8 animate-spin text-purple-400" />
            ) : (
              <>
                {images.length > 1 && (
                  <button
                    onClick={() => setCurrentIndex((i) => (i > 0 ? i - 1 : images.length - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm hover:bg-black/70"
                  >
                    <ArrowLeft className="h-6 w-6" />
                  </button>
                )}
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentIndex}
                    src={images[currentIndex]?.url}
                    alt={`Page ${currentIndex + 1}`}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.2 }}
                    className="max-h-full max-w-full object-contain"
                  />
                </AnimatePresence>
                {images.length > 1 && (
                  <button
                    onClick={() => setCurrentIndex((i) => (i < images.length - 1 ? i + 1 : 0))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm hover:bg-black/70"
                  >
                    <ArrowRight className="h-6 w-6" />
                  </button>
                )}
              </>
            )}
          </div>
           {/* Footer */}
           {images.length > 1 && (
            <div className="border-t border-white/10 p-2 text-center text-xs text-slate-400">
              Page {currentIndex + 1} of {images.length}
            </div>
           )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}