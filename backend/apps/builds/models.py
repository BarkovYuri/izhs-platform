from io import BytesIO
from pathlib import Path

from django.core.files.base import ContentFile
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from PIL import Image as PILImage, ImageOps

# Максимальный размер по большей стороне (px). Достаточно для рендеров.
IMAGE_MAX_SIZE = 1920
IMAGE_JPEG_QUALITY = 82


def _compress_imagefield(field_file) -> bool:
    """Сжимает изображение «на лету» при сохранении модели.
    Возвращает True если файл был изменён."""
    if not field_file:
        return False
    try:
        with PILImage.open(field_file) as im:
            im = ImageOps.exif_transpose(im)
            w, h = im.size
            if max(w, h) <= IMAGE_MAX_SIZE:
                return False  # уже маленький — не трогаем
            im.thumbnail((IMAGE_MAX_SIZE, IMAGE_MAX_SIZE), PILImage.LANCZOS)
            if im.mode != "RGB":
                im = im.convert("RGB")
            buf = BytesIO()
            im.save(buf, "JPEG", quality=IMAGE_JPEG_QUALITY, optimize=True, progressive=True)
            buf.seek(0)
            # Сохраняем в jpeg, новое имя с расширением .jpg
            orig_name = Path(field_file.name).stem
            field_file.save(f"{orig_name}.jpg", ContentFile(buf.read()), save=False)
            return True
    except Exception:
        # На прод-сервере молча не падаем — оставим исходный файл
        return False


class Build(models.Model):
    STATUS_PLANNED = "planned"
    STATUS_BUILDING = "building"
    STATUS_AVAILABLE = "available"
    STATUS_SOLD = "sold"

    STATUS_CHOICES = (
        (STATUS_PLANNED, "Проект (свободный участок)"),
        (STATUS_BUILDING, "Строится"),
        (STATUS_AVAILABLE, "Готов, продаётся"),
        (STATUS_SOLD, "Продан"),
    )

    title = models.CharField("Название", max_length=200)
    slug = models.SlugField("Слаг (URL)", max_length=220, unique=True)

    area = models.DecimalField("Площадь, м²", max_digits=7, decimal_places=2)
    price = models.DecimalField("Цена от, ₽", max_digits=12, decimal_places=2)

    floors = models.PositiveSmallIntegerField("Этажность", default=1)
    bedrooms = models.PositiveSmallIntegerField("Спален", null=True, blank=True)

    status = models.CharField("Статус", max_length=20, choices=STATUS_CHOICES, default=STATUS_PLANNED)
    is_typical = models.BooleanField("Типовой проект", default=True)

    plot_number = models.CharField(
        "Номер участка на генплане", max_length=20, blank=True,
        help_text="Если проект привязан к конкретному участку ЖК"
    )
    available_in_settlement = models.BooleanField(
        "Можно построить в ЖК «Красная смородина»", default=True
    )
    available_on_client_land = models.BooleanField(
        "Можно построить на участке клиента", default=True
    )

    short_description = models.TextField("Короткое описание", blank=True)
    description = models.TextField("Полное описание", blank=True)

    is_published = models.BooleanField("Опубликовано", default=True)
    is_featured = models.BooleanField("Показывать на главной", default=False)
    created_at = models.DateTimeField("Создано", auto_now_add=True)
    updated_at = models.DateTimeField("Обновлено", auto_now=True)

    class Meta:
        verbose_name = "Проект дома"
        verbose_name_plural = "Проекты домов"
        ordering = ["-is_featured", "-created_at"]

    def __str__(self) -> str:
        return self.title


class _BuildImageBase(models.Model):
    image = models.ImageField("Изображение", upload_to="builds/")
    order = models.PositiveIntegerField("Порядок", default=0)

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        # При первом сохранении файла — сжимаем если он крупнее лимита.
        if self.image and not self.pk:
            _compress_imagefield(self.image)
        elif self.image and self.pk:
            # Если файл изменился (новый upload поверх старого) — тоже сжимаем
            try:
                old = type(self).objects.only("image").get(pk=self.pk)
                if old.image != self.image:
                    _compress_imagefield(self.image)
            except type(self).DoesNotExist:
                pass
        super().save(*args, **kwargs)


class BuildImage(_BuildImageBase):
    build = models.ForeignKey(Build, on_delete=models.CASCADE, related_name="images", verbose_name="Дом")
    image = models.ImageField("Фото дома", upload_to="builds/")

    class Meta:
        verbose_name = "Фото дома"
        verbose_name_plural = "Фото домов"
        ordering = ["order", "id"]


class BuildFloorImage(_BuildImageBase):
    build = models.ForeignKey(Build, on_delete=models.CASCADE, related_name="floors_images", verbose_name="Дом")
    image = models.ImageField("Поэтажный план", upload_to="builds/floors/")

    class Meta:
        verbose_name = "Поэтажный план"
        verbose_name_plural = "Поэтажные планы"
        ordering = ["order", "id"]


class BuildFacadeImage(_BuildImageBase):
    build = models.ForeignKey(Build, on_delete=models.CASCADE, related_name="facades", verbose_name="Дом")
    image = models.ImageField("Схема фасадов", upload_to="builds/facades/")

    class Meta:
        verbose_name = "Схема фасадов"
        verbose_name_plural = "Схемы фасадов"
        ordering = ["order", "id"]


class SpecKey(models.Model):
    SECTION_MAIN = "main"
    SECTION_NETWORKS = "networks"
    SECTION_LAYOUT = "layout"
    SECTION_STRUCT = "struct"

    SECTION_CHOICES = (
        (SECTION_MAIN, "Основные характеристики"),
        (SECTION_NETWORKS, "Подключение к сетям"),
        (SECTION_LAYOUT, "Объемно-планировочные решения"),
        (SECTION_STRUCT, "Конструктивные решения"),
    )

    section = models.CharField("Раздел", max_length=20, choices=SECTION_CHOICES)
    title = models.CharField("Название поля", max_length=220)
    default_value = models.CharField(
        "Значение по умолчанию", max_length=500, blank=True,
        help_text="Подставится при создании нового проекта дома; затем редактируется на карточке",
    )
    order = models.PositiveIntegerField("Порядок", default=0)

    class Meta:
        verbose_name = "Поле характеристик"
        verbose_name_plural = "Поля характеристик"
        ordering = ["section", "order", "id"]
        unique_together = ("section", "title")

    def __str__(self) -> str:
        return f"{self.get_section_display()}: {self.title}"


class BuildSpecValue(models.Model):
    build = models.ForeignKey(Build, on_delete=models.CASCADE, related_name="spec_values", verbose_name="Дом")
    key = models.ForeignKey(SpecKey, on_delete=models.CASCADE, related_name="values", verbose_name="Поле")
    value = models.CharField("Значение", max_length=500, blank=True)

    class Meta:
        verbose_name = "Характеристика дома"
        verbose_name_plural = "Характеристики дома"
        unique_together = ("build", "key")
        ordering = ["key__section", "key__order", "id"]

    def __str__(self) -> str:
        return f"{self.build.title} — {self.key.title}: {self.value}"


class EstimateStage(models.Model):
    title = models.CharField("Название этапа", max_length=220)
    order = models.PositiveIntegerField("Порядок", default=0)

    class Meta:
        verbose_name = "Этап сметы"
        verbose_name_plural = "Этапы сметы"
        ordering = ["order", "id"]
        unique_together = ("title",)

    def __str__(self) -> str:
        return self.title


class BuildEstimateValue(models.Model):
    build = models.ForeignKey(Build, on_delete=models.CASCADE, related_name="estimate_values", verbose_name="Дом")
    stage = models.ForeignKey(EstimateStage, on_delete=models.CASCADE, related_name="values", verbose_name="Этап")

    materials_cost = models.DecimalField("Стоимость материалов, ₽", max_digits=12, decimal_places=2, default=0)
    works_cost = models.DecimalField("Стоимость работ, ₽", max_digits=12, decimal_places=2, default=0)

    class Meta:
        verbose_name = "Строка сметы"
        verbose_name_plural = "Смета"
        unique_together = ("build", "stage")
        ordering = ["stage__order", "id"]

    @property
    def total(self):
        return (self.materials_cost or 0) + (self.works_cost or 0)


@receiver(post_save, sender=Build)
def ensure_templates(sender, instance: Build, created: bool, **kwargs):
    if not created:
        return

    keys = SpecKey.objects.all()
    BuildSpecValue.objects.bulk_create(
        [BuildSpecValue(build=instance, key=k, value=k.default_value) for k in keys],
        ignore_conflicts=True,
    )

    stages = EstimateStage.objects.all()
    BuildEstimateValue.objects.bulk_create(
        [BuildEstimateValue(build=instance, stage=s, materials_cost=0, works_cost=0) for s in stages],
        ignore_conflicts=True,
    )
