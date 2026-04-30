from django.urls import path, include
from .views import health, PageContentView, SiteSettingsView

urlpatterns = [
    path("health/", health, name="health"),
    path("settings/", SiteSettingsView.as_view(), name="site-settings"),
    path(
        "page/<slug:slug>/",
        PageContentView.as_view(),
        name="page-content",
    ),
    path("", include("apps.builds.urls")),
    path("", include("apps.leads.urls")),
    path("", include("apps.faq.urls")),
    path("", include("apps.portfolio.urls")),
]
