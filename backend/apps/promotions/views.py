from django.utils import timezone
from rest_framework.generics import ListAPIView, RetrieveAPIView

from .models import Promotion
from .serializers import PromotionSerializer


def _active_promotions_qs():
    today = timezone.localdate()
    return (
        Promotion.objects
        .filter(is_published=True, starts_at__lte=today, ends_at__gte=today)
        .prefetch_related("build_links__build__images")
        .order_by("ends_at", "-created_at")
    )


class PromotionListView(ListAPIView):
    serializer_class = PromotionSerializer

    def get_queryset(self):
        return _active_promotions_qs()


class PromotionDetailView(RetrieveAPIView):
    serializer_class = PromotionSerializer
    lookup_field = "slug"

    def get_queryset(self):
        return _active_promotions_qs()
