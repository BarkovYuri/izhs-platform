from django import forms
from django.contrib import admin
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.utils.html import format_html

from unfold.admin import ModelAdmin

from .models import SiteSettings


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

    fieldsets = (
        ("Бренд", {"fields": ("site_name", "tagline", "about_short")}),
        ("Контакты", {"fields": ("phone", "email", "address")}),
        ("Посёлок", {"fields": ("settlement_name", "settlement_location")}),
        ("Реквизиты", {"fields": ("legal_name", "inn", "ogrnip")}),
        ("Соцсети и мессенджеры", {"fields": ("vk_url", "telegram_url", "whatsapp_url", "max_url")}),
        ("Посёлок — карта и план", {"fields": ("yandex_map_iframe", "settlement_plan", "settlement_plan_preview")}),
        ("Офис — карта", {"fields": ("office_map_iframe",)}),
        ("Аналитика и верификация поисковиков", {
            "fields": ("yandex_metrika_id", "yandex_verification", "google_verification"),
        }),
        ("Контакты — дополнительно", {"fields": ("working_hours",)}),
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
