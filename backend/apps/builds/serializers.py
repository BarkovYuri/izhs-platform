from django.utils import timezone
from rest_framework import serializers
from .models import (
    Build,
    BuildImage, BuildFloorImage, BuildFacadeImage,
    BuildFAQ,
    SpecKey,
    BuildEstimateValue,
)


class ImgSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuildImage
        fields = ("image", "order")


class FloorPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuildFloorImage
        fields = ("image", "order")


class FacadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuildFacadeImage
        fields = ("image", "order")


class EstimateValueSerializer(serializers.ModelSerializer):
    stage_title = serializers.CharField(source="stage.title")
    order = serializers.IntegerField(source="stage.order")
    total = serializers.SerializerMethodField()

    class Meta:
        model = BuildEstimateValue
        fields = ("stage_title", "materials_cost", "works_cost", "total", "order")

    def get_total(self, obj):
        return str(obj.total)


class BuildFAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuildFAQ
        fields = ("question", "answer", "order")


COMMON_LIST_FIELDS = (
    "title", "slug", "area", "price", "floors", "bedrooms",
    "status", "is_typical", "is_featured",
    "available_in_settlement", "available_on_client_land",
    "plot_number", "short_description", "promo",
)


class PromoFieldMixin:
    """Отдаёт активную акцию дома (или null), если она есть.

    Зависит от prefetch_related("promo_links__promotion") на queryset
    вьюхи (см. apps/builds/views.py) — без него будет N+1 на список.
    Импорт apps.promotions.models — не циклический: там Build подключён
    строкой "builds.Build", а не прямым импортом.
    """

    def get_promo(self, obj: Build):
        today = timezone.localdate()
        best = None
        for link in obj.promo_links.all():
            p = link.promotion
            if p.is_published and p.starts_at <= today <= p.ends_at:
                if best is None or p.ends_at < best.promotion.ends_at:
                    best = link
        if best is None:
            return None
        p = best.promotion
        return {
            "promotion_slug": p.slug,
            "promotion_title": p.title,
            "badge_label": p.badge_label,
            "promo_price": str(best.promo_price),
            "starts_at": p.starts_at,
            "ends_at": p.ends_at,
            "contract_deadline": p.contract_deadline,
            "terms": p.terms,
        }


class BuildListSerializer(PromoFieldMixin, serializers.ModelSerializer):
    cover = serializers.SerializerMethodField()
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    promo = serializers.SerializerMethodField()

    class Meta:
        model = Build
        fields = COMMON_LIST_FIELDS + ("status_label", "cover")

    def get_cover(self, obj: Build):
        first = obj.images.order_by("order", "id").first()
        return first.image.url if first else None


class BuildDetailSerializer(PromoFieldMixin, serializers.ModelSerializer):
    images = ImgSerializer(many=True, read_only=True)
    floor_plans = FloorPlanSerializer(many=True, read_only=True, source="floors_images")
    facades = FacadeSerializer(many=True, read_only=True)
    estimate_items = EstimateValueSerializer(many=True, read_only=True, source="estimate_values")
    status_label = serializers.CharField(source="get_status_display", read_only=True)

    specs_main = serializers.SerializerMethodField()
    specs_networks = serializers.SerializerMethodField()
    specs_layout = serializers.SerializerMethodField()
    specs_struct = serializers.SerializerMethodField()
    faq_items = serializers.SerializerMethodField()
    promo = serializers.SerializerMethodField()

    class Meta:
        model = Build
        fields = COMMON_LIST_FIELDS + (
            "status_label", "description",
            "images", "floor_plans", "facades",
            "specs_main", "specs_networks", "specs_layout", "specs_struct",
            "estimate_items",
            "faq_items",
        )

    def get_faq_items(self, obj: Build):
        qs = obj.faq_items.filter(is_published=True).order_by("order", "id")
        return BuildFAQSerializer(qs, many=True).data

    def _specs_by_section(self, obj: Build, section: str):
        qs = obj.spec_values.select_related("key").filter(key__section=section).order_by("key__order", "key__id")
        data = {}
        for row in qs:
            v = (row.value or "").strip()
            if v:
                data[row.key.title] = v
        return data

    def get_specs_main(self, obj): return self._specs_by_section(obj, SpecKey.SECTION_MAIN)
    def get_specs_networks(self, obj): return self._specs_by_section(obj, SpecKey.SECTION_NETWORKS)
    def get_specs_layout(self, obj): return self._specs_by_section(obj, SpecKey.SECTION_LAYOUT)
    def get_specs_struct(self, obj): return self._specs_by_section(obj, SpecKey.SECTION_STRUCT)
