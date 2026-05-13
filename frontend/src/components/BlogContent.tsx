import { Fragment, type ReactNode } from "react";
import { resolveMediaUrl } from "@/services/api";

/**
 * Лёгкий рендерер markdown-lite для статей блога.
 *
 * Поддерживается (по строкам):
 *   ## Заголовок 2          →  <h2>
 *   ### Заголовок 3         →  <h3>
 *   > цитата                →  <blockquote>
 *   - / • строка            →  <ul><li>
 *   ---                     →  <hr>
 *   ![Подпись](url) одна    →  <figure><img><figcaption>
 *   обычная строка          →  <p>
 *
 * Поддерживается (внутри строки):
 *   **жирный**              →  <strong>
 *   *курсив*                →  <em>
 *   [текст](url)            →  <a>
 *   ![alt](url) (инлайн)    →  <img> внутри текста
 *
 * Это полностью SSR-безопасный код — без dangerouslySetInnerHTML.
 */

type Token =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "italic"; value: string }
  | { type: "link"; text: string; href: string }
  | { type: "image"; alt: string; src: string };

// Парсим инлайн-разметку строки в массив токенов.
// Простая реализация: бежим по строке и ищем спец-маркеры в порядке
// "ссылка → жирный → курсив". Можно было бы регулярками, но циклом
// надёжнее в edge-кейсах.
function tokenize(line: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  let buf = "";
  const flush = () => {
    if (buf) {
      tokens.push({ type: "text", value: buf });
      buf = "";
    }
  };

  while (i < line.length) {
    // ![alt](src) — должно идти ДО [text](url), т.к. отличается только
    // ведущим «!».
    if (line[i] === "!" && line[i + 1] === "[") {
      const close = line.indexOf("]", i + 2);
      if (close > -1 && line[close + 1] === "(") {
        const parenClose = line.indexOf(")", close + 2);
        if (parenClose > -1) {
          flush();
          const alt = line.slice(i + 2, close);
          const src = line.slice(close + 2, parenClose);
          tokens.push({ type: "image", alt, src });
          i = parenClose + 1;
          continue;
        }
      }
    }

    // [text](url)
    if (line[i] === "[") {
      const close = line.indexOf("]", i + 1);
      if (close > -1 && line[close + 1] === "(") {
        const parenClose = line.indexOf(")", close + 2);
        if (parenClose > -1) {
          flush();
          const text = line.slice(i + 1, close);
          const href = line.slice(close + 2, parenClose);
          tokens.push({ type: "link", text, href });
          i = parenClose + 1;
          continue;
        }
      }
    }

    // **bold**
    if (line.startsWith("**", i)) {
      const close = line.indexOf("**", i + 2);
      if (close > -1) {
        flush();
        tokens.push({ type: "bold", value: line.slice(i + 2, close) });
        i = close + 2;
        continue;
      }
    }

    // *italic* — но только если это не часть **
    if (
      line[i] === "*" &&
      line[i + 1] !== "*" &&
      (i === 0 || line[i - 1] !== "*")
    ) {
      const close = line.indexOf("*", i + 1);
      if (close > -1 && line[close + 1] !== "*") {
        flush();
        tokens.push({ type: "italic", value: line.slice(i + 1, close) });
        i = close + 1;
        continue;
      }
    }

    buf += line[i];
    i++;
  }
  flush();
  return tokens;
}

function renderTokens(tokens: Token[]): ReactNode {
  return tokens.map((t, i) => {
    if (t.type === "text") return <Fragment key={i}>{t.value}</Fragment>;
    if (t.type === "bold") return <strong key={i}>{t.value}</strong>;
    if (t.type === "italic") return <em key={i}>{t.value}</em>;
    if (t.type === "link") {
      const external = /^https?:\/\//.test(t.href);
      return (
        <a
          key={i}
          href={t.href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="text-[var(--rs-brand)] underline-offset-2 hover:underline"
        >
          {t.text}
        </a>
      );
    }
    if (t.type === "image") {
      // Инлайн-картинка в строке (редкий случай — обычно блок-figure).
      // Прогон через resolveMediaUrl нужен для относительных /media/ путей.
      // eslint-disable-next-line @next/next/no-img-element
      return (
        <img
          key={i}
          src={resolveMediaUrl(t.src)}
          alt={t.alt}
          className="inline-block max-h-[1.4em] align-middle mx-1"
          loading="lazy"
          decoding="async"
        />
      );
    }
    return null;
  });
}

type Block =
  | { type: "h2"; content: string; id: string }
  | { type: "h3"; content: string; id: string }
  | { type: "paragraph"; content: string }
  | { type: "blockquote"; content: string }
  | { type: "hr" }
  | { type: "list"; items: string[] }
  | { type: "figure"; src: string; alt: string }
  | { type: "table"; headers: string[]; rows: string[][] };

const FIGURE_RE = /^!\[([^\]]*)\]\(([^)]+)\)$/;

function parseTableRow(line: string): string[] {
  // Разбиваем строку «| a | b | c |» в ["a", "b", "c"].
  const parts = line.split("|").map((p) => p.trim());
  if (parts.length && parts[0] === "") parts.shift();
  if (parts.length && parts[parts.length - 1] === "") parts.pop();
  return parts;
}

const RU_TO_LAT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo",
  ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
  н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
  ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch", ъ: "",
  ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

function slugifyHeading(text: string): string {
  const out = text
    .toLowerCase()
    .replace(/[а-яё]/g, (c) => RU_TO_LAT[c] ?? "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return out || "section";
}

function parseBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  const lines = text.replace(/\r\n/g, "\n").split("\n");

  // Дедуп id для одинаковых заголовков: «Плюсы» → «plusy»,
  // «Плюсы» (второй раз) → «plusy-2» и т.д.
  const seenIds = new Set<string>();
  const makeId = (content: string): string => {
    const base = slugifyHeading(content);
    let id = base;
    let n = 2;
    while (seenIds.has(id)) {
      id = `${base}-${n}`;
      n++;
    }
    seenIds.add(id);
    return id;
  };

  let i = 0;
  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();

    if (!line) {
      i++;
      continue;
    }

    if (line === "---" || line === "***" || line === "___") {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    if (line.startsWith("## ")) {
      const content = line.slice(3).trim();
      blocks.push({ type: "h2", content, id: makeId(content) });
      i++;
      continue;
    }

    if (line.startsWith("### ")) {
      const content = line.slice(4).trim();
      blocks.push({ type: "h3", content, id: makeId(content) });
      i++;
      continue;
    }

    if (line.startsWith("> ")) {
      // Собираем многострочную цитату до пустой строки.
      const parts: string[] = [line.slice(2).trim()];
      i++;
      while (i < lines.length) {
        const next = lines[i].trim();
        if (!next.startsWith("> ")) break;
        parts.push(next.slice(2).trim());
        i++;
      }
      blocks.push({ type: "blockquote", content: parts.join(" ") });
      continue;
    }

    if (/^[-•]\s+/.test(line)) {
      const items: string[] = [line.replace(/^[-•]\s+/, "").trim()];
      i++;
      while (i < lines.length) {
        const next = lines[i].trim();
        if (!/^[-•]\s+/.test(next)) break;
        items.push(next.replace(/^[-•]\s+/, "").trim());
        i++;
      }
      blocks.push({ type: "list", items });
      continue;
    }

    // Картинка на отдельной строке → блок <figure> с подписью.
    const figureMatch = line.match(FIGURE_RE);
    if (figureMatch) {
      blocks.push({
        type: "figure",
        alt: figureMatch[1],
        src: figureMatch[2],
      });
      i++;
      continue;
    }

    // Таблица в стиле markdown:
    //   | Заголовок | Заголовок |
    //   | --- | --- |
    //   | данные | данные |
    if (
      /^\|.*\|$/.test(line) &&
      i + 1 < lines.length &&
      /^\|[\s|:-]+\|$/.test(lines[i + 1].trim()) &&
      lines[i + 1].includes("-")
    ) {
      const headers = parseTableRow(line);
      i += 2; // пропускаем заголовок + строку-разделитель
      const rows: string[][] = [];
      while (i < lines.length) {
        const next = lines[i].trim();
        if (!/^\|.*\|$/.test(next)) break;
        rows.push(parseTableRow(next));
        i++;
      }
      blocks.push({ type: "table", headers, rows });
      continue;
    }

    // Обычный абзац — собираем подряд идущие непустые строки.
    const para: string[] = [line];
    i++;
    while (i < lines.length) {
      const next = lines[i].trim();
      if (!next) break;
      // Если началась структурная разметка — стоп.
      if (
        next.startsWith("## ") ||
        next.startsWith("### ") ||
        next.startsWith("> ") ||
        /^[-•]\s+/.test(next) ||
        next === "---" ||
        next === "***" ||
        next === "___"
      ) {
        break;
      }
      para.push(next);
      i++;
    }
    blocks.push({ type: "paragraph", content: para.join(" ") });
  }

  return blocks;
}

export default function BlogContent({
  text,
  showToc = false,
}: {
  text: string;
  /** Показать блок «Содержание» вверху со ссылками на H2-разделы.
   *  TOC появляется только если в тексте 3+ H2 — иначе бессмысленно. */
  showToc?: boolean;
}) {
  if (!text) return null;
  const blocks = parseBlocks(text);

  // TOC только если 3+ заголовков второго уровня — для коротких статей
  // оглавление бессмысленно и захламляет верх.
  const tocItems = blocks
    .filter((b): b is Extract<Block, { type: "h2" }> => b.type === "h2")
    .map((b) => ({ id: b.id, content: b.content }));
  const renderToc = showToc && tocItems.length >= 3;

  return (
    <div className="prose-rs text-[15px] sm:text-[17px] leading-relaxed text-[var(--rs-ink)] space-y-5">
      {renderToc && (
        <nav
          aria-label="Содержание статьи"
          className="card-rs p-5 sm:p-6 not-prose"
        >
          <div className="text-[12px] uppercase tracking-wide text-[var(--rs-muted)] mb-3 font-bold">
            Содержание
          </div>
          <ol className="space-y-1.5 list-decimal list-inside text-[14px] sm:text-[15px] marker:text-[var(--rs-brand)] marker:font-bold">
            {tocItems.map((it) => (
              <li key={it.id}>
                <a
                  href={`#${it.id}`}
                  className="hover:text-[var(--rs-brand)] hover:underline underline-offset-2"
                >
                  {it.content}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      {blocks.map((b, i) => {
        if (b.type === "hr") {
          return (
            <hr
              key={i}
              className="my-8 border-t border-[var(--rs-line)]"
            />
          );
        }
        if (b.type === "h2") {
          return (
            <h2
              key={i}
              id={b.id}
              className="h-display mt-10 text-[24px] sm:text-[30px] font-extrabold leading-tight scroll-mt-24"
            >
              {renderTokens(tokenize(b.content))}
            </h2>
          );
        }
        if (b.type === "h3") {
          return (
            <h3
              key={i}
              id={b.id}
              className="h-display mt-6 text-[20px] sm:text-[24px] font-extrabold leading-tight scroll-mt-24"
            >
              {renderTokens(tokenize(b.content))}
            </h3>
          );
        }
        if (b.type === "blockquote") {
          return (
            <blockquote
              key={i}
              className="border-l-4 border-[var(--rs-brand)] pl-4 italic text-[var(--rs-muted)]"
            >
              {renderTokens(tokenize(b.content))}
            </blockquote>
          );
        }
        if (b.type === "list") {
          return (
            <ul key={i} className="space-y-2.5 pl-1">
              {b.items.map((it, j) => (
                <li key={j} className="flex items-start gap-2.5">
                  <span
                    className="mt-2 inline-block w-1.5 h-1.5 rounded-full bg-[var(--rs-brand)] shrink-0"
                    aria-hidden
                  />
                  <span>{renderTokens(tokenize(it))}</span>
                </li>
              ))}
            </ul>
          );
        }
        if (b.type === "table") {
          return (
            <div
              key={i}
              className="not-prose my-6 -mx-4 sm:mx-0 overflow-x-auto"
            >
              <table className="min-w-full text-[13px] sm:text-[14px] border-collapse">
                <thead>
                  <tr className="bg-[var(--rs-line)]/40">
                    {b.headers.map((h, hi) => (
                      <th
                        key={hi}
                        scope="col"
                        className="px-3 py-2.5 text-left font-bold border-b-2 border-[var(--rs-brand)] align-top"
                      >
                        {renderTokens(tokenize(h))}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {b.rows.map((row, ri) => (
                    <tr
                      key={ri}
                      className="border-b border-[var(--rs-line)] last:border-0"
                    >
                      {row.map((cell, ci) => (
                        <td
                          key={ci}
                          className="px-3 py-2 align-top"
                        >
                          {renderTokens(tokenize(cell))}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        if (b.type === "figure") {
          return (
            <figure key={i} className="my-8 -mx-4 sm:mx-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveMediaUrl(b.src)}
                alt={b.alt}
                className="w-full h-auto sm:rounded-2xl bg-[var(--rs-line)]/40"
                loading="lazy"
                decoding="async"
              />
              {b.alt && (
                <figcaption className="mt-3 px-4 sm:px-0 text-[13px] text-[var(--rs-muted)] italic text-center">
                  {b.alt}
                </figcaption>
              )}
            </figure>
          );
        }
        return (
          <p key={i} className="leading-relaxed">
            {renderTokens(tokenize(b.content))}
          </p>
        );
      })}
    </div>
  );
}
