"use client";

import { useState } from "react";
import { cn, formatPrice } from "@/lib/utils";
import Gallery from "@/components/Gallery";
import type { BuildDetail } from "@/types/api";

const TABS = [
  { id: "specs", label: "Характеристики" },
  { id: "plans", label: "Планировки" },
  { id: "facades", label: "Фасады" },
  { id: "estimate", label: "Сметный расчёт" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function BuildSpecsTabs({ build }: { build: BuildDetail }) {
  const [tab, setTab] = useState<TabId>("specs");

  const hasPlans = (build.floor_plans?.length ?? 0) > 0;
  const hasFacades = (build.facades?.length ?? 0) > 0;
  const hasEstimate = (build.estimate_items ?? []).some(
    (r) => Number(r.materials_cost) > 0 || Number(r.works_cost) > 0
  );

  // Все 4 панели всегда рендерятся в DOM — переключаем видимость
  // через CSS. Это даёт поисковикам полный HTML со всеми данными:
  // характеристики, планировки, фасады, смета — всё индексируется.
  // UX-эффект таб-переключения для пользователя сохраняется.
  return (
    <div>
      <div
        role="tablist"
        aria-label="Информация о проекте"
        className="flex gap-2 overflow-x-auto pb-1 mb-6 border-b border-[var(--rs-line)] w-full max-w-full"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            id={`tab-${t.id}`}
            onClick={() => setTab(t.id)}
            className={cn(
              "shrink-0 px-4 py-3 text-[14px] font-bold border-b-2 -mb-px transition",
              tab === t.id
                ? "border-[var(--rs-brand)] text-[var(--rs-ink)]"
                : "border-transparent text-[var(--rs-muted)] hover:text-[var(--rs-ink)]"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Panel id="specs" active={tab === "specs"}>
        <div className="grid gap-4 md:grid-cols-2">
          <SpecsCard title="Основные характеристики" specs={build.specs_main} />
          <SpecsCard title="Подключение к сетям" specs={build.specs_networks} />
          <SpecsCard title="Объёмно-планировочные решения" specs={build.specs_layout} />
          <SpecsCard title="Конструктивные решения" specs={build.specs_struct} />
        </div>
      </Panel>

      <Panel id="plans" active={tab === "plans"}>
        {hasPlans ? <Gallery items={build.floor_plans} />
                  : <Empty>Поэтажные планы скоро появятся</Empty>}
      </Panel>

      <Panel id="facades" active={tab === "facades"}>
        {hasFacades ? <Gallery items={build.facades} />
                    : <Empty>Схемы фасадов скоро появятся</Empty>}
      </Panel>

      <Panel id="estimate" active={tab === "estimate"}>
        {hasEstimate ? <EstimateTable rows={build.estimate_items} />
                     : <Empty>Сметный расчёт уточняется индивидуально под клиента</Empty>}
      </Panel>
    </div>
  );
}

function Panel({
  id, active, children,
}: { id: string; active: boolean; children: React.ReactNode }) {
  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      hidden={!active}
    >
      {children}
    </div>
  );
}

function SpecsCard({ title, specs }: { title: string; specs: Record<string, string> }) {
  const entries = Object.entries(specs || {}).filter(([k, v]) => k.trim() && v.trim());
  if (entries.length === 0) {
    return (
      <section className="card-rs p-6">
        <h3 className="font-bold text-[17px] mb-3 tracking-tight">{title}</h3>
        <div className="text-[13px] text-[var(--rs-muted)]">Уточняется</div>
      </section>
    );
  }
  return (
    <section className="card-rs p-6">
      <h3 className="font-bold text-[17px] mb-5 tracking-tight">{title}</h3>
      <dl className="divide-y divide-[var(--rs-line)]">
        {entries.map(([k, v]) => (
          <div key={k} className="py-3.5 first:pt-0 last:pb-0">
            <dt className="text-[11px] uppercase tracking-[0.08em] text-[var(--rs-muted)] font-semibold leading-snug">
              {k}
            </dt>
            <dd className="mt-1.5 text-[15px] font-semibold text-[var(--rs-ink)] leading-snug break-words">
              {v}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="card-rs p-10 text-center text-[var(--rs-muted)]">{children}</div>
  );
}

function EstimateTable({ rows }: { rows: BuildDetail["estimate_items"] }) {
  const sorted = rows.slice().sort((a, b) => a.order - b.order);
  const sumM = sorted.reduce((a, r) => a + Number(r.materials_cost || 0), 0);
  const sumW = sorted.reduce((a, r) => a + Number(r.works_cost || 0), 0);
  return (
    <section className="card-rs p-2 sm:p-5 overflow-x-auto">
      <table className="w-full text-[14px]">
        <thead>
          <tr className="text-left text-[var(--rs-muted)] text-[12px] uppercase">
            <th className="px-3 py-3">Этап</th>
            <th className="px-3 py-3">Материалы</th>
            <th className="px-3 py-3">Работы</th>
            <th className="px-3 py-3">Итого</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => (
            <tr key={i} className="border-t border-[var(--rs-line)]">
              <td className="px-3 py-3 font-medium">{r.stage_title}</td>
              <td className="px-3 py-3">{Number(r.materials_cost) > 0 ? formatPrice(r.materials_cost) : "—"}</td>
              <td className="px-3 py-3">{Number(r.works_cost) > 0 ? formatPrice(r.works_cost) : "—"}</td>
              <td className="px-3 py-3 font-bold">{Number(r.total) > 0 ? formatPrice(r.total) : "—"}</td>
            </tr>
          ))}
          <tr className="border-t-2 border-[var(--rs-line)] bg-[var(--rs-bg)]">
            <td className="px-3 py-3 font-bold">Всего</td>
            <td className="px-3 py-3 font-bold">{formatPrice(sumM)}</td>
            <td className="px-3 py-3 font-bold">{formatPrice(sumW)}</td>
            <td className="px-3 py-3 font-bold text-[var(--rs-brand)]">{formatPrice(sumM + sumW)}</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}
