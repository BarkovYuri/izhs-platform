from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("common", "0017_update_office_map_iframe"),
    ]

    operations = [
        migrations.CreateModel(
            name="PageContentVideo",
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
                    "video_url",
                    models.URLField(
                        help_text=(
                            "Поддерживается YouTube, RuTube, VK Видео. "
                            "Просто скопируйте ссылку из адресной строки "
                            "браузера (например https://youtu.be/abc123 "
                            "или https://vk.com/video-12345_67890). Сайт "
                            "автоматически вставит плеер."
                        ),
                        max_length=400,
                        verbose_name="Ссылка на видео",
                    ),
                ),
                (
                    "title",
                    models.CharField(
                        blank=True,
                        help_text="Короткое описание сюжета — что в этом видео.",
                        max_length=200,
                        verbose_name="Подпись под видео",
                    ),
                ),
                (
                    "order",
                    models.PositiveSmallIntegerField(
                        default=0,
                        help_text="Меньшее число — выше в списке.",
                        verbose_name="Порядок",
                    ),
                ),
                (
                    "is_published",
                    models.BooleanField(
                        default=True,
                        help_text=(
                            "Сними галку, чтобы временно скрыть видео."
                        ),
                        verbose_name="Опубликовано",
                    ),
                ),
                (
                    "page",
                    models.ForeignKey(
                        on_delete=models.deletion.CASCADE,
                        related_name="videos",
                        to="common.pagecontent",
                        verbose_name="Страница",
                    ),
                ),
            ],
            options={
                "verbose_name": "Видео для страницы",
                "verbose_name_plural": "Видео для страниц",
                "ordering": ("order", "id"),
            },
        ),
    ]
