"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import PrivacyLink from "@/components/PrivacyLink";

const STORAGE_KEY = "cookie-consent";

/**
 * Cookie-баннер по 152-ФЗ.
 *
 * Показывается один раз при первом заходе. После клика «Понятно»
 * или крестика сохраняет согласие в localStorage и больше не
 * показывается.
 *
 * НЕ блокирует Метрику до согласия — этот вариант юридически
 * достаточен (факт уведомления + ссылка на политику есть, а
 * закрытие баннера фиксирует acknowledgement).
 */
export default function CookieBanner() {
  // mounted=false при первом рендере (избегаем SSR mismatch).
  // visible=false до тех пор, пока не сработала плавная анимация —
  // на mount флаги меняются с задержкой, баннер плавно «выезжает».
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === "accepted") return;
    } catch {
      // localStorage недоступен (privacy mode, iframe) — показываем,
      // это безопаснее, чем молча игнорировать.
    }
    setMounted(true);
    // Двойной requestAnimationFrame даёт DOM время отрендерить
    // компонент в начальном (скрытом) состоянии до того, как
    // включится translate-y-0 — иначе анимации не будет.
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      // Если запись не удалась — просто закрываем для текущей сессии.
    }
    setVisible(false);
    // Даём анимации closing-вниз доиграть, потом отмонтируем.
    setTimeout(() => setMounted(false), 250);
  };

  if (!mounted) return null;

  return (
    <div
      role="dialog"
      aria-label="Уведомление об использовании cookies"
      className={`fixed bottom-3 left-3 right-3 sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-[360px] z-40 transition-all duration-300 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <div className="card-rs p-4 sm:p-5 shadow-xl border border-[var(--rs-line)]">
        <div className="flex items-start justify-between gap-3">
          <div className="text-[12px] uppercase tracking-wide text-[var(--rs-brand)] font-bold">
            Cookies
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Закрыть"
            className="-mt-1 -mr-1 p-1 text-[var(--rs-muted)] hover:text-[var(--rs-ink)] transition"
          >
            <X size={16} />
          </button>
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-[var(--rs-ink)]">
          Сайт использует cookies и Яндекс.Метрику для удобства
          пользования и анализа аудитории. Подробнее в{" "}
          <PrivacyLink className="text-[var(--rs-brand)] underline-offset-2 hover:underline cursor-pointer">
            Политике обработки персональных данных
          </PrivacyLink>
          .
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="btn-primary mt-4 w-full justify-center !py-2 !text-[14px]"
        >
          Понятно
        </button>
      </div>
    </div>
  );
}
