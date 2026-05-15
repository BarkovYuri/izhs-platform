import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import Breadcrumbs from "@/components/Breadcrumbs";
import BuildCard from "@/components/BuildCard";
import LeadForm from "@/components/LeadForm";
import { getBuildFilters, getBuilds } from "@/services/api";
import {
  FILTER_DEFS,
  FILTER_GROUPS,
  FILTER_TYPES,
  getFilter,
} from "@/lib/buildFilters";
import type { BuildFilterContent } from "@/types/api";

/** Берём поле из админки, иначе fallback из кода. Пустую строку считаем «нет». */
function pick(
  overrides: BuildFilterContent | undefined,
  key: keyof BuildFilterContent,
  fallback: string,
): string {
  const v = overrides?.[key];
  return v && v.trim() ? v : fallback;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RouteParams = { type: string };

export async function generateStaticParams(): Promise<RouteParams[]> {
  return FILTER_TYPES.map((type) => ({ type }));
}

export async function generateMetadata(
  { params }: { params: Promise<RouteParams> },
): Promise<Metadata> {
  const { type } = await params;
  const def = getFilter(type);
  if (!def) return {};
  const overrides = (await getBuildFilters()).find((f) => f.slug === def.slug);
  const metaTitle = pick(overrides, "meta_title", def.metaTitle);
  const metaDescription = pick(overrides, "meta_description", def.metaDescription);
  const url = `/builds/filtr/${def.slug}`;
  return {
    title: metaTitle,
    description: metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url,
      type: "website",
      images: ["/og.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: ["/og.png"],
    },
  };
}

export default async function FilteredBuildsPage(
  { params }: { params: Promise<RouteParams> },
) {
  const { type } = await params;
  const def = getFilter(type);
  if (!def) notFound();

  const [builds, filterContents] = await Promise.all([
    getBuilds(),
    getBuildFilters(),
  ]);
  const overrides = filterContents.find((f) => f.slug === def.slug);
  const kicker = pick(overrides, "kicker", def.kicker);
  const title = pick(overrides, "title", def.title);
  const intro = pick(overrides, "intro", def.intro);
  const filtered = builds.filter(def.matches);

  // Группируем все остальные фильтры по группам — выводим под каталогом
  // как блок «Ещё фильтры», чтобы поисковики ходили по перелинковке,
  // а пользователи легко переключались между категориями.
  const otherFilters = FILTER_TYPES.filter((t) => t !== def.slug).map(
    (t) => FILTER_DEFS[t],
  );

  return (
    <div className="container-rs py-10 sm:py-14">
      {/* BreadcrumbList JSON-LD генерируется внутри компонента Breadcrumbs. */}
      <Breadcrumbs
        items={[
          { label: "Проекты домов", href: "/builds" },
          { label: title },
        ]}
      />

      <div className="mb-8 max-w-3xl">
        <div className="text-[12px] uppercase tracking-[0.2em] text-[var(--rs-brand)] font-bold">
          {kicker}
        </div>
        <h1 className="h-display mt-2 text-[36px] sm:text-[52px] font-extrabold leading-tight">
          {title}
        </h1>
        <p className="mt-4 text-[15px] sm:text-[17px] text-[var(--rs-muted)] leading-relaxed">
          {intro}
        </p>
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b) => (
            <BuildCard key={b.slug} b={b} />
          ))}
        </div>
      ) : (
        <div className="card-rs p-8 text-center">
          <div className="font-bold text-[18px] mb-2">
            Подходящих готовых проектов сейчас нет
          </div>
          <p className="text-[14px] text-[var(--rs-muted)] max-w-xl mx-auto">
            Можем спроектировать такой дом с нуля или доработать
            существующий проект под ваши параметры. Оставьте заявку — обсудим.
          </p>
          <Link href="/builds" className="btn-secondary text-[14px] mt-4 inline-flex">
            Смотреть все проекты <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Перелинковка на остальные фильтры — даёт поисковикам сильный
          сигнал тематической группировки и позволяет пользователю
          быстро переключиться. */}
      <section className="mt-14">
        <h2 className="h-display text-[22px] sm:text-[28px] font-extrabold mb-5">
          Ещё фильтры каталога
        </h2>
        <div className="grid gap-5 sm:grid-cols-3">
          {FILTER_GROUPS.map((g) => {
            const items = otherFilters.filter((f) => f.group === g.id);
            if (items.length === 0) return null;
            return (
              <div key={g.id} className="card-rs p-5">
                <div className="text-[12px] uppercase tracking-wide text-[var(--rs-muted)] mb-3 font-bold">
                  {g.label}
                </div>
                <ul className="space-y-2 text-[14px]">
                  {items.map((f) => {
                    const o = filterContents.find((x) => x.slug === f.slug);
                    const label = pick(o, "title", f.title).replace(" в Томске", "");
                    return (
                      <li key={f.slug}>
                        <Link
                          href={`/builds/filtr/${f.slug}`}
                          className="hover:text-[var(--rs-brand)] inline-flex items-center gap-1.5"
                        >
                          <span>{label}</span>
                          <ArrowRight size={12} className="opacity-50" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Заявка — внизу: пользователь дошёл до конца категории, ему
          стоит предложить расчёт. */}
      <section className="mt-14 grid gap-8 lg:grid-cols-[1fr_420px] items-start">
        <div>
          <div className="text-[12px] uppercase tracking-[0.2em] text-[var(--rs-brand)] font-bold">
            Заявка
          </div>
          <h2 className="h-display mt-2 text-[26px] sm:text-[34px] font-extrabold">
            Не нашли подходящего проекта?
          </h2>
          <p className="mt-3 text-[15px] text-[var(--rs-muted)] max-w-xl">
            Доработаем существующий или спроектируем с нуля. Обсудим
            бюджет, сроки, ипотечные программы и подберём участок в ЖК
            «Красная смородина».
          </p>
          <ul className="mt-6 grid gap-3 text-[14px]">
            <li className="flex gap-2">
              <CheckCircle2 size={18} className="text-[var(--rs-brand)] shrink-0 mt-0.5" />
              Бесплатная консультация и выезд на участок
            </li>
            <li className="flex gap-2">
              <CheckCircle2 size={18} className="text-[var(--rs-brand)] shrink-0 mt-0.5" />
              Эскроу и ипотека в Сбере, Альфе, Левобережном, ДОМ.РФ
            </li>
            <li className="flex gap-2">
              <CheckCircle2 size={18} className="text-[var(--rs-brand)] shrink-0 mt-0.5" />
              Договор с фиксированной ценой — без сюрпризов в смете
            </li>
          </ul>
        </div>
        <LeadForm source="catalog" />
      </section>
    </div>
  );
}
