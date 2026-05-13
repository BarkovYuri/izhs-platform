import Link from "next/link";
import { Clock, Mail, MapPin, MessageCircle, MessageSquare, Phone, Send, ShieldCheck, Users } from "lucide-react";
import type { SiteSettings } from "@/types/api";
import { formatPhoneHref } from "@/lib/utils";
import PrivacyLink from "@/components/PrivacyLink";
import TermsLink from "@/components/TermsLink";

export default function Footer({ s }: { s: SiteSettings }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-[var(--rs-line)] bg-[var(--rs-bg)]">
      <div className="container-rs py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight">{s.site_name}</span>
              <span className="badge badge-brand">Кисловка, Томск</span>
            </div>
            {s.about_short && (
              <p className="mt-4 text-[14px] leading-relaxed text-[var(--rs-muted)] max-w-md">
                {s.about_short}
              </p>
            )}
          </div>

          <div>
            <div className="font-bold text-[14px] mb-3">Разделы</div>
            <ul className="space-y-2 text-[14px]">
              <li><Link href="/builds" className="hover:text-[var(--rs-brand)]">Проекты домов</Link></li>
              <li><Link href="/portfolio" className="hover:text-[var(--rs-brand)]">Построенные дома</Link></li>
              <li><Link href="/settlement" className="hover:text-[var(--rs-brand)]">ЖК «{s.settlement_name}»</Link></li>
              <li><Link href="/about" className="hover:text-[var(--rs-brand)]">О компании</Link></li>
              <li><Link href="/faq" className="hover:text-[var(--rs-brand)]">Вопросы и ответы</Link></li>
              <li><Link href="/contacts" className="hover:text-[var(--rs-brand)]">Контакты</Link></li>
              <li className="pt-2 border-t border-[var(--rs-line)] mt-2">
                <PrivacyLink className="text-[var(--rs-muted)] hover:text-[var(--rs-brand)] cursor-pointer">
                  Политика обработки данных
                </PrivacyLink>
              </li>
              <li>
                <TermsLink className="text-[var(--rs-muted)] hover:text-[var(--rs-brand)] cursor-pointer">
                  Пользовательское соглашение
                </TermsLink>
              </li>
            </ul>
          </div>

          <div>
            <div className="font-bold text-[14px] mb-3">Контакты</div>
            <ul className="space-y-2.5 text-[14px]">
              {s.phone && (
                <li className="flex items-start gap-2">
                  <Phone size={16} className="mt-0.5 shrink-0 text-[var(--rs-brand)]" />
                  <a href={formatPhoneHref(s.phone)} className="hover:text-[var(--rs-brand)]">{s.phone}</a>
                </li>
              )}
              {s.email && (
                <li className="flex items-start gap-2">
                  <Mail size={16} className="mt-0.5 shrink-0 text-[var(--rs-brand)]" />
                  <a href={`mailto:${s.email}`} className="hover:text-[var(--rs-brand)]">{s.email}</a>
                </li>
              )}
              {(s.address || s.settlement_location) && (
                <li className="flex items-start gap-2">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-[var(--rs-brand)]" />
                  <span>{s.address || s.settlement_location}</span>
                </li>
              )}
              {s.working_hours && (
                <li className="flex items-start gap-2">
                  <Clock size={16} className="mt-0.5 shrink-0 text-[var(--rs-brand)]" />
                  <span>{s.working_hours}</span>
                </li>
              )}
              {s.warranty_years && (
                <li className="flex items-start gap-2">
                  <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[var(--rs-brand)]" />
                  <span>Гарантия {s.warranty_years} лет {s.warranty_subject || "на конструктив"}</span>
                </li>
              )}
              {s.telegram_url && (
                <li className="flex items-start gap-2">
                  <Send size={16} className="mt-0.5 shrink-0 text-[var(--rs-brand)]" />
                  <a href={s.telegram_url} target="_blank" rel="noopener" className="hover:text-[var(--rs-brand)]">Telegram</a>
                </li>
              )}
              {s.whatsapp_url && (
                <li className="flex items-start gap-2">
                  <MessageCircle size={16} className="mt-0.5 shrink-0 text-[var(--rs-brand)]" />
                  <a href={s.whatsapp_url} target="_blank" rel="noopener" className="hover:text-[var(--rs-brand)]">WhatsApp</a>
                </li>
              )}
              {s.max_url && (
                <li className="flex items-start gap-2">
                  <MessageSquare size={16} className="mt-0.5 shrink-0 text-[var(--rs-brand)]" />
                  <a href={s.max_url} target="_blank" rel="noopener" className="hover:text-[var(--rs-brand)]">MAX</a>
                </li>
              )}
              {s.vk_url && (
                <li className="flex items-start gap-2">
                  <Users size={16} className="mt-0.5 shrink-0 text-[var(--rs-brand)]" />
                  <a href={s.vk_url} target="_blank" rel="noopener" className="hover:text-[var(--rs-brand)]">ВКонтакте</a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--rs-line)] text-[12px] text-[var(--rs-muted)] flex flex-wrap gap-x-6 gap-y-2">
          <span>© {year} {s.site_name}. Все права защищены.</span>
          {s.legal_name && <span>{s.legal_name}</span>}
          {s.inn && <span>ИНН {s.inn}</span>}
          {s.ogrnip && <span>ОГРНИП {s.ogrnip}</span>}
        </div>
      </div>
    </footer>
  );
}
