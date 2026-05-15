"""IndexNow integration.

Протокол поддерживается Яндексом, Bing, Naver и Seznam (НЕ Google).
Один ping → все участвующие поисковики уведомлены.

Используется как fire-and-forget при сохранении публикуемых
сущностей (статья, билд, страница) — Яндекс приходит обходить URL
обычно в течение 15–30 минут вместо стандартных 1–7 дней.

Ключ хранится в env-переменной INDEXNOW_KEY. Если не задан —
функция тихо игнорируется (удобно для локалки и тестов).

Файл подтверждения должен лежать на сайте по адресу
`/<key>.txt` и содержать сам ключ. У нас хранится в
frontend/public/<key>.txt, Next.js отдаёт автоматически.
"""

from __future__ import annotations

import logging
import threading
from urllib.parse import quote
from urllib.request import Request, urlopen

from django.conf import settings

log = logging.getLogger(__name__)

# Generic IndexNow endpoint — broadcast всем участникам протокола.
# Альтернатива: https://yandex.com/indexnow (только Яндекс), но
# общий эндпоинт надёжнее.
API_ENDPOINT = "https://api.indexnow.org/indexnow"


def _enabled() -> bool:
    """Включён ли IndexNow для текущего окружения."""
    if settings.DEBUG:
        return False
    return bool(getattr(settings, "INDEXNOW_KEY", ""))


def _absolute(url: str) -> str:
    """Превращаем относительный путь в абсолютный (с https://домен)."""
    if url.startswith("http://") or url.startswith("https://"):
        return url
    site = getattr(settings, "SITE_URL", "https://remstroy70.ru").rstrip("/")
    path = url if url.startswith("/") else "/" + url
    return f"{site}{path}"


def _ping_sync(url: str) -> None:
    """Реальный HTTP-запрос. Вызывается из фонового треда."""
    key = settings.INDEXNOW_KEY
    qs = f"url={quote(url, safe='')}&key={quote(key, safe='')}"
    req = Request(f"{API_ENDPOINT}?{qs}", method="GET")
    try:
        with urlopen(req, timeout=5) as resp:
            status = resp.status
        if 200 <= status < 300:
            log.info("IndexNow OK: %s (%s)", url, status)
        else:
            log.warning("IndexNow non-2xx: %s (%s)", url, status)
    except Exception as e:  # noqa: BLE001 — нам важно не упасть в треде
        log.warning("IndexNow error for %s: %s", url, e)


def notify(url: str) -> None:
    """Public API: уведомить IndexNow про изменение URL.

    Fire-and-forget — никогда не блокирует вызывающий код. Если
    ключа нет / DEBUG / экземпляр приложения в тестах — no-op.
    """
    if not _enabled():
        return
    abs_url = _absolute(url)
    t = threading.Thread(target=_ping_sync, args=(abs_url,), daemon=True)
    t.start()


def notify_many(urls: list[str]) -> None:
    """Уведомить несколько URL разом."""
    for u in urls:
        notify(u)
