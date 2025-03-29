from django.urls import path
from .views import (
    ConversationsView,
    ConversationDetailView,
    MessageView,
)

urlpatterns = [
    path("conversations/", ConversationsView.as_view(), name="conversations"),
    path(
        "conversations/<int:pk>/",
        ConversationDetailView.as_view(),
        name="conversation-detail",
    ),
    path(
        "conversations/<int:conversation_id>/messages/",
        MessageView.as_view(),
        name="message-list",
    ),
    # path('messages/<int:pk>/', MessageDetailView.as_view(), name='message-detail'),
    # path('messages/<int:message_id>/reactions/', MessageReactionView.as_view(), name='message-reactions'),
]
