from django.http import Http404, JsonResponse
from rest_framework.generics import RetrieveAPIView

from .models import PageContent, SiteSettings
from .serializers import PageContentSerializer, SiteSettingsSerializer


def health(request):
    return JsonResponse({"status": "ok"})


class SiteSettingsView(RetrieveAPIView):
    serializer_class = SiteSettingsSerializer

    def get_object(self):
        return SiteSettings.load()


class PageContentView(RetrieveAPIView):
    """Возвращает тексты заголовков/SEO для конкретной страницы."""

    serializer_class = PageContentSerializer
    lookup_field = "slug"

    def get_object(self):
        slug = self.kwargs[self.lookup_field]
        valid = {s for s, _ in PageContent.PAGE_CHOICES}
        if slug not in valid:
            raise Http404("Unknown page slug")
        obj, _ = PageContent.objects.get_or_create(slug=slug)
        return obj
