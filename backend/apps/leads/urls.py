from django.urls import path
from .views import LeadCreateView

urlpatterns = [
    path("leads/", LeadCreateView.as_view(), name="leads-create"),
]
