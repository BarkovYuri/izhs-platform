"""XML-фид «Недвижимость» для Яндекс.Вебмастера — раздел «Дополненное
представление в поиске» / «Товары и услуги» (НЕ путать со старым
специализированным форматом YRL для yandex.ru/realty — это два разных
продукта Яндекса с разными схемами; здесь используется генерик-YML,
как для Яндекс.Маркета, с category/offer/param).

Первая версия этого файла была написана под YRL (realty-feed) — валидатор
Вебмастера отклонил фид с ошибкой «в offer отсутствуют обязательные
элементы name, price, url, currencyId, categoryId, set-ids, picture,
param "Конверсия", param "Тип предложения"» — именно этот набор тегов
ниже и реализован, он подтверждён самим валидатором, а не только
документацией.

Загружается вручную в Вебмастере: Фиды → Недвижимость → указать URL
этого эндпоинта.

Второй раунд модерации (после исправления обязательных тегов) отклонил
фид уже целиком, с другой формулировкой: «в фиде есть предложения о
строительстве, которые нельзя разместить в категории "Недвижимость"» —
100% предложений. Причина: ни у одного Build не было заполнено
plot_number — то есть каждый offer описывал типовой проект («можно
построить такой дом»), а не конкретный идентифицируемый объект
недвижимости («вот этот дом на вот этом участке»). Яндекс совершенно
справедливо читает первое как услугу строительства, а не объявление о
продаже.

Поэтому в фид попадают только дома, у которых заполнен plot_number —
то есть за домом реально закреплён конкретный свободный участок в ЖК
«Красная смородина» (available_in_settlement=True, не распроданные,
хотя бы 3 фото). Вариант «строим на вашем участке» сюда никогда не
годится: это услуга, а не конкретный объект недвижимости с адресом.

categoryId — не глобальный справочник Яндекса, а наш собственный
(объявляется тут же в <shop><categories>), поэтому id="1"="Дом" ничем
не рискует конфликтовать с чужими фидами.
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

CATEGORY_ID_HOUSE = "1"
SET_ID_MAIN = "krasnaya-smorodina"

MIN_IMAGES = 3  # без фото объявление всё равно не покажут — не шлём пустышку
MAX_DESCRIPTION = 3000


def _sub(parent: Element, tag: str, text, **attrs) -> Element | None:
    if text is None or text == "":
        return None
    el = SubElement(parent, tag, attrs)
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
    locality = (s.settlement_location or "д. Кисловка").split(",")[0].strip()
    address_region = f"Томская область, {locality}, ЖК «{s.settlement_name}»"

    builds = (
        Build.objects.filter(
            is_published=True,
            available_in_settlement=True,
        )
        .exclude(status=Build.STATUS_SOLD)
        .exclude(plot_number="")
        .prefetch_related("images", "promo_links__promotion")
        .order_by("id")
    )

    root = Element("yml_catalog", {
        "date": datetime.now(dt_timezone.utc).strftime("%Y-%m-%d %H:%M"),
    })
    shop = SubElement(root, "shop")
    _sub(shop, "name", s.site_name or "Ремстрой")
    _sub(shop, "company", s.legal_name or s.site_name or "Ремстрой")
    _sub(shop, "url", settings.SITE_URL)

    categories = SubElement(shop, "categories")
    _sub(categories, "category", "Дом", id=CATEGORY_ID_HOUSE)

    sets = SubElement(shop, "sets")
    a_set = SubElement(sets, "set", {"id": SET_ID_MAIN})
    _sub(a_set, "name", f"Дома в ЖК «{s.settlement_name}»")
    _sub(a_set, "url", f"{settings.SITE_URL}/settlement")

    offers = SubElement(shop, "offers")

    for b in builds:
        images = [img for img in b.images.order_by("order", "id") if img.image][:10]
        if len(images) < MIN_IMAGES:
            continue

        offer = SubElement(offers, "offer", {"id": b.slug})
        _sub(offer, "name", b.title)
        _sub(offer, "url", f"{settings.SITE_URL}/builds/{b.slug}")
        _sub(offer, "price", int(_current_price(b)), **{"from": "true"})
        _sub(offer, "currencyId", "RUR")
        _sub(offer, "categoryId", CATEGORY_ID_HOUSE)
        _sub(offer, "set-ids", SET_ID_MAIN)

        for img in images:
            _sub(offer, "picture", f"{settings.SITE_URL}{img.image.url}")

        _sub(offer, "param", "1", name="Конверсия")
        _sub(offer, "param", "Продажа", name="Тип предложения")
        _sub(offer, "param", b.area, name="Площадь")
        _sub(offer, "param", b.floors, name="Число этажей")
        if b.bedrooms:
            _sub(offer, "param", b.bedrooms, name="Число комнат")
        address = address_region + (f", уч. {b.plot_number}" if b.plot_number else "")
        _sub(offer, "param", address, name="Адрес")
        _sub(offer, "param", SETTLEMENT_LAT, name="Широта")
        _sub(offer, "param", SETTLEMENT_LNG, name="Долгота")
        _sub(offer, "param", "Первичный", name="Рынок жилья")

        description = (b.short_description or b.description or "")[:MAX_DESCRIPTION]
        _sub(offer, "description", description)

    xml_bytes = tostring(root, encoding="utf-8")
    pretty = minidom.parseString(xml_bytes).toprettyxml(indent="  ", encoding="utf-8")
    return HttpResponse(pretty, content_type="application/xml; charset=utf-8")
