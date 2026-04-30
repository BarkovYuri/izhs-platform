"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { cn, formatPhoneHref } from "@/lib/utils";
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const siteName = settings.site_name;
  const phone = settings.phone;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-200",
        scrolled
          ? "bg-[var(--rs-bg)]/85 backdrop-blur-md border-b border-[var(--rs-line)]"
          : "bg-transparent",
      )}
    >
      <div className="container-rs flex items-center justify-between gap-3 py-3">
        <Link href="/" className="flex items-center gap-3" aria-label="На главную">
          <div className="relative h-9 w-9 overflow-hidden rounded-lg bg-[var(--rs-brand)]/10">
            <Image src="/logo.png" alt={siteName} fill className="object-contain p-1" priority />
          </div>
          <div className="leading-tight">
            <div className="font-extrabold text-[15px] tracking-tight">{siteName}</div>
            <div className="text-[11px] text-[var(--rs-muted)] hidden sm:block">Кирпичные дома в Кисловке</div>
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
          className="md:hidden btn-ghost p-2"
          onClick={() => setOpen(true)}
          aria-label="Открыть меню"
        >
          <Menu size={24} />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-[var(--rs-bg)] md:hidden overflow-y-auto">
          <div className="container-rs flex items-center justify-between py-3">
            <Link href="/" onClick={() => setOpen(false)} className="font-extrabold text-[15px]">
              {siteName}
            </Link>
            <button onClick={() => setOpen(false)} className="btn-ghost p-2" aria-label="Закрыть">
              <X size={24} />
            </button>
          </div>
          <div className="container-rs flex flex-col gap-1 py-6">
            {NAV.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                onClick={() => setOpen(false)}
                className="py-3 text-[20px] font-semibold border-b border-[var(--rs-line)]"
              >
                {it.label}
              </Link>
            ))}
            <div className="mt-6 flex flex-col gap-3" onClick={() => setOpen(false)}>
              <WriteUsButton settings={settings} variant="primary" label="Написать нам" className="w-full [&_>button]:w-full [&_>button]:justify-center" />
              {phone && (
                <a href={formatPhoneHref(phone)} className="btn-secondary justify-center">
                  <Phone size={18} /> {phone}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
