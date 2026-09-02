import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import PromoCard from "@/components/PromoCard";
import { getPromotions } from "@/services/api";
import { withBrand } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const TITLE = "Акции на кирпичные дома";
const SUBTITLE =
  "Дома со сниженной ценой при заключении договора строительного подряда в отведённый срок. Акции ограничены по времени.";
const META_TITLE = withBrand("Акции на кирпичные дома в Томске");
const META_DESCRIPTION =
  "Действующие акции на типовые проекты кирпичных домов от застройщика Ремстрой. Сниженная цена при заключении договора в срок акции.";

export const metadata: Metadata = {
  title: META_TITLE,
  description: META_DESCRIPTION,
  alternates: { canonical: "/akcii" },
  openGraph: {
    title: META_TITLE, description: META_DESCRIPTION, url: "/akcii", type: "website",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: META_TITLE, description: META_DESCRIPTION, images: ["/og.png"],
  },
};

export default async function PromotionsPage() {
  const promotions = await getPromotions();

  return (
    <div className="container-rs py-10 sm:py-14">
      <Breadcrumbs items={[{ label: "Акции" }]} />
      <div className="mb-10">
        <div className="text-[12px] uppercase tracking-[0.2em] text-[var(--rs-brand)] font-bold">
          Акции
        </div>
        <h1 className="h-display mt-2 text-[36px] sm:text-[52px] font-extrabold">
          {TITLE}
        </h1>
        <p className="mt-3 text-[15px] text-[var(--rs-muted)] max-w-2xl">
          {SUBTITLE}
        </p>
      </div>

      {promotions.length === 0 ? (
        <div className="card-rs p-8 text-center text-[var(--rs-muted)]">
          Сейчас нет активных акций. Загляните позже — мы регулярно запускаем
          новые предложения на типовые проекты.
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {promotions.map((p) => (
            <PromoCard key={p.slug} promotion={p} />
          ))}
        </div>
      )}
    </div>
  );
}
