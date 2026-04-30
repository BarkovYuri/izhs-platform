import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Hammer, Home, MapPin, Trees } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import LeadForm from "@/components/LeadForm";
import { getBuilds, getPageContent, getSettings, resolveMediaUrl } from "@/services/api";
import { settlementJsonLd } from "@/lib/seo";
import { pickText } from "@/lib/pageContent";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const FALLBACK_KICKER = "Жилой посёлок";
const FALLBACK_META_TITLE = "Посёлок «Красная смородина» — Кисловка, Томск";
const FALLBACK_META_DESCRIPTION =
  "Жилой коттеджный посёлок «Красная смородина» в деревне Кисловка под Томском. Кирпичные дома с земельными участками, скважина, септик, эскроу.";

export async function generateMetadata(): Promise<Metadata> {
  const pc = await getPageContent("settlement");
  const title = pickText(pc, "meta_title", FALLBACK_META_TITLE);
  const description = pickText(pc, "meta_description", FALLBACK_META_DESCRIPTION);
  return {
    title,
    description,
    alternates: { canonical: "/settlement" },
    openGraph: {
      title, description, url: "/settlement", type: "website",
      images: ["/og.png"],
    },
    twitter: {
      card: "summary_large_image",
      title, description, images: ["/og.png"],
    },
  };
}

export default async function SettlementPage() {
  const [s, builds, pc] = await Promise.all([getSettings(), getBuilds(), getPageContent("settlement")]);
  const planUrl = s.settlement_plan ? resolveMediaUrl(s.settlement_plan) : null;
  const featured = builds.slice(0, 3);

  // PageContent переопределяет, иначе берём настройки/название посёлка.
  const kicker = pickText(pc, "kicker", FALLBACK_KICKER);
  const title = pickText(pc, "title", `«${s.settlement_name}»`);
  const subtitle = pickText(pc, "subtitle", s.about_settlement);

  return (
    <div className="container-rs py-10 sm:py-14">
      <JsonLd data={settlementJsonLd(s)} />
      <Breadcrumbs items={[{ label: `Посёлок ${s.settlement_name}` }]} />

      {/* HERO */}
      <section className="grid gap-8 lg:grid-cols-[1.2fr_1fr] items-start mb-14">
        <div>
          <div className="text-[12px] uppercase tracking-[0.2em] text-[var(--rs-brand)] font-bold">
            {kicker}
          </div>
          <h1 className="h-display mt-2 text-[40px] sm:text-[60px] font-extrabold leading-[1.05]">
            {title}
          </h1>
          <div className="mt-3 inline-flex items-center gap-2 badge badge-brand">
            <MapPin size={14} /> {s.settlement_location}
          </div>
          {subtitle && (
            <p className="mt-6 text-[16px] sm:text-[18px] leading-relaxed text-[var(--rs-muted)] max-w-2xl">
              {subtitle}
            </p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/builds" className="btn-primary">
              Проекты домов <ArrowRight size={16} />
            </Link>
            <a href="#zayavka" className="btn-secondary">
              Узнать о свободных участках
            </a>
          </div>
        </div>

        {/* Карта посёлка справа в hero */}
        {s.yandex_map_iframe ? (
          <div
            className="yandex-map-wrap card-rs overflow-hidden"
            dangerouslySetInnerHTML={{ __html: s.yandex_map_iframe }}
          />
        ) : (
          <div className="card-rs aspect-[4/3] grid place-items-center text-[var(--rs-muted)] text-sm">
            Карта посёлка скоро появится
          </div>
        )}
      </section>

      {/* Прогресс застройки посёлка */}
      <section className="mb-14">
        <div className="card-rs p-6 sm:p-8 grid gap-5 sm:grid-cols-[auto_1fr_auto] items-center">
          <div className="flex items-baseline gap-2">
            <div className="font-extrabold text-[var(--rs-brand)] leading-none text-[44px] sm:text-[56px]">
              {s.settlement_homes_built}
            </div>
            <div className="text-[var(--rs-muted)] text-[18px] sm:text-[22px] font-bold">
              из {s.settlement_homes_total}
            </div>
          </div>
          <div className="min-w-0">
            <h2 className="h-display text-[20px] sm:text-[24px] font-extrabold leading-tight">
              домов в посёлке уже построены
            </h2>
            <p className="mt-2 text-[14px] text-[var(--rs-muted)] leading-relaxed">
              Стройка идёт постоянно — посмотрите фото и видео реализованных
              объектов, чтобы оценить качество.
            </p>
            {/* Полоса прогресса */}
            <div className="mt-3 h-2 rounded-full bg-[var(--rs-line)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--rs-brand)]"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round(
                      (s.settlement_homes_built /
                        Math.max(1, s.settlement_homes_total)) *
                        100,
                    ),
                  )}%`,
                }}
              />
            </div>
          </div>
          <Link href="/portfolio" className="btn-secondary text-[14px] shrink-0">
            Реализованные объекты <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Преимущества */}
      <section className="mb-14">
        <h2 className="h-display text-[26px] sm:text-[34px] font-extrabold mb-6">
          Что есть в посёлке
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Feature icon={<MapPin />} title="Расположение">
            Деревня Кисловка, всего ~15 минут до Томска
          </Feature>
          <Feature icon={<Trees />} title="Природа">
            Окружение лесом и сосновым бором, чистый воздух
          </Feature>
          <Feature icon={<Home />} title="Свой участок">
            У каждого дома собственный участок со скважиной и септиком
          </Feature>
          <Feature icon={<Hammer />} title="Один застройщик">
            Все дома строит {s.site_name} — единая ответственность за коробку
          </Feature>
        </div>
      </section>

      {/* Генплан */}
      {planUrl ? (
        <section className="mb-14">
          <h2 className="h-display text-[26px] sm:text-[34px] font-extrabold mb-3">
            Генеральный план
          </h2>
          <p className="text-[15px] text-[var(--rs-muted)] mb-6 max-w-2xl">
            Расположение участков и проектов на территории посёлка. Уточняйте
            актуальный статус каждого участка через форму ниже.
          </p>
          <div className="card-rs overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={planUrl}
              alt={`Генплан посёлка ${s.settlement_name}`}
              className="w-full h-auto block"
            />
          </div>
        </section>
      ) : (
        <section className="mb-14 card-rs p-8 text-center">
          <div className="text-[var(--rs-muted)] text-[14px]">
            Генеральный план посёлка скоро будет добавлен.
          </div>
        </section>
      )}

      {/* Топ-проекты в посёлке */}
      {featured.length > 0 && (
        <section className="mb-14">
          <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
            <h2 className="h-display text-[26px] sm:text-[34px] font-extrabold">
              Проекты, доступные в посёлке
            </h2>
            <Link href="/builds" className="btn-secondary text-[14px]">
              Все проекты <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 text-[13px]">
            {featured.map((b) => (
              <Link
                key={b.slug}
                href={`/builds/${b.slug}`}
                className="card-rs p-5 hover:-translate-y-0.5 transition"
              >
                <div className="font-extrabold text-[16px]">{b.title}</div>
                <div className="text-[12px] text-[var(--rs-muted)] mt-1">
                  {Number(b.area).toFixed(0)} м² · {b.floors} эт.
                </div>
                <div className="mt-3 inline-flex items-center gap-1 text-[var(--rs-brand)] font-bold">
                  Подробнее <ArrowRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Заявка */}
      <section id="zayavka" className="grid gap-8 lg:grid-cols-[1fr_420px] items-start scroll-mt-24">
        <div>
          <div className="text-[12px] uppercase tracking-[0.2em] text-[var(--rs-brand)] font-bold">
            Свободные участки
          </div>
          <h2 className="h-display mt-2 text-[26px] sm:text-[34px] font-extrabold">
            Узнать о свободных участках в посёлке
          </h2>
          <p className="mt-3 text-[15px] text-[var(--rs-muted)] max-w-xl">
            Расскажем, какие участки и проекты сейчас доступны, согласуем
            индивидуальные доработки и подберём ипотечную программу.
          </p>
          <ul className="mt-6 grid gap-3 text-[14px]">
            <li className="flex gap-2">
              <CheckCircle2 size={18} className="text-[var(--rs-brand)] shrink-0 mt-0.5"/>
              Осмотр посёлка и свободных участков
            </li>
            <li className="flex gap-2">
              <CheckCircle2 size={18} className="text-[var(--rs-brand)] shrink-0 mt-0.5"/>
              Ипотека через банки-партнёры (Сбер, Альфа, Левобережный, ДОМ.РФ)
            </li>
            <li className="flex gap-2">
              <CheckCircle2 size={18} className="text-[var(--rs-brand)] shrink-0 mt-0.5"/>
              Расчёты через эскроу-счёт
            </li>
          </ul>
        </div>
        <LeadForm source="other" />
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
