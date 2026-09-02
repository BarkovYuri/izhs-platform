"use client";

import { useEffect, useState } from "react";

/** 1 слайд на мобильных, 2 — от sm и шире. */
export function useItemsPerView(breakpointPx = 640, wide = 2, narrow = 1): number {
  const [itemsPerView, setItemsPerView] = useState(narrow);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${breakpointPx}px)`);
    const update = () => setItemsPerView(mq.matches ? wide : narrow);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpointPx, wide, narrow]);
  return itemsPerView;
}

/**
 * Бесконечная карусель «показываем N штук, листаем по одной, по кругу».
 * Технически: к массиву в конец приклеивается ещё N первых элементов
 * (клон) — когда трек доезжает до клона (index === count), это
 * визуально неотличимо от начала, и мы мгновенно (без transition)
 * возвращаем index на 0. Для «назад» с нулевой позиции — обратный
 * трюк: мгновенно прыгаем на клон в конце, затем на следующем кадре
 * анимированно откатываемся на один шаг — получается бесшовный
 * реверс без второго набора клонов.
 */
export function useLoopCarousel(count: number, itemsPerView: number, autoplayMs = 5000) {
  const canLoop = count > itemsPerView && count > 0;
  const [rawIndex, setIndex] = useState(0);
  const [noTransition, setNoTransition] = useState(false);
  const [paused, setPaused] = useState(false);

  // Производное значение, не отдельный effect+setState: если карусель
  // не листается (itemsPerView подрос на резайзе — все влезли в одну
  // строку), всегда показываем позицию 0, чем бы ни был rawIndex —
  // он просто «ждёт» и продолжит работать, если canLoop снова станет true.
  const index = canLoop ? rawIndex : 0;

  useEffect(() => {
    if (!canLoop || paused) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((i) => Math.min(i + 1, count)), autoplayMs);
    return () => clearInterval(id);
  }, [canLoop, paused, autoplayMs, count]);

  useEffect(() => {
    if (!noTransition) return;
    const raf = requestAnimationFrame(() => setNoTransition(false));
    return () => cancelAnimationFrame(raf);
  }, [noTransition]);

  const handleTransitionEnd = () => {
    if (canLoop && index === count) {
      setNoTransition(true);
      setIndex(0);
    }
  };

  const goNext = () => {
    // Клэмп на count — без него быстрые повторные клики уводили index
    // за пределы клонированного «хвоста» массива (длина count+itemsPerView)
    // быстрее, чем успевал сработать onTransitionEnd со сбросом на 0.
    // Рендерился несуществующий элемент — карусель выглядела пустой.
    if (canLoop) setIndex((i) => Math.min(i + 1, count));
  };

  const goPrev = () => {
    if (!canLoop) return;
    if (index === 0) {
      setNoTransition(true);
      setIndex(count);
      requestAnimationFrame(() => {
        setNoTransition(false);
        setIndex(count - 1);
      });
    } else {
      setIndex((i) => i - 1);
    }
  };

  const goTo = (i: number) => setIndex(i);

  const activeDot = count > 0 ? index % count : 0;

  return { index, noTransition, paused, setPaused, goNext, goPrev, goTo, handleTransitionEnd, activeDot, canLoop };
}
