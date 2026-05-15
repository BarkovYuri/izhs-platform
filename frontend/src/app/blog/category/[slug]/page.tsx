import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import ArticleCard from "@/components/ArticleCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getArticles, getBlogCategories } from "@/services/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RouteParams = { slug: string };

export async function generateMetadata(
  { params }: { params: Promise<RouteParams> },
): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getBlogCategories();
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) return {};
  const title = `${cat.name} — статьи блога | Ремстрой`;
  const description =
    cat.description ||
    `Статьи в категории «${cat.name}» — блог застройщика «Ремстрой».`;
  const url = `/blog/category/${slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: ["/og.png"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.png"],
    },
  };
}

export default async function BlogCategoryPage(
  { params }: { params: Promise<RouteParams> },
) {
  const { slug } = await params;
  const [categories, articles] = await Promise.all([
    getBlogCategories(),
    getArticles(slug),
  ]);
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) notFound();

  return (
    <div className="container-rs py-10 sm:py-14">
      {/* BreadcrumbList JSON-LD генерируется внутри компонента Breadcrumbs. */}
      <Breadcrumbs
        items={[
          { label: "Блог", href: "/blog" },
          { label: cat.name },
        ]}
      />

      <div className="mb-8 max-w-3xl">
        <div className="text-[12px] uppercase tracking-[0.2em] text-[var(--rs-brand)] font-bold">
          Тема
        </div>
        <h1 className="h-display mt-2 text-[36px] sm:text-[52px] font-extrabold">
          {cat.name}
        </h1>
        {cat.description && (
          <p className="mt-4 text-[15px] sm:text-[17px] text-[var(--rs-muted)] leading-relaxed">
            {cat.description}
          </p>
        )}
      </div>

      {/* Перелинковка на другие категории. */}
      {categories.length > 1 && (
        <section className="mb-10">
          <div className="text-[12px] uppercase tracking-wide text-[var(--rs-muted)] mb-3 font-bold">
            Другие темы
          </div>
          <div className="flex flex-wrap gap-2">
            {categories
              .filter((c) => c.slug !== slug)
              .map((c) => (
                <Link
                  key={c.slug}
                  href={`/blog/category/${c.slug}`}
                  className="badge badge-muted hover:badge-brand transition"
                >
                  {c.name}
                </Link>
              ))}
            <Link
              href="/blog"
              className="badge badge-muted hover:badge-brand transition"
            >
              Все статьи
            </Link>
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
            В этой теме пока нет статей
          </div>
          <Link href="/blog" className="btn-secondary text-[14px] mt-4 inline-flex">
            Все статьи блога
          </Link>
        </div>
      )}
    </div>
  );
}
