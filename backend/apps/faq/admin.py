from django.contrib import admin

from unfold.admin import ModelAdmin, TabularInline

from .models import FaqCategory, FaqItem


class FaqItemInline(TabularInline):
    model = FaqItem
    extra = 1
    tab = True
    fields = ("question", "answer", "order", "is_published")
    verbose_name = "Вопрос"
    verbose_name_plural = "Вопросы в категории"


@admin.register(FaqCategory)
class FaqCategoryAdmin(ModelAdmin):
    list_display = ("title", "slug", "order")
    list_display_links = ("title",)
    list_editable = ("order",)
    prepopulated_fields = {"slug": ("title",)}
    ordering = ("order", "id")
    save_on_top = True
    inlines = [FaqItemInline]


@admin.register(FaqItem)
class FaqItemAdmin(ModelAdmin):
    list_display = ("question", "category", "order", "is_published")
    list_display_links = ("question",)
    list_filter = ("category", "is_published")
    list_editable = ("order", "is_published")
    search_fields = ("question", "answer")
    save_on_top = True
    fieldsets = (
        ("Вопрос-ответ", {"fields": ("category", "question", "answer")}),
        ("Отображение", {"fields": ("order", "is_published")}),
    )
