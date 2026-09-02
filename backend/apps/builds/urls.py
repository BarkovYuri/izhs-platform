from django.urls import path
from .views import BuildListView, BuildDetailView
from .feeds import realty_feed

urlpatterns = [
    path("builds/", BuildListView.as_view(), name="builds-list"),
    path("builds/<slug:slug>/", BuildDetailView.as_view(), name="builds-detail"),
    path("feeds/realty.xml", realty_feed, name="realty-feed"),
]
