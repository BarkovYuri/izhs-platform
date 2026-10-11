import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value: number | string): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  return new Intl.NumberFormat("ru-RU").format(Math.round(n)) + " ₽";
}

export function formatArea(value: number | string): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  return `${n.toFixed(1)} м²`;
}

export function formatPhoneHref(phone: string): string {
  return "tel:" + phone.replace(/[^+\d]/g, "");
}

/** «до 31.12.2026» или «бессрочно» для акции без даты окончания. */
export function formatUntil(endsAt: string | null): string {
  return endsAt ? `до ${formatDate(endsAt)}` : "бессрочно";
}

export function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" }).format(d);
}

/** Склонение по числу: pluralRu(2, ["дом", "дома", "домов"]) → "дома". */
export function pluralRu(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}
