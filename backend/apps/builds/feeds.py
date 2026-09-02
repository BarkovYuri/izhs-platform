"""XML-фид «Недвижимость» для Яндекс.Вебмастера (формат YRL).

Загружается вручную в Вебмастере: Фиды → Недвижимость → указать URL
этого эндпоинта. Формат описан тут:
https://yandex.ru/support/realty/ru/feed/requirements-sale-housing.md

В фид попадают только дома, которые реально можно купить с участком в
ЖК «Красная смородина» (available_in_settlement=True) — у них есть
фиксированный адрес и координаты. Вариант «строим на вашем участке»
сюда не годится: это услуга, а не конкретный объект недвижимости с
адресом, фид на такое не рассчитан.

Часть опциональных тегов спецификации (built-year, lot-area,
living-space) не заполняем — таких данных просто нет в модели Build,
а слать неточные/выдуманные значения рискованнее, чем не слать вовсе
(Яндекс блокирует фид при расхождении с данными на сайте). Если
Вебмастер после загрузки укажет на другие обязательные поля — их
легко добавить точечно.
"""

from datetime import datetime, timezone as dt_timezone
from xml.etree.ElementTree import Element, SubElement, tostring
from xml.dom import minidom

from django.conf import settings
from django.http import HttpResponse

from apps.common.models import SiteSettings
from .models import Build

# Координаты ЖК «Красная смородина» — те же, что в JSON-LD на фронте
# (frontend/src/lib/seo.ts, settlementJsonLd).
SETTLEMENT_LAT = "56.404519"
SETTLEMENT_LNG = "84.871372"

NS = "http://webmaster.yandex.ru/schemas/feed/realty/2010-06"


def _iso(dt: datetime) -> str:
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=dt_timezone.utc)
    return dt.isoformat(timespec="seconds")


def _sub(parent: Element, tag: str, text) -> Element | None:
    if text is None or text == "":
        return None
    el = SubElement(parent, tag)
    el.text = str(text)
    return el


def _current_price(build: Build):
    """Активная акционная цена, если есть, иначе обычная — то же
    значение, что показывается на странице дома."""
    today = datetime.now(dt_timezone.utc).date()
    best = None
    for link in build.promo_links.select_related("promotion").all():
        p = link.promotion
        if p.is_published and p.starts_at <= today <= p.ends_at:
            if best is None or p.ends_at < best.promotion.ends_at:
                best = link
    return best.promo_price if best else build.price


def realty_feed(request):
    s = SiteSettings.load()
    builds = (
        Build.objects.filter(
            is_published=True,
            available_in_settlement=True,
        )
        .exclude(status=Build.STATUS_SOLD)
        .prefetch_related("images", "promo_links__promotion")
        .order_by("id")
    )

    root = Element("realty-feed", {"xmlns": NS})
    _sub(root, "generation-date", _iso(datetime.now(dt_timezone.utc)))

    for b in builds:
        offer = SubElement(root, "offer", {"internal-id": b.slug})
        _sub(offer, "type", "продажа")
        _sub(offer, "property-type", "жилая")
        _sub(offer, "category", "дом")
        _sub(offer, "creation-date", _iso(b.created_at))
        _sub(offer, "url", f"{settings.SITE_URL}/builds/{b.slug}")

        location = SubElement(offer, "location")
        _sub(location, "country", "Россия")
        _sub(location, "region", "Томская область")
        # settlement_location обычно вида «д. Кисловка, Томская область» —
        # берём только населённый пункт, область уже отдельным тегом выше.
        locality = (s.settlement_location or "д. Кисловка").split(",")[0].strip()
        _sub(location, "locality-name", locality)
        address = f"ЖК «{s.settlement_name}»" + (f", участок {b.plot_number}" if b.plot_number else "")
        _sub(location, "address", address)
        _sub(location, "latitude", SETTLEMENT_LAT)
        _sub(location, "longitude", SETTLEMENT_LNG)

        agent = SubElement(offer, "sales-agent")
        _sub(agent, "category", "застройщик")
        if s.phone:
            _sub(agent, "phone", s.phone)
        _sub(agent, "organization", s.legal_name or s.site_name)

        price = SubElement(offer, "price")
        _sub(price, "value", int(_current_price(b)))
        _sub(price, "currency", "RUB")

        area = SubElement(offer, "area")
        _sub(area, "value", b.area)
        _sub(area, "unit", "кв. м")

        if b.bedrooms:
            _sub(offer, "rooms", b.bedrooms)
        _sub(offer, "building-type", "кирпичный")
        _sub(offer, "description", b.short_description or b.description)

        for img in b.images.order_by("order", "id")[:10]:
            if img.image:
                _sub(offer, "image", f"{settings.SITE_URL}{img.image.url}")

    xml_bytes = tostring(root, encoding="utf-8")
    pretty = minidom.parseString(xml_bytes).toprettyxml(indent="  ", encoding="utf-8")
    return HttpResponse(pretty, content_type="application/xml; charset=utf-8")
