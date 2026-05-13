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
    "plot_number", "short_description",
)


class BuildListSerializer(serializers.ModelSerializer):
    cover = serializers.SerializerMethodField()
    status_label = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Build
        fields = COMMON_LIST_FIELDS + ("status_label", "cover")

    def get_cover(self, obj: Build):
        first = obj.images.order_by("order", "id").first()
        return first.image.url if first else None


class BuildDetailSerializer(serializers.ModelSerializer):
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
