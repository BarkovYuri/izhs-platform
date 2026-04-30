import type {
  BuildDetail, BuildListItem, FaqCategory, LeadPayload,
  PageContent, PageSlug, PortfolioItem, SiteSettings,
} from "@/types/api";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE}${url}`;
}

async function fetchJson<T>(path: string, init?: RequestInit, fallback?: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
      cache: init?.cache ?? "no-store",
      // Двойная страховка: Next.js Data Cache не должен кэшировать ответ.
      next: { revalidate: 0 },
    });
    if (!res.ok) {
      if (fallback !== undefined) return fallback;
      throw new Error(`API ${path}: ${res.status} ${res.statusText}`);
    }
    return res.json() as Promise<T>;
  } catch (e) {
    if (fallback !== undefined) return fallback;
    throw e;
  }
}

export const getBuilds = () => fetchJson<BuildListItem[]>("/api/builds/", undefined, []);
export const getPortfolio = () => fetchJson<PortfolioItem[]>("/api/portfolio/", undefined, []);
export const getBuild  = (slug: string) => fetchJson<BuildDetail>(`/api/builds/${slug}/`);
export const getFaq    = () => fetchJson<FaqCategory[]>("/api/faq/", undefined, []);
export const getSettings = () => fetchJson<SiteSettings>("/api/settings/", undefined, {
  site_name: "Ремстрой",
  tagline: "",
  phone: "", email: "", address: "",
  settlement_name: "Красная смородина",
  settlement_location: "д. Кисловка, Томская область",
  legal_name: "", inn: "", ogrnip: "",
  vk_url: "", telegram_url: "", whatsapp_url: "", max_url: "",
  yandex_map_iframe: "", office_map_iframe: "", settlement_plan: null,
  yandex_metrika_id: "", yandex_verification: "", google_verification: "", working_hours: "",
  founded_year: 2016,
  homes_built_total: 30, settlement_homes_built: 12, settlement_homes_total: 40,
  about_short: "",
  about_intro: "", about_escrow: "", about_settlement: "", about_outro: "",
  directions_list: "", advantages_list: "", partner_banks: "",
  seo_title_default: "", seo_description_default: "",
});

/**
 * Тексты заголовков для одной страницы (редактируется в админке).
 * Если бэкенд недоступен или поле пустое — на фронте используется
 * хардкод-фолбэк, чтобы сайт не упал и не стал пустым.
 */
export const getPageContent = (slug: PageSlug) =>
  fetchJson<PageContent>(`/api/page/${slug}/`, undefined, {
    slug,
    kicker: "",
    title: "",
    subtitle: "",
    meta_title: "",
    meta_description: "",
  });

export async function createLead(payload: LeadPayload): Promise<{ ok: boolean; id?: number; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/leads/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: text || `${res.status} ${res.statusText}` };
    }
    return res.json();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
