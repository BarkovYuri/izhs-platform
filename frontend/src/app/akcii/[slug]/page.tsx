import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, Flame } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import LeadForm from "@/components/LeadForm";
import { getPromotion, resolveMediaUrl } from "@/services/api";
import { formatDate, formatPrice } from "@/lib/utils";
import { SITE_URL, withBrand } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  try {
    const p = await getPromotion(slug);
    const title = withBrand(`${p.title} — акция`);
    const description = p.terms.length > 160 ? p.terms.slice(0, 157).replace(/\s+\S*$/, "") + "…" : p.terms;
    return {
      title,
      description,
      alternates: { canonical: `${SITE_URL}/akcii/${p.slug}` },
      openGraph: { title, description, type: "website", url: `${SITE_URL}/akcii/${p.slug}`, images: ["/og.png"] },
      twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
    };
  } catch {
    return { title: withBrand("Акция") };
  }
}

export default async function PromotionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getPromotion(slug).catch(() => null);
  if (!p) notFound();

  return (
    <div className="py-10 sm:py-14">
      <div className="container-rs">
        <Breadcrumbs items={[{ label: "Акции", href: "/akcii" }, { label: p.title }]} />
      </div>

      <div className="container-rs">
        {p.banner_image ? (
          // banner_image — готовый креатив (фото + лого + «АКЦИЯ» уже
          // вшиты в файл, см. generate_promo_banners.py). Фиксируем блок
          // по её пропорциям, иначе object-cover при произвольной высоте
          // обрежет верх картинки и лого пропадёт из кадра. Заголовок —
          // компактной плашкой снизу, полный текст акции — в карточке
          // «Условия акции» ниже, тут не дублируем.
          <div className="relative overflow-hidden rounded-[var(--rs-radius)] shadow-[var(--rs-shadow)] aspect-[2.5/1]">
            <Image
              src={resolveMediaUrl(p.banner_image)}
              alt=""
              fill
              sizes="(min-width: 1200px) 1200px, 100vw"
              quality={70}
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 promo-banner-bottom-overlay" />
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-8">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide bg-white/15 px-2.5 py-1 rounded-full text-white">
                <Flame size={13} /> {p.badge_label}
              </span>
              <h1 className="h-display mt-0 sm:mt-2 font-extrabold leading-tight text-white text-[20px] sm:text-[32px] line-clamp-2">
                {p.banner_title || p.title}
              </h1>
            </div>
          </div>
        ) : (
          <div className="promo-banner relative overflow-hidden rounded-[var(--rs-radius)] shadow-[var(--rs-shadow)] p-6 sm:p-10">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide bg-white/15 px-2.5 py-1 rounded-full text-white">
              <Flame size={13} /> {p.badge_label}
            </span>
            <h1 className="h-display mt-3 font-extrabold leading-tight text-white text-[28px] sm:text-[40px]">
              {p.banner_title || p.title}
            </h1>
            {p.banner_subtitle && (
              <p className="mt-2 text-[14px] sm:text-[16px] text-white/85 max-w-2xl">
                {p.banner_subtitle}
              </p>
            )}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            <section className="card-rs p-6">
              <h2 className="h-display text-[22px] sm:text-[26px] font-extrabold mb-3">Условия акции</h2>
              <p className="text-[15px] leading-relaxed whitespace-pre-line text-[var(--rs-ink)]/85">
                {p.terms}
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="text-[13.5px]">
                  <div className="text-[var(--rs-muted)]">Акция действует</div>
                  <div className="font-bold">{formatDate(p.starts_at)} — {formatDate(p.ends_at)}</div>
                </div>
                {p.contract_deadline && (
                  <div className="text-[13.5px]">
                    <div className="text-[var(--rs-muted)]">Заключить договор до</div>
                    <div className="font-bold">{formatDate(p.contract_deadline)}</div>
                  </div>
                )}
              </div>
            </section>

            {p.builds.length > 0 && (
              <section className="mt-8">
                <h2 className="h-display text-[22px] sm:text-[26px] font-extrabold mb-4">
                  Дома по акции
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {p.builds.map((b) => (
                    <Link
                      key={b.build_slug}
                      href={`/builds/${b.build_slug}`}
                      className="card-rs overflow-hidden flex flex-col sm:hover:-translate-y-1 transition-transform duration-200"
                    >
                      <div className="relative aspect-[16/10] bg-[var(--rs-line)]/40 overflow-hidden">
                        {b.build_cover ? (
                          <Image
                            src={resolveMediaUrl(b.build_cover)}
                            alt={b.build_title}
                            fill
                            sizes="(min-width: 640px) 50vw, 100vw"
                            quality={70}
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full grid place-items-center text-[var(--rs-muted)] text-sm">
                            Нет фото
                          </div>
                        )}
                        <span className="badge badge-promo absolute top-2.5 left-2.5 !text-[11px] !py-0.5 !px-2">
                          <Flame size={12} /> −{b.discount_percent}%
                        </span>
                      </div>
                      <div className="p-4 flex items-center justify-between gap-3">
                        <div className="font-bold text-[14.5px] leading-tight">{b.build_title}</div>
                        <div className="text-right shrink-0">
                          <div className="price-old text-[12px]">{formatPrice(b.original_price)}</div>
                          <div className="font-extrabold text-[16px] text-[var(--rs-brand)]">
                            {formatPrice(b.promo_price)}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <Link
              href="/akcii"
              className="inline-flex items-center gap-1.5 mt-8 text-[14px] font-bold text-[var(--rs-brand)] hover:underline"
            >
              Все акции <ArrowRight size={14} />
            </Link>
          </div>

          <aside className="lg:sticky lg:top-24 self-start min-w-0">
            <div className="card-rs p-5 sm:p-6">
              <h3 className="font-extrabold text-[16px] mb-3">Успеть по акции</h3>
              <LeadForm source="project" buildTitle={p.title} compact />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
