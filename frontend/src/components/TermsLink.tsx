"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import TermsContent from "@/components/TermsContent";
import { getSettings } from "@/services/api";
import type { SiteSettings } from "@/types/api";

export default function TermsLink({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [s, setS] = useState<SiteSettings | null>(null);

  useEffect(() => {
    if (!open || s) return;
    getSettings().then(setS).catch(() => setS(null));
  }, [open, s]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ?? "text-[var(--rs-brand)] hover:underline cursor-pointer"
        }
      >
        {children ?? "Пользовательское соглашение"}
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Пользовательское соглашение"
      >
        {s ? (
          <TermsContent s={s} />
        ) : (
          <div className="py-8 text-center text-[var(--rs-muted)]">Загрузка…</div>
        )}
      </Modal>
    </>
  );
}
