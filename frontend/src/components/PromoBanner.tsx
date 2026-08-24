import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Flame } from "lucide-react";
import type { Promotion } from "@/types/api";
import { formatDate } from "@/lib/utils";
import { resolveMediaUrl } from "@/services/api";

export default function PromoBanner({ promotion }: { promotion?: Promotion | null }) {
  if (!promotion) return null;

  const title = promotion.banner_title || promotion.title;
  const subtitle = promotion.banner_subtitle || promotion.terms;
  const houseCount = promotion.builds.length;

  const hasImage = Boolean(promotion.banner_image);

  // Готовая картинка баннера (banner_image) — это законченный рекламный
  // креатив: фото дома + фирменный лого в углу + слово «АКЦИЯ» вшиты
  // прямо в файл (см. backend/scripts/generate_promo_banners.py).
  // Блок фиксируем по её пропорциям (2.5:1), иначе flex-контейнер
  // произвольной высоты обрежет верх картинки через object-cover —
  // лого и текст на фото могут просто не попасть в кадр.
  // Динамический текст (цена/даты/CTA) едет в нижнюю плашку, чтобы не
  // накладываться на зашитые в картинку элементы.
  if (hasImage) {
    return (
      <section className="container-rs pt-8 sm:pt-12">
        <div className="relative overflow-hidden rounded-[var(--rs-radius)] shadow-[var(--rs-shadow)] aspect-[2.5/1]">
          <Image
            src={resolveMediaUrl(promotion.banner_image)}
            alt=""
            fill
            sizes="(min-width: 1200px) 1200px, 100vw"
            quality={70}
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 promo-banner-bottom-overlay" />
          <div className="absolute inset-x-0 bottom-0 p-3 sm:p-6 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide bg-white/15 px-2.5 py-1 rounded-full text-white">
                <Flame size={13} /> {promotion.badge_label}
              </span>
              <div className="mt-0 sm:mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[12px] sm:text-[12.5px] text-white/90 font-semibold">
                <span>Действует до {formatDate(promotion.ends_at)}</span>
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
      </section>
    );
  }

  return (
    <section className="container-rs pt-8 sm:pt-12">
      <div className="promo-banner relative overflow-hidden rounded-[var(--rs-radius)] shadow-[var(--rs-shadow)] p-6 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide bg-white/15 px-2.5 py-1 rounded-full">
            <Flame size={13} /> {promotion.badge_label}
          </span>
          <h2 className="h-display mt-3 font-extrabold leading-tight text-[24px] sm:text-[32px]">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-[14px] sm:text-[15px] text-white/85 max-w-xl">
              {subtitle}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-white/80">
            <span>Действует до {formatDate(promotion.ends_at)}</span>
            {houseCount > 0 && (
              <span>
                {houseCount} {houseCount === 1 ? "дом участвует" : "дома/домов участвуют"}
              </span>
            )}
          </div>
        </div>
        <Link
          href={`/akcii/${promotion.slug}`}
          className="shrink-0 inline-flex items-center gap-2 bg-white text-[var(--rs-brand-2)] font-bold rounded-full px-5 py-3 text-[14px] hover:bg-white/90 transition-colors"
        >
          Подробнее об акции <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
