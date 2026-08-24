import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import type { Promotion } from "@/types/api";
import { formatDate } from "@/lib/utils";

export default function PromoBanner({ promotion }: { promotion?: Promotion | null }) {
  if (!promotion) return null;

  const title = promotion.banner_title || promotion.title;
  const subtitle = promotion.banner_subtitle || promotion.terms;
  const houseCount = promotion.builds.length;

  return (
    <section className="container-rs pt-8 sm:pt-12">
      <div className="promo-banner p-6 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
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
