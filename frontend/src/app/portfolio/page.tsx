import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import LeadForm from "@/components/LeadForm";
import PortfolioCard from "@/components/PortfolioCard";
import { getPortfolio } from "@/services/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Реализованные объекты — построенные дома",
  description:
    "Фото и видео уже построенных кирпичных домов застройщика Ремстрой в Томске и посёлке Красная смородина.",
  alternates: { canonical: "/portfolio" },
  openGraph: {
    title: "Реализованные объекты — Ремстрой",
    description:
      "Галерея построенных кирпичных домов с фото и видео — посмотрите как мы строим.",
    url: "/portfolio",
    type: "website",
  },
};

export default async function PortfolioPage() {
  const items = await getPortfolio();
  return (
    <div className="container-rs py-10 sm:py-14">
      <Breadcrumbs items={[{ label: "Реализованные объекты" }]} />
      <div className="mb-10 max-w-2xl">
        <div className="text-[12px] uppercase tracking-[0.2em] text-[var(--rs-brand)] font-bold">
          Реализованные объекты
        </div>
        <h1 className="h-display mt-2 text-[36px] sm:text-[52px] font-extrabold">
          Дома, которые мы построили
        </h1>
        <p className="mt-3 text-[15px] text-[var(--rs-muted)]">
          Реальные объекты с фотографиями и видео-обзорами. Нажмите на
          карточку, чтобы посмотреть всю галерею.
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
