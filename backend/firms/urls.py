from django.urls import path
from .views import FirmDetailView, RegenerateEmbedKeyView, ValidateEmbedKeyView

urlpatterns = [
    path('', FirmDetailView.as_view(), name='firm-detail'),
    path('regenerate-key/', RegenerateEmbedKeyView.as_view(), name='regenerate-key'),
    path('validate-key/', ValidateEmbedKeyView.as_view(), name='validate-key'),
]
