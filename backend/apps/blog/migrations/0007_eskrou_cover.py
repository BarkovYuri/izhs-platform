"""Устанавливает обложку для статьи про эскроу-счёт.

Файл лежит рядом — в migrations/seed_files/eskrou-cover.jpg. При
применении миграции содержимое копируется в Article.cover (через
ImageField → upload_to="blog/"), Django сам пересоздаст путь
вида media/blog/eskrou-cover_xxxxx.jpg.

Идемпотентна: если обложка уже стоит, миграция ничего не делает.
"""

from pathlib import Path

from django.core.files.base import ContentFile
from django.db import migrations


SEED_PATH = Path(__file__).resolve().parent / "seed_files" / "eskrou-cover.jpg"


def set_cover(apps, schema_editor):
    Article = apps.get_model("blog", "Article")
    article = Article.objects.filter(slug="eskrou-schet-izhs-chto-eto").first()
    if article is None:
        return
    if article.cover:
        # Если админ уже что-то загрузил — не трогаем.
        return
    if not SEED_PATH.exists():
        return  # safety: файл может отсутствовать в чистом чекауте
    with SEED_PATH.open("rb") as f:
        article.cover.save(
            "eskrou-cover.jpg",
            ContentFile(f.read()),
            save=True,
        )


def unset_cover(apps, schema_editor):
    """Не откатываем — данные пользователя могут быть уже изменены."""
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("blog", "0006_eskrou_inline_image"),
    ]

    operations = [
        migrations.RunPython(set_cover, unset_cover),
    ]
