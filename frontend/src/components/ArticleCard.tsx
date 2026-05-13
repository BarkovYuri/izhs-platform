import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays } from "lucide-react";
import type { BlogArticleListItem } from "@/types/api";
import { resolveMediaUrl } from "@/services/api";

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function ArticleCard({ a }: { a: BlogArticleListItem }) {
  const cover = a.cover ? resolveMediaUrl(a.cover) : null;
  return (
    <Link
      href={`/blog/${a.slug}`}
      className="card-rs group overflow-hidden flex flex-col transition-transform duration-200 active:scale-[0.99] sm:hover:-translate-y-1"
    >
      <div className="relative aspect-[16/10] bg-[var(--rs-line)]/40 overflow-hidden">
        {cover ? (
          <Image
            src={cover}
            alt={a.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            quality={70}
            className="object-cover transition-transform duration-500 sm:group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-[var(--rs-muted)] text-sm">
            Без обложки
          </div>
        )}
        {a.category && (
          <span className="absolute top-2 left-2 sm:top-3 sm:left-3 badge badge-brand !text-[11px] !py-0.5 !px-2">
            {a.category.name}
          </span>
        )}
      </div>

      <div className="p-4 sm:p-5 flex flex-col gap-2.5 flex-1">
        <h3
          className="font-extrabold leading-tight tracking-tight line-clamp-3"
          style={{
            fontSize: "clamp(15px, 4.4vw, 19px)",
            overflowWrap: "anywhere",
            wordBreak: "break-word",
          }}
        >
          {a.title}
        </h3>

        {a.excerpt && (
          <p className="text-[13px] sm:text-[14px] text-[var(--rs-muted)] line-clamp-3">
            {a.excerpt}
          </p>
        )}

        <div className="mt-auto pt-3 flex items-center justify-between gap-3 border-t border-[var(--rs-line)]">
          <div className="text-[12px] text-[var(--rs-muted)] inline-flex items-center gap-1.5">
            <CalendarDays size={13} /> {formatDate(a.published_at)}
          </div>
          <span className="inline-flex items-center gap-1 text-[var(--rs-brand)] font-bold text-[13px]">
            Читать <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}
