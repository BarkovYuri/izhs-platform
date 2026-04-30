"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { formatPhoneHref } from "@/lib/utils";
import WriteUsButton from "@/components/WriteUsButton";
import type { SiteSettings } from "@/types/api";

type NavLink = { href: string; label: string };

const NAV: NavLink[] = [
  { href: "/builds", label: "Проекты" },
  { href: "/settlement", label: "Посёлок" },
  { href: "/about", label: "О компании" },
  { href: "/faq", label: "Вопросы" },
  { href: "/contacts", label: "Контакты" },
];

export default function Navbar({ settings }: { settings: SiteSettings }) {
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const tickingRef = useRef(false);

  // Scroll-class через rAF + прямую манипуляцию DOM (без setState на каждый
  // пиксель — это и был источник лага на mobile).
  useEffect(() => {
    const update = () => {
      tickingRef.current = false;
      const el = headerRef.current;
      if (!el) return;
      const scrolled = window.scrollY > 8;
      el.classList.toggle("nav-scrolled", scrolled);
    };
    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Блокировка scroll body при открытом мобильном меню.
  // Сохраняем/восстанавливаем top, чтобы избежать прыжка на iOS Safari.
  useEffect(() => {
    if (!open) return;
    const y = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${y}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      window.scrollTo(0, y);
    };
  }, [open]);

  const siteName = settings.site_name;
  const phone = settings.phone;

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 nav-header transition-colors duration-150"
    >
      <div className="container-rs flex items-center justify-between gap-3 py-3">
        <Link href="/" className="flex items-center gap-3" aria-label="На главную">
          <div className="relative h-9 w-9 overflow-hidden rounded-lg bg-[var(--rs-brand)]/10 shrink-0">
            <Image
              src="/logo.png"
              alt={siteName}
              fill
              sizes="36px"
              className="object-contain p-1"
              priority
            />
          </div>
          <div className="leading-tight min-w-0">
            <div className="font-extrabold text-[15px] tracking-tight truncate">{siteName}</div>
            <div className="text-[11px] text-[var(--rs-muted)] hidden sm:block truncate">
              Кирпичные дома в Кисловке
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((it) => (
            <Link key={it.href} href={it.href} className="btn-ghost text-[14px]">
              {it.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <WriteUsButton settings={settings} variant="primary" label="Написать" />
        </div>

        <button
          type="button"
          className="md:hidden btn-ghost p-2 -mr-2"
          onClick={() => setOpen(true)}
          aria-label="Открыть меню"
        >
          <Menu size={24} />
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-[var(--rs-bg)] md:hidden overflow-y-auto"
          // touchAction чтобы iOS не пытался скроллить body под меню
          style={{ touchAction: "pan-y" }}
        >
          <div className="container-rs flex items-center justify-between py-3 border-b border-[var(--rs-line)]">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 font-extrabold text-[15px]"
            >
              <div className="relative h-9 w-9 overflow-hidden rounded-lg bg-[var(--rs-brand)]/10 shrink-0">
                <Image src="/logo.png" alt={siteName} fill sizes="36px" className="object-contain p-1" />
              </div>
              {siteName}
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn-ghost p-2 -mr-2"
              aria-label="Закрыть меню"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="container-rs flex flex-col py-2">
            {NAV.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                onClick={() => setOpen(false)}
                className="py-3.5 text-[18px] font-semibold border-b border-[var(--rs-line)]"
              >
                {it.label}
              </Link>
            ))}
          </nav>

          <div className="container-rs flex flex-col gap-3 mt-4 pb-10">
            <WriteUsButton
              settings={settings}
              variant="primary"
              label="Написать нам"
              className="w-full [&>button]:w-full [&>button]:justify-center"
            />
            {phone && (
              <a
                href={formatPhoneHref(phone)}
                onClick={() => setOpen(false)}
                className="btn-secondary justify-center"
              >
                <Phone size={18} /> {phone}
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
