from django.urls import path
from .views import PromotionListView, PromotionDetailView

urlpatterns = [
    path("promotions/", PromotionListView.as_view(), name="promotions-list"),
    path("promotions/<slug:slug>/", PromotionDetailView.as_view(), name="promotions-detail"),
]
