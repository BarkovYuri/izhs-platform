import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import FaqAccordion from "@/components/FaqAccordion";
import JsonLd from "@/components/JsonLd";
import LeadForm from "@/components/LeadForm";
import { getFaq } from "@/services/api";
import { faqPageJsonLd } from "@/lib/seo";

// Не кэшируем — FAQ редактируется в админке, должен обновляться сразу.
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Вопросы и ответы",
  description: "Ответы на частые вопросы о строительстве кирпичных домов: сроки, эскроу, ипотека, посёлок Красная смородина в Кисловке.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "Вопросы и ответы — Ремстрой",
    description: "Эскроу, ипотека, сроки, индивидуальные проекты — отвечаем на частые вопросы.",
    url: "/faq", type: "website",
  },
};

export default async function FaqPage() {
  const categories = await getFaq();
  return (
    <div className="container-rs py-10 sm:py-14">
      <JsonLd data={faqPageJsonLd(categories)} />
      <Breadcrumbs items={[{ label: "Вопросы и ответы" }]} />
      <div className="mb-10 max-w-2xl">
        <div className="text-[12px] uppercase tracking-[0.2em] text-[var(--rs-brand)] font-bold">
          FAQ
        </div>
        <h1 className="h-display mt-2 text-[36px] sm:text-[52px] font-extrabold">Вопросы и ответы</h1>
        <p className="mt-3 text-[15px] text-[var(--rs-muted)]">
          Ответы на самые частые вопросы клиентов. Если нужного нет — задайте свой через форму ниже.
        </p>
      </div>

      <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
        <FaqAccordion categories={categories} />
        <aside className="lg:sticky lg:top-24 self-start">
          <h2 className="font-extrabold text-[20px] mb-4">Остался вопрос?</h2>
          <LeadForm source="other" />
        </aside>
      </div>
    </div>
  );
}
