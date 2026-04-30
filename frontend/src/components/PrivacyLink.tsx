"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import PrivacyContent from "@/components/PrivacyContent";
import { getSettings } from "@/services/api";
import type { SiteSettings } from "@/types/api";

export default function PrivacyLink({ children }: { children?: React.ReactNode }) {
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
        className="text-[var(--rs-brand)] hover:underline cursor-pointer"
      >
        {children ?? "Политикой обработки персональных данных"}
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Политика обработки персональных данных"
      >
        {s ? (
          <PrivacyContent s={s} />
        ) : (
          <div className="py-8 text-center text-[var(--rs-muted)]">Загрузка…</div>
        )}
      </Modal>
    </>
  );
}
