"use client";

import { useEffect, useRef, useState } from "react";
import { Mail, MessageCircle, MessageSquare, Phone, Send, Users, X } from "lucide-react";
import type { SiteSettings } from "@/types/api";
import { cn, formatPhoneHref } from "@/lib/utils";

type Channel = {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  hint?: string;
  color: string; // фон-tint иконки
};

function buildChannels(s: SiteSettings): Channel[] {
  const list: Channel[] = [];
  if (s.telegram_url) {
    list.push({
      id: "tg", label: "Telegram", hint: "Быстрый ответ", href: s.telegram_url,
      icon: <Send size={18} />, color: "#229ED9",
    });
  }
  if (s.whatsapp_url) {
    list.push({
      id: "wa", label: "WhatsApp", href: s.whatsapp_url,
      icon: <MessageCircle size={18} />, color: "#25D366",
    });
  }
  if (s.max_url) {
    list.push({
      id: "max", label: "MAX", hint: "Российский мессенджер", href: s.max_url,
      icon: <MessageSquare size={18} />, color: "#7B61FF",
    });
  }
  if (s.vk_url) {
    list.push({
      id: "vk", label: "ВКонтакте", href: s.vk_url,
      icon: <Users size={18} />, color: "#0077FF",
    });
  }
  if (s.email) {
    list.push({
      id: "email", label: s.email, href: `mailto:${s.email}`,
      icon: <Mail size={18} />, color: "#6a635a",
    });
  }
  if (s.phone) {
    list.push({
      id: "phone", label: s.phone, hint: "Если предпочитаете звонок",
      href: formatPhoneHref(s.phone),
      icon: <Phone size={18} />, color: "#5b6b41",
    });
  }
  return list;
}

export default function WriteUsButton({
  settings,
  variant = "primary",
  label = "Написать",
  className,
}: {
  settings: SiteSettings;
  variant?: "primary" | "secondary" | "ghost";
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const channels = buildChannels(settings);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (channels.length === 0) return null;

  const btnClass =
    variant === "primary" ? "btn-primary" :
    variant === "secondary" ? "btn-secondary" :
    "btn-ghost";

  return (
    <div className={cn("relative inline-block", className)} ref={ref}>
      <button
        type="button"
        className={btnClass}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <MessageSquare size={16} /> {label}
      </button>

      {open && (
        <>
          {/* Backdrop на mobile — затемнение фона + клик для закрытия */}
          <div
            className="fixed inset-0 z-40 bg-black/40 sm:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            role="menu"
            className={cn(
              // Mobile: bottom-sheet снизу экрана.
              "fixed inset-x-3 bottom-3 z-50 card-rs p-2 shadow-2xl",
              // Desktop (sm+): обычный dropdown справа от кнопки.
              "sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:mt-2 sm:min-w-[280px] sm:max-w-[320px]",
              "sm:z-50",
              "max-h-[80vh] overflow-y-auto",
            )}
          >
            <div className="px-3 py-2 flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wide text-[var(--rs-muted)] font-bold">
                Выберите способ
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="sm:hidden btn-ghost p-1 -mr-1"
                aria-label="Закрыть"
              >
                <X size={18} />
              </button>
            </div>
          <ul className="grid">
            {channels.map((c) => (
              <li key={c.id}>
                <a
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-[var(--rs-bg)] transition"
                >
                  <span
                    className="grid place-items-center w-10 h-10 rounded-lg shrink-0 text-white"
                    style={{ background: c.color }}
                  >
                    {c.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-[15px] sm:text-[14px] truncate">{c.label}</span>
                    {c.hint && <span className="block text-[12px] sm:text-[11px] text-[var(--rs-muted)]">{c.hint}</span>}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          </div>
        </>
      )}
    </div>
  );
}
