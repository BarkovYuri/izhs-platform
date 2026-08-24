"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight, Flame } from "lucide-react";
import type { Promotion } from "@/types/api";
import { formatDate } from "@/lib/utils";
import { resolveMediaUrl } from "@/services/api";
import { useItemsPerView, useLoopCarousel } from "@/lib/useLoopCarousel";

export default function PromoBanner({ promotions }: { promotions: Promotion[] }) {
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
    // Без container-rs — секция растянута на всю ширину сайта, как Hero
    // над ней (у той тот же приём: контейнер только у контента внутри,
    // не у самой section). px вместо него — небольшой отступ от края
    // экрана, чтобы скруглённые углы карточек не упирались в него.
    <section className="px-3 sm:px-6 lg:px-10 pt-8 sm:pt-12">
      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div className="overflow-hidden">
          <div
            className={`flex ${noTransition ? "" : "transition-transform duration-500 ease-out"}`}
            style={{ transform: `translateX(-${index * slideWidth}%)` }}
            onTransitionEnd={handleTransitionEnd}
          >
            {extended.map((p, i) => (
              <div key={`${p.slug}-${i}`} className="shrink-0 px-2 sm:px-3" style={{ width: `${slideWidth}%` }}>
                <PromoBannerSlide promotion={p} />
              </div>
            ))}
          </div>
        </div>

        {canLoop && (
          <>
            <button
              type="button"
              aria-label="Предыдущая акция"
              onClick={goPrev}
              className="hidden sm:grid place-items-center absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-[var(--rs-brand-2)] shadow-md z-10"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              aria-label="Следующая акция"
              onClick={goNext}
              className="hidden sm:grid place-items-center absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-[var(--rs-brand-2)] shadow-md z-10"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {canLoop && (
        <div className="mt-4 flex items-center justify-center gap-2">
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
    </section>
  );
}

function PromoBannerSlide({ promotion }: { promotion: Promotion }) {
  const houseCount = promotion.builds.length;
  const hasImage = Boolean(promotion.banner_image);

  // banner_image — законченный креатив (фото + лого + «АКЦИЯ» вшиты в
  // файл, см. backend/scripts/generate_promo_banners.py). Блок фиксируем
  // по её пропорциям (2.5:1), иначе произвольная высота обрежет верх
  // картинки вместе с лого. Динамический текст — компактной плашкой снизу.
  if (hasImage) {
    return (
      <div className="relative overflow-hidden rounded-[var(--rs-radius)] shadow-[var(--rs-shadow)] aspect-[2.5/1]">
        <Image
          src={resolveMediaUrl(promotion.banner_image)}
          alt=""
          fill
          sizes="(min-width: 1200px) 600px, 100vw"
          quality={70}
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 promo-banner-bottom-overlay" />
        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide bg-white/15 px-2.5 py-1 rounded-full text-white">
              <Flame size={13} /> {promotion.badge_label}
            </span>
            <div className="mt-0 sm:mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[12px] sm:text-[12.5px] text-white/90 font-semibold">
              <span>До {formatDate(promotion.ends_at)}</span>
              {houseCount > 0 && (
                <span className="hidden sm:inline">
                  {houseCount} {houseCount === 1 ? "дом участвует" : "дома/домов участвуют"}
                </span>
              )}
            </div>
          </div>
          <Link
            href={`/akcii/${promotion.slug}`}
            className="shrink-0 inline-flex items-center gap-1.5 sm:gap-2 bg-white text-[var(--rs-brand-2)] font-bold rounded-full px-3.5 sm:px-5 py-2 sm:py-3 text-[12.5px] sm:text-[14px] hover:bg-white/90 transition-colors"
          >
            <span className="hidden sm:inline">Подробнее об акции</span>
            <span className="sm:hidden">Подробнее</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  const title = promotion.banner_title || promotion.title;

  return (
    <div className="promo-banner relative overflow-hidden rounded-[var(--rs-radius)] shadow-[var(--rs-shadow)] aspect-[2.5/1]">
      <div className="absolute inset-0 p-5 sm:p-8 flex flex-col justify-center">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide bg-white/15 px-2.5 py-1 rounded-full self-start">
          <Flame size={13} /> {promotion.badge_label}
        </span>
        <h2 className="h-display mt-2 sm:mt-3 font-extrabold leading-tight text-[18px] sm:text-[26px] line-clamp-2">
          {title}
        </h2>
        <div className="mt-2 sm:mt-3 flex items-center justify-between gap-3">
          <span className="text-[12px] sm:text-[12.5px] text-white/80">
            Действует до {formatDate(promotion.ends_at)}
          </span>
          <Link
            href={`/akcii/${promotion.slug}`}
            className="shrink-0 inline-flex items-center gap-1.5 bg-white text-[var(--rs-brand-2)] font-bold rounded-full px-3.5 py-2 text-[12.5px] hover:bg-white/90 transition-colors"
          >
            Подробнее <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
