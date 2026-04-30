from django.urls import path, include
from .views import health, SiteSettingsView

urlpatterns = [
    path("health/", health, name="health"),
    path("settings/", SiteSettingsView.as_view(), name="site-settings"),
    path("", include("apps.builds.urls")),
    path("", include("apps.leads.urls")),
    path("", include("apps.faq.urls")),
]
