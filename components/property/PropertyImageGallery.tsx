"use client";
import { useState } from "react";
import { PROPERTY_TYPE_ICONS } from "@/lib/property-labels";

interface Props {
  images: string[];
  title: string;
  propertyType: string;
}

export function PropertyImageGallery({ images, title, propertyType }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const hasImages = images && images.length > 0;

  if (!hasImages) {
    return (
      <div className="aspect-video rounded-2xl flex flex-col items-center justify-center border"
        style={{ background: "var(--primary-light)", borderColor: "var(--border)" }}>
        <div className="text-6xl mb-3">{PROPERTY_TYPE_ICONS[propertyType] ?? "🏠"}</div>
        <p className="text-sm font-medium" style={{ color: "var(--primary)" }}>{title}</p>
        <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>No photos uploaded yet</p>
      </div>
    );
  }

  return (
    <div>
      {/* Main image */}
      <div
        className="relative aspect-video rounded-2xl overflow-hidden cursor-zoom-in"
        style={{ background: "var(--surface-alt)" }}
        onClick={() => setLightbox(true)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[activeIdx]} alt={title} className="w-full h-full object-cover" />
        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
          {activeIdx + 1} / {images.length}
        </div>
        {/* Prev/Next arrows */}
        <div className="absolute inset-0 flex items-center justify-between px-3 opacity-0 hover:opacity-100 transition-opacity">
          {activeIdx > 0 && (
            <button
              onClick={e => { e.stopPropagation(); setActiveIdx(activeIdx - 1); }}
              className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-gray-800 shadow-lg hover:bg-white transition-all text-xl font-bold"
            >‹</button>
          )}
          {activeIdx < images.length - 1 && (
            <button
              onClick={e => { e.stopPropagation(); setActiveIdx(activeIdx + 1); }}
              className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-gray-800 shadow-lg hover:bg-white transition-all text-xl font-bold ml-auto"
            >›</button>
          )}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={img}
              alt={`Photo ${i + 1}`}
              onClick={() => setActiveIdx(i)}
              className={`w-16 h-16 flex-shrink-0 rounded-lg object-cover cursor-pointer transition-all ${
                i === activeIdx ? "ring-2 ring-offset-2" : "opacity-60 hover:opacity-100"
              }`}
              style={i === activeIdx ? { ringColor: "var(--primary)" } : {}}
            />
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[activeIdx]}
            alt={title}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
          />
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl w-10 h-10 flex items-center justify-center"
            onClick={() => setLightbox(false)}
          >✕</button>
          {activeIdx > 0 && (
            <button
              className="absolute left-4 text-white/70 hover:text-white text-5xl"
              onClick={e => { e.stopPropagation(); setActiveIdx(activeIdx - 1); }}
            >‹</button>
          )}
          {activeIdx < images.length - 1 && (
            <button
              className="absolute right-4 text-white/70 hover:text-white text-5xl"
              onClick={e => { e.stopPropagation(); setActiveIdx(activeIdx + 1); }}
            >›</button>
          )}
        </div>
      )}
    </div>
  );
}
