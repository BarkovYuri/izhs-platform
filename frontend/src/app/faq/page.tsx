import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import FaqAccordion from "@/components/FaqAccordion";
import JsonLd from "@/components/JsonLd";
import LeadForm from "@/components/LeadForm";
import { getFaq, getPageContent } from "@/services/api";
import { faqPageJsonLd } from "@/lib/seo";
import { pickText } from "@/lib/pageContent";

// Не кэшируем — FAQ редактируется в админке, должен обновляться сразу.
export const dynamic = "force-dynamic";
export const revalidate = 0;

const FALLBACK_KICKER = "FAQ";
const FALLBACK_TITLE = "Вопросы и ответы";
const FALLBACK_SUBTITLE =
  "Ответы на самые частые вопросы клиентов. Если нужного нет — задайте свой через форму ниже.";
const FALLBACK_META_TITLE = "Вопросы и ответы";
const FALLBACK_META_DESCRIPTION =
  "Ответы на частые вопросы о строительстве кирпичных домов: сроки, эскроу, ипотека, посёлок Красная смородина в Кисловке.";

export async function generateMetadata(): Promise<Metadata> {
  const pc = await getPageContent("faq");
  const title = pickText(pc, "meta_title", FALLBACK_META_TITLE);
  const description = pickText(pc, "meta_description", FALLBACK_META_DESCRIPTION);
  return {
    title,
    description,
    alternates: { canonical: "/faq" },
    openGraph: {
      title, description, url: "/faq", type: "website",
      images: ["/og.png"],
    },
    twitter: {
      card: "summary_large_image",
      title, description, images: ["/og.png"],
    },
  };
}

export default async function FaqPage() {
  const [categories, pc] = await Promise.all([getFaq(), getPageContent("faq")]);
  const kicker = pickText(pc, "kicker", FALLBACK_KICKER);
  const title = pickText(pc, "title", FALLBACK_TITLE);
  const subtitle = pickText(pc, "subtitle", FALLBACK_SUBTITLE);
  return (
    <div className="container-rs py-10 sm:py-14">
      <JsonLd data={faqPageJsonLd(categories)} />
      <Breadcrumbs items={[{ label: "Вопросы и ответы" }]} />
      <div className="mb-10 max-w-2xl">
        <div className="text-[12px] uppercase tracking-[0.2em] text-[var(--rs-brand)] font-bold">
          {kicker}
        </div>
        <h1 className="h-display mt-2 text-[36px] sm:text-[52px] font-extrabold">{title}</h1>
        <p className="mt-3 text-[15px] text-[var(--rs-muted)]">
          {subtitle}
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
