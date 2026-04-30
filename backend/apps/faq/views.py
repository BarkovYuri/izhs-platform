from rest_framework.generics import ListAPIView

from .models import FaqCategory, FaqItem
from .serializers import FaqCategorySerializer, FaqItemSerializer


class FaqGroupedListView(ListAPIView):
    """Возвращает категории с вложенными вопросами для отрисовки на странице FAQ."""
    serializer_class = FaqCategorySerializer

    def get_queryset(self):
        return FaqCategory.objects.prefetch_related("items").order_by("order", "id")


class FaqFlatListView(ListAPIView):
    """Плоский список вопросов (на случай, если категории не используются)."""
    serializer_class = FaqItemSerializer

    def get_queryset(self):
        return FaqItem.objects.filter(is_published=True).order_by("category__order", "order", "id")
