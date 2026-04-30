"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { resolveMediaUrl } from "@/services/api";

type Item = { image: string; order: number };

export default function Gallery({ items }: { items: Item[] }) {
  // Мемоизируем — иначе каждый rerender создаёт новый array → next/image
  // считает что src изменился и грузит заново.
  const urls = useMemo(
    () =>
      items
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((i) => resolveMediaUrl(i.image))
        .filter(Boolean),
    [items],
  );

  const [idx, setIdx] = useState(0);
  const [open, setOpen] = useState(false);
  const total = urls.length;

  const prev = () => setIdx((i) => (i - 1 + total) % total);
  const next = () => setIdx((i) => (i + 1) % total);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (total === 0) {
    return (
      <div className="card-rs grid place-items-center aspect-[4/3] text-[var(--rs-muted)]">
        Нет изображений
      </div>
    );
  }

  return (
    <div>
      {/* Главное фото — на mobile почти квадрат (4:3), на десктопе шире (16:10).
          Все картинки рендерим разом (display:opacity), браузер кэширует —
          переключения мгновенные, без повторной загрузки. */}
      <div className="relative overflow-hidden bg-[var(--rs-line)]/40 sm:rounded-2xl aspect-[4/3] sm:aspect-[16/10]">
        {urls.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt=""
            fill
            sizes="(min-width: 1024px) 800px, 100vw"
            quality={80}
            priority={i === 0}
            className={`object-cover transition-opacity duration-200 ${
              i === idx ? "opacity-100" : "opacity-0 pointer-events-none"
            } cursor-zoom-in`}
            onClick={() => i === idx && setOpen(true)}
          />
        ))}

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Предыдущее"
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-md z-10"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Следующее"
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-md z-10"
            >
              <ChevronRight size={22} />
            </button>
            <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 bg-black/60 text-white text-xs font-semibold px-2.5 py-1 rounded-full z-10">
              {idx + 1} / {total}
            </div>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="mt-3 px-4 sm:px-0 flex gap-2 overflow-x-auto pb-1">
          {urls.map((u, i) => (
            <button
              key={u}
              type="button"
              onClick={() => setIdx(i)}
              className={`relative shrink-0 rounded-lg overflow-hidden border-2 transition w-20 h-14 sm:w-24 sm:h-16 ${
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
                quality={50}
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-2 sm:p-4"
          onClick={() => setOpen(false)}
        >
          <div className="relative max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* В модалке — оригинал (полноразмерный) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={urls[idx]}
              alt=""
              className="w-full max-h-[88vh] object-contain rounded-lg"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Закрыть"
              className="absolute top-2 right-2 bg-white/15 hover:bg-white/25 text-white rounded-full p-2"
            >
              <X size={22} />
            </button>
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
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
