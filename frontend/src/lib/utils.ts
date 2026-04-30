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
