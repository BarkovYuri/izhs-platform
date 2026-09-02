import { SITE_URL } from "@/lib/seo";

// Обычный app/robots.ts (metadata route) не умеет отдавать
// произвольные директивы — а Clean-param (Яндекс-специфичная,
// остальные роботы её просто игнорируют) нужна, чтобы не плодить
// дубли страниц из-за UTM-меток и параметров фильтра каталога.
// Поэтому тут полноценный route handler с текстом файла целиком.
export async function GET() {
  const body = `User-Agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_next/

# UTM-метки не меняют содержимое страницы — не плодим дубли в индексе.
Clean-param: utm_source&utm_medium&utm_campaign /
# Фильтры/сортировка каталога — контент отличается, но канонической
# страницей должен оставаться обычный /builds без параметров.
Clean-param: status&floors&sort /builds

Host: ${SITE_URL}
Sitemap: ${SITE_URL}/sitemap.xml
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
