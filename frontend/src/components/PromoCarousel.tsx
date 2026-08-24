"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Promotion } from "@/types/api";
import PromoCard from "@/components/PromoCard";

const AUTOPLAY_MS = 5000;

export default function PromoCarousel({ promotions }: { promotions: Promotion[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = promotions.length;

  const go = (delta: number) => {
    setIndex((i) => (count === 0 ? 0 : (i + delta + count) % count));
  };

  useEffect(() => {
    if (count <= 1 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [count, paused]);

  if (count === 0) return null;

  return (
    <section className="section">
      <div className="container-rs">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-[12px] uppercase tracking-[0.2em] text-[var(--rs-brand)] font-bold">
              Не упустите
            </div>
            <h2 className="h-display mt-2 text-[28px] sm:text-[36px] font-extrabold">Акции</h2>
          </div>
          {count > 1 && (
            <div className="hidden sm:flex items-center gap-2">
              <CarouselButton onClick={() => go(-1)} label="Предыдущая акция">
                <ChevronLeft size={18} />
              </CarouselButton>
              <CarouselButton onClick={() => go(1)} label="Следующая акция">
                <ChevronRight size={18} />
              </CarouselButton>
            </div>
          )}
        </div>

        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {promotions.map((p) => (
              <div key={p.slug} className="w-full shrink-0 px-1">
                <div className="max-w-xl mx-auto sm:mx-0">
                  <PromoCard promotion={p} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {count > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            {promotions.map((p, i) => (
              <button
                key={p.slug}
                type="button"
                aria-label={`Показать акцию «${p.title}»`}
                onClick={() => setIndex(i)}
                className="h-2 rounded-full transition-all"
                style={{
                  width: i === index ? 24 : 8,
                  background: i === index ? "var(--rs-brand)" : "var(--rs-line)",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function CarouselButton({
  onClick, label, children,
}: { onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="btn-secondary !p-2.5 !rounded-full"
    >
      {children}
    </button>
  );
}
