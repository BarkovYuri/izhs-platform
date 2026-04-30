from rest_framework import serializers
from .models import FaqCategory, FaqItem


class FaqItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FaqItem
        fields = ("id", "question", "answer", "order")


class FaqCategorySerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()

    class Meta:
        model = FaqCategory
        fields = ("id", "title", "slug", "order", "items")

    def get_items(self, obj: FaqCategory):
        qs = obj.items.filter(is_published=True).order_by("order", "id")
        return FaqItemSerializer(qs, many=True).data
