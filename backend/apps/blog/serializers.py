from rest_framework import serializers

from .models import Article, ArticleImage, Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("name", "slug", "description", "order")


class ArticleImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArticleImage
        fields = ("image", "alt", "order")


class ArticleListSerializer(serializers.ModelSerializer):
    """Облегчённый сериализатор для списка — без полного body."""

    category = CategorySerializer(read_only=True)

    class Meta:
        model = Article
        fields = (
            "title", "slug",
            "excerpt", "cover",
            "category",
            "published_at",
        )


class ArticleDetailSerializer(serializers.ModelSerializer):
    """Полный сериализатор для отдельной страницы статьи."""

    category = CategorySerializer(read_only=True)
    inline_images = ArticleImageSerializer(many=True, read_only=True)

    class Meta:
        model = Article
        fields = (
            "title", "slug",
            "excerpt", "body", "cover",
            "category",
            "published_at", "updated_at",
            "meta_title", "meta_description", "keywords",
            "inline_images",
        )
