import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays } from "lucide-react";

import ArticleCard from "@/components/ArticleCard";
import BlogContent from "@/components/BlogContent";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import LeadForm from "@/components/LeadForm";
import {
  getArticle,
  getArticles,
  getSettings,
  resolveMediaUrl,
} from "@/services/api";
import { absoluteUrl, OG_IMAGE, SITE_URL } from "@/lib/seo";
import type { BlogArticle } from "@/types/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RouteParams = { slug: string };

function metaTitleFor(a: BlogArticle): string {
  return a.meta_title?.trim() || a.title;
}

function metaDescriptionFor(a: BlogArticle): string {
  if (a.meta_description?.trim()) return a.meta_description;
  if (a.excerpt?.trim()) return a.excerpt;
  return a.body.slice(0, 200).replace(/\s+/g, " ").trim();
}

export async function generateMetadata(
  { params }: { params: Promise<RouteParams> },
): Promise<Metadata> {
  const { slug } = await params;
  let article: BlogArticle | null = null;
  try {
    article = await getArticle(slug);
  } catch {
    return {};
  }
  const title = metaTitleFor(article);
  const description = metaDescriptionFor(article);
  const cover = article.cover ? resolveMediaUrl(article.cover) : "/og.png";
  const url = `/blog/${article.slug}`;
  // Keywords из админки — необязательно. Парсим строку «слово, слово»
  // в массив, как ожидает Next.js Metadata API.
  const keywords = article.keywords
    ? article.keywords.split(/\s*,\s*/).filter(Boolean)
    : undefined;
  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      images: [cover],
      publishedTime: article.published_at,
      modifiedTime: article.updated_at,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [cover],
    },
  };
}

function articleJsonLd(a: BlogArticle, orgName: string) {
  const cover = a.cover ? absoluteUrl(a.cover) : OG_IMAGE;
  const url = `${SITE_URL}/blog/${a.slug}`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: a.title,
      description: a.excerpt || a.meta_description,
      image: cover,
      datePublished: a.published_at,
      dateModified: a.updated_at,
      author: {
        "@type": "Organization",
        name: orgName,
        url: SITE_URL,
      },
      publisher: { "@id": `${SITE_URL}/#organization` },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      articleSection: a.category?.name,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Главная",
          item: `${SITE_URL}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Блог",
          item: `${SITE_URL}/blog`,
        },
        ...(a.category
          ? [
              {
                "@type": "ListItem",
                position: 3,
                name: a.category.name,
                item: `${SITE_URL}/blog/category/${a.category.slug}`,
              },
            ]
          : []),
        {
          "@type": "ListItem",
          position: a.category ? 4 : 3,
          name: a.title,
          item: url,
        },
      ],
    },
  ];
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default async function BlogArticlePage(
  { params }: { params: Promise<RouteParams> },
) {
  const { slug } = await params;
  let article: BlogArticle;
  try {
    article = await getArticle(slug);
  } catch {
    notFound();
  }

  // Похожие статьи: предпочитаем ту же категорию, исключая текущую.
  const [settings, others] = await Promise.all([
    getSettings(),
    getArticles(article.category?.slug),
  ]);
  const similar = others.filter((a) => a.slug !== article.slug).slice(0, 3);

  const cover = article.cover ? resolveMediaUrl(article.cover) : null;

  return (
    <article className="container-rs py-10 sm:py-14">
      <JsonLd data={articleJsonLd(article, settings.site_name)} />
      <Breadcrumbs
        items={[
          { label: "Блог", href: "/blog" },
          ...(article.category
            ? [
                {
                  label: article.category.name,
                  href: `/blog/category/${article.category.slug}`,
                },
              ]
            : []),
          { label: article.title },
        ]}
      />

      <header className="mb-8 max-w-3xl">
        {article.category && (
          <Link
            href={`/blog/category/${article.category.slug}`}
            className="text-[12px] uppercase tracking-[0.2em] text-[var(--rs-brand)] font-bold hover:underline"
          >
            {article.category.name}
          </Link>
        )}
        <h1 className="h-display mt-2 text-[34px] sm:text-[48px] font-extrabold leading-tight">
          {article.title}
        </h1>
        <div className="mt-4 flex items-center gap-2 text-[13px] text-[var(--rs-muted)]">
          <CalendarDays size={14} />
          <time dateTime={article.published_at}>
            {formatDate(article.published_at)}
          </time>
        </div>
      </header>

      {cover && (
        <div className="mb-10 rounded-2xl overflow-hidden bg-[var(--rs-line)]/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover}
            alt={article.title}
            className="w-full h-auto object-cover"
            loading="eager"
            decoding="async"
          />
        </div>
      )}

      <div className="max-w-3xl">
        <BlogContent text={article.body} showToc />
      </div>

      {/* Похожие статьи — внутренняя перелинковка для SEO + UX. */}
      {similar.length > 0 && (
        <section className="mt-16">
          <h2 className="h-display text-[24px] sm:text-[30px] font-extrabold mb-6">
            Похожие статьи
          </h2>
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((a) => (
              <ArticleCard key={a.slug} a={a} />
            ))}
          </div>
        </section>
      )}

      {/* CTA — после статьи логично предложить выбрать проект или связаться. */}
      <section className="mt-16 grid gap-8 lg:grid-cols-[1fr_420px] items-start">
        <div>
          <div className="text-[12px] uppercase tracking-[0.2em] text-[var(--rs-brand)] font-bold">
            Готовы начать?
          </div>
          <h2 className="h-display mt-2 text-[26px] sm:text-[34px] font-extrabold">
            Хотите построить свой дом?
          </h2>
          <p className="mt-3 text-[15px] text-[var(--rs-muted)] max-w-xl">
            Посмотрите наши готовые проекты или оставьте заявку — обсудим
            бюджет, сроки и подберём подходящий вариант.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/builds" className="btn-primary">
              Смотреть проекты <ArrowRight size={16} />
            </Link>
            <Link href="/settlement" className="btn-secondary">
              О посёлке «Красная смородина»
            </Link>
          </div>
        </div>
        <LeadForm source="other" />
      </section>
    </article>
  );
}
