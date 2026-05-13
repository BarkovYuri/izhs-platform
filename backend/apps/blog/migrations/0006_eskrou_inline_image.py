"""Добавляет адаптированную инфографику про эскроу в начало статьи.

Картинка лежит в frontend/public/eskrou-schet-izhs.webp — отдаётся
Next.js по абсолютному пути /eskrou-schet-izhs.webp.
Markdown-шорткод вида ![подпись](url) на отдельной строке
превращается на фронте в блок <figure> с подписью.

Если бы картинка была загружена через админку (Article.cover или
ArticleImage), у неё был бы путь /media/blog/... — здесь же файл
лежит в статике фронта, поэтому ссылка корневая.
"""

from django.db import migrations


IMAGE_MD = (
    "![Эскроу-счёт: трёхсторонняя сделка между заказчиком, банком "
    "и застройщиком](/eskrou-schet-izhs.webp)\n\n"
)

OLD_INTRO_END = (
    "Подробнее о реформе — в [статье про ипотеку на ИЖС в 2026]"
    "(/blog/ipoteka-na-izhs-tomsk-2026)."
)

NEW_INTRO_END = OLD_INTRO_END + "\n\n" + IMAGE_MD.rstrip()


def add_image(apps, schema_editor):
    Article = apps.get_model("blog", "Article")
    article = Article.objects.filter(slug="eskrou-schet-izhs-chto-eto").first()
    if article is None:
        return
    if "/eskrou-schet-izhs.webp" in article.body:
        return  # уже добавлено — идемпотентно
    if OLD_INTRO_END not in article.body:
        return  # тело не совпадает с эталонным, не трогаем
    article.body = article.body.replace(OLD_INTRO_END, NEW_INTRO_END)
    article.save(update_fields=["body", "updated_at"])


def remove_image(apps, schema_editor):
    Article = apps.get_model("blog", "Article")
    article = Article.objects.filter(slug="eskrou-schet-izhs-chto-eto").first()
    if article is None:
        return
    if IMAGE_MD.strip() not in article.body:
        return
    article.body = article.body.replace("\n\n" + IMAGE_MD.strip(), "")
    article.save(update_fields=["body", "updated_at"])


class Migration(migrations.Migration):

    dependencies = [
        ("blog", "0005_update_eskrou_article"),
    ]

    operations = [
        migrations.RunPython(add_image, remove_image),
    ]
