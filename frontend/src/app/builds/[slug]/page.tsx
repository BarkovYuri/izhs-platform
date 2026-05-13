import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Bed, Building2, Hash, MapPin, Maximize2 } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import FaqAccordion from "@/components/FaqAccordion";
import Gallery from "@/components/Gallery";
import BuildSpecsTabs from "@/components/BuildSpecsTabs";
import LeadForm from "@/components/LeadForm";
import { getBuild, getSettings, resolveMediaUrl } from "@/services/api";
import { formatArea, formatPrice } from "@/lib/utils";
import { faqPageJsonLd, SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const STATUS_BADGE: Record<string, string> = {
  available: "badge-olive",
  building: "badge-gold",
  planned: "badge-muted",
  sold: "badge-muted",
};

const STATUS_AVAILABILITY: Record<string, string> = {
  available: "https://schema.org/InStock",
  building: "https://schema.org/PreOrder",
  planned: "https://schema.org/PreOrder",
  sold: "https://schema.org/SoldOut",
};

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  try {
    const b = await getBuild(slug);
    const fullDescription =
      b.short_description ||
      `Кирпичный дом ${formatArea(b.area)}, ${b.floors} эт., от ${formatPrice(b.price)}`;
    // Google и Яндекс показывают ~160 символов в выдаче — длиннее
    // обрезается на середине слова. Режем сами по последнему пробелу.
    const description =
      fullDescription.length > 160
        ? fullDescription.slice(0, 157).replace(/\s+\S*$/, "") + "…"
        : fullDescription;
    const ogImage = b.cover ? resolveMediaUrl(b.cover) : "/og.png";
    return {
      title: `${b.title} — кирпичный дом ${formatArea(b.area)}`,
      description,
      alternates: { canonical: `${SITE_URL}/builds/${b.slug}` },
      openGraph: {
        title: b.title,
        description,
        type: "website",
        url: `${SITE_URL}/builds/${b.slug}`,
        images: [ogImage],
      },
      twitter: {
        card: "summary_large_image",
        title: b.title,
        description,
        images: [ogImage],
      },
    };
  } catch {
    return { title: "Проект дома" };
  }
}

export default async function BuildPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [b, s] = await Promise.all([
    getBuild(slug).catch(() => null),
    getSettings(),
  ]);
  if (!b) notFound();

  const allImages = [
    ...(b.images || []),
    ...(b.floor_plans || []),
    ...(b.facades || []),
  ].map((i) => resolveMediaUrl(i.image));

  // Собираем все характеристики из 4 групп в плоский список
  // PropertyValue. Пустые ключи/значения отфильтровываем — в schema
  // должны попадать только реальные данные.
  const specEntries = [
    ...Object.entries(b.specs_main || {}),
    ...Object.entries(b.specs_networks || {}),
    ...Object.entries(b.specs_layout || {}),
    ...Object.entries(b.specs_struct || {}),
  ].filter(([k, v]) => k.trim() && v.trim());

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: b.title,
    description: b.short_description || b.description || `Кирпичный дом ${formatArea(b.area)}, ${b.floors} эт.`,
    image: allImages.slice(0, 8),
    brand: { "@type": "Organization", name: s.site_name },
    category: "Дом",
    offers: {
      "@type": "Offer",
      price: b.price,
      priceCurrency: "RUB",
      availability: STATUS_AVAILABILITY[b.status] || "https://schema.org/PreOrder",
      url: `${SITE_URL}/builds/${b.slug}`,
      seller: { "@type": "Organization", name: s.legal_name || s.site_name },
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "Площадь", value: formatArea(b.area) },
      { "@type": "PropertyValue", name: "Этажность", value: String(b.floors) },
      ...(b.bedrooms != null
        ? [{ "@type": "PropertyValue", name: "Спальни", value: String(b.bedrooms) }]
        : []),
      // Все характеристики из админки — поисковик увидит полный
      // паспорт дома: тип фундамента, материал стен, толщина и т.д.
      ...specEntries.map(([name, value]) => ({
        "@type": "PropertyValue",
        name,
        value,
      })),
    ],
  };

  return (
    <div className="py-6 sm:py-14">
      <div className="container-rs">
        <Breadcrumbs items={[
          { label: "Проекты", href: "/builds" },
          { label: b.title },
        ]} />
      </div>
      <div className="container-rs grid gap-6 sm:gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`badge ${STATUS_BADGE[b.status] || "badge-muted"}`}>{b.status_label}</span>
            {b.is_typical && <span className="badge badge-brand">Типовой проект</span>}
            {b.plot_number && (
              <span className="badge"><Hash size={12} /> Участок {b.plot_number}</span>
            )}
          </div>

          <h1
            className="h-display font-extrabold tracking-tight leading-tight"
            style={{
              fontSize: "clamp(18px, 5.6vw, 44px)",
              overflowWrap: "anywhere",
              wordBreak: "break-word",
              hyphens: "auto",
            }}
          >
            {b.title}
          </h1>

          {b.short_description && (
            <p className="mt-3 text-[14px] sm:text-[17px] text-[var(--rs-muted)] max-w-3xl">
              {b.short_description}
            </p>
          )}

          <div className="mt-4 sm:mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[13px] sm:text-[14px]">
            <span className="inline-flex items-center gap-1.5"><Maximize2 size={15} className="text-[var(--rs-muted)]"/> {formatArea(b.area)}</span>
            <span className="inline-flex items-center gap-1.5"><Building2 size={15} className="text-[var(--rs-muted)]"/> {b.floors} эт.</span>
            {b.bedrooms != null && (
              <span className="inline-flex items-center gap-1.5"><Bed size={15} className="text-[var(--rs-muted)]"/> {b.bedrooms} спальни</span>
            )}
          </div>

          {/* Галерея в пределах контейнера (никаких отрицательных margin'ов —
              они вызывали horizontal overflow на iPhone Safari → авто-zoom). */}
          <div className="mt-5 sm:mt-8">
            <Gallery items={b.images} />
          </div>

          {b.description && (
            <section className="mt-10 prose prose-stone max-w-none">
              <h2 className="h-display text-[24px] sm:text-[28px] font-extrabold">Описание</h2>
              <div className="mt-3 text-[15px] leading-relaxed whitespace-pre-line text-[var(--rs-ink)]/85">
                {b.description}
              </div>
            </section>
          )}

          <section className="mt-10">
            <BuildSpecsTabs build={b} />
          </section>

          {/* Per-build FAQ — 3-8 вопросов конкретно про этот проект.
              Заполняется в админке через inline. Если пуст — секция
              не рендерится. FAQPage schema добавляется отдельным
              JSON-LD скриптом ниже — даёт rich snippets в Google. */}
          {b.faq_items.length > 0 && (
            <section className="mt-12">
              <h2 className="h-display text-[24px] sm:text-[30px] font-extrabold mb-6">
                Вопросы по проекту
              </h2>
              <FaqAccordion
                categories={[
                  {
                    id: 0,
                    title: "",
                    slug: "",
                    order: 0,
                    items: b.faq_items.map((it, i) => ({
                      id: i,
                      question: it.question,
                      answer: it.answer,
                      order: it.order,
                    })),
                  },
                ]}
              />
              <Link
                href="/faq"
                className="inline-flex items-center gap-1.5 mt-6 text-[14px] font-bold text-[var(--rs-brand)] hover:underline"
              >
                Не нашли свой вопрос? Смотрите общие вопросы и ответы
                <ArrowRight size={14} />
              </Link>
            </section>
          )}

          <section className="mt-10 grid gap-3 sm:grid-cols-2">
            {b.available_in_settlement && (
              <div className="card-rs p-5 flex items-start gap-3">
                <MapPin className="text-[var(--rs-brand)] shrink-0 mt-0.5" size={20} />
                <div>
                  <div className="font-bold text-[15px]">В ЖК «{s.settlement_name}»</div>
                  <div className="text-[13px] text-[var(--rs-muted)] mt-1">
                    Под ключ на участке ЖК. Цена — с участком.
                  </div>
                </div>
              </div>
            )}
            {b.available_on_client_land && (
              <div className="card-rs p-5 flex items-start gap-3">
                <MapPin className="text-[var(--rs-olive)] shrink-0 mt-0.5" size={20} />
                <div>
                  <div className="font-bold text-[15px]">На вашем участке</div>
                  <div className="text-[13px] text-[var(--rs-muted)] mt-1">
                    Построим на вашей земле. Бесплатный выезд для замера и оценки.
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 self-start min-w-0">
          <div className="card-rs p-5 sm:p-6">
            <div className="text-[12px] text-[var(--rs-muted)] uppercase tracking-wide">Цена от</div>
            <div
              className="font-extrabold text-[var(--rs-brand)] leading-none"
              style={{
                fontSize: "clamp(24px, 7.5vw, 34px)",
                fontVariantNumeric: "tabular-nums",
                overflowWrap: "anywhere",
              }}
            >
              {formatPrice(b.price)}
            </div>
            <div className="text-[12px] text-[var(--rs-muted)] mt-2">
              Финальная стоимость зависит от участка, доработок и комплектации.
            </div>
            <div className="mt-5 border-t border-[var(--rs-line)] pt-5">
              <h3 className="font-extrabold text-[16px] mb-3">Получить расчёт</h3>
              <LeadForm source="project" buildId={undefined} buildTitle={b.title} compact />
            </div>
          </div>
        </aside>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Отдельный JSON-LD для FAQPage — Google поддерживает только
          один FAQPage на страницу и не любит когда он смешан с
          Product schema. Поэтому второй <script>, не объединяем. */}
      {b.faq_items.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              faqPageJsonLd([{ items: b.faq_items }]),
            ),
          }}
        />
      )}
    </div>
  );
}
