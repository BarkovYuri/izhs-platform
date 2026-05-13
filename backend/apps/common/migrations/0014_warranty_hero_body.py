"""Добавляет поля гарантии в SiteSettings, hero/body в PageContent.

Бэкап-fields для будущей кастомизации главной (hero_lead/hero_accent)
и универсальное поле body для длинного описания на любой странице —
сейчас используется на /settlement.

Заодно: data-migration устанавливает дефолтные значения для уже
существующих записей (гарантия 5 лет на конструктив, рабочие часы
будни 10:00-18:00, Hero на главной — «Свой кирпичный дом / по цене
квартиры»).
"""

from django.db import migrations, models


SETTLEMENT_BODY_DEFAULT = (
    "Новый комплекс «Красная смородина» расположен в живописном "
    "месте в деревне Кисловка. Микрорайон состоит из 32 индивидуальных "
    "коттеджей.\n\n"
    "- Земельные участки 5–7 соток, общая площадь домов от 140 до 165 м².\n"
    "- Дома представлены с верандой на первом этаже или небольшим "
    "балконом на втором этаже.\n"
    "- Свободная планировка позволяет воплотить любую вашу фантазию, "
    "а также застройщик предоставляет типовые продуманные планировки "
    "и дизайн-проекты отделки (черновая или white box).\n"
    "- Высокие потолки 3 метра, большое панорамное остекление от пола, "
    "крыша из битумной черепицы Shinglas.\n"
    "- Коммуникации: газовое отопление (догазификация физлиц), септик "
    "и индивидуальная скважина — это даёт экономию на коммунальных "
    "услугах.\n\n"
    "Возможно построить дом по вашему индивидуальному проекту, "
    "с сохранением концепции комплекса. Полная документация для "
    "застройки всех оставшихся участков готова. Расчёт ипотеки "
    "доступен.\n\n"
    "Гарантия юридической чистоты сделки от компании."
)


def fill_defaults(apps, schema_editor):
    SiteSettings = apps.get_model("common", "SiteSettings")
    PageContent = apps.get_model("common", "PageContent")

    # Настройки — единственная запись.
    s = SiteSettings.objects.first()
    if s is not None:
        changed = False
        if not s.warranty_years:
            s.warranty_years = 5
            changed = True
        if not s.warranty_subject:
            s.warranty_subject = "на конструктив"
            changed = True
        if not s.working_hours:
            s.working_hours = "Пн–Пт 10:00–18:00"
            changed = True
        if changed:
            s.save()

    # Hero на главной — устанавливаем только если оба поля пустые,
    # чтобы не перетереть будущие правки администратора.
    home = PageContent.objects.filter(slug="home").first()
    if home is not None and not home.hero_lead and not home.hero_accent:
        home.hero_lead = "Свой кирпичный дом"
        home.hero_accent = "по цене квартиры"
        home.save()

    # Body для страницы ЖК — заполняем только если пустое.
    settlement = PageContent.objects.filter(slug="settlement").first()
    if settlement is not None and not settlement.body:
        settlement.body = SETTLEMENT_BODY_DEFAULT
        settlement.save()


def reverse_noop(apps, schema_editor):
    """Откатывать data-migration не нужно — поля удалятся вместе со схемой."""
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("common", "0013_seo_keywords_pass"),
    ]

    operations = [
        migrations.AddField(
            model_name="sitesettings",
            name="warranty_years",
            field=models.PositiveSmallIntegerField(
                default=5,
                help_text=(
                    "Сколько лет гарантии. Используется в Hero на главной "
                    "(«Гарантия 5 лет»), в футере и в Schema.org."
                ),
                verbose_name="Гарантия (лет)",
            ),
        ),
        migrations.AddField(
            model_name="sitesettings",
            name="warranty_subject",
            field=models.CharField(
                blank=True,
                default="на конструктив",
                help_text=(
                    "Короткая фраза, что покрывает гарантия. "
                    "Например: «на конструктив», «на коробку и кровлю»."
                ),
                max_length=200,
                verbose_name="На что распространяется гарантия",
            ),
        ),
        migrations.AddField(
            model_name="pagecontent",
            name="body",
            field=models.TextField(
                blank=True,
                help_text=(
                    "Длинное описание для страницы (например, подробное "
                    "описание ЖК на /settlement). Поддерживает абзацы "
                    "(пустая строка = новый абзац) и маркеры списка "
                    "(строка начинается с «-» или «•»). Видно только на "
                    "странице, для которой включено в коде."
                ),
                verbose_name="Основной текст страницы",
            ),
        ),
        migrations.AddField(
            model_name="pagecontent",
            name="hero_lead",
            field=models.CharField(
                blank=True,
                help_text=(
                    "Только для главной (slug=home). Первая часть "
                    "большого заголовка в Hero, отображается белым. "
                    "Например: «Свой кирпичный дом»."
                ),
                max_length=120,
                verbose_name="Hero — заголовок, белая часть",
            ),
        ),
        migrations.AddField(
            model_name="pagecontent",
            name="hero_accent",
            field=models.CharField(
                blank=True,
                help_text=(
                    "Только для главной. Вторая часть заголовка, "
                    "оранжевым акцентом. Например: «по цене квартиры»."
                ),
                max_length=120,
                verbose_name="Hero — заголовок, оранжевая часть",
            ),
        ),
        migrations.RunPython(fill_defaults, reverse_noop),
    ]
