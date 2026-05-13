import type { MetadataRoute } from "next";
import { getBuilds } from "@/services/api";
import { SITE_URL } from "@/lib/seo";
import { FILTER_TYPES } from "@/lib/buildFilters";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const builds = await getBuilds();
  const now = new Date();
  // /privacy и /terms намеренно не включаем — у них noindex,
  // включение в sitemap создаёт смешанный сигнал для поисковиков.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/builds`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/portfolio`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${SITE_URL}/settlement`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contacts`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];
  const buildRoutes: MetadataRoute.Sitemap = builds.map((b) => ({
    url: `${SITE_URL}/builds/${b.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));
  // SEO-фильтры каталога — отдельные landing-страницы под низкочастотные
  // запросы (одноэтажные/двухэтажные, площадь, с балконом и т.п.).
  const filterRoutes: MetadataRoute.Sitemap = FILTER_TYPES.map((t) => ({
    url: `${SITE_URL}/builds/filtr/${t}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));
  return [...staticRoutes, ...buildRoutes, ...filterRoutes];
}
