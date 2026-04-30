from django.db import migrations


DEFAULTS = {
    "slug": "portfolio",
    "kicker": "Реализованные объекты",
    "title": "Дома, которые мы построили",
    "subtitle": (
        "Реальные объекты с фотографиями и видео-обзорами. Нажмите на "
        "карточку, чтобы посмотреть всю галерею."
    ),
    "meta_title": "Реализованные объекты — построенные дома",
    "meta_description": (
        "Фото и видео уже построенных кирпичных домов застройщика "
        "Ремстрой в Томске и посёлке Красная смородина."
    ),
}


def seed(apps, schema_editor):
    PageContent = apps.get_model("common", "PageContent")
    PageContent.objects.update_or_create(
        slug=DEFAULTS["slug"],
        defaults={k: v for k, v in DEFAULTS.items() if k != "slug"},
    )


def unseed(apps, schema_editor):
    PageContent = apps.get_model("common", "PageContent")
    PageContent.objects.filter(slug=DEFAULTS["slug"]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("common", "0010_add_homes_stats_and_portfolio_page"),
    ]

    operations = [
        migrations.RunPython(seed, unseed),
    ]
