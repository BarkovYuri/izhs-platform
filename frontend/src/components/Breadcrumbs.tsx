import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; href?: string };

const SITE_URL = "https://remstroy70.ru";

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all: Crumb[] = [{ label: "Главная", href: "/" }, ...items];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: SITE_URL + c.href } : {}),
    })),
  };

  return (
    <>
      <nav aria-label="Хлебные крошки" className="text-[13px] text-[var(--rs-muted)] mb-6">
        <ol className="flex flex-wrap items-center gap-1.5">
          {all.map((c, i) => {
            const isLast = i === all.length - 1;
            return (
              <li key={i} className="flex items-center gap-1.5">
                {c.href && !isLast ? (
                  <Link href={c.href} className="hover:text-[var(--rs-brand)]">
                    {c.label}
                  </Link>
                ) : (
                  <span className={isLast ? "text-[var(--rs-ink)] font-medium" : ""}>
                    {c.label}
                  </span>
                )}
                {!isLast && <ChevronRight size={14} className="opacity-60" />}
              </li>
            );
          })}
        </ol>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
