"""Правки контента после аудита сайта (октябрь 2026).

Заглушки в правилах акций, расхождения цен и дат, опечатки. Все замены
точечные: строка меняется, только если в базе лежит ровно ожидаемый текст,
поэтому повторный прогон и правки, уже сделанные руками в админке, безопасны.
"""

from datetime import date
from decimal import Decimal

from django.db import migrations

PROMO_136 = "specialnaya-cena-na-stroitelstvo-doma-136-m"
PROMO_SPECIAL = "specialnaya-cena-na-stroitelstvo-doma"
PROMO_REFERRAL = "privedi-druga-poluchi-100-000"

ORGANIZER_NO_OGRNIP = "Барков Юрий Михайлович, ИНН 701716191942, адрес"
ORGANIZER_WITH_OGRNIP = "Барков Юрий Михайлович, ИНН 701716191942, ОГРНИП 316703100074912, адрес"

PROMO_TERMS = {
    PROMO_136: [
        (
            "Договор подряда заключается на один из двух указанных типовых проектов",
            "Договор подряда заключается на типовой проект EURO-136B",
        ),
        (" [если применимо — указать ограничение по количеству участников]", ""),
        (" [если применимо]", ""),
    ],
    PROMO_SPECIAL: [
        (
            "Договор подряда заключается на типовой проект без",
            "Договор подряда заключается на один из указанных типовых проектов без",
        ),
        (ORGANIZER_NO_OGRNIP, ORGANIZER_WITH_OGRNIP),
    ],
    PROMO_REFERRAL: [
        ("начиная с [дата запуска],", "начиная с 20.08.2026,"),
        ("в течение [10 (десяти)] рабочих дней", "в течение 10 (десяти) рабочих дней"),
        (
            "поступления денежных средств Организатору по п. 5.3.",
            "поступления денежных средств Организатору при раскрытии счёта эскроу (п. 5).",
        ),
        (
            " или мошеннических действий, а также аннулировать уже произведённую выплату"
            " при последующем расторжении договора с Приглашённым по вине последнего"
            " (например, невыполнение договора) — [указать, применимо ли это условие].",
            " или мошеннических действий.",
        ),
        (
            "Это общее описание механики, а не налоговая консультация — конкретный порядок"
            " (особенно если у Приглашающего в течение года уже был доход, выводящий его"
            " в повышенную ставку НДФЛ) стоит сверить с бухгалтером Организатора перед"
            " запуском программы.",
            "Это общее описание механики, а не налоговая консультация. Если у Приглашающего"
            " в течение года уже был доход, выводящий его в повышенную ставку НДФЛ,"
            " порядок удержания уточняется у Организатора до выплаты.",
        ),
    ],
}

PROMO_SUBTITLES = {
    PROMO_136: "EURO-136B с балконом — 9 500 000 ₽ вместо 10 200 000 ₽ при договоре до 31.12.2026",
    PROMO_SPECIAL: "EURO-65B за 7 400 000 ₽ и EURO-86B за 8 300 000 ₽ при договоре до 31.12.2026",
    PROMO_REFERRAL: "100 000 ₽ за каждого друга, который построит дом с Ремстрой",
}

# slug: (старая цена, новая цена) — «Цена от» = обычная цена из правил акций.
BUILD_PRICES = {
    "dvuhetazhnyj-dom-euro-136b-s-balkonom": (Decimal("9500000"), Decimal("10200000")),
    "odnoetazhnyj-dom-euro-86b": (Decimal("7900000"), Decimal("8500000")),
}

BUILD_TEXT = {
    "dvuhetazhnyj-dom-euro-136b-s-balkonom": (
        "short_description",
        "Компактная застройка 86 м² освобождает место на участке",
        "Пятно застройки — всего 86 м², поэтому остаётся место на участке",
    ),
    "trehetazhnyj-euro-200b-c-bolshim-garazhom": (
        "title",
        "EURO-200B c большим",  # латинская «c»
        "EURO-200B с большим",
    ),
    "odnoetazhnyj-euro86": (
        "short_description",
        "старт от 8 миллионов рублей",
        "старт от 8,5 млн рублей",
    ),
}

PORTFOLIO_TITLES = {
    # (старое название, год) → новое: два разных дома с одинаковым именем.
    ("Белый Большой", 2022): "Белый большой, 2022",
    ("Белый большой", 2024): "Белый большой, 2024",
}


def _replace(obj, field, old, new):
    value = getattr(obj, field)
    if old in value:
        setattr(obj, field, value.replace(old, new))
        return True
    return False


def forwards(apps, schema_editor):
    Promotion = apps.get_model("promotions", "Promotion")
    Build = apps.get_model("builds", "Build")
    BuildSpecValue = apps.get_model("builds", "BuildSpecValue")
    FaqItem = apps.get_model("faq", "FaqItem")
    PortfolioItem = apps.get_model("portfolio", "PortfolioItem")

    for promo in Promotion.objects.filter(slug__in=PROMO_TERMS):
        changed = False
        for old, new in PROMO_TERMS[promo.slug]:
            changed |= _replace(promo, "terms", old, new)
        if not promo.banner_subtitle:
            promo.banner_subtitle = PROMO_SUBTITLES[promo.slug]
            changed = True
        # Карточка показывала «с 20.08», а в правилах — 24.08.2026.
        if promo.slug == PROMO_136 and promo.starts_at == date(2026, 8, 20):
            promo.starts_at = date(2026, 8, 24)
            changed = True
        # Программа бессрочная — пустая дата окончания.
        if promo.slug == PROMO_REFERRAL and promo.ends_at == date(2030, 1, 1):
            promo.ends_at = None
            changed = True
        if changed:
            promo.save()

    for slug, (old, new) in BUILD_PRICES.items():
        Build.objects.filter(slug=slug, price=old).update(price=new)

    for slug, (field, old, new) in BUILD_TEXT.items():
        build = Build.objects.filter(slug=slug).first()
        if build and _replace(build, field, old, new):
            build.save(update_fields=[field])

    # Объём записан то «м2» (ошибка), то «м3» — приводим к «м³».
    for sv in BuildSpecValue.objects.filter(key__title="Объём надземной части"):
        for wrong in (" м2", " м3"):
            if sv.value.endswith(wrong):
                sv.value = sv.value[: -len(wrong)] + " м³"
                sv.save(update_fields=["value"])
                break

    for item in FaqItem.objects.filter(question__startswith="C"):  # латинская «C»
        item.question = "С" + item.question[1:]
        item.save(update_fields=["question"])

    for (old, year), new in PORTFOLIO_TITLES.items():
        PortfolioItem.objects.filter(title=old, year=year).update(title=new)
    for item in PortfolioItem.objects.filter(location__contains="ул.Ивановского"):
        item.location = item.location.replace("ул.Ивановского", "ул. Ивановского")
        item.save(update_fields=["location"])


class Migration(migrations.Migration):

    dependencies = [
        ("promotions", "0002_promotion_ends_at_optional"),
        ("builds", "0011_assign_plot_numbers"),
        ("faq", "0001_initial"),
        ("portfolio", "0002_alter_portfolioitem_location"),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
