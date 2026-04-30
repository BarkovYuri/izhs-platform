"use client";

import { useEffect, useState } from "react";
import { X, ZoomIn } from "lucide-react";

type Props = {
  src: string;
  alt: string;
};

/**
 * Карточка-картинка с hover-эффектом + lightbox по клику.
 *
 * Hover: лёгкий подъём (-translate-y-0.5), картинка слегка
 * увеличивается (scale 1.03), появляется иконка лупы. Карточка
 * адаптируется под естественные размеры изображения — ничего
 * не обрезается.
 *
 * Клик: полноэкранный лайтбокс с тёмным фоном. Закрывается Esc,
 * кликом по фону или кнопкой ×. На мобильных можно pinch-zoom
 * браузером для деталей.
 */
export default function ZoomableImage({ src, alt }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Открыть «${alt}» в полном размере`}
        className="card-rs overflow-hidden block w-full p-0 cursor-zoom-in transition group text-left hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]"
      >
        <div className="relative w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="w-full h-auto block transition duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition">
            <ZoomIn size={18} />
          </div>
        </div>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={alt}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-lg select-none cursor-zoom-out"
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Закрыть"
            className="absolute top-4 right-4 bg-white/15 hover:bg-white/25 text-white rounded-full p-2.5 transition"
          >
            <X size={24} />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-[12px] hidden sm:block">
            Esc — закрыть · pinch / колёсико — зум
          </div>
        </div>
      )}
    </>
  );
}
