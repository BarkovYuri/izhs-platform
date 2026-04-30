import type { MetadataRoute } from "next";
import { getBuilds } from "@/services/api";

const BASE = "https://remstroy70.ru";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const builds = await getBuilds();
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/builds`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/portfolio`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${BASE}/settlement`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/contacts`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
  const buildRoutes: MetadataRoute.Sitemap = builds.map((b) => ({
    url: `${BASE}/builds/${b.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));
  return [...staticRoutes, ...buildRoutes];
}
