"""XML-фид «Недвижимость» для Яндекс.Вебмастера (формат YRL).

Загружается вручную в Вебмастере: Фиды → Недвижимость → указать URL
этого эндпоинта. Официальная спецификация (важно соблюдать порядок
дочерних тегов — YRL это XSD-схема, порядок значим):
https://yandex.ru/support/realty/ru/feed/requirements-sale-housing.md

В фид попадают только дома, которые реально можно купить с участком в
ЖК «Красная смородина» (available_in_settlement=True, не распроданные)
— у них есть фиксированный адрес и координаты посёлка. Вариант «строим
на вашем участке» сюда не годится: это услуга, а не конкретный объект
недвижимости с адресом, фид на такое не рассчитан.

Сознательно не заполняем:
- built-year — по спецификации не обязателен для частных домов;
- lot-area / category="дом с участком" — площадь участка не хранится
  в Build, а слать неточное значение хуже, чем не слать (категория
  "дом" без участка не требует lot-area);
- room-space (площадь каждой комнаты по отдельности) — таких данных
  нет, поле по смыслу больше для комнат под аренду, не для дома целиком;
- yandex-building-id/yandex-house-id — это для новостроек-квартир из
  базы Яндекса, к частным домам не относится.
living-space заполняем тем же значением, что и area (общая площадь) —
сайт нигде не разделяет общую/жилую площадь, разошедшихся цифр не будет.
"""

import re
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

MIN_IMAGES = 3  # спецификация: "image* — не меньше трёх фото"
MAX_DESCRIPTION = 10_000  # спецификация: "не более 10 000 знаков"


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


def _phone_yrl(raw: str) -> str | None:
    """+7XXXXXXXXXX — код страны и 10 цифр, без пробелов (требование YRL).
    Сайт хранит телефон в человекочитаемом виде («+7 909 543 58 85»)."""
    digits = re.sub(r"\D", "", raw or "")
    if digits.startswith("8"):
        digits = "7" + digits[1:]
    if len(digits) != 11 or not digits.startswith("7"):
        return None
    return f"+{digits}"


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
    phone = _phone_yrl(s.phone)
    # settlement_location обычно вида «д. Кисловка, Томская область» —
    # берём только населённый пункт, область передаём отдельным тегом.
    locality = (s.settlement_location or "д. Кисловка").split(",")[0].strip()

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
        images = [img for img in b.images.order_by("order", "id") if img.image][:10]
        # "каждое объявление посвящено одному объекту... не меньше трёх
        # фото" — без хотя бы 3 фото объявление невалидно, пропускаем его,
        # а не шлём заведомо невалидный offer на весь фид.
        if len(images) < MIN_IMAGES:
            continue

        # Порядок дочерних тегов ниже соответствует официальному примеру
        # YRL-документа — намеренно не переставляем произвольно.
        offer = SubElement(root, "offer", {"internal-id": b.slug})
        _sub(offer, "type", "продажа")
        _sub(offer, "property-type", "жилая")
        _sub(offer, "category", "дом")
        _sub(offer, "url", f"{settings.SITE_URL}/builds/{b.slug}")
        _sub(offer, "creation-date", _iso(b.created_at))

        location = SubElement(offer, "location")
        _sub(location, "country", "Россия")
        _sub(location, "region", "Томская область")
        _sub(location, "locality-name", locality)
        # village-name — не валидный элемент <location> по факту (проверено
        # валидатором Вебмастера, реальный список короче документированного);
        # название ЖК держим прямо в address, благо валидный тег и всегда
        # присутствует, с уч. или без.
        address = f"ЖК «{s.settlement_name}»" + (f", уч. {b.plot_number}" if b.plot_number else "")
        _sub(location, "address", address)
        _sub(location, "latitude", SETTLEMENT_LAT)
        _sub(location, "longitude", SETTLEMENT_LNG)

        agent = SubElement(offer, "sales-agent")
        if phone:
            _sub(agent, "phone", phone)
        _sub(agent, "category", "застройщик")
        _sub(agent, "organization", s.legal_name or s.site_name)

        price = SubElement(offer, "price")
        _sub(price, "value", int(_current_price(b)))
        _sub(price, "currency", "RUB")

        area = SubElement(offer, "area")
        _sub(area, "value", b.area)
        _sub(area, "unit", "кв. м")

        living_space = SubElement(offer, "living-space")
        _sub(living_space, "value", b.area)
        _sub(living_space, "unit", "кв. м")

        if b.bedrooms:
            _sub(offer, "rooms", b.bedrooms)
        _sub(offer, "floors-total", b.floors)
        _sub(offer, "building-type", "кирпичный")

        description = (b.short_description or b.description or "")[:MAX_DESCRIPTION]
        _sub(offer, "description", description)

        for img in images:
            _sub(offer, "image", f"{settings.SITE_URL}{img.image.url}")

    xml_bytes = tostring(root, encoding="utf-8")
    pretty = minidom.parseString(xml_bytes).toprettyxml(indent="  ", encoding="utf-8")
    return HttpResponse(pretty, content_type="application/xml; charset=utf-8")
