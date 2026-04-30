import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSettings } from "@/services/api";
import { SITE_URL } from "@/lib/seo";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter", display: "swap" });
const manrope = Manrope({ subsets: ["latin", "cyrillic"], variable: "--font-manrope", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const title = s.seo_title_default || `${s.site_name} — кирпичные дома в посёлке ${s.settlement_name}`;
  const description = s.seo_description_default || s.about_short || "Строительство кирпичных домов";
  const verification: Record<string, string> = {};
  if (s.yandex_verification) verification.yandex = s.yandex_verification;
  if (s.google_verification) verification.google = s.google_verification;

  return {
    title: { default: title, template: `%s — ${s.site_name}` },
    description,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: "/" },
    icons: { icon: "/favicon.svg" },
    keywords: [
      "кирпичный дом", "купить дом Томск", "коттеджный посёлок", "Красная смородина",
      "Кисловка", "ИЖС Томск", "Ремстрой", "дом под ключ", "ипотека на дом",
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
    },
    twitter: { card: "summary_large_image", title, description },
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
          <Script id="ym-counter" strategy="afterInteractive">{`
            (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
            (window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");
            ym(${s.yandex_metrika_id}, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true, webvisor:true, ecommerce:"dataLayer" });
          `}</Script>
        )}
      </body>
    </html>
  );
}
