import Link from "next/link";
import { ArrowRight, Award, CheckCircle2, MapPin } from "lucide-react";
import type { PageContent, SiteSettings } from "@/types/api";
import WriteUsButton from "@/components/WriteUsButton";
import { pickText } from "@/lib/pageContent";

const DEFAULT_HERO_SUBTITLE =
  "Проверенные типовые проекты с функциональной планировкой " +
  "• Бесплатная доработка архитектором под ваши нужды " +
  "• Скважина и септик включены в стоимость " +
  "• Строим в «Красной смородине» и на ваших участках.";

export default function Hero({
  s,
  pageContent,
}: {
  s: SiteSettings;
  pageContent?: PageContent | null;
}) {
  const foundedYear = s.founded_year || 2016;
  const homesBuilt = s.homes_built_total || 30;
  const settlementBuilt = s.settlement_homes_built || 12;
  const settlementTotal = s.settlement_homes_total || 40;

  // Subtitle берём из PageContent (можно править в админке).
  // Если пользователь разделил пункты через •, показываем как
  // список с галочками — это выглядит сильнее обычного абзаца.
  const subtitle = pickText(pageContent, "subtitle", DEFAULT_HERO_SUBTITLE);
  const bullets = subtitle.includes("•")
    ? subtitle
        .split("•")
        .map((s) => s.trim().replace(/[.,;]+$/, ""))
        .filter(Boolean)
    : null;

  return (
    <section
      className="relative isolate hero-bg"
      style={{
        // background-attachment: fixed → parallax-эффект на десктопе:
        // фон «стоит» при скролле, контент едет вверх. На mobile Safari
        // fixed не работает корректно — браузер сам падает на scroll
        // (см. CSS-фикс ниже в globals).
        backgroundImage:
          "linear-gradient(180deg, rgba(20,16,12,0.55) 0%, rgba(20,16,12,0.35) 40%, rgba(20,16,12,0.65) 100%), url('/hero-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center 60%",
        backgroundAttachment: "fixed",
        backgroundColor: "#1a1411",
      }}
    >
      <div className="container-rs pt-20 pb-24 sm:pt-28 sm:pb-32">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--rs-brand)]/90 text-white text-[12px] sm:text-[13px] font-bold border border-white/10 backdrop-blur-sm">
              <MapPin size={14} />
              ЖК «{s.settlement_name}», {s.settlement_location}
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 text-white text-[12px] sm:text-[13px] font-bold border border-white/20 backdrop-blur-sm">
              <Award size={13} />
              На рынке с {foundedYear} года
            </div>
          </div>

          <h1 className="h-display mt-5 text-[40px] sm:text-[64px] font-extrabold leading-[1.05] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
            Кирпичные дома{" "}
            <span className="text-[#f3a677]">под ваш стиль жизни</span>
          </h1>

          {bullets ? (
            <ul className="mt-6 grid gap-2.5 max-w-2xl text-[15px] sm:text-[17px] leading-snug">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-2.5">
                  <CheckCircle2
                    size={20}
                    className="text-[#f3a677] shrink-0 mt-0.5"
                  />
                  <span className="text-white/95 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
                    {b}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-[16px] sm:text-[18px] leading-relaxed text-white/85 max-w-2xl drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
              {subtitle}
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/builds" className="btn-primary shadow-lg shadow-black/30">
              Смотреть проекты <ArrowRight size={16} />
            </Link>
            <WriteUsButton
              settings={s}
              variant="secondary"
              label="Написать нам"
            />
          </div>

          <div className="mt-12 flex flex-wrap gap-x-8 gap-y-4 text-[13px]">
            <Stat value={`${homesBuilt}+`} label="построено домов" />
            <Stat
              value={`${settlementBuilt}/${settlementTotal}`}
              label={`в ЖК «${s.settlement_name}»`}
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
      <div className="font-extrabold text-[22px] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
        {value}
      </div>
      <div className="text-[12px] uppercase tracking-wide text-white/70">
        {label}
      </div>
    </div>
  );
}
