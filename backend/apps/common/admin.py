from django import forms
from django.contrib import admin
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.utils.html import format_html

from unfold.admin import ModelAdmin, TabularInline

from .models import (
    BuildFilterContent,
    PageContent,
    PageContentImage,
    PageContentVideo,
    SiteSettings,
)


PAGE_FRONT_URLS = {
    PageContent.PAGE_HOME: "/",
    PageContent.PAGE_BUILDS: "/builds",
    PageContent.PAGE_FAQ: "/faq",
    PageContent.PAGE_ABOUT: "/about",
    PageContent.PAGE_CONTACTS: "/contacts",
    PageContent.PAGE_SETTLEMENT: "/settlement",
    PageContent.PAGE_PORTFOLIO: "/portfolio",
}


class SiteSettingsForm(forms.ModelForm):
    class Meta:
        model = SiteSettings
        fields = "__all__"
        widgets = {
            "tagline": forms.TextInput(attrs={"size": 80}),
            "about_short": forms.Textarea(attrs={"rows": 4, "cols": 80}),
            "about_intro": forms.Textarea(attrs={"rows": 5, "cols": 80}),
            "about_escrow": forms.Textarea(attrs={"rows": 5, "cols": 80}),
            "about_settlement": forms.Textarea(attrs={"rows": 4, "cols": 80}),
            "about_outro": forms.Textarea(attrs={"rows": 4, "cols": 80}),
            "directions_list": forms.Textarea(attrs={"rows": 6, "cols": 80}),
            "advantages_list": forms.Textarea(attrs={"rows": 6, "cols": 80}),
            "seo_title_default": forms.TextInput(attrs={"size": 80}),
            "seo_description_default": forms.Textarea(attrs={"rows": 2, "cols": 80}),
            "yandex_map_iframe": forms.Textarea(attrs={
                "rows": 4, "cols": 80,
                "style": "font-family: monospace; font-size: 11px;",
            }),
            "office_map_iframe": forms.Textarea(attrs={
                "rows": 4, "cols": 80,
                "style": "font-family: monospace; font-size: 11px;",
            }),
        }


@admin.register(SiteSettings)
class SiteSettingsAdmin(ModelAdmin):
    form = SiteSettingsForm
    save_on_top = True
    change_form_template = "admin/common/sitesettings/change_form.html"

    fieldsets = (
        ("Бренд", {"fields": ("site_name", "tagline", "about_short")}),
        ("Контакты", {"fields": ("phone", "email", "address")}),
        ("ЖК (жилой комплекс)", {"fields": ("settlement_name", "settlement_location")}),
        ("Реквизиты", {"fields": ("legal_name", "inn", "ogrnip")}),
        ("Соцсети и мессенджеры", {"fields": ("vk_url", "telegram_url", "whatsapp_url", "max_url")}),
        ("ЖК — карта и генплан", {"fields": ("yandex_map_iframe", "settlement_plan", "settlement_plan_preview")}),
        ("Офис — карта", {"fields": ("office_map_iframe",)}),
        ("Аналитика и верификация поисковиков", {
            "fields": ("yandex_metrika_id", "yandex_verification", "google_verification"),
        }),
        ("Контакты — дополнительно", {"fields": ("working_hours",)}),
        ("Гарантия", {
            "fields": ("warranty_years", "warranty_subject"),
            "description": (
                "Используется в Hero на главной, в футере и в "
                "Schema.org для поисковиков."
            ),
        }),
        ("Стаж и статистика", {
            "fields": (
                "founded_year",
                "homes_built_total",
                "settlement_homes_built",
                "settlement_homes_total",
            ),
            "description": (
                "Эти числа показываются в Hero на главной и в блоке "
                "статистики ЖК. Меняй их по мере роста — переделывать "
                "сайт не нужно."
            ),
        }),
        ("О компании — расширенный блок", {
            "fields": ("about_intro", "about_escrow", "about_settlement", "about_outro",
                       "directions_list", "advantages_list", "partner_banks"),
            "classes": ("collapse",),
        }),
        ("SEO по умолчанию", {"fields": ("seo_title_default", "seo_description_default")}),
    )

    readonly_fields = ("settlement_plan_preview",)

    def settlement_plan_preview(self, obj):
        if obj and obj.settlement_plan:
            return format_html(
                '<img src="{}" style="max-width:520px;max-height:340px;'
                'border-radius:8px;border:1px solid #ddd;" />',
                obj.settlement_plan.url,
            )
        return "—"
    settlement_plan_preview.short_description = "Предпросмотр генплана"

    def has_add_permission(self, request):
        return not SiteSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False

    def changelist_view(self, request, extra_context=None):
        obj = SiteSettings.load()
        return HttpResponseRedirect(
            reverse("admin:common_sitesettings_change", args=(obj.pk,))
        )


class PageContentImageInline(TabularInline):
    model = PageContentImage
    extra = 0
    fields = ("image", "preview", "alt", "order")
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


class PageContentVideoInline(TabularInline):
    model = PageContentVideo
    extra = 0
    fields = ("video_url", "title", "order", "is_published")
    ordering = ("order", "id")


class PageContentForm(forms.ModelForm):
    class Meta:
        model = PageContent
        fields = "__all__"
        widgets = {
            "kicker": forms.TextInput(attrs={"size": 60}),
            "title": forms.TextInput(attrs={"size": 80}),
            "subtitle": forms.Textarea(attrs={"rows": 3, "cols": 80}),
            "body": forms.Textarea(attrs={"rows": 14, "cols": 80}),
            "hero_lead": forms.TextInput(attrs={"size": 60}),
            "hero_accent": forms.TextInput(attrs={"size": 60}),
            "meta_title": forms.TextInput(attrs={"size": 80}),
            "meta_description": forms.Textarea(attrs={"rows": 2, "cols": 80}),
        }


@admin.register(PageContent)
class PageContentAdmin(ModelAdmin):
    form = PageContentForm
    list_display = ("page_label", "title", "kicker", "view_on_site_link")
    list_display_links = ("page_label", "title")
    readonly_fields = ("page_help",)
    change_form_template = "admin/common/sitesettings/change_form.html"
    inlines = [PageContentImageInline, PageContentVideoInline]

    fieldsets = (
        ("Какая страница", {
            "fields": ("slug", "page_help"),
            "description": (
                "Выберите страницу сайта, тексты которой хотите изменить. "
                "Каждая страница хранится одной записью — менять slug "
                "у уже существующей записи не нужно."
            ),
        }),
        ("Видимый текст на странице", {
            "fields": ("kicker", "title", "subtitle"),
            "description": (
                "Это то, что увидит посетитель в самом верху страницы: "
                "мини-метка, большой заголовок и короткий лид-абзац под ним."
            ),
        }),
        ("Hero на главной (только для slug=home)", {
            "fields": ("hero_lead", "hero_accent"),
            "description": (
                "Большой заголовок в Hero делится на белую и оранжевую "
                "часть. На остальных страницах эти поля игнорируются."
            ),
            "classes": ("collapse",),
        }),
        ("Основной текст страницы", {
            "fields": ("body",),
            "description": (
                "Длинное описание (например, описание ЖК). Поддерживает "
                "абзацы и маркированные списки."
            ),
            "classes": ("collapse",),
        }),
        ("Для поисковых систем (SEO)", {
            "fields": ("meta_title", "meta_description"),
            "classes": ("collapse",),
            "description": (
                "Эти поля видят только Google, Яндекс и социальные сети — "
                "для красивых превью при шеринге ссылки."
            ),
        }),
    )

    def page_label(self, obj):
        return obj.get_slug_display()
    page_label.short_description = "Страница"
    page_label.admin_order_field = "slug"

    def view_on_site_link(self, obj):
        url = PAGE_FRONT_URLS.get(obj.slug)
        if not url:
            return "—"
        return format_html(
            '<a href="{}" target="_blank" rel="noopener" '
            'style="color: rgb(184,90,53); font-weight:600;">'
            'Открыть на сайте ↗</a>',
            url,
        )
    view_on_site_link.short_description = "Просмотр"

    def page_help(self, obj):
        if not obj or not obj.pk:
            return "—"
        url = PAGE_FRONT_URLS.get(obj.slug, "")
        if obj.slug == PageContent.PAGE_HOME:
            extra = (
                '<div style="margin-top:8px;padding:8px 12px;'
                'background:rgb(253,246,240);border:1px solid '
                'rgb(243,207,184);border-radius:6px;color:rgb(120,60,20);">'
                '<b>Hero на главной:</b> большой заголовок собирается из '
                'двух частей — «белая» (поле «Hero — заголовок, белая '
                'часть») и «оранжевая» (акцентная). По умолчанию: '
                '«Свой кирпичный дом / по цене квартиры».'
                '</div>'
            )
        elif obj.slug == PageContent.PAGE_SETTLEMENT:
            extra = (
                '<div style="margin-top:8px;padding:8px 12px;'
                'background:rgb(253,246,240);border:1px solid '
                'rgb(243,207,184);border-radius:6px;color:rgb(120,60,20);">'
                '<b>Описание ЖК:</b> разверните блок «Основной текст '
                'страницы» — там описание комплекса. Поддерживаются '
                'абзацы (пустая строка) и маркеры списка (строка '
                'начинается с «-» или «•»).'
                '</div>'
            )
        else:
            extra = ""
        return format_html(
            '<div style="padding:10px 14px;background:rgb(253,246,240);'
            'border:1px solid rgb(243,207,184);border-radius:8px;'
            'font-size:13px;line-height:1.55;">'
            '<b>Эти тексты отображаются на странице:</b> '
            '<a href="{0}" target="_blank" rel="noopener" '
            'style="color:rgb(184,90,53);font-weight:600;">'
            'https://remstroy70.ru{0} ↗</a><br>'
            'После сохранения изменения появятся на сайте автоматически '
            '(обычно в течение нескольких секунд).{1}'
            '</div>',
            url,
            format_html(extra) if extra else "",
        )
    page_help.short_description = " "

    def has_delete_permission(self, request, obj=None):
        # Записи создаются миграцией. Удалять не нужно — иначе после
        # повторного захода в админку придётся пересоздавать вручную.
        return False


class BuildFilterContentForm(forms.ModelForm):
    class Meta:
        model = BuildFilterContent
        fields = "__all__"
        widgets = {
            "kicker": forms.TextInput(attrs={"size": 60}),
            "title": forms.TextInput(attrs={"size": 80}),
            "intro": forms.Textarea(attrs={"rows": 5, "cols": 80}),
            "meta_title": forms.TextInput(attrs={"size": 80}),
            "meta_description": forms.Textarea(attrs={"rows": 3, "cols": 80}),
        }


@admin.register(BuildFilterContent)
class BuildFilterContentAdmin(ModelAdmin):
    form = BuildFilterContentForm
    list_display = ("slug", "title", "kicker", "view_on_site_link")
    list_display_links = ("slug", "title")
    search_fields = ("slug", "title", "intro")
    ordering = ("slug",)

    fieldsets = (
        ("Технический идентификатор", {
            "fields": ("slug",),
            "description": (
                "Slug фильтра должен совпадать с FILTER_TYPES в "
                "frontend/src/lib/buildFilters.ts. Записи создаются "
                "миграцией — новый фильтр добавляется сначала в коде, "
                "потом сюда. Не меняй slug без согласования с фронтом."
            ),
        }),
        ("Видимый текст на странице", {
            "fields": ("kicker", "title", "intro"),
            "description": (
                "Эти тексты увидит посетитель: kicker над H1, сам H1 "
                "и лид-абзац под ним. Если оставить пустыми — на "
                "фронте подставится дефолт из buildFilters.ts."
            ),
        }),
        ("Для поисковых систем (SEO)", {
            "fields": ("meta_title", "meta_description"),
            "classes": ("collapse",),
            "description": (
                "Title и description для выдачи Google/Яндекса. "
                "До ~60 символов в title, до ~160 в description."
            ),
        }),
    )

    def view_on_site_link(self, obj):
        return format_html(
            '<a href="/builds/filtr/{}" target="_blank" rel="noopener" '
            'style="color: rgb(184,90,53); font-weight:600;">'
            'Открыть на сайте ↗</a>',
            obj.slug,
        )
    view_on_site_link.short_description = "Просмотр"

    def has_delete_permission(self, request, obj=None):
        # Записи создаются миграцией. Удалять нельзя — фильтр в коде
        # будет искать запись и упадёт на fallback к хардкоду.
        return False

    def has_add_permission(self, request):
        # Новые фильтры добавляются миграцией, не через UI.
        return False
