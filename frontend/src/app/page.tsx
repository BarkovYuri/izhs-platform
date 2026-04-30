// Не кэшируем — данные приходят из админки, должны обновляться сразу.
export const revalidate = 0;

import Link from "next/link";
import { ArrowRight, CheckCircle2, Hammer, Home, Layers, MapPin, Wrench } from "lucide-react";
import Hero from "@/components/Hero";
import BuildCard from "@/components/BuildCard";
import LeadForm from "@/components/LeadForm";
import FaqAccordion from "@/components/FaqAccordion";
import JsonLd from "@/components/JsonLd";
import { getBuilds, getFaq, getSettings } from "@/services/api";
import { organizationJsonLd } from "@/lib/seo";

export default async function HomePage() {
  const [s, builds, faq] = await Promise.all([getSettings(), getBuilds(), getFaq()]);
  // На главную показываем только проекты с флагом is_featured.
  // Если ни один проект не отмечен — fallback на первые 6, чтобы блок не был пустым.
  const featuredOnly = builds.filter((b) => b.is_featured);
  const featured = (featuredOnly.length > 0 ? featuredOnly : builds).slice(0, 6);
  const faqPreview = faq.map((c) => ({ ...c, items: c.items.slice(0, 3) })).slice(0, 2);

  return (
    <>
      <JsonLd data={organizationJsonLd(s)} />
      <Hero s={s} />

      <section className="section">
        <div className="container-rs">
          <SectionHead
            kicker="О посёлке"
            title={`«${s.settlement_name}» — посёлок в Кисловке`}
            subtitle={s.about_short}
          />
          <div className="grid gap-4 md:grid-cols-3 mt-10">
            <FeatureCard
              icon={<MapPin />}
              title="Расположение"
              text={`${s.settlement_location}. Удобный заезд, окружение природой.`}
            />
            <FeatureCard
              icon={<Home />}
              title="Свой участок"
              text="Каждый дом — на собственном участке со скважиной и септиком."
            />
            <FeatureCard
              icon={<Hammer />}
              title="Строит застройщик"
              text="Один подрядчик, один договор, ответственность за всю коробку."
            />
          </div>
        </div>
      </section>

      <section className="section bg-white border-y border-[var(--rs-line)]">
        <div className="container-rs">
          <SectionHead
            kicker="Проекты"
            title="Каталог кирпичных домов"
            subtitle="Типовые проекты, которые дорабатываем под ваши задачи. Если нужен полностью индивидуальный — спроектируем с нуля."
            action={
              <Link href="/builds" className="btn-secondary">
                Все проекты <ArrowRight size={16} />
              </Link>
            }
          />
          <div className="mt-10">
            {featured.length === 0 ? (
              <div className="card-rs p-8 text-center text-[var(--rs-muted)]">
                Проекты добавляются в админке. Откройте /admin/ и заполните «Проекты домов».
              </div>
            ) : (
              <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((b) => <BuildCard key={b.slug} b={b} />)}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-rs">
          <SectionHead
            kicker="Что входит"
            title="Кирпичная коробка под ключ"
            subtitle="Чёткий состав работ — без сюрпризов. Внутреннюю отделку и инженерку обсуждаем отдельно."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-10">
            <Included icon={<Layers />} title="Фундамент" text="Под расчёт грунта на участке" />
            <Included icon={<Home />} title="Кирпичные стены" text="Полнотелый/пустотелый — по проекту" />
            <Included icon={<Wrench />} title="Скважина и септик" text="Вода и канализация — в стоимости" />
            <Included icon={<CheckCircle2 />} title="Кровля и окна" text="Готовая закрытая коробка" />
          </div>
        </div>
      </section>

      {faqPreview.length > 0 && (
        <section className="section bg-white border-y border-[var(--rs-line)]">
          <div className="container-rs">
            <SectionHead
              kicker="Вопросы"
              title="Что спрашивают чаще всего"
              action={
                <Link href="/faq" className="btn-secondary">
                  Все вопросы <ArrowRight size={16} />
                </Link>
              }
            />
            <div className="mt-10 max-w-3xl">
              <FaqAccordion categories={faqPreview} />
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container-rs">
          <div className="grid gap-10 lg:grid-cols-2 items-start">
            <div>
              <SectionHead
                kicker="Заявка"
                title="Получите расчёт по выбранному проекту"
                subtitle="Перезвоним в течение рабочего дня, обсудим бюджет, сроки и доработки."
              />
              <ul className="mt-8 grid gap-3 text-[14px]">
                <li className="flex gap-2"><CheckCircle2 size={18} className="text-[var(--rs-brand)] shrink-0 mt-0.5"/> Бесплатная консультация и выезд на участок</li>
                <li className="flex gap-2"><CheckCircle2 size={18} className="text-[var(--rs-brand)] shrink-0 mt-0.5"/> Прозрачная смета по этапам коробки</li>
                <li className="flex gap-2"><CheckCircle2 size={18} className="text-[var(--rs-brand)] shrink-0 mt-0.5"/> Договор с фиксированной ценой</li>
              </ul>
            </div>
            <LeadForm source="homepage" />
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHead({
  kicker, title, subtitle, action,
}: { kicker?: string; title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div className="max-w-2xl">
        {kicker && (
          <div className="text-[12px] uppercase tracking-[0.2em] text-[var(--rs-brand)] font-bold">
            {kicker}
          </div>
        )}
        <h2 className="h-display mt-2 text-[28px] sm:text-[40px] font-extrabold">{title}</h2>
        {subtitle && <p className="mt-3 text-[15px] text-[var(--rs-muted)] leading-relaxed">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function FeatureCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="card-rs p-6">
      <div className="w-11 h-11 rounded-xl bg-[var(--rs-brand)]/10 text-[var(--rs-brand)] grid place-items-center mb-4">
        {icon}
      </div>
      <div className="font-bold text-[17px]">{title}</div>
      <div className="mt-2 text-[14px] text-[var(--rs-muted)] leading-relaxed">{text}</div>
    </div>
  );
}

function Included({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="card-rs p-6">
      <div className="text-[var(--rs-olive)] mb-3">{icon}</div>
      <div className="font-bold text-[15px]">{title}</div>
      <div className="mt-1 text-[13px] text-[var(--rs-muted)]">{text}</div>
    </div>
  );
}
