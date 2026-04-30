import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import PrivacyContent from "@/components/PrivacyContent";
import { getSettings } from "@/services/api";

export const metadata: Metadata = {
  title: "Политика обработки персональных данных",
  description: "Политика в отношении обработки и защиты персональных данных пользователей сайта Ремстрой.",
  alternates: { canonical: "/privacy" },
  robots: { index: false, follow: true },
};

export default async function PrivacyPage() {
  const s = await getSettings();
  return (
    <article className="container-rs py-12 sm:py-16 max-w-3xl">
      <Breadcrumbs items={[{ label: "Политика обработки данных" }]} />
      <div className="text-[12px] uppercase tracking-[0.2em] text-[var(--rs-brand)] font-bold">
        Документы
      </div>
      <h1 className="h-display mt-2 text-[32px] sm:text-[44px] font-extrabold mb-8">
        Политика обработки персональных данных
      </h1>
      <PrivacyContent s={s} />
    </article>
  );
}
