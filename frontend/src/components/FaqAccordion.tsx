"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FaqCategory } from "@/types/api";
import { cn } from "@/lib/utils";

export default function FaqAccordion({ categories }: { categories: FaqCategory[] }) {
  const flat = categories.flatMap((c) => c.items.map((it) => ({ ...it, _cat: c.title })));
  if (flat.length === 0) {
    return <div className="text-[var(--rs-muted)]">Скоро добавим вопросы.</div>;
  }
  return (
    <div className="grid gap-8">
      {categories.map((cat) =>
        cat.items.length === 0 ? null : (
          <section key={cat.id}>
            {cat.title && (
              <h3 className="font-extrabold text-[20px] mb-3 tracking-tight">{cat.title}</h3>
            )}
            <div className="grid gap-2">
              {cat.items.map((item) => (
                <FaqRow key={item.id} q={item.question} a={item.answer} />
              ))}
            </div>
          </section>
        )
      )}
    </div>
  );
}

function FaqRow({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card-rs overflow-hidden">
      <button
        className="w-full flex items-start justify-between gap-3 p-5 text-left hover:bg-[var(--rs-bg)] transition"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="font-bold text-[15px]">{q}</span>
        <ChevronDown size={20} className={cn("shrink-0 mt-0.5 transition-transform text-[var(--rs-muted)]", open && "rotate-180")} />
      </button>
      {open && (
        <div className="px-5 pb-5 text-[14px] leading-relaxed text-[var(--rs-muted)] whitespace-pre-line">
          {a}
        </div>
      )}
    </div>
  );
}
