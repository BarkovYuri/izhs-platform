from django.db import models

from apps.builds.models import _compress_imagefield


class PortfolioItem(models.Model):
    """Реализованный объект — построенный дом, который можно показать
    с фото/видео в галерее на сайте.

    Все текстовые поля кроме обложки опциональны: пользователь может
    залить просто 5 фото без подписи и видео, и это уже работает.
    """

    title = models.CharField(
        "Название (опционально)",
        max_length=160,
        blank=True,
        help_text=(
            'Например: «Дом 180 м² в Кисловке». Если оставить пустым — '
            'на сайте будет показано краткое описание (площадь, год).'
        ),
    )
    description = models.TextField(
        "Краткое описание (опционально)",
        blank=True,
        help_text=(
            "Что построили, особенности проекта, отзыв заказчика. "
            "Можно оставить пустым."
        ),
    )

    year = models.PositiveSmallIntegerField(
        "Год сдачи (опционально)",
        null=True, blank=True,
        help_text="Например, 2024.",
    )
    area = models.DecimalField(
        "Площадь, м² (опционально)",
        max_digits=7, decimal_places=2,
        null=True, blank=True,
    )
    location = models.CharField(
        "Расположение (опционально)",
        max_length=200,
        blank=True,
        help_text='Например: «посёлок Красная смородина» или «д. Лоскутово».',
    )

    cover = models.ImageField(
        "Обложка (главное фото)",
        upload_to="portfolio/",
        help_text=(
            "Главное фото, которое показывается в карточке на сайте. "
            "Большие фото автоматически сжимаются до 1920px."
        ),
    )

    video_url = models.URLField(
        "Ссылка на видео (опционально)",
        blank=True,
        help_text=(
            "Скопируй ссылку на видео из YouTube, RuTube, VK Видео или "
            "ВКонтакте — на сайте автоматически встроится плеер. "
            "Если ссылка с другого сервиса — будет ссылка «Смотреть видео»."
        ),
    )

    order = models.PositiveSmallIntegerField(
        "Порядок",
        default=0,
        help_text="Меньшее число — выше в списке. Можно оставить 0.",
    )
    is_published = models.BooleanField(
        "Опубликован",
        default=True,
        help_text="Сними галку, чтобы временно скрыть объект с сайта.",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Реализованный объект"
        verbose_name_plural = "Реализованные объекты"
        ordering = ("order", "-year", "-created_at")

    def __str__(self) -> str:
        if self.title:
            return self.title
        if self.year and self.area:
            return f"Дом {self.area} м², {self.year}"
        if self.area:
            return f"Дом {self.area} м²"
        return f"Объект #{self.pk or '—'}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if _compress_imagefield(self.cover):
            super().save(update_fields=["cover"])


class PortfolioImage(models.Model):
    """Фотографии объекта в галерее (помимо обложки)."""

    item = models.ForeignKey(
        PortfolioItem,
        on_delete=models.CASCADE,
        related_name="images",
        verbose_name="Объект",
    )
    image = models.ImageField(
        "Фото",
        upload_to="portfolio/",
    )
    order = models.PositiveSmallIntegerField(
        "Порядок",
        default=0,
    )

    class Meta:
        verbose_name = "Фото объекта"
        verbose_name_plural = "Фотографии объекта"
        ordering = ("order", "id")

    def __str__(self) -> str:
        return f"Фото объекта «{self.item}»"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if _compress_imagefield(self.image):
            super().save(update_fields=["image"])
