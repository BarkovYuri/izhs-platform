from django.http import JsonResponse
from rest_framework.generics import RetrieveAPIView

from .models import SiteSettings
from .serializers import SiteSettingsSerializer


def health(request):
    return JsonResponse({"status": "ok"})


class SiteSettingsView(RetrieveAPIView):
    serializer_class = SiteSettingsSerializer

    def get_object(self):
        return SiteSettings.load()
