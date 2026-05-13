from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("blog", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="article",
            name="keywords",
            field=models.CharField(
                blank=True,
                help_text=(
                    "Через запятую: «эскроу, ипотека, ИЖС, Томск». "
                    "Прим.: Google игнорирует meta keywords, Яндекс "
                    "тоже не использует их для ранжирования. Поле — "
                    "больше для учёта копирайтера, чем для SEO."
                ),
                max_length=300,
                verbose_name="Ключевые слова",
            ),
        ),
    ]
