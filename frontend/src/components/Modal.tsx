"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Modal({
  open,
  onClose,
  title,
  children,
  size = "lg",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "md" | "lg";
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Закрытие по Escape + блокировка скролла body
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    // фокус для скринридеров и для клавиатурной навигации
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const maxW = size === "md" ? "max-w-2xl" : "max-w-3xl";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] animate-[fadeIn_.15s_ease]" />

      <div
        ref={dialogRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative z-10 w-full bg-[var(--rs-bg)] sm:rounded-2xl",
          "max-h-[100dvh] sm:max-h-[88vh] overflow-y-auto",
          "shadow-2xl outline-none",
          "sm:my-6 sm:mx-4",
          maxW,
        )}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 px-5 sm:px-7 py-4 bg-[var(--rs-bg)]/95 backdrop-blur border-b border-[var(--rs-line)]">
          <h2 className="font-extrabold text-[18px] sm:text-[22px] tracking-tight">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="btn-ghost p-2 -mr-2 shrink-0"
          >
            <X size={22} />
          </button>
        </div>

        <div className="px-5 sm:px-7 py-6">{children}</div>

        <div className="sticky bottom-0 z-10 px-5 sm:px-7 py-3 bg-[var(--rs-bg)]/95 backdrop-blur border-t border-[var(--rs-line)] flex justify-end">
          <button type="button" onClick={onClose} className="btn-secondary">
            Закрыть
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </div>
  );
}
