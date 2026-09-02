import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import MortgageCalculator from "@/components/MortgageCalculator";
import LeadForm from "@/components/LeadForm";
import { getSettings } from "@/services/api";
import { withBrand } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const TITLE = "Калькулятор ипотеки на строительство дома";
const SUBTITLE =
  "Прикиньте ежемесячный платёж и переплату по ипотеке на кирпичный дом в Томске или Кисловке. Точную ставку и одобрение — у банков-партнёров.";
const META_TITLE = withBrand("Калькулятор ипотеки на дом в Томске");
const META_DESCRIPTION =
  "Рассчитайте ежемесячный платёж по ипотеке на строительство кирпичного дома. Первоначальный взнос, срок, ставка — банки-партнёры: Сбербанк, Альфа-Банк, Левобережный, ДОМ.РФ.";

export const metadata: Metadata = {
  title: META_TITLE,
  description: META_DESCRIPTION,
  alternates: { canonical: "/ipoteka" },
  openGraph: {
    title: META_TITLE, description: META_DESCRIPTION, url: "/ipoteka", type: "website",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: META_TITLE, description: META_DESCRIPTION, images: ["/og.png"],
  },
};

export default async function MortgagePage() {
  const s = await getSettings();
  const banks = (s.partner_banks || "")
    .split(",")
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <div className="container-rs py-10 sm:py-14">
      <Breadcrumbs items={[{ label: "Ипотечный калькулятор" }]} />
      <div className="mb-10 max-w-2xl">
        <div className="text-[12px] uppercase tracking-[0.2em] text-[var(--rs-brand)] font-bold">
          Финансирование
        </div>
        <h1 className="h-display mt-2 text-[32px] sm:text-[48px] font-extrabold">
          {TITLE}
        </h1>
        <p className="mt-3 text-[15px] text-[var(--rs-muted)]">
          {SUBTITLE}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <MortgageCalculator />

          {banks.length > 0 && (
            <section className="mt-8 card-rs p-5 sm:p-6">
              <h2 className="font-extrabold text-[16px] mb-3">Банки-партнёры</h2>
              <ul className="grid gap-2 sm:grid-cols-2 text-[14px]">
                {banks.map((bank) => (
                  <li key={bank} className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[var(--rs-brand)] shrink-0" />
                    {bank}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {s.about_escrow && (
            <section className="mt-8">
              <h2 className="h-display text-[20px] sm:text-[24px] font-extrabold mb-3">
                Про эскроу-счета
              </h2>
              <p className="text-[14px] sm:text-[15px] text-[var(--rs-muted)] leading-relaxed whitespace-pre-line">
                {s.about_escrow}
              </p>
            </section>
          )}

          <Link
            href="/blog/ipoteka-na-izhs-tomsk-2026"
            className="inline-flex items-center gap-1.5 mt-8 text-[14px] font-bold text-[var(--rs-brand)] hover:underline"
          >
            Подробнее об ипотеке на ИЖС в Томске <ArrowRight size={14} />
          </Link>
        </div>

        <aside className="lg:sticky lg:top-24 self-start min-w-0">
          <div className="card-rs p-5 sm:p-6">
            <h3 className="font-extrabold text-[16px] mb-3">Получить консультацию по ипотеке</h3>
            <LeadForm source="mortgage" compact />
          </div>
        </aside>
      </div>
    </div>
  );
}
