import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import TermsContent from "@/components/TermsContent";
import { getSettings } from "@/services/api";

export const metadata: Metadata = {
  title: "Пользовательское соглашение",
  description: "Условия использования сайта Ремстрой и информации, размещённой на нём.",
  alternates: { canonical: "/terms" },
  robots: { index: false, follow: true },
};

export default async function TermsPage() {
  const s = await getSettings();
  return (
    <article className="container-rs py-12 sm:py-16 max-w-3xl">
      <Breadcrumbs items={[{ label: "Пользовательское соглашение" }]} />
      <div className="text-[12px] uppercase tracking-[0.2em] text-[var(--rs-brand)] font-bold">
        Документы
      </div>
      <h1 className="h-display mt-2 text-[32px] sm:text-[44px] font-extrabold mb-8">
        Пользовательское соглашение
      </h1>
      <TermsContent s={s} />
    </article>
  );
}
