from django.urls import path
from .views import FaqGroupedListView, FaqFlatListView

urlpatterns = [
    path("faq/", FaqGroupedListView.as_view(), name="faq-grouped"),
    path("faq/flat/", FaqFlatListView.as_view(), name="faq-flat"),
]
