import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail, MapPin, MessageCircle, MessageSquare, Phone, Send, Users } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import LeadForm from "@/components/LeadForm";
import { getSettings } from "@/services/api";
import { formatPhoneHref } from "@/lib/utils";
import { localBusinessJsonLd } from "@/lib/seo";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Контакты",
  description: "Связаться с застройщиком Ремстрой: телефон, email, адрес офиса в Томске на Комсомольском проспекте, 43А. Карта проезда.",
  alternates: { canonical: "/contacts" },
  openGraph: {
    title: "Контакты — Ремстрой",
    description: "Адрес офиса, телефон, мессенджеры. Карта проезда в Томске.",
    url: "/contacts", type: "website",
  },
};

export default async function ContactsPage() {
  const s = await getSettings();
  return (
    <div className="container-rs py-10 sm:py-14">
      <JsonLd data={localBusinessJsonLd(s)} />
      <Breadcrumbs items={[{ label: "Контакты" }]} />
      <div className="mb-10 max-w-2xl">
        <div className="text-[12px] uppercase tracking-[0.2em] text-[var(--rs-brand)] font-bold">
          Контакты
        </div>
        <h1 className="h-display mt-2 text-[36px] sm:text-[52px] font-extrabold">Связаться с нами</h1>
        <p className="mt-3 text-[15px] text-[var(--rs-muted)]">
          Позвоните или оставьте заявку — обсудим проект, выезд на участок и стоимость.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
        <div className="grid gap-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {s.telegram_url && <ContactBox icon={<Send />} title="Telegram" value="Написать в Telegram" href={s.telegram_url} accent="#229ED9" />}
            {s.whatsapp_url && <ContactBox icon={<MessageCircle />} title="WhatsApp" value="Написать в WhatsApp" href={s.whatsapp_url} accent="#25D366" />}
            {s.max_url && <ContactBox icon={<MessageSquare />} title="MAX" value="Написать в MAX" href={s.max_url} accent="#7B61FF" />}
            {s.vk_url && <ContactBox icon={<Users />} title="ВКонтакте" value="Сообщество ВК" href={s.vk_url} accent="#0077FF" />}
            {s.email && <ContactBox icon={<Mail />} title="Email" value={s.email} href={`mailto:${s.email}`} />}
            {s.phone && <ContactBox icon={<Phone />} title="Телефон" value={s.phone} href={formatPhoneHref(s.phone)} />}
            {(s.settlement_location || s.address) && (
              <ContactBox icon={<MapPin />} title="Расположение" value={s.settlement_location || s.address} />
            )}
          </div>

          {s.office_map_iframe ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-extrabold text-[18px]">Офис на карте</h2>
                {s.address && (
                  <span className="text-[13px] text-[var(--rs-muted)]">{s.address}</span>
                )}
              </div>
              <div
                className="yandex-map-wrap card-rs overflow-hidden"
                dangerouslySetInnerHTML={{ __html: s.office_map_iframe }}
              />
            </div>
          ) : (
            <div className="card-rs p-6">
              <div className="font-extrabold text-[15px] mb-1">Офис</div>
              <div className="text-[13px] text-[var(--rs-muted)]">
                Адрес и карта офиса будут добавлены позже. Пока свяжитесь любым удобным
                способом — мы организуем встречу или выезд на участок.
              </div>
            </div>
          )}

          <div className="card-rs p-6">
            <div className="font-extrabold text-[15px] mb-2">Хотите посмотреть посёлок?</div>
            <div className="text-[13px] text-[var(--rs-muted)] mb-4">
              Карта и подробная информация о посёлке «{s.settlement_name}» — на отдельной странице.
            </div>
            <Link href="/settlement" className="btn-secondary text-[13px]">
              Перейти на страницу посёлка <ArrowRight size={14} />
            </Link>
          </div>

          {(s.legal_name || s.inn || s.ogrnip) && (
            <div className="card-rs p-5 text-[13px] text-[var(--rs-muted)] grid gap-1">
              {s.legal_name && <div>{s.legal_name}</div>}
              {s.inn && <div>ИНН: {s.inn}</div>}
              {s.ogrnip && <div>ОГРНИП: {s.ogrnip}</div>}
            </div>
          )}
        </div>

        <div>
          <h2 className="font-extrabold text-[22px] mb-4">Оставить заявку</h2>
          <LeadForm source="contacts" />
        </div>
      </div>
    </div>
  );
}

function ContactBox({
  icon, title, value, href, accent,
}: { icon: React.ReactNode; title: string; value: string; href?: string; accent?: string }) {
  const iconStyle = accent
    ? { background: accent, color: "#fff" }
    : undefined;
  const iconClass = accent
    ? "w-10 h-10 rounded-lg grid place-items-center mb-3"
    : "w-10 h-10 rounded-lg bg-[var(--rs-brand)]/10 text-[var(--rs-brand)] grid place-items-center mb-3";
  const content = (
    <div className="card-rs p-5 h-full transition hover:-translate-y-0.5">
      <div className={iconClass} style={iconStyle}>
        {icon}
      </div>
      <div className="text-[12px] text-[var(--rs-muted)] uppercase tracking-wide">{title}</div>
      <div className="font-bold text-[16px] mt-1 break-words">{value}</div>
    </div>
  );
  return href ? (
    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener" className="block">
      {content}
    </a>
  ) : content;
}
