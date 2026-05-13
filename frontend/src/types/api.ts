export type BuildStatus = "planned" | "building" | "available" | "sold";

export type BuildListItem = {
  title: string;
  slug: string;
  area: string;
  price: string;
  floors: number;
  bedrooms: number | null;
  status: BuildStatus;
  status_label: string;
  is_typical: boolean;
  is_featured: boolean;
  available_in_settlement: boolean;
  available_on_client_land: boolean;
  plot_number: string;
  short_description: string;
  cover: string | null;
};

export type ImageRef = { image: string; order: number };

export type EstimateItem = {
  stage_title: string;
  materials_cost: string;
  works_cost: string;
  total: string;
  order: number;
};

export type BuildFAQItem = {
  question: string;
  answer: string;
  order: number;
};

export type BuildDetail = BuildListItem & {
  description: string;
  images: ImageRef[];
  floor_plans: ImageRef[];
  facades: ImageRef[];
  specs_main: Record<string, string>;
  specs_networks: Record<string, string>;
  specs_layout: Record<string, string>;
  specs_struct: Record<string, string>;
  estimate_items: EstimateItem[];
  faq_items: BuildFAQItem[];
};

export type SiteSettings = {
  site_name: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  settlement_name: string;
  settlement_location: string;
  legal_name: string;
  inn: string;
  ogrnip: string;
  vk_url: string;
  telegram_url: string;
  whatsapp_url: string;
  max_url: string;
  yandex_map_iframe: string;
  office_map_iframe: string;
  settlement_plan: string | null;
  yandex_metrika_id: string;
  yandex_verification: string;
  google_verification: string;
  working_hours: string;
  warranty_years: number;
  warranty_subject: string;
  founded_year: number;
  homes_built_total: number;
  settlement_homes_built: number;
  settlement_homes_total: number;
  about_short: string;
  about_intro: string;
  about_escrow: string;
  about_settlement: string;
  about_outro: string;
  directions_list: string;
  advantages_list: string;
  partner_banks: string;
  seo_title_default: string;
  seo_description_default: string;
};

export type PortfolioImage = {
  image: string;
  order: number;
};

export type PortfolioItem = {
  id: number;
  title: string;
  description: string;
  year: number | null;
  area: string | null;
  location: string;
  cover: string;
  video_url: string;
  images: PortfolioImage[];
  order: number;
};

export type PageSlug =
  | "home" | "builds" | "faq" | "about" | "contacts" | "settlement" | "portfolio";

export type PageContentImage = {
  image: string;
  alt: string;
  order: number;
};

export type BuildFilterContent = {
  slug: string;
  kicker: string;
  title: string;
  intro: string;
  meta_title: string;
  meta_description: string;
};

export type PageContent = {
  slug: PageSlug;
  kicker: string;
  title: string;
  subtitle: string;
  body: string;
  hero_lead: string;
  hero_accent: string;
  meta_title: string;
  meta_description: string;
  images: PageContentImage[];
};

export type FaqItem = {
  id: number;
  question: string;
  answer: string;
  order: number;
};

export type FaqCategory = {
  id: number;
  title: string;
  slug: string;
  order: number;
  items: FaqItem[];
};

export type BlogCategory = {
  name: string;
  slug: string;
  description: string;
  order: number;
};

export type BlogArticleListItem = {
  title: string;
  slug: string;
  excerpt: string;
  cover: string | null;
  category: BlogCategory | null;
  published_at: string;
};

export type BlogInlineImage = {
  image: string;
  alt: string;
  order: number;
};

export type BlogArticle = BlogArticleListItem & {
  body: string;
  updated_at: string;
  meta_title: string;
  meta_description: string;
  keywords: string;
  inline_images: BlogInlineImage[];
};

export type LeadPayload = {
  name: string;
  phone: string;
  email?: string;
  message?: string;
  build?: number;
  source?: "homepage" | "project" | "contacts" | "catalog" | "other";
  page_url?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
};
