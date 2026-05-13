import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import ArticleCard from "@/components/ArticleCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { getArticles, getBlogCategories } from "@/services/api";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const TITLE = "Блог Ремстрой — статьи о строительстве, ипотеке и материалах";
const DESCRIPTION =
  "Гайды по строительству кирпичных домов в Томске: как выбрать участок, " +
  "оформить ипотеку, какой кирпич использовать. Опыт застройщика «Ремстрой».";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/blog" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/blog",
    type: "website",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og.png"],
  },
};

function blogJsonLd(articles: { title: string; slug: string }[]) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Blog",
      "@id": `${SITE_URL}/blog#blog`,
      name: "Блог Ремстрой",
      description: DESCRIPTION,
      url: `${SITE_URL}/blog`,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: articles.map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/blog/${a.slug}`,
        name: a.title,
      })),
    },
  ];
}

export default async function BlogPage() {
  const [articles, categories] = await Promise.all([
    getArticles(),
    getBlogCategories(),
  ]);

  return (
    <div className="container-rs py-10 sm:py-14">
      <JsonLd data={blogJsonLd(articles)} />
      <Breadcrumbs items={[{ label: "Блог" }]} />

      <div className="mb-8 max-w-3xl">
        <div className="text-[12px] uppercase tracking-[0.2em] text-[var(--rs-brand)] font-bold">
          Блог
        </div>
        <h1 className="h-display mt-2 text-[36px] sm:text-[52px] font-extrabold">
          Статьи о строительстве и ипотеке
        </h1>
        <p className="mt-3 text-[15px] sm:text-[17px] text-[var(--rs-muted)] leading-relaxed">
          Опыт застройщика «Ремстрой»: как выбрать материалы, оформить
          ипотеку, не попасть на типовые ошибки в стройке.
        </p>
      </div>

      {/* Категории — для перелинковки и UX-фильтрации. */}
      {categories.length > 0 && (
        <section className="mb-10">
          <div className="text-[12px] uppercase tracking-wide text-[var(--rs-muted)] mb-3 font-bold">
            Темы
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/blog/category/${c.slug}`}
                className="badge badge-muted hover:badge-brand transition"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {articles.length > 0 ? (
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.slug} a={a} />
          ))}
        </div>
      ) : (
        <div className="card-rs p-8 text-center">
          <div className="font-bold text-[18px] mb-2">
            Статей пока нет
          </div>
          <p className="text-[14px] text-[var(--rs-muted)]">
            Скоро здесь появятся материалы о стройке, ипотеке и материалах.
          </p>
          <Link href="/builds" className="btn-secondary text-[14px] mt-4 inline-flex">
            Перейти к каталогу <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
