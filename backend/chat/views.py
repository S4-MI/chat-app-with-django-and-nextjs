from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q
from rest_framework import generics
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import ListCreateAPIView
from rest_framework.permissions import IsAuthenticated

from .models import (
    Conversation,
    Message,
)
from .serializers import (
    ConversationsSerializer,
    ConversationDetailSerializer,
    MessageSerializer,
)


class ConversationsView(ListCreateAPIView):
    """List all conversations of the authenticated user and create a new conversation"""

    serializer_class = ConversationsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Conversation.objects.filter(members=self.request.user)

        # TODO: Add search filter
        # Add search filter
        search_query = self.request.query_params.get("search", None)
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query)  # Search in conversation title
                | Q(
                    members__username__icontains=search_query
                )  # Search in members' usernames
                | Q(
                    members__first_name__icontains=search_query
                )  # Search in members' first names
            ).distinct()

        return queryset


class ConversationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a conversation"""

    serializer_class = ConversationDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Conversation.objects.filter(members=user)

    def perform_update(self, serializer):
        conversation = self.get_object()

        # Check if user is admin
        is_admin = conversation.admin == self.request.user

        if not is_admin and conversation.is_group:
            raise PermissionDenied("Only group admins can update the conversation")

        # Update the conversation
        serializer.save()

        # Create a system message for the update
        if conversation.is_group:
            Message.objects.create(
                conversation=conversation,
                sender=None,
                content=f"{self.request.user.username} updated the group",
                type=Message.MessageType.SYSTEM,
            )


class MessageView(ListCreateAPIView):
    """List all messages in a conversation or create a new message"""

    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        conversation_id = self.kwargs["conversation_id"]
        user = self.request.user
        conversation = get_object_or_404(Conversation, id=conversation_id)

        # Check if user is a member of this conversation
        if not conversation.members.filter(id=user.id).exists():
            raise PermissionDenied("You are not a member of this conversation")

        # Get all messages in the conversation
        return Message.objects.filter(conversation_id=conversation_id).select_related(
            "sender"
        )

    def perform_create(self, serializer):
        conversation_id = self.kwargs["conversation_id"]
        user = self.request.user
        conversation = get_object_or_404(Conversation, id=conversation_id)

        # Check if user is a member of this conversation
        if not conversation.members.filter(id=user.id).exists():
            raise PermissionDenied("You are not a member of this conversation")

        # Save the message
        message = serializer.save(sender=user, conversation_id=conversation_id)

        # Update the conversation's last_updated timestamp
        conversation.updated_at = timezone.now()
        conversation.save()

        # # Send notifications to other members
        # channel_layer = get_channel_layer()

        # # Get other active members
        # other_members = conversation.members.exclude(id=user.id)

        # async_to_sync(channel_layer.group_send)(
        #     f"conversation_{conversation_id}",
        #     {"type": "new_message", "message": message},
        # )
