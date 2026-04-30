import type { PageContent } from "@/types/api";

/**
 * Берёт значение из PageContent, если оно непустое, иначе fallback.
 * Используется на страницах, чтобы при пустом поле в админке
 * показывался текущий хардкод (а не пустота).
 */
export function pickText(
  pc: PageContent | undefined | null,
  field: keyof PageContent,
  fallback: string,
): string {
  const v = pc?.[field];
  return typeof v === "string" && v.trim() ? v : fallback;
}
