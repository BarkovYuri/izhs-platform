from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("blog", "0002_article_keywords"),
    ]

    operations = [
        migrations.CreateModel(
            name="ArticleImage",
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
                            "Большие фото сожмутся автоматически "
                            "до 1920px."
                        ),
                        upload_to="blog/inline/",
                        verbose_name="Изображение",
                    ),
                ),
                (
                    "alt",
                    models.CharField(
                        blank=True,
                        help_text=(
                            "Подпись под картинкой и alt-текст для "
                            "поисковика и скринридеров. Желательно — "
                            "описательный, без «фото»."
                        ),
                        max_length=200,
                        verbose_name="Подпись (alt-текст)",
                    ),
                ),
                (
                    "order",
                    models.PositiveSmallIntegerField(
                        default=0,
                        help_text=(
                            "Меньшее число — выше в списке "
                            "(для удобства админа)."
                        ),
                        verbose_name="Порядок",
                    ),
                ),
                (
                    "article",
                    models.ForeignKey(
                        on_delete=models.deletion.CASCADE,
                        related_name="inline_images",
                        to="blog.article",
                        verbose_name="Статья",
                    ),
                ),
            ],
            options={
                "verbose_name": "Изображение в статье",
                "verbose_name_plural": "Изображения в статьях",
                "ordering": ("order", "id"),
            },
        ),
    ]
