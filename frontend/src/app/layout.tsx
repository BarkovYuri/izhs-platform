import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getPageContent, getSettings } from "@/services/api";
import { SITE_URL } from "@/lib/seo";
import { pickText } from "@/lib/pageContent";

// Явный viewport — фиксирует масштаб на старте загрузки страницы,
// чтобы iPhone Safari не уменьшал зум автоматически если что-то широкое
// проскочит. Юзер всё ещё может пинч-зумить (maximumScale=5).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#b85a35",
};

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter", display: "swap" });
const manrope = Manrope({ subsets: ["latin", "cyrillic"], variable: "--font-manrope", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const [s, pc] = await Promise.all([getSettings(), getPageContent("home")]);
  // Главная: SEO Title/Description в PageContent имеет высший приоритет,
  // потом seo_title_default из настроек, потом дефолтная фраза.
  const fallbackTitle = s.seo_title_default
    || `${s.site_name} — кирпичные дома в Томске и Кисловке от застройщика`;
  const fallbackDescription = s.seo_description_default
    || s.about_short
    || (
      "Кирпичные дома под ключ в Томске и Томской области от " +
      "застройщика Ремстрой. Купить или построить дом в ЖК " +
      "«Красная смородина» (Кисловка) или на вашем участке. " +
      "Эскроу, ипотека, индивидуальная доработка проекта."
    );
  const title = pickText(pc, "meta_title", fallbackTitle);
  const description = pickText(pc, "meta_description", fallbackDescription);
  const verification: Record<string, string> = {};
  if (s.yandex_verification) verification.yandex = s.yandex_verification;
  if (s.google_verification) verification.google = s.google_verification;

  return {
    title: { default: title, template: `%s — ${s.site_name}` },
    description,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: "/" },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any", type: "image/x-icon" },
        { url: "/favicon.svg", type: "image/svg+xml" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    },
    keywords: [
      // Высокочастотные запросы — основной таргет
      "купить дом Томск",
      "построить дом Томск",
      "купить кирпичный дом",
      "строительство домов Томск",
      "застройщик Томск",
      "строительная компания Томск",
      // Регион + тип
      "ИЖС Томск",
      "коттедж Томск",
      "дом под ключ Томск",
      "кирпичный дом под ключ",
      "одноэтажный дом",
      "двухэтажный дом",
      // Локация
      "купить дом в Кисловке",
      "дом в Томской области",
      "ЖК Красная смородина",
      "коттеджный посёлок Томск",
      "жилой комплекс Кисловка",
      // Финансирование
      "ипотека на дом Томск",
      "эскроу строительство дома",
      "дом в ипотеку",
      "ипотека ИЖС",
      // Бренд
      "Ремстрой",
      "Ремстрой Томск",
      "ремстрой70",
    ],
    authors: [{ name: s.legal_name || s.site_name }],
    creator: s.site_name,
    publisher: s.site_name,
    formatDetection: { telephone: true, email: true, address: true },
    verification: Object.keys(verification).length ? verification : undefined,
    openGraph: {
      title, description,
      type: "website",
      locale: "ru_RU",
      siteName: s.site_name,
      url: SITE_URL,
      images: [
        {
          url: "/og.png",
          width: 1200,
          height: 630,
          alt: `${s.site_name} — строительство кирпичных домов`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.png"],
    },
    robots: {
      index: true, follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  return (
    <html lang="ru" className={`${inter.variable} ${manrope.variable}`}>
      <body>
        <Navbar settings={s} />
        <main>{children}</main>
        <Footer s={s} />
        {s.yandex_metrika_id && (
          <>
            {/* Snippet от Яндекс.Метрики для Next.js / SSR-приложений.
                ssr:true + referrer/url нужны для корректного учёта переходов
                между страницами без полной перезагрузки (SPA-навигация). */}
            <Script id="ym-counter" strategy="afterInteractive">{`
              (function(m,e,t,r,i,k,a){
                m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                m[i].l=1*new Date();
                for (var j = 0; j < document.scripts.length; j++) {
                  if (document.scripts[j].src === r) { return; }
                }
                k=e.createElement(t),a=e.getElementsByTagName(t)[0],
                k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
              })(window, document, 'script',
                'https://mc.yandex.ru/metrika/tag.js?id=${s.yandex_metrika_id}',
                'ym');
              ym(${s.yandex_metrika_id}, 'init', {
                ssr:true,
                webvisor:true,
                clickmap:true,
                ecommerce:"dataLayer",
                referrer: document.referrer,
                url: location.href,
                accurateTrackBounce:true,
                trackLinks:true
              });
            `}</Script>
            <noscript>
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://mc.yandex.ru/watch/${s.yandex_metrika_id}`}
                  style={{ position: "absolute", left: "-9999px" }}
                  alt=""
                />
              </div>
            </noscript>
          </>
        )}
      </body>
    </html>
  );
}
