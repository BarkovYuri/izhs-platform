/**
 * Простой рендерер для длинных текстов, которые редактируются в админке
 * как обычный textarea. Поддерживает:
 *  - абзацы (разделитель — пустая строка);
 *  - маркированные списки (каждая строка начинается с «-» или «•»).
 *
 * Это намеренно минимум — пользователю не нужно учить markdown, а админка
 * не таскает heavy WYSIWYG. Сложные кейсы (заголовки, ссылки) пока не
 * нужны на тех страницах, где этот компонент используется.
 */
export default function RichText({ text }: { text: string }) {
  if (!text) return null;

  const blocks = text
    .replace(/\r\n/g, "\n")
    .trim()
    .split(/\n\s*\n/);

  return (
    <div className="space-y-5 text-[15px] sm:text-[16px] leading-relaxed text-[var(--rs-ink)]">
      {blocks.map((block, i) => {
        const lines = block
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
        const isList =
          lines.length > 0 && lines.every((l) => /^[-•]\s+/.test(l));

        if (isList) {
          return (
            <ul key={i} className="space-y-2.5 pl-1">
              {lines.map((l, j) => (
                <li key={j} className="flex items-start gap-2.5">
                  <span
                    className="mt-1.5 inline-block w-1.5 h-1.5 rounded-full bg-[var(--rs-brand)] shrink-0"
                    aria-hidden
                  />
                  <span>{l.replace(/^[-•]\s+/, "")}</span>
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={i} className="leading-relaxed">
            {block}
          </p>
        );
      })}
    </div>
  );
}
