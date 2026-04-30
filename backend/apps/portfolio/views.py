from rest_framework.generics import ListAPIView

from .models import PortfolioItem
from .serializers import PortfolioItemSerializer


class PortfolioListView(ListAPIView):
    """Публичный список реализованных объектов (только опубликованные)."""

    serializer_class = PortfolioItemSerializer
    pagination_class = None

    def get_queryset(self):
        return (
            PortfolioItem.objects
            .filter(is_published=True)
            .prefetch_related("images")
        )
