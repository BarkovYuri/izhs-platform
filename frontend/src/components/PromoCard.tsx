import Link from "next/link";
import { ArrowRight, Flame, Home } from "lucide-react";
import type { Promotion } from "@/types/api";
import { formatDate } from "@/lib/utils";

export default function PromoCard({ promotion }: { promotion: Promotion }) {
  const houseCount = promotion.builds.length;
  return (
    <Link
      href={`/akcii/${promotion.slug}`}
      className="card-rs group overflow-hidden flex flex-col p-5 sm:p-6 h-full transition-transform duration-200 sm:hover:-translate-y-1"
    >
      <span className="badge badge-promo self-start !text-[11px] !py-0.5 !px-2">
        <Flame size={12} /> {promotion.badge_label}
      </span>

      <h3 className="h-display mt-3 font-extrabold text-[19px] sm:text-[21px] leading-tight">
        {promotion.title}
      </h3>

      <p className="mt-2 text-[13.5px] text-[var(--rs-muted)] leading-relaxed line-clamp-3 flex-1">
        {promotion.terms}
      </p>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[12.5px] text-[var(--rs-muted)]">
        <span>С {formatDate(promotion.starts_at)} по {formatDate(promotion.ends_at)}</span>
        {houseCount > 0 && (
          <span className="inline-flex items-center gap-1">
            <Home size={13} /> {houseCount} {houseCount === 1 ? "дом" : "дома/домов"}
          </span>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--rs-line)] flex items-center justify-between">
        <span className="inline-flex items-center gap-1 text-[var(--rs-brand)] font-bold text-[13px]">
          Смотреть акцию <ArrowRight size={16} />
        </span>
      </div>
    </Link>
  );
}
