import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import BuildFiltersBar from "@/components/BuildFiltersBar";
import JsonLd from "@/components/JsonLd";
import { getBuildFilters, getBuilds, getPageContent } from "@/services/api";
import { buildsCatalogJsonLd } from "@/lib/seo";
import { pickText } from "@/lib/pageContent";
import { FILTER_DEFS, FILTER_GROUPS, FILTER_TYPES } from "@/lib/buildFilters";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const FALLBACK_TITLE = "Проекты кирпичных домов";
const FALLBACK_SUBTITLE =
  "Типовые проекты, готовые к строительству. Перепланировка и доработка по запросу клиента.";
const FALLBACK_KICKER = "Каталог";
const FALLBACK_META_TITLE =
  "Каталог проектов кирпичных домов в Томске | от застройщика";
const FALLBACK_META_DESCRIPTION =
  "Готовые проекты кирпичных домов в Томске и Кисловке: одноэтажные и двухэтажные, от 80 до 200 м². Цена от застройщика, эскроу, ипотека. ЖК «Красная смородина» или на вашем участке.";

export async function generateMetadata(): Promise<Metadata> {
  const pc = await getPageContent("builds");
  const title = pickText(pc, "meta_title", FALLBACK_META_TITLE);
  const description = pickText(pc, "meta_description", FALLBACK_META_DESCRIPTION);
  return {
    title,
    description,
    alternates: { canonical: "/builds" },
    openGraph: {
      title, description, url: "/builds", type: "website",
      images: ["/og.png"],
    },
    twitter: {
      card: "summary_large_image",
      title, description, images: ["/og.png"],
    },
  };
}

export default async function BuildsPage() {
  const [builds, pc, filterContents] = await Promise.all([
    getBuilds(),
    getPageContent("builds"),
    getBuildFilters(),
  ]);
  const kicker = pickText(pc, "kicker", FALLBACK_KICKER);
  const title = pickText(pc, "title", FALLBACK_TITLE);
  const subtitle = pickText(pc, "subtitle", FALLBACK_SUBTITLE);
  // Заголовки фильтров — из админки если редактировались, иначе fallback из кода.
  const filterTitleFor = (slug: string, fallback: string) => {
    const o = filterContents.find((f) => f.slug === slug);
    const t = o?.title?.trim();
    return (t || fallback).replace(" в Томске", "");
  };

  return (
    <div className="container-rs py-10 sm:py-14">
      <JsonLd data={buildsCatalogJsonLd(builds)} />
      <Breadcrumbs items={[{ label: "Проекты домов" }]} />
      <div className="mb-8">
        <div className="text-[12px] uppercase tracking-[0.2em] text-[var(--rs-brand)] font-bold">
          {kicker}
        </div>
        <h1 className="h-display mt-2 text-[36px] sm:text-[52px] font-extrabold">
          {title}
        </h1>
        <p className="mt-3 text-[15px] text-[var(--rs-muted)] max-w-2xl">
          {subtitle}
        </p>
      </div>

      {/* SEO-фильтры — отдельные landing'и под низкочастотные запросы.
          Идут до клиентского BuildFiltersBar, чтобы боты сразу видели
          ссылки в статичном HTML. */}
      <section className="mb-10">
        <div className="text-[12px] uppercase tracking-wide text-[var(--rs-muted)] mb-3 font-bold">
          Подобрать дом
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {FILTER_GROUPS.map((g) => {
            const items = FILTER_TYPES
              .map((t) => FILTER_DEFS[t])
              .filter((f) => f.group === g.id);
            if (items.length === 0) return null;
            return (
              <div key={g.id} className="card-rs p-5">
                <div className="text-[12px] uppercase tracking-wide text-[var(--rs-muted)] mb-3 font-bold">
                  {g.label}
                </div>
                <ul className="space-y-2 text-[14px]">
                  {items.map((f) => (
                    <li key={f.slug}>
                      <Link
                        href={`/builds/filtr/${f.slug}`}
                        className="hover:text-[var(--rs-brand)] inline-flex items-center gap-1.5"
                      >
                        <span>{filterTitleFor(f.slug, f.title)}</span>
                        <ArrowRight size={12} className="opacity-50" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <Suspense fallback={<CatalogSkeleton />}>
        <BuildFiltersBar builds={builds} />
      </Suspense>
    </div>
  );
}

/** Скелетон, пока компонент с useSearchParams хидрируется на клиенте. */
function CatalogSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card-rs aspect-[4/3] bg-[var(--rs-line)]/40 animate-pulse" />
      ))}
    </div>
  );
}
