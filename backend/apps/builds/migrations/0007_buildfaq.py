from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("builds", "0006_alter_build_available_in_settlement_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="BuildFAQ",
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
                    "question",
                    models.CharField(
                        help_text=(
                            "Конкретный вопрос про этот проект: «Можно "
                            "ли изменить планировку?», «Какая площадь "
                            "террасы?», «Подходит ли под семейную "
                            "ипотеку?» и т.п."
                        ),
                        max_length=300,
                        verbose_name="Вопрос",
                    ),
                ),
                (
                    "answer",
                    models.TextField(
                        help_text=(
                            "Развёрнутый ответ, 1–3 абзаца. Можно с "
                            "ссылками на другие страницы или статьи "
                            "блога — они отрендерятся как ссылки."
                        ),
                        verbose_name="Ответ",
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
                        verbose_name="Опубликован",
                    ),
                ),
                (
                    "build",
                    models.ForeignKey(
                        on_delete=models.deletion.CASCADE,
                        related_name="faq_items",
                        to="builds.build",
                        verbose_name="Проект",
                    ),
                ),
            ],
            options={
                "verbose_name": "Вопрос-ответ по проекту",
                "verbose_name_plural": "Вопросы-ответы по проекту",
                "ordering": ("order", "id"),
            },
        ),
    ]
