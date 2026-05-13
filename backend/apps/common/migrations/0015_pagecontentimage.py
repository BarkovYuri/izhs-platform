"""Модель PageContentImage — галерея фотографий для страницы.

Используется на /settlement (и в будущем — на других страницах,
если решим добавить туда фотогалереи). Привязка к PageContent
через FK, автокомпрессия через _compress_imagefield на save().
"""

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("common", "0014_warranty_hero_body"),
    ]

    operations = [
        migrations.CreateModel(
            name="PageContentImage",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "image",
                    models.ImageField(
                        help_text=(
                            "Большие фото автоматически сжимаются до 1920px."
                        ),
                        upload_to="pages/",
                        verbose_name="Фотография",
                    ),
                ),
                (
                    "alt",
                    models.CharField(
                        blank=True,
                        help_text=(
                            "Короткое описание фото — пригодится для поиска "
                            "картинок и для людей со скринридерами. "
                            "Можно оставить пустым."
                        ),
                        max_length=200,
                        verbose_name="Подпись / альт-текст",
                    ),
                ),
                (
                    "order",
                    models.PositiveSmallIntegerField(
                        default=0,
                        help_text="Меньшее число — выше в галерее.",
                        verbose_name="Порядок",
                    ),
                ),
                (
                    "page",
                    models.ForeignKey(
                        on_delete=models.deletion.CASCADE,
                        related_name="images",
                        to="common.pagecontent",
                        verbose_name="Страница",
                    ),
                ),
            ],
            options={
                "verbose_name": "Фото для страницы",
                "verbose_name_plural": "Фотографии для страниц",
                "ordering": ("order", "id"),
            },
        ),
    ]
