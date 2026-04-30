import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, Hammer, MapPin, ShieldCheck, Wallet } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import LeadForm from "@/components/LeadForm";
import { getPageContent, getSettings } from "@/services/api";
import { pickText } from "@/lib/pageContent";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const FALLBACK_KICKER = "О компании";
const FALLBACK_META_TITLE = "О компании — Ремстрой";
const FALLBACK_META_DESCRIPTION =
  "Застройщик кирпичных домов в Томске и Томской области. Эскроу, аккредитация в банках, собственный ЖК «Красная смородина».";

export async function generateMetadata(): Promise<Metadata> {
  const pc = await getPageContent("about");
  const title = pickText(pc, "meta_title", FALLBACK_META_TITLE);
  const description = pickText(pc, "meta_description", FALLBACK_META_DESCRIPTION);
  return {
    title,
    description,
    alternates: { canonical: "/about" },
    openGraph: {
      title, description, url: "/about", type: "website",
      images: ["/og.png"],
    },
    twitter: {
      card: "summary_large_image",
      title, description, images: ["/og.png"],
    },
  };
}

function splitLines(text: string): string[] {
  return text.split("\n").map((s) => s.trim()).filter(Boolean);
}

export default async function AboutPage() {
  const [s, pc] = await Promise.all([getSettings(), getPageContent("about")]);
  const directions = splitLines(s.directions_list);
  const advantages = splitLines(s.advantages_list);
  const banks = s.partner_banks
    ? s.partner_banks.split(",").map((b) => b.trim()).filter(Boolean)
    : [];

  // Если в PageContent заполнены title/subtitle — они переопределяют дефолт.
  const kicker = pickText(pc, "kicker", FALLBACK_KICKER);
  const title = pickText(pc, "title", `${s.site_name} — застройщик кирпичных домов`);
  const subtitle = pickText(pc, "subtitle", s.about_intro);

  return (
    <div className="container-rs py-10 sm:py-14">
      <Breadcrumbs items={[{ label: "О компании" }]} />
      <div className="max-w-3xl">
        <div className="text-[12px] uppercase tracking-[0.2em] text-[var(--rs-brand)] font-bold">
          {kicker}
        </div>
        <h1 className="h-display mt-2 text-[36px] sm:text-[52px] font-extrabold">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-5 text-[16px] sm:text-[18px] leading-relaxed text-[var(--rs-muted)]">
            {subtitle}
          </p>
        )}
      </div>

      {/* Эскроу + банки */}
      {(s.about_escrow || banks.length > 0) && (
        <section className="mt-12 grid gap-6 lg:grid-cols-[1fr_320px] items-start">
          <div className="card-rs p-6 sm:p-8">
            <div className="flex items-start gap-3 mb-4">
              <ShieldCheck className="text-[var(--rs-brand)] shrink-0 mt-1" size={28} />
              <h2 className="h-display text-[22px] sm:text-[26px] font-extrabold">
                Эскроу-счета и банки-партнёры
              </h2>
            </div>
            {s.about_escrow && (
              <p className="text-[15px] leading-relaxed text-[var(--rs-ink)]/85">
                {s.about_escrow}
              </p>
            )}
          </div>
          {banks.length > 0 && (
            <aside className="card-rs p-6">
              <div className="flex items-center gap-2 mb-3">
                <Wallet size={18} className="text-[var(--rs-olive)]" />
                <span className="text-[12px] uppercase tracking-wide text-[var(--rs-muted)] font-bold">
                  Банки
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {banks.map((b) => (
                  <span key={b} className="badge badge-olive">{b}</span>
                ))}
              </div>
            </aside>
          )}
        </section>
      )}

      {/* Направления деятельности */}
      {directions.length > 0 && (
        <section className="mt-12">
          <div className="text-[12px] uppercase tracking-[0.2em] text-[var(--rs-brand)] font-bold mb-2">
            Направления деятельности
          </div>
          <h2 className="h-display text-[24px] sm:text-[32px] font-extrabold">
            Что делаем
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {directions.map((d) => (
              <li key={d} className="card-rs p-4 flex items-start gap-3">
                <CheckCircle2 className="text-[var(--rs-brand)] shrink-0 mt-0.5" size={18} />
                <span className="text-[14px] leading-relaxed">{d}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Посёлок — короткое упоминание с переходом на отдельную страницу */}
      <section className="mt-12 card-rs p-6 sm:p-8 flex flex-col sm:flex-row gap-5 items-start">
        <div className="w-12 h-12 shrink-0 rounded-xl bg-[var(--rs-brand)]/10 text-[var(--rs-brand)] grid place-items-center">
          <MapPin size={24} />
        </div>
        <div className="flex-1">
          <h2 className="h-display text-[22px] sm:text-[26px] font-extrabold">
            Собственный ЖК «{s.settlement_name}»
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-[var(--rs-muted)] max-w-2xl">
            Строим в собственном жилом комплексе в {s.settlement_location}.
            Свободные участки, общая инфраструктура, единый стандарт качества.
          </p>
        </div>
        <Link href="/settlement" className="btn-secondary text-[14px] shrink-0">
          О ЖК <ArrowRight size={14} />
        </Link>
      </section>

      {/* Кросс-линк на портфолио — социальное доказательство */}
      <section className="mt-6 card-rs p-6 sm:p-8 flex flex-col sm:flex-row gap-5 items-start">
        <div className="w-12 h-12 shrink-0 rounded-xl bg-[var(--rs-olive)]/15 text-[var(--rs-olive)] grid place-items-center">
          <CheckCircle2 size={24} />
        </div>
        <div className="flex-1">
          <h2 className="h-display text-[22px] sm:text-[26px] font-extrabold">
            Уже построено более {s.homes_built_total} домов
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-[var(--rs-muted)] max-w-2xl">
            Реальные объекты с фото и видео — посмотрите, как мы строим
            и что получают наши клиенты.
          </p>
        </div>
        <Link href="/portfolio" className="btn-secondary text-[14px] shrink-0">
          Реализованные объекты <ArrowRight size={14} />
        </Link>
      </section>

      {/* Преимущества */}
      {advantages.length > 0 && (
        <section className="mt-12">
          <div className="text-[12px] uppercase tracking-[0.2em] text-[var(--rs-brand)] font-bold mb-2">
            Преимущества
          </div>
          <h2 className="h-display text-[24px] sm:text-[32px] font-extrabold">
            Почему {s.site_name}
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {advantages.map((a) => (
              <li key={a} className="card-rs p-5">
                <CheckCircle2 className="text-[var(--rs-olive)] mb-2" size={20} />
                <div className="text-[14px] leading-relaxed font-medium">{a}</div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Заключение */}
      {s.about_outro && (
        <section className="mt-12 max-w-3xl">
          <p className="text-[16px] sm:text-[18px] leading-relaxed text-[var(--rs-ink)]/90">
            {s.about_outro}
          </p>
        </section>
      )}

      {/* Этапы работы */}
      <section className="mt-16 grid gap-10 lg:grid-cols-[1fr_380px] items-start">
        <div className="card-rs p-8">
          <h2 className="h-display text-[24px] sm:text-[32px] font-extrabold">
            Как мы работаем
          </h2>
          <ol className="mt-6 grid gap-5">
            <Step n="1" title="Заявка и консультация">
              Обсуждаем проект, бюджет, сроки. Подбираем подходящий типовой проект или планируем индивидуальный.
            </Step>
            <Step n="2" title="Подбор и проверка ипотеки">
              Помогаем с ипотечной заявкой в банках-партнёрах. Подключаем госпрограммы, если подходите.
            </Step>
            <Step n="3" title="Договор и эскроу">
              Заключаем договор с фиксированной ценой. Открываем эскроу-счёт — деньги защищены до сдачи.
            </Step>
            <Step n="4" title="Строительство">
              Строим капитальную кирпичную коробку с фундаментом, кровлей, окнами, скважиной и септиком.
            </Step>
            <Step n="5" title="Сдача">
              Подписываем приёмку. Банк раскрывает эскроу. Дальше — оформление и заселение.
            </Step>
          </ol>
        </div>

        <aside className="lg:sticky lg:top-24">
          <h2 className="font-extrabold text-[20px] mb-4">Узнать о свободных участках</h2>
          <LeadForm source="other" />
        </aside>
      </section>

      {/* Бейджи фич */}
      <section className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Feature icon={<Building2 />} title="Кирпич">
          Только капитальное кирпичное строительство — долговечно и тепло
        </Feature>
        <Feature icon={<ShieldCheck />} title="Эскроу">
          Финансовая безопасность клиента: деньги защищены до сдачи дома
        </Feature>
        <Feature icon={<Wallet />} title="Ипотека">
          Аккредитация в Сбербанке, Альфа-Банке, Левобережном, ДОМ.РФ
        </Feature>
        <Feature icon={<Hammer />} title="Свой ЖК">
          ЖК «{s.settlement_name}» — стройка в проверенной локации
        </Feature>
      </section>
    </div>
  );
}

function Feature({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="card-rs p-5">
      <div className="w-10 h-10 rounded-lg bg-[var(--rs-brand)]/10 text-[var(--rs-brand)] grid place-items-center mb-3">
        {icon}
      </div>
      <div className="font-bold text-[15px]">{title}</div>
      <div className="mt-1 text-[13px] text-[var(--rs-muted)] leading-relaxed">{children}</div>
    </div>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <li className="grid grid-cols-[40px_1fr] gap-4 items-start">
      <div className="w-10 h-10 rounded-full bg-[var(--rs-brand)] text-white font-extrabold grid place-items-center text-[15px]">
        {n}
      </div>
      <div>
        <div className="font-bold text-[16px]">{title}</div>
        <div className="text-[14px] text-[var(--rs-muted)] mt-1 leading-relaxed">{children}</div>
      </div>
    </li>
  );
}
