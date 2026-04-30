import { Suspense } from "react";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import BuildFiltersBar from "@/components/BuildFiltersBar";
import JsonLd from "@/components/JsonLd";
import { getBuilds, getPageContent } from "@/services/api";
import { buildsCatalogJsonLd } from "@/lib/seo";
import { pickText } from "@/lib/pageContent";

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
  const [builds, pc] = await Promise.all([getBuilds(), getPageContent("builds")]);
  const kicker = pickText(pc, "kicker", FALLBACK_KICKER);
  const title = pickText(pc, "title", FALLBACK_TITLE);
  const subtitle = pickText(pc, "subtitle", FALLBACK_SUBTITLE);

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
