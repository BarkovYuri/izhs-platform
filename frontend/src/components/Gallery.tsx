"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { resolveMediaUrl } from "@/services/api";

type Item = { image: string; order: number };

export default function Gallery({ items, aspect = "16/10" }: { items: Item[]; aspect?: string }) {
  const sorted = items.slice().sort((a, b) => a.order - b.order);
  const urls = sorted.map((i) => resolveMediaUrl(i.image)).filter(Boolean);
  const [idx, setIdx] = useState(0);
  const [open, setOpen] = useState(false);

  const prev = () => setIdx((i) => (i - 1 + urls.length) % urls.length);
  const next = () => setIdx((i) => (i + 1) % urls.length);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (urls.length === 0) {
    return (
      <div className="card-rs grid place-items-center aspect-[16/10] text-[var(--rs-muted)]">
        Нет изображений
      </div>
    );
  }

  return (
    <div>
      <div className="relative card-rs overflow-hidden" style={{ aspectRatio: aspect }}>
        <Image
          src={urls[idx]}
          alt=""
          fill
          sizes="(min-width: 1024px) 800px, 100vw"
          priority={idx === 0}
          quality={80}
          className="object-cover cursor-zoom-in"
          onClick={() => setOpen(true)}
        />
        {urls.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Предыдущее"
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-md z-10"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Следующее"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-md z-10"
            >
              <ChevronRight size={22} />
            </button>
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-semibold px-2.5 py-1 rounded-full z-10">
              {idx + 1} / {urls.length}
            </div>
          </>
        )}
      </div>

      {urls.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {urls.map((u, i) => (
            <button
              key={u + i}
              type="button"
              onClick={() => setIdx(i)}
              className={`relative shrink-0 rounded-lg overflow-hidden border-2 transition w-24 h-16 ${
                i === idx
                  ? "border-[var(--rs-brand)]"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
              aria-label={`Фото ${i + 1}`}
            >
              <Image
                src={u}
                alt=""
                fill
                sizes="96px"
                quality={60}
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div className="relative max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* В модалке грузим оригинал без оптимизации (полноразмерное фото). */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={urls[idx]}
              alt=""
              className="w-full max-h-[85vh] object-contain rounded-lg"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Закрыть"
              className="absolute top-2 right-2 bg-white/15 hover:bg-white/25 text-white rounded-full p-2"
            >
              <X size={22} />
            </button>
            {urls.length > 1 && (
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
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
