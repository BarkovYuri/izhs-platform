from django.urls import path, include
from .views import (
    BuildFilterContentListView,
    health,
    PageContentView,
    SiteSettingsView,
)

urlpatterns = [
    path("health/", health, name="health"),
    path("settings/", SiteSettingsView.as_view(), name="site-settings"),
    path(
        "page/<slug:slug>/",
        PageContentView.as_view(),
        name="page-content",
    ),
    path(
        "build-filters/",
        BuildFilterContentListView.as_view(),
        name="build-filters",
    ),
    path("", include("apps.builds.urls")),
    path("", include("apps.leads.urls")),
    path("", include("apps.faq.urls")),
    path("", include("apps.portfolio.urls")),
    path("", include("apps.blog.urls")),
]
