from django.urls import path
from .views import AskView, ChatHistoryView, SessionDetailView, ChatStatsView

urlpatterns = [
    path('ask/', AskView.as_view(), name='ask'),
    path('history/', ChatHistoryView.as_view(), name='chat-history'),
    path('session/<uuid:session_id>/', SessionDetailView.as_view(), name='session-detail'),
    path('stats/', ChatStatsView.as_view(), name='chat-stats'),
]
