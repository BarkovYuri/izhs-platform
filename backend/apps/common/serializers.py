from rest_framework import serializers
from .models import PageContent, SiteSettings


class PageContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageContent
        fields = (
            "slug",
            "kicker", "title", "subtitle",
            "meta_title", "meta_description",
        )


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = (
            "site_name", "tagline",
            "phone", "email", "address",
            "settlement_name", "settlement_location",
            "legal_name", "inn", "ogrnip",
            "vk_url", "telegram_url", "whatsapp_url", "max_url",
            "yandex_map_iframe", "office_map_iframe", "settlement_plan",
            "yandex_metrika_id", "yandex_verification", "google_verification",
            "working_hours",
            "about_short",
            "about_intro", "about_escrow", "about_settlement", "about_outro",
            "directions_list", "advantages_list", "partner_banks",
            "seo_title_default", "seo_description_default",
        )
