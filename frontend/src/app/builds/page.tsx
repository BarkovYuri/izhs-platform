import { Suspense } from "react";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import BuildFiltersBar from "@/components/BuildFiltersBar";
import JsonLd from "@/components/JsonLd";
import { getBuilds } from "@/services/api";
import { buildsCatalogJsonLd } from "@/lib/seo";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Каталог проектов кирпичных домов",
  description: "Типовые и индивидуальные проекты кирпичных домов в посёлке Красная смородина и на вашем участке. Площадь, цены, фото, планировки.",
  alternates: { canonical: "/builds" },
  openGraph: {
    title: "Каталог проектов кирпичных домов",
    description: "Типовые и индивидуальные проекты, цены, планировки, спецификации.",
    url: "/builds", type: "website",
  },
};

export default async function BuildsPage() {
  const builds = await getBuilds();

  return (
    <div className="container-rs py-10 sm:py-14">
      <JsonLd data={buildsCatalogJsonLd(builds)} />
      <Breadcrumbs items={[{ label: "Проекты домов" }]} />
      <div className="mb-8">
        <div className="text-[12px] uppercase tracking-[0.2em] text-[var(--rs-brand)] font-bold">
          Каталог
        </div>
        <h1 className="h-display mt-2 text-[36px] sm:text-[52px] font-extrabold">
          Проекты кирпичных домов
        </h1>
        <p className="mt-3 text-[15px] text-[var(--rs-muted)] max-w-2xl">
          Типовые проекты, готовые к строительству. Перепланировка и доработка по запросу клиента.
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
