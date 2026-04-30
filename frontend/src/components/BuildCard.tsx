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
      className="card-rs group overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] bg-[var(--rs-line)]/40 overflow-hidden">
        {cover ? (
          <Image
            src={cover}
            alt={b.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            quality={75}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-[var(--rs-muted)] text-sm">
            Нет фото
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`badge ${STATUS_BADGE[b.status] || "badge-muted"}`}>{b.status_label}</span>
          {b.is_typical && <span className="badge badge-brand">Типовой</span>}
        </div>
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <h3 className="font-extrabold text-[18px] leading-tight tracking-tight">{b.title}</h3>

        <div className="flex flex-wrap gap-3 text-[13px] text-[var(--rs-muted)]">
          <span className="inline-flex items-center gap-1.5"><Maximize2 size={14}/> {formatArea(b.area)}</span>
          <span className="inline-flex items-center gap-1.5"><Building2 size={14}/> {b.floors} эт.</span>
          {b.bedrooms != null && (
            <span className="inline-flex items-center gap-1.5"><Bed size={14}/> {b.bedrooms} спальни</span>
          )}
        </div>

        {b.short_description && (
          <p className="text-[13px] text-[var(--rs-muted)] line-clamp-2">{b.short_description}</p>
        )}

        <div className="mt-auto pt-3 flex items-end justify-between border-t border-[var(--rs-line)]">
          <div>
            <div className="text-[11px] text-[var(--rs-muted)] uppercase tracking-wide">Цена от</div>
            <div className="font-extrabold text-[20px] text-[var(--rs-ink)]">{formatPrice(b.price)}</div>
          </div>
          <span className="inline-flex items-center gap-1 text-[var(--rs-brand)] font-bold text-[14px]">
            Подробнее <ArrowRight size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
}
