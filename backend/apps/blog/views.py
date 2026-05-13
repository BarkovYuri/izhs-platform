from rest_framework.generics import ListAPIView, RetrieveAPIView

from .models import Article, Category
from .serializers import (
    ArticleDetailSerializer,
    ArticleListSerializer,
    CategorySerializer,
)


class ArticleListView(ListAPIView):
    """Публичный список статей блога (только опубликованные)."""

    serializer_class = ArticleListSerializer
    pagination_class = None

    def get_queryset(self):
        qs = (
            Article.objects
            .filter(is_published=True)
            .select_related("category")
        )
        category_slug = self.request.query_params.get("category")
        if category_slug:
            qs = qs.filter(category__slug=category_slug)
        return qs


class ArticleDetailView(RetrieveAPIView):
    serializer_class = ArticleDetailSerializer
    lookup_field = "slug"

    def get_queryset(self):
        return (
            Article.objects
            .filter(is_published=True)
            .select_related("category")
        )


class CategoryListView(ListAPIView):
    serializer_class = CategorySerializer
    pagination_class = None

    def get_queryset(self):
        return Category.objects.filter(is_published=True)
