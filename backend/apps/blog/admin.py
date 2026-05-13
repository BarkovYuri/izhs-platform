from django import forms
from django.contrib import admin
from django.utils.html import format_html

from unfold.admin import ModelAdmin

from .models import Article, Category


@admin.register(Category)
class CategoryAdmin(ModelAdmin):
    list_display = ("name", "slug", "order", "is_published", "article_count")
    list_editable = ("order", "is_published")
    search_fields = ("name", "slug", "description")
    prepopulated_fields = {"slug": ("name",)}
    fieldsets = (
        ("Основное", {
            "fields": ("name", "slug", "description"),
            "description": (
                "Категории объединяют статьи по темам. Описание "
                "показывается над списком статей в категории."
            ),
        }),
        ("Публикация", {"fields": ("order", "is_published")}),
    )

    def article_count(self, obj):
        return obj.articles.filter(is_published=True).count()
    article_count.short_description = "Статей"


class ArticleForm(forms.ModelForm):
    class Meta:
        model = Article
        fields = "__all__"
        widgets = {
            "title": forms.TextInput(attrs={"size": 80}),
            "excerpt": forms.Textarea(attrs={"rows": 3, "cols": 80}),
            "body": forms.Textarea(attrs={
                "rows": 25, "cols": 90,
                "style": "font-family: ui-monospace, SFMono-Regular, monospace; font-size: 13px;",
            }),
            "meta_title": forms.TextInput(attrs={"size": 80}),
            "meta_description": forms.Textarea(attrs={"rows": 2, "cols": 80}),
        }


@admin.register(Article)
class ArticleAdmin(ModelAdmin):
    form = ArticleForm
    list_display = (
        "title", "category", "published_at",
        "is_published", "cover_preview",
    )
    list_filter = ("category", "is_published", "published_at")
    list_editable = ("is_published",)
    search_fields = ("title", "slug", "excerpt", "body")
    prepopulated_fields = {"slug": ("title",)}
    date_hierarchy = "published_at"
    readonly_fields = ("cover_preview_big", "created_at", "updated_at")

    fieldsets = (
        ("Заголовок и публикация", {
            "fields": (
                "title", "slug",
                "category",
                "is_published", "published_at",
            ),
        }),
        ("Анонс и обложка", {
            "fields": ("excerpt", "cover", "cover_preview_big"),
            "description": (
                "Excerpt — короткий текст для превью в списках. "
                "Если оставить пустым, возьмутся первые 200 символов "
                "из тела статьи."
            ),
        }),
        ("Текст статьи", {
            "fields": ("body",),
            "description": (
                "Поддерживается markdown-lite:\n"
                "  ## Заголовок 2-го уровня\n"
                "  ### Заголовок 3-го уровня\n"
                "  **жирный**   *курсив*\n"
                "  [текст ссылки](https://example.com)\n"
                "  - пункт списка (или •)\n"
                "  > цитата (начинается с >)\n\n"
                "Между абзацами оставляйте пустую строку."
            ),
        }),
        ("SEO (опционально)", {
            "fields": ("meta_title", "meta_description"),
            "classes": ("collapse",),
            "description": (
                "Если оставить пустыми — будут использованы title "
                "и excerpt."
            ),
        }),
        ("Технические поля", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",),
        }),
    )

    def cover_preview(self, obj):
        if obj and obj.cover:
            return format_html(
                '<img src="{}" style="max-width:80px;max-height:50px;'
                'border-radius:4px;border:1px solid #ddd;" />',
                obj.cover.url,
            )
        return "—"
    cover_preview.short_description = "Обложка"

    def cover_preview_big(self, obj):
        if obj and obj.cover:
            return format_html(
                '<img src="{}" style="max-width:520px;max-height:340px;'
                'border-radius:8px;border:1px solid #ddd;" />',
                obj.cover.url,
            )
        return "—"
    cover_preview_big.short_description = "Предпросмотр обложки"
