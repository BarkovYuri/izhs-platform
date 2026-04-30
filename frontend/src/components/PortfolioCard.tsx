"use client";

import { useState } from "react";
import { Calendar, MapPin, Maximize2, Play, X } from "lucide-react";
import { resolveMediaUrl } from "@/services/api";
import { getVideoEmbedUrl } from "@/lib/video";
import type { PortfolioItem } from "@/types/api";
import PortfolioLightbox from "@/components/PortfolioLightbox";

function defaultLabel(item: PortfolioItem): string {
  if (item.title) return item.title;
  if (item.year && item.area) return `Дом ${item.area} м², ${item.year}`;
  if (item.area) return `Дом ${item.area} м²`;
  return "Реализованный объект";
}

export default function PortfolioCard({ item }: { item: PortfolioItem }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"photos" | "video">("photos");

  const cover = resolveMediaUrl(item.cover);
  const photos = [
    item.cover,
    ...(item.images?.map((i) => i.image) ?? []),
  ]
    .filter(Boolean)
    .map((u) => resolveMediaUrl(u));
  const embedUrl = getVideoEmbedUrl(item.video_url);
  const hasVideo = Boolean(item.video_url);

  const label = defaultLabel(item);

  const meta: string[] = [];
  if (item.area) meta.push(`${item.area} м²`);
  if (item.year) meta.push(`${item.year}`);
  if (item.location) meta.push(item.location);

  return (
    <>
      <button
        type="button"
        onClick={() => { setTab("photos"); setOpen(true); }}
        className="group card-rs overflow-hidden text-left p-0 cursor-pointer transition hover:-translate-y-0.5"
      >
        <div className="relative aspect-[16/10] bg-[var(--rs-bg)] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover}
            alt={label}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover transition group-hover:scale-[1.02]"
          />
          {hasVideo && (
            <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 bg-black/65 text-white text-[12px] font-semibold px-2.5 py-1 rounded-full">
              <Play size={12} /> Видео
            </div>
          )}
          {photos.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/55 text-white text-[12px] font-semibold px-2.5 py-1 rounded-full">
              {photos.length} фото
            </div>
          )}
        </div>
        <div className="p-5">
          <div className="font-extrabold text-[16px] leading-snug">
            {label}
          </div>
          {meta.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-[var(--rs-muted)]">
              {item.area && (
                <span className="inline-flex items-center gap-1">
                  <Maximize2 size={13} /> {item.area} м²
                </span>
              )}
              {item.year && (
                <span className="inline-flex items-center gap-1">
                  <Calendar size={13} /> {item.year}
                </span>
              )}
              {item.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={13} /> {item.location}
                </span>
              )}
            </div>
          )}
          {item.description && (
            <p className="mt-3 text-[13px] text-[var(--rs-muted)] line-clamp-3 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>
      </button>

      {open && (
        <PortfolioLightbox
          item={item}
          photos={photos}
          embedUrl={embedUrl}
          rawVideoUrl={item.video_url}
          tab={tab}
          setTab={setTab}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
