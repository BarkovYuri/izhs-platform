from django.contrib import admin
from django.utils.html import format_html

from unfold.admin import ModelAdmin, TabularInline

from .models import PortfolioImage, PortfolioItem


class PortfolioImageInline(TabularInline):
    model = PortfolioImage
    extra = 1
    fields = ("image", "preview", "order")
    readonly_fields = ("preview",)
    ordering = ("order", "id")

    def preview(self, obj):
        if obj and obj.image:
            return format_html(
                '<img src="{}" style="max-width:120px;max-height:80px;'
                'border-radius:6px;border:1px solid #ddd;" />',
                obj.image.url,
            )
        return "—"
    preview.short_description = "Превью"


@admin.register(PortfolioItem)
class PortfolioItemAdmin(ModelAdmin):
    list_display = (
        "display_title", "year", "area_display", "is_published", "order",
    )
    list_editable = ("is_published", "order")
    list_filter = ("is_published", "year")
    search_fields = ("title", "description", "location")
    inlines = [PortfolioImageInline]

    fieldsets = (
        ("Основное", {
            "fields": ("title", "description"),
            "description": (
                "Название и описание необязательны — можно залить только "
                "обложку и фото в галерее, и объект уже будет показан."
            ),
        }),
        ("Параметры объекта", {
            "fields": ("year", "area", "location"),
        }),
        ("Обложка", {
            "fields": ("cover", "cover_preview"),
            "description": (
                "Главное фото — то, что увидит посетитель в карточке "
                "на сайте. Большие фото сожмутся автоматически."
            ),
        }),
        ("Видео (опционально)", {
            "fields": ("video_url",),
            "description": (
                "Ссылка на YouTube, RuTube, VK Видео или ВКонтакте. "
                "Сайт сам встроит плеер. Если оставить пустым — видео "
                "просто не показывается."
            ),
        }),
        ("Публикация", {
            "fields": ("order", "is_published"),
        }),
    )
    readonly_fields = ("cover_preview",)

    def cover_preview(self, obj):
        if obj and obj.cover:
            return format_html(
                '<img src="{}" style="max-width:520px;max-height:340px;'
                'border-radius:8px;border:1px solid #ddd;" />',
                obj.cover.url,
            )
        return "—"
    cover_preview.short_description = "Превью обложки"

    def display_title(self, obj):
        return str(obj)
    display_title.short_description = "Объект"

    def area_display(self, obj):
        return f"{obj.area} м²" if obj.area else "—"
    area_display.short_description = "Площадь"
