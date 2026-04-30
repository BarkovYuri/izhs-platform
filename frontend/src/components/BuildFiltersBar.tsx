"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { BuildListItem, BuildStatus } from "@/types/api";
import BuildCard from "@/components/BuildCard";
import { SlidersHorizontal, X } from "lucide-react";

const STATUS_OPTIONS: { id: "all" | BuildStatus; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "available", label: "Готовые" },
  { id: "building", label: "Строятся" },
  { id: "planned", label: "Проекты" },
];

const FLOORS_OPTIONS = [0, 1, 2, 3];
const SORT_OPTIONS = [
  { id: "default", label: "По умолчанию" },
  { id: "price-asc", label: "Цена ↑" },
  { id: "price-desc", label: "Цена ↓" },
  { id: "area-asc", label: "Площадь ↑" },
  { id: "area-desc", label: "Площадь ↓" },
] as const;

type SortId = (typeof SORT_OPTIONS)[number]["id"];
type StatusId = "all" | BuildStatus;

function readStatus(v: string | null): StatusId {
  return ["all", "available", "building", "planned", "sold"].includes(v ?? "")
    ? (v as StatusId) : "all";
}
function readSort(v: string | null): SortId {
  return SORT_OPTIONS.some((o) => o.id === v) ? (v as SortId) : "default";
}
function readFloors(v: string | null): number {
  const n = Number(v);
  return Number.isFinite(n) && [0, 1, 2, 3].includes(n) ? n : 0;
}

export default function BuildFiltersBar({ builds }: { builds: BuildListItem[] }) {
  const router = useRouter();
  const params = useSearchParams();

  const [status, setStatus] = useState<StatusId>(() => readStatus(params.get("status")));
  const [floors, setFloors] = useState<number>(() => readFloors(params.get("floors")));
  const [sort, setSort] = useState<SortId>(() => readSort(params.get("sort")));
  const [showFilters, setShowFilters] = useState(false);

  // Синхронизация state → URL (replace, без записи в history)
  useEffect(() => {
    const next = new URLSearchParams();
    if (status !== "all") next.set("status", status);
    if (floors > 0) next.set("floors", String(floors));
    if (sort !== "default") next.set("sort", sort);
    const qs = next.toString();
    const url = qs ? `?${qs}` : window.location.pathname;
    router.replace(url, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, floors, sort]);

  const filtered = useMemo(() => {
    let arr = builds.slice();
    if (status !== "all") arr = arr.filter((b) => b.status === status);
    if (floors > 0) arr = arr.filter((b) => b.floors === floors);
    switch (sort) {
      case "price-asc": arr.sort((a, b) => Number(a.price) - Number(b.price)); break;
      case "price-desc": arr.sort((a, b) => Number(b.price) - Number(a.price)); break;
      case "area-asc": arr.sort((a, b) => Number(a.area) - Number(b.area)); break;
      case "area-desc": arr.sort((a, b) => Number(b.area) - Number(a.area)); break;
    }
    return arr;
  }, [builds, status, floors, sort]);

  const hasActiveFilters = status !== "all" || floors > 0 || sort !== "default";

  function reset() {
    setStatus("all");
    setFloors(0);
    setSort("default");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="text-[14px] text-[var(--rs-muted)]">
          Найдено: <b className="text-[var(--rs-ink)]">{filtered.length}</b>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button onClick={reset} className="btn-ghost py-2 text-[13px]">
              <X size={14} /> Сбросить
            </button>
          )}
          <select
            className="input-rs py-2 text-[13px] w-auto"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortId)}
          >
            {SORT_OPTIONS.map((o) => (<option key={o.id} value={o.id}>{o.label}</option>))}
          </select>
          <button
            className="btn-secondary py-2 text-[13px] md:hidden"
            onClick={() => setShowFilters((v) => !v)}
          >
            <SlidersHorizontal size={14} /> Фильтры
          </button>
        </div>
      </div>

      <div className={`${showFilters ? "" : "hidden md:flex"} flex-wrap gap-3 mb-6 card-rs p-4`}>
        <FilterGroup label="Статус">
          <Pills
            options={STATUS_OPTIONS.map((o) => ({ value: o.id, label: o.label }))}
            value={status}
            onChange={(v) => setStatus(v as StatusId)}
          />
        </FilterGroup>
        <FilterGroup label="Этажность">
          <Pills
            options={FLOORS_OPTIONS.map((n) => ({ value: String(n), label: n === 0 ? "Все" : `${n} эт.` }))}
            value={String(floors)}
            onChange={(v) => setFloors(Number(v))}
          />
        </FilterGroup>
      </div>

      {filtered.length === 0 ? (
        <div className="card-rs p-10 text-center text-[var(--rs-muted)]">
          По выбранным фильтрам ничего не найдено.
          {hasActiveFilters && (
            <div className="mt-3">
              <button onClick={reset} className="btn-secondary text-[13px]">Сбросить фильтры</button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b) => <BuildCard key={b.slug} b={b} />)}
        </div>
      )}
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[12px] uppercase tracking-wide text-[var(--rs-muted)] font-bold">{label}</span>
      {children}
    </div>
  );
}

function Pills({
  options, value, onChange,
}: { options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 rounded-full text-[13px] font-semibold border transition ${
            value === o.value
              ? "bg-[var(--rs-brand)] text-white border-[var(--rs-brand)]"
              : "bg-white text-[var(--rs-ink)] border-[var(--rs-line)] hover:border-[var(--rs-brand)]"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
