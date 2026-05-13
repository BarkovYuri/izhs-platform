from rest_framework import serializers
from .models import (
    BuildFilterContent,
    PageContent,
    PageContentImage,
    SiteSettings,
)


class BuildFilterContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuildFilterContent
        fields = (
            "slug", "kicker", "title", "intro",
            "meta_title", "meta_description",
        )


class PageContentImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageContentImage
        fields = ("image", "alt", "order")


class PageContentSerializer(serializers.ModelSerializer):
    images = PageContentImageSerializer(many=True, read_only=True)

    class Meta:
        model = PageContent
        fields = (
            "slug",
            "kicker", "title", "subtitle", "body",
            "hero_lead", "hero_accent",
            "meta_title", "meta_description",
            "images",
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
            "warranty_years", "warranty_subject",
            "founded_year",
            "homes_built_total",
            "settlement_homes_built", "settlement_homes_total",
            "about_short",
            "about_intro", "about_escrow", "about_settlement", "about_outro",
            "directions_list", "advantages_list", "partner_banks",
            "seo_title_default", "seo_description_default",
        )
