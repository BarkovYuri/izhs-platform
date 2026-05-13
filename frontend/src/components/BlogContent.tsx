import { Fragment, type ReactNode } from "react";

/**
 * Лёгкий рендерер markdown-lite для статей блога.
 *
 * Поддерживается (по строкам):
 *   ## Заголовок 2  →  <h2>
 *   ### Заголовок 3 →  <h3>
 *   > цитата        →  <blockquote>
 *   - / • строка    →  <ul><li>
 *   ---             →  <hr>
 *   обычная строка  →  <p>
 *
 * Поддерживается (внутри строки):
 *   **жирный**       →  <strong>
 *   *курсив*         →  <em>
 *   [текст](url)     →  <a>  (внутренние ссылки рендерятся через next/link
 *                              на уровне use Link только если начинаются с '/')
 *
 * Это полностью SSR-безопасный код — без dangerouslySetInnerHTML.
 */

type Token =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "italic"; value: string }
  | { type: "link"; text: string; href: string };

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
    return null;
  });
}

type Block =
  | { type: "h2" | "h3"; content: string }
  | { type: "paragraph"; content: string }
  | { type: "blockquote"; content: string }
  | { type: "hr" }
  | { type: "list"; items: string[] };

function parseBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  const lines = text.replace(/\r\n/g, "\n").split("\n");

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
      blocks.push({ type: "h2", content: line.slice(3).trim() });
      i++;
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push({ type: "h3", content: line.slice(4).trim() });
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

export default function BlogContent({ text }: { text: string }) {
  if (!text) return null;
  const blocks = parseBlocks(text);

  return (
    <div className="prose-rs text-[15px] sm:text-[17px] leading-relaxed text-[var(--rs-ink)] space-y-5">
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
              className="h-display mt-10 text-[24px] sm:text-[30px] font-extrabold leading-tight"
            >
              {renderTokens(tokenize(b.content))}
            </h2>
          );
        }
        if (b.type === "h3") {
          return (
            <h3
              key={i}
              className="h-display mt-6 text-[20px] sm:text-[24px] font-extrabold leading-tight"
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
        return (
          <p key={i} className="leading-relaxed">
            {renderTokens(tokenize(b.content))}
          </p>
        );
      })}
    </div>
  );
}
