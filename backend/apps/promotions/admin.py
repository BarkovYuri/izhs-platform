from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import ModelAdmin, TabularInline

from .models import Promotion, PromotionBuild


class PromotionBuildInline(TabularInline):
    model = PromotionBuild
    extra = 1
    tab = True
    autocomplete_fields = ["build"]
    fields = ("build", "promo_price")
    verbose_name = "Дом по акции"
    verbose_name_plural = "Дома по акции"


class PromotionAdmin(ModelAdmin):
    list_display = ("title", "status_badge", "starts_at", "ends_at", "contract_deadline", "is_published")
    list_display_links = ("title",)
    list_filter = ("is_published",)
    search_fields = ("title", "slug")
    prepopulated_fields = {"slug": ("title",)}
    save_on_top = True
    inlines = [PromotionBuildInline]

    fieldsets = (
        ("Основное", {
            "fields": ("title", "slug", "badge_label", "is_published"),
        }),
        ("Сроки", {
            "fields": ("starts_at", "ends_at", "contract_deadline"),
        }),
        ("Условия", {
            "fields": ("terms",),
        }),
        ("Баннер", {
            "fields": ("banner_title", "banner_subtitle", "banner_image"),
        }),
    )

    def status_badge(self, obj):
        if obj.is_active:
            return format_html(
                '<span style="color:#1a7a3a;font-weight:600;">● активна</span>'
            )
        return format_html(
            '<span style="color:#8a8a8a;">○ неактивна</span>'
        )
    status_badge.short_description = "Статус"


admin.site.register(Promotion, PromotionAdmin)
