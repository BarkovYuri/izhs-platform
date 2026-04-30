from django.db import migrations


DEFAULTS = [
    {
        "slug": "home",
        "kicker": "",
        "title": "",
        "subtitle": "",
        "meta_title": "",
        "meta_description": "",
    },
    {
        "slug": "builds",
        "kicker": "Каталог",
        "title": "Проекты кирпичных домов",
        "subtitle": (
            "Типовые проекты, готовые к строительству. "
            "Перепланировка и доработка по запросу клиента."
        ),
        "meta_title": "Каталог проектов кирпичных домов",
        "meta_description": (
            "Типовые и индивидуальные проекты кирпичных домов в посёлке "
            "Красная смородина и на вашем участке. Площадь, цены, фото, "
            "планировки."
        ),
    },
    {
        "slug": "faq",
        "kicker": "FAQ",
        "title": "Вопросы и ответы",
        "subtitle": (
            "Ответы на самые частые вопросы клиентов. Если нужного нет — "
            "задайте свой через форму ниже."
        ),
        "meta_title": "Вопросы и ответы",
        "meta_description": (
            "Ответы на частые вопросы о строительстве кирпичных домов: "
            "сроки, эскроу, ипотека, посёлок Красная смородина в Кисловке."
        ),
    },
    {
        "slug": "about",
        "kicker": "О компании",
        "title": "",
        "subtitle": "",
        "meta_title": "О компании — Ремстрой",
        "meta_description": (
            "Застройщик кирпичных домов в Томске и Томской области. "
            "Эскроу, аккредитация в банках, собственный посёлок "
            "Красная смородина."
        ),
    },
    {
        "slug": "contacts",
        "kicker": "Контакты",
        "title": "Связаться с нами",
        "subtitle": (
            "Позвоните или оставьте заявку — обсудим проект, выезд "
            "на участок и стоимость."
        ),
        "meta_title": "Контакты",
        "meta_description": (
            "Связаться с застройщиком Ремстрой: телефон, email, адрес "
            "офиса в Томске на Комсомольском проспекте, 43А. "
            "Карта проезда."
        ),
    },
    {
        "slug": "settlement",
        "kicker": "Жилой посёлок",
        "title": "",
        "subtitle": "",
        "meta_title": "Посёлок «Красная смородина» — Кисловка, Томск",
        "meta_description": (
            "Жилой коттеджный посёлок «Красная смородина» в деревне "
            "Кисловка под Томском. Кирпичные дома с земельными "
            "участками, скважина, септик, эскроу."
        ),
    },
]


def seed_pages(apps, schema_editor):
    PageContent = apps.get_model("common", "PageContent")
    for row in DEFAULTS:
        PageContent.objects.update_or_create(
            slug=row["slug"],
            defaults={k: v for k, v in row.items() if k != "slug"},
        )


def unseed_pages(apps, schema_editor):
    PageContent = apps.get_model("common", "PageContent")
    PageContent.objects.filter(
        slug__in=[r["slug"] for r in DEFAULTS]
    ).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("common", "0006_add_page_content"),
    ]

    operations = [
        migrations.RunPython(seed_pages, unseed_pages),
    ]
