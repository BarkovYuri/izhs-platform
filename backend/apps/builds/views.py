from rest_framework.filters import OrderingFilter
from rest_framework.generics import ListAPIView, RetrieveAPIView

from .models import Build
from .serializers import BuildListSerializer, BuildDetailSerializer


class BuildListView(ListAPIView):
    queryset = Build.objects.filter(is_published=True).prefetch_related("images")
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
    )
    serializer_class = BuildDetailSerializer
    lookup_field = "slug"
