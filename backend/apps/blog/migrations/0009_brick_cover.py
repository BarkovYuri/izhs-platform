"""Устанавливает обложку для статьи про выбор кирпича.

Файл — migrations/seed_files/brick-cover.jpg. Идемпотентна:
не перетирает обложку, если админ уже что-то загрузил вручную.
"""

from pathlib import Path

from django.core.files.base import ContentFile
from django.db import migrations


SEED_PATH = Path(__file__).resolve().parent / "seed_files" / "brick-cover.jpg"


def set_cover(apps, schema_editor):
    Article = apps.get_model("blog", "Article")
    article = Article.objects.filter(slug="kakoj-kirpich-vybrat-dlya-doma").first()
    if article is None:
        return
    if article.cover:
        return
    if not SEED_PATH.exists():
        return
    with SEED_PATH.open("rb") as f:
        article.cover.save(
            "brick-cover.jpg",
            ContentFile(f.read()),
            save=True,
        )


def unset_cover(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("blog", "0008_update_brick_article"),
    ]

    operations = [
        migrations.RunPython(set_cover, unset_cover),
    ]
