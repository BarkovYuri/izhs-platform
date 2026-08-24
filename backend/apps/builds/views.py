from django.db.models import Prefetch
from rest_framework.filters import OrderingFilter
from rest_framework.generics import ListAPIView, RetrieveAPIView

from apps.promotions.models import PromotionBuild

from .models import Build
from .serializers import BuildListSerializer, BuildDetailSerializer

_PROMO_PREFETCH = Prefetch(
    "promo_links",
    queryset=PromotionBuild.objects.select_related("promotion"),
)


class BuildListView(ListAPIView):
    queryset = Build.objects.filter(is_published=True).prefetch_related(
        "images", _PROMO_PREFETCH,
    )
    serializer_class = BuildListSerializer
    filter_backends = [OrderingFilter]
    ordering_fields = ["price", "area", "created_at"]
    ordering = ["-is_featured", "-created_at"]


class BuildDetailView(RetrieveAPIView):
    queryset = Build.objects.filter(is_published=True).prefetch_related(
        "images",
        "floors_images",
        "facades",
        "spec_values__key",
        "estimate_values__stage",
        _PROMO_PREFETCH,
    )
    serializer_class = BuildDetailSerializer
    lookup_field = "slug"
