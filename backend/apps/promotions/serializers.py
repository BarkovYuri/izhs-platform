from rest_framework import serializers

from .models import Promotion, PromotionBuild


class PromotionBuildSerializer(serializers.ModelSerializer):
    build_slug = serializers.CharField(source="build.slug", read_only=True)
    build_title = serializers.CharField(source="build.title", read_only=True)
    build_cover = serializers.SerializerMethodField()
    original_price = serializers.DecimalField(
        source="build.price", max_digits=12, decimal_places=2, read_only=True,
    )
    discount_percent = serializers.IntegerField(read_only=True)

    class Meta:
        model = PromotionBuild
        fields = (
            "build_slug", "build_title", "build_cover",
            "original_price", "promo_price", "discount_percent",
        )

    def get_build_cover(self, obj: PromotionBuild):
        first = obj.build.images.order_by("order", "id").first()
        return first.image.url if first else None


class PromotionSerializer(serializers.ModelSerializer):
    is_active = serializers.BooleanField(read_only=True)
    builds = PromotionBuildSerializer(source="build_links", many=True, read_only=True)

    class Meta:
        model = Promotion
        fields = (
            "title", "slug", "badge_label",
            "banner_title", "banner_subtitle", "banner_image",
            "terms", "contract_deadline",
            "starts_at", "ends_at", "is_active",
            "builds",
        )
