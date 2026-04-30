import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Bed, Building2, Maximize2 } from "lucide-react";
import type { BuildListItem } from "@/types/api";
import { formatArea, formatPrice } from "@/lib/utils";
import { resolveMediaUrl } from "@/services/api";

const STATUS_BADGE: Record<string, string> = {
  available: "badge-olive",
  building: "badge-gold",
  planned: "badge-muted",
  sold: "badge-muted",
};

export default function BuildCard({ b }: { b: BuildListItem }) {
  const cover = b.cover ? resolveMediaUrl(b.cover) : null;
  return (
    <Link
      href={`/builds/${b.slug}`}
      className="card-rs group overflow-hidden flex flex-col transition-transform duration-200 active:scale-[0.99] sm:hover:-translate-y-1"
    >
      {/* Обложка: на mobile более «горизонтальная» (16:10), на desktop — 4:3 */}
      <div className="relative aspect-[16/10] sm:aspect-[4/3] bg-[var(--rs-line)]/40 overflow-hidden">
        {cover ? (
          <Image
            src={cover}
            alt={b.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            quality={70}
            className="object-cover transition-transform duration-500 sm:group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-[var(--rs-muted)] text-sm">
            Нет фото
          </div>
        )}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-wrap gap-1.5 max-w-[calc(100%-1rem)]">
          <span className={`badge !text-[11px] !py-0.5 !px-2 ${STATUS_BADGE[b.status] || "badge-muted"}`}>
            {b.status_label}
          </span>
          {b.is_typical && (
            <span className="badge badge-brand !text-[11px] !py-0.5 !px-2">Типовой</span>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-5 flex flex-col gap-2.5 flex-1">
        <h3
          className="font-extrabold leading-tight tracking-tight line-clamp-2"
          style={{
            fontSize: "clamp(15px, 4.4vw, 18px)",
            overflowWrap: "anywhere",
            wordBreak: "break-word",
          }}
        >
          {b.title}
        </h3>

        {/* Метрики компактно одной строкой */}
        <div className="flex items-center gap-x-3 gap-y-1 text-[12.5px] sm:text-[13px] text-[var(--rs-muted)] flex-wrap">
          <span className="inline-flex items-center gap-1"><Maximize2 size={13}/> {formatArea(b.area)}</span>
          <span className="inline-flex items-center gap-1"><Building2 size={13}/> {b.floors} эт.</span>
          {b.bedrooms != null && (
            <span className="inline-flex items-center gap-1"><Bed size={13}/> {b.bedrooms} сп.</span>
          )}
        </div>

        {/* Описание скрываем на самых мелких экранах — экономим высоту карточки */}
        {b.short_description && (
          <p className="hidden sm:block text-[13px] text-[var(--rs-muted)] line-clamp-2">
            {b.short_description}
          </p>
        )}

        {/* Цена + CTA в одной строке, всегда снизу */}
        <div className="mt-auto pt-3 flex items-center justify-between gap-3 border-t border-[var(--rs-line)]">
          <div className="min-w-0">
            <div className="text-[10.5px] sm:text-[11px] text-[var(--rs-muted)] uppercase tracking-wide leading-none">
              Цена от
            </div>
            <div className="font-extrabold text-[17px] sm:text-[20px] text-[var(--rs-ink)] leading-tight whitespace-nowrap">
              {formatPrice(b.price)}
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[var(--rs-brand)] font-bold text-[13px] shrink-0">
            <span className="hidden sm:inline">Подробнее</span>
            <ArrowRight size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
}
