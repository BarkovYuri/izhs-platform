import type { SiteSettings } from "@/types/api";

export const SITE_URL = "https://remstroy70.ru";

export function absoluteUrl(path: string): string {
  if (!path) return SITE_URL;
  if (path.startsWith("http")) return path;
  return SITE_URL + (path.startsWith("/") ? path : `/${path}`);
}

/** Полный JSON-LD блок для Organization + WebSite (главная страница). */
export function organizationJsonLd(s: SiteSettings) {
  const sameAs = [s.vk_url, s.telegram_url, s.whatsapp_url, s.max_url].filter(Boolean);
  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: s.site_name,
    legalName: s.legal_name || s.site_name,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    image: `${SITE_URL}/og-default.png`,
    description: s.about_short || s.about_intro || `Застройщик ${s.site_name}`,
    telephone: s.phone || undefined,
    email: s.email || undefined,
    taxID: s.inn || undefined,
    sameAs: sameAs.length ? sameAs : undefined,
    address: s.address ? {
      "@type": "PostalAddress",
      addressCountry: "RU",
      addressLocality: "Томск",
      streetAddress: s.address,
    } : undefined,
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: s.site_name,
    inLanguage: "ru-RU",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return [org, website];
}

/** LocalBusiness — для страницы Контакты, влияет на локальную выдачу (Yandex/Google Maps). */
export function localBusinessJsonLd(s: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/contacts#localbusiness`,
    name: s.site_name,
    description: s.about_short || s.about_intro,
    url: `${SITE_URL}/contacts`,
    telephone: s.phone || undefined,
    email: s.email || undefined,
    image: `${SITE_URL}/og-default.png`,
    priceRange: "₽₽₽",
    address: {
      "@type": "PostalAddress",
      addressCountry: "RU",
      addressLocality: "Томск",
      streetAddress: s.address || "Комсомольский проспект, 43А",
    },
    openingHours: s.working_hours || undefined,
    areaServed: { "@type": "AdministrativeArea", name: "Томская область" },
    sameAs: [s.vk_url, s.telegram_url, s.max_url].filter(Boolean),
  };
}

/** FAQPage — даёт богатые сниппеты с раскрывающимися вопросами в Google. */
export function faqPageJsonLd(categories: { items: { question: string; answer: string }[] }[]) {
  const items = categories.flatMap((c) => c.items);
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: { "@type": "Answer", text: it.answer },
    })),
  };
}

/** Place — посёлок как географический объект с координатами. */
export function settlementJsonLd(s: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "Place",
    "@id": `${SITE_URL}/settlement#place`,
    name: `Посёлок ${s.settlement_name}`,
    description: s.about_settlement,
    url: `${SITE_URL}/settlement`,
    image: s.settlement_plan ? absoluteUrl(s.settlement_plan) : `${SITE_URL}/og-default.png`,
    address: {
      "@type": "PostalAddress",
      addressCountry: "RU",
      addressRegion: "Томская область",
      addressLocality: s.settlement_location || "д. Кисловка",
    },
    // Координаты посёлка из его iframe карты
    geo: {
      "@type": "GeoCoordinates",
      latitude: 56.404519,
      longitude: 84.871372,
    },
  };
}

/** CollectionPage + ItemList для каталога проектов. */
export function buildsCatalogJsonLd(builds: { title: string; slug: string; price: string }[]) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      url: `${SITE_URL}/builds`,
      name: "Каталог проектов кирпичных домов",
      isPartOf: { "@id": `${SITE_URL}/#website` },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: builds.map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/builds/${b.slug}`,
        name: b.title,
      })),
    },
  ];
}
