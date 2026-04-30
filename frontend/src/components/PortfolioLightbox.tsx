"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react";
import type { PortfolioItem } from "@/types/api";

type Props = {
  item: PortfolioItem;
  photos: string[];
  embedUrl: string | null;
  rawVideoUrl: string;
  tab: "photos" | "video";
  setTab: (t: "photos" | "video") => void;
  onClose: () => void;
};

export default function PortfolioLightbox({
  item, photos, embedUrl, rawVideoUrl, tab, setTab, onClose,
}: Props) {
  const [idx, setIdx] = useState(0);
  const total = photos.length;
  const hasVideo = Boolean(rawVideoUrl);

  const prev = () => setIdx((i) => (i - 1 + total) % total);
  const next = () => setIdx((i) => (i + 1) % total);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (tab === "photos" && total > 1) {
        if (e.key === "ArrowLeft") prev();
        if (e.key === "ArrowRight") next();
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, total]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex flex-col p-2 sm:p-4"
      onClick={onClose}
    >
      <div className="flex items-center justify-between gap-3 px-2 sm:px-4 py-2 max-w-6xl mx-auto w-full text-white">
        <div className="font-bold text-[15px] sm:text-[18px] truncate">
          {item.title || (item.area ? `Дом ${item.area} м²` : "Объект")}
          {item.year && (
            <span className="ml-2 text-white/60 font-normal">{item.year}</span>
          )}
        </div>
        {hasVideo && (
          <div className="flex gap-1 bg-white/10 rounded-full p-1">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setTab("photos"); }}
              className={`px-3 py-1 rounded-full text-[12px] font-semibold transition ${
                tab === "photos" ? "bg-white text-black" : "text-white/80 hover:text-white"
              }`}
            >
              Фото {total > 0 ? `· ${total}` : ""}
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setTab("video"); }}
              className={`px-3 py-1 rounded-full text-[12px] font-semibold transition ${
                tab === "video" ? "bg-white text-black" : "text-white/80 hover:text-white"
              }`}
            >
              Видео
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          aria-label="Закрыть"
          className="bg-white/15 hover:bg-white/25 text-white rounded-full p-2"
        >
          <X size={22} />
        </button>
      </div>

      <div
        className="flex-1 flex items-center justify-center min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        {tab === "photos" ? (
          total > 0 ? (
            <div className="relative max-w-6xl w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photos[idx]}
                alt=""
                className="w-full max-h-[78vh] object-contain rounded-lg select-none"
              />
              {total > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prev}
                    aria-label="Предыдущее"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/15 hover:bg-white/25 text-white rounded-full p-3"
                  >
                    <ChevronLeft size={26} />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    aria-label="Следующее"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/15 hover:bg-white/25 text-white rounded-full p-3"
                  >
                    <ChevronRight size={26} />
                  </button>
                  <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    {idx + 1} / {total}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-white/70">Фотографий пока нет</div>
          )
        ) : embedUrl ? (
          <div className="w-full max-w-6xl aspect-video">
            <iframe
              src={embedUrl}
              className="w-full h-full rounded-lg"
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
              title={item.title || "Видео объекта"}
            />
          </div>
        ) : (
          <div className="text-white/80 flex flex-col items-center gap-3">
            <div>Этот сервис пока не встраивается на сайт.</div>
            <a
              href={rawVideoUrl}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 bg-white text-black font-bold px-5 py-3 rounded-full"
            >
              Открыть видео <ExternalLink size={16} />
            </a>
          </div>
        )}
      </div>

      {tab === "photos" && total > 1 && (
        <div
          className="mx-auto max-w-6xl w-full mt-3 flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "thin" }}
          onClick={(e) => e.stopPropagation()}
        >
          {photos.map((p, i) => (
            <button
              key={p}
              type="button"
              onClick={() => setIdx(i)}
              className={`relative shrink-0 rounded-md overflow-hidden border-2 transition w-20 h-14 sm:w-24 sm:h-16 ${
                i === idx
                  ? "border-white"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
              aria-label={`Фото ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p}
                alt=""
                loading="eager"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
