from django.urls import path
from .views import BuildListView, BuildDetailView

urlpatterns = [
    path("builds/", BuildListView.as_view(), name="builds-list"),
    path("builds/<slug:slug>/", BuildDetailView.as_view(), name="builds-detail"),
]
