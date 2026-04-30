import Link from "next/link";
import { ArrowRight, Award, MapPin } from "lucide-react";
import type { SiteSettings } from "@/types/api";
import WriteUsButton from "@/components/WriteUsButton";

export default function Hero({ s }: { s: SiteSettings }) {
  const foundedYear = s.founded_year || 2016;
  const homesBuilt = s.homes_built_total || 30;
  const settlementBuilt = s.settlement_homes_built || 12;
  const settlementTotal = s.settlement_homes_total || 40;
  return (
    <section className="relative isolate">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 80% at 70% 0%, rgba(184,90,53,0.10), transparent 60%)," +
            "radial-gradient(50% 60% at 0% 100%, rgba(91,107,65,0.10), transparent 60%)," +
            "linear-gradient(180deg, var(--rs-bg) 0%, #f6efde 100%)",
        }}
      />
      <div
        className="absolute inset-0 -z-10 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(31,28,24,1) 1px, transparent 1px), linear-gradient(90deg, rgba(31,28,24,1) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="container-rs pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 badge badge-brand">
              <MapPin size={14} />
              Посёлок «{s.settlement_name}», {s.settlement_location}
            </div>
            <div className="inline-flex items-center gap-1.5 badge badge-olive">
              <Award size={13} />
              На рынке с {foundedYear} года
            </div>
          </div>

          <h1 className="h-display mt-5 text-[40px] sm:text-[64px] font-extrabold">
            Кирпичные дома{" "}
            <span className="text-[var(--rs-brand)]">под ваш стиль жизни</span>
          </h1>

          <p className="mt-6 text-[16px] sm:text-[18px] leading-relaxed text-[var(--rs-muted)] max-w-2xl">
            6 типовых проектов с возможностью индивидуальной доработки. Скважина и септик в комплекте.
            Строим на участках посёлка «{s.settlement_name}» или на вашей земле.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/builds" className="btn-primary">
              Смотреть проекты <ArrowRight size={16} />
            </Link>
            <WriteUsButton settings={s} variant="secondary" label="Написать нам" />
          </div>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-[13px]">
            <Stat value={`${homesBuilt}+`} label="построено домов" />
            <Stat
              value={`${settlementBuilt}/${settlementTotal}`}
              label={`в посёлке «${s.settlement_name}»`}
            />
            <Stat value="100%" label="кирпич" />
            <Stat value="индивид." label="доработка проекта" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-extrabold text-[20px] text-[var(--rs-ink)]">{value}</div>
      <div className="text-[12px] uppercase tracking-wide text-[var(--rs-muted)]">{label}</div>
    </div>
  );
}
