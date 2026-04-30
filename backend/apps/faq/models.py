from django.db import models


class FaqCategory(models.Model):
    title = models.CharField("Название категории", max_length=120)
    slug = models.SlugField("Слаг", max_length=140, unique=True)
    order = models.PositiveIntegerField("Порядок", default=0)

    class Meta:
        verbose_name = "Категория FAQ"
        verbose_name_plural = "Категории FAQ"
        ordering = ["order", "id"]

    def __str__(self) -> str:
        return self.title


class FaqItem(models.Model):
    category = models.ForeignKey(
        FaqCategory, verbose_name="Категория", on_delete=models.SET_NULL,
        null=True, blank=True, related_name="items",
    )
    question = models.CharField("Вопрос", max_length=300)
    answer = models.TextField("Ответ")
    order = models.PositiveIntegerField("Порядок", default=0)
    is_published = models.BooleanField("Опубликовано", default=True)

    class Meta:
        verbose_name = "Вопрос-ответ"
        verbose_name_plural = "Вопросы-ответы"
        ordering = ["category__order", "order", "id"]

    def __str__(self) -> str:
        return self.question
