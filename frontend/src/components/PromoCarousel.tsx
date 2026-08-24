"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Promotion } from "@/types/api";
import PromoCard from "@/components/PromoCard";
import { useItemsPerView, useLoopCarousel } from "@/lib/useLoopCarousel";

export default function PromoCarousel({ promotions }: { promotions: Promotion[] }) {
  const rawItemsPerView = useItemsPerView();
  const count = promotions.length;
  const itemsPerView = Math.max(1, Math.min(rawItemsPerView, count || 1));

  const {
    index, noTransition, setPaused,
    goNext, goPrev, goTo, handleTransitionEnd, activeDot, canLoop,
  } = useLoopCarousel(count, itemsPerView);

  if (count === 0) return null;

  const extended = canLoop ? [...promotions, ...promotions.slice(0, itemsPerView)] : promotions;
  const slideWidth = 100 / itemsPerView;

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
          {canLoop && (
            <div className="hidden sm:flex items-center gap-2">
              <CarouselButton onClick={goPrev} label="Предыдущая акция">
                <ChevronLeft size={18} />
              </CarouselButton>
              <CarouselButton onClick={goNext} label="Следующая акция">
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
            className={`flex ${noTransition ? "" : "transition-transform duration-500 ease-out"}`}
            style={{ transform: `translateX(-${index * slideWidth}%)` }}
            onTransitionEnd={handleTransitionEnd}
          >
            {extended.map((p, i) => (
              <div key={`${p.slug}-${i}`} className="shrink-0 px-1.5 sm:px-2" style={{ width: `${slideWidth}%` }}>
                <PromoCard promotion={p} />
              </div>
            ))}
          </div>
        </div>

        {canLoop && (
          <div className="mt-6 flex items-center justify-center gap-2">
            {promotions.map((p, i) => (
              <button
                key={p.slug}
                type="button"
                aria-label={`Показать акцию «${p.title}»`}
                onClick={() => goTo(i)}
                className="h-2 rounded-full transition-all"
                style={{
                  width: i === activeDot ? 24 : 8,
                  background: i === activeDot ? "var(--rs-brand)" : "var(--rs-line)",
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
