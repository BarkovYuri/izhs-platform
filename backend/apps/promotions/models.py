from django.db import models
from django.utils import timezone


class Promotion(models.Model):
    """Акция: скидка на цену выбранных домов на ограниченный срок.

    Домом можно «поймать» акцию только если у него есть привязка
    PromotionBuild с этой акцией — сама Promotion ничего не меняет
    в ценах, пока к ней не привязан хотя бы один дом.
    """

    title = models.CharField("Название акции", max_length=200)
    slug = models.SlugField("Слаг (URL)", max_length=220, unique=True)

    badge_label = models.CharField(
        "Текст значка на карточке дома", max_length=40, default="Акция",
    )

    banner_title = models.CharField(
        "Заголовок баннера", max_length=200, blank=True,
        help_text="Если пусто — используется название акции",
    )
    banner_subtitle = models.CharField("Подзаголовок баннера", max_length=300, blank=True)
    banner_image = models.ImageField(
        "Картинка баннера", upload_to="promotions/", blank=True, null=True,
    )

    terms = models.TextField(
        "Условия акции",
        help_text=(
            "Например: «Скидка действует при заключении договора "
            "строительного подряда до 31.12.2026»"
        ),
    )
    contract_deadline = models.DateField(
        "Заключить договор до", null=True, blank=True,
        help_text="Крайний срок подписания договора для получения акционной цены",
    )

    starts_at = models.DateField("Акция действует с")
    ends_at = models.DateField("Акция действует по")

    is_published = models.BooleanField("Опубликована", default=True)

    created_at = models.DateTimeField("Создано", auto_now_add=True)
    updated_at = models.DateTimeField("Обновлено", auto_now=True)

    class Meta:
        verbose_name = "Акция"
        verbose_name_plural = "Акции"
        ordering = ["ends_at", "-created_at"]

    def __str__(self) -> str:
        return self.title

    @property
    def is_active(self) -> bool:
        today = timezone.localdate()
        return self.is_published and self.starts_at <= today <= self.ends_at


class PromotionBuild(models.Model):
    """Привязка дома к акции с индивидуальной акционной ценой."""

    promotion = models.ForeignKey(
        Promotion, on_delete=models.CASCADE,
        related_name="build_links", verbose_name="Акция",
    )
    # Строковая ссылка на apps.builds.Build — чтобы apps/builds не пришлось
    # импортировать apps.promotions.models на уровне модуля (ниже, в
    # apps/builds/serializers.py, будет обратный импорт PromotionBuild).
    build = models.ForeignKey(
        "builds.Build", on_delete=models.CASCADE,
        related_name="promo_links", verbose_name="Дом",
    )
    promo_price = models.DecimalField("Акционная цена, ₽", max_digits=12, decimal_places=2)

    class Meta:
        verbose_name = "Дом по акции"
        verbose_name_plural = "Дома по акции"
        unique_together = ("promotion", "build")
        ordering = ["id"]

    def __str__(self) -> str:
        return f"{self.promotion.title} — {self.build.title}"

    @property
    def discount_percent(self) -> int:
        price = self.build.price
        if not price:
            return 0
        return round((1 - (self.promo_price / price)) * 100)
