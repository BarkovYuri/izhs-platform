"use client";

import { useMemo, useState } from "react";
import { formatPrice } from "@/lib/utils";

const DEFAULT_PRICE = 8_500_000;
const DEFAULT_DOWN_PERCENT = 20;
const DEFAULT_RATE = 8; // семейная ипотека — частый сценарий для этой аудитории
const DEFAULT_YEARS = 30; // максимальный срок — минимальный платёж, меньше пугает с порога

function annuityPayment(principal: number, annualRatePercent: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  if (annualRatePercent <= 0) return principal / months;
  const r = annualRatePercent / 100 / 12;
  const factor = Math.pow(1 + r, months);
  return (principal * r * factor) / (factor - 1);
}

export default function MortgageCalculator({
  initialPrice = DEFAULT_PRICE,
  compact = false,
}: {
  initialPrice?: number;
  compact?: boolean;
}) {
  const [price, setPrice] = useState(Math.round(initialPrice));
  const [downPercent, setDownPercent] = useState(DEFAULT_DOWN_PERCENT);
  const [years, setYears] = useState(DEFAULT_YEARS);
  const [rate, setRate] = useState(DEFAULT_RATE);

  const { downPayment, principal, monthlyPayment } = useMemo(() => {
    const down = Math.round((price * downPercent) / 100);
    const loan = Math.max(price - down, 0);
    const months = years * 12;
    const monthly = annuityPayment(loan, rate, months);
    return {
      downPayment: down,
      principal: loan,
      monthlyPayment: monthly,
    };
  }, [price, downPercent, years, rate]);

  return (
    <div className={compact ? "" : "card-rs p-5 sm:p-8"}>
      <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
        <Field label="Стоимость дома" value={`${formatPrice(price)}`}>
          <input
            type="range"
            min={2_000_000}
            max={25_000_000}
            step={100_000}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="range-rs"
          />
        </Field>

        <Field label="Первоначальный взнос" value={`${downPercent}% · ${formatPrice(downPayment)}`}>
          <input
            type="range"
            min={10}
            max={70}
            step={5}
            value={downPercent}
            onChange={(e) => setDownPercent(Number(e.target.value))}
            className="range-rs"
          />
        </Field>

        <Field label="Срок кредита" value={`${years} лет`}>
          <input
            type="range"
            min={1}
            max={30}
            step={1}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="range-rs"
          />
        </Field>

        <Field label="Ставка, % годовых" value={`${rate}%`}>
          <input
            type="range"
            min={2}
            max={20}
            step={0.1}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="range-rs"
          />
        </Field>
      </div>

      <div className="mt-6 sm:mt-8 pt-6 border-t border-[var(--rs-line)] grid gap-4 sm:grid-cols-2">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-[var(--rs-muted)]">Платёж в месяц</div>
          <div
            className="font-extrabold text-[var(--rs-brand)] leading-tight"
            style={{ fontSize: "clamp(22px, 5vw, 30px)" }}
          >
            {formatPrice(Math.round(monthlyPayment))}
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wide text-[var(--rs-muted)]">Сумма кредита</div>
          <div className="font-bold text-[18px] sm:text-[20px]">{formatPrice(principal)}</div>
        </div>
      </div>

      <p className="mt-4 text-[12px] text-[var(--rs-muted)] leading-relaxed">
        Расчёт приблизительный и не является публичной офертой (ст. 437 ГК РФ). Точная ставка
        и условия зависят от программы и банка — уточняйте у партнёров при заключении договора.
      </p>
    </div>
  );
}

function Field({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label className="text-[13px] text-[var(--rs-muted)]">{label}</label>
        <span className="font-bold text-[14px] whitespace-nowrap">{value}</span>
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}
