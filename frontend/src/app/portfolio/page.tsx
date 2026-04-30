import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import LeadForm from "@/components/LeadForm";
import PortfolioCard from "@/components/PortfolioCard";
import { getPageContent, getPortfolio, getSettings } from "@/services/api";
import { pickText } from "@/lib/pageContent";
import { portfolioJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const FALLBACK_KICKER = "Реализованные объекты";
const FALLBACK_TITLE = "Дома, которые мы построили";
const FALLBACK_SUBTITLE =
  "Реальные объекты с фотографиями и видео-обзорами. Нажмите на карточку, чтобы посмотреть всю галерею.";
const FALLBACK_META_TITLE =
  "Построенные дома в Томске — фото и видео реализованных объектов";
const FALLBACK_META_DESCRIPTION =
  "Фото и видео реальных кирпичных домов, построенных в Томске и Кисловке застройщиком Ремстрой. Более 30 готовых объектов в ЖК «Красная смородина» и на участках клиентов.";

export async function generateMetadata(): Promise<Metadata> {
  const pc = await getPageContent("portfolio");
  const title = pickText(pc, "meta_title", FALLBACK_META_TITLE);
  const description = pickText(pc, "meta_description", FALLBACK_META_DESCRIPTION);
  return {
    title,
    description,
    alternates: { canonical: "/portfolio" },
    openGraph: {
      title, description, url: "/portfolio", type: "website",
      images: ["/og.png"],
    },
    twitter: {
      card: "summary_large_image",
      title, description, images: ["/og.png"],
    },
  };
}

export default async function PortfolioPage() {
  const [items, pc, s] = await Promise.all([
    getPortfolio(), getPageContent("portfolio"), getSettings(),
  ]);
  const kicker = pickText(pc, "kicker", FALLBACK_KICKER);
  const title = pickText(pc, "title", FALLBACK_TITLE);
  const subtitle = pickText(pc, "subtitle", FALLBACK_SUBTITLE);

  return (
    <div className="container-rs py-10 sm:py-14">
      {items.length > 0 && <JsonLd data={portfolioJsonLd(items, s.site_name)} />}
      <Breadcrumbs items={[{ label: "Реализованные объекты" }]} />
      <div className="mb-10 max-w-2xl">
        <div className="text-[12px] uppercase tracking-[0.2em] text-[var(--rs-brand)] font-bold">
          {kicker}
        </div>
        <h1 className="h-display mt-2 text-[36px] sm:text-[52px] font-extrabold">
          {title}
        </h1>
        <p className="mt-3 text-[15px] text-[var(--rs-muted)]">
          {subtitle}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="card-rs p-10 text-center text-[var(--rs-muted)]">
          Объекты добавляются. Скоро здесь появятся фото построенных домов.
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <PortfolioCard key={item.id} item={item} />
          ))}
        </div>
      )}

      <section className="mt-16 grid gap-8 lg:grid-cols-[1fr_420px] items-start">
        <div className="max-w-2xl">
          <h2 className="h-display text-[24px] sm:text-[32px] font-extrabold">
            Хотите такой же?
          </h2>
          <p className="mt-3 text-[15px] text-[var(--rs-muted)]">
            Расскажем, какой проект подойдёт под ваш участок и бюджет,
            покажем дома живьём и согласуем индивидуальные доработки.
          </p>
        </div>
        <LeadForm source="other" />
      </section>
    </div>
  );
}
