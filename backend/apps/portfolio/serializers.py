from rest_framework import serializers

from .models import PortfolioImage, PortfolioItem


class PortfolioImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioImage
        fields = ("image", "order")


class PortfolioItemSerializer(serializers.ModelSerializer):
    images = PortfolioImageSerializer(many=True, read_only=True)

    class Meta:
        model = PortfolioItem
        fields = (
            "id",
            "title",
            "description",
            "year",
            "area",
            "location",
            "cover",
            "video_url",
            "images",
            "order",
        )
