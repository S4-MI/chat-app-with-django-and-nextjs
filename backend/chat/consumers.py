import json
import logging

from rest_framework.renderers import JSONRenderer
from asgiref.sync import async_to_sync
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from django.utils import timezone


from accounts.serializers import UserMinimalSerializer
from .serializers import MessageSerializer

from .models import Conversation, Message

logger = logging.getLogger("django.request")

User = get_user_model()


class ConversationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        logger.info(f"================================================")
        logger.info(f"ConversationConsumer connect: {self.user}")
        logger.info(f"================================================\n\n")

        if not self.user.is_authenticated:
            await self.close()
            return

        self.conversation_id = self.scope["url_route"]["kwargs"]["conversation_id"]
        self.conversation_group_name = f"conversation_{self.conversation_id}"
        self.user_id = self.user.id

        # Check if the user is a member of this conversation
        is_member = await self.is_conversation_member(
            self.user_id, self.conversation_id
        )
        if not is_member:
            await self.close()
            return

        # Join the conversation group
        await self.channel_layer.group_add(
            self.conversation_group_name, self.channel_name
        )

        await self.accept()

        logger.info(f"================================================")
        logger.info(f"ConversationConsumer accept: {self.user}")
        logger.info(f"================================================\n\n")

        await self.send(
            text_data=json.dumps(
                {
                    "type": "join",
                    "message": "You have successfully joined the conversation",
                }
            )
        )

    async def disconnect(self, close_code):
        if hasattr(self, "conversation_group_name"):
            # Leave conversation group
            await self.channel_layer.group_discard(
                self.conversation_group_name, self.channel_name
            )

    async def receive(self, text_data):
        logger.info(f"================================================")
        logger.info(f"ConversationConsumer receive: {text_data}")
        logger.info(f"================================================\n\n")

        try:
            json_data = json.loads(text_data)
            message_type = json_data.get("type", "message")

            logger.info(f"================================================")
            logger.info(f"ConversationConsumer json_data: {json_data}")
            logger.info(f"================================================\n\n")

            if message_type == "message":
                content = json_data.get("content", "")

                # Save message to database
                message = await self.save_message(
                    user_id=self.user.id,
                    conversation_id=self.conversation_id,
                    content=content,
                )

                logger.info(f"================================================")
                logger.info(f"ConversationConsumer receive: {message}")
                logger.info(f"================================================\n\n")

                # Send message to the conversation group
                await self.channel_layer.group_send(
                    self.conversation_group_name,
                    {"type": "chat_message", "message": message},
                )

                # Update conversation's updated_at timestamp
                # await self.update_conversation_timestamp(self.conversation_id)

            elif message_type == "typing":
                # Inform others that user is typing
                is_typing = json_data.get("is_typing", False)

                await self.channel_layer.group_send(
                    self.conversation_group_name,
                    {
                        "type": "typing_status",
                        "user": self.user,
                        "is_typing": is_typing,
                    },
                )

        except Exception as e:
            # Send error message to the client
            await self.send(text_data=json.dumps({"type": "error", "message": str(e)}))

            logger.error(f"================================================")
            logger.error(f"ConversationConsumer receive error: {e}")
            logger.error(f"================================================\n\n")

    async def chat_message(self, event):
        logger.info(f"================================================")
        logger.info(f"ConversationConsumer chat_message: {event}")
        logger.info(f"================================================\n\n")

        message = event["message"]

        if message["sender"]["id"] == self.user.id:
            message["is_own_message"] = True

        # Send message to WebSocket
        await self.send(
            text_data=json.dumps({"type": "new_message", "message": message})
        )

    async def typing_status(self, event):
        if event["user"].id == self.user.id:
            return

        user = json.loads(
            JSONRenderer().render(UserMinimalSerializer(event["user"]).data)
        )

        await self.send(
            text_data=json.dumps(
                {
                    "type": "typing_status",
                    "user": user,
                    "is_typing": event["is_typing"],
                }
            )
        )

    @database_sync_to_async
    def is_conversation_member(self, user_id, conversation_id):
        try:
            return Conversation.objects.filter(
                id=conversation_id, members__id=user_id
            ).exists()
        except Exception as e:
            logger.error(f"Error checking if user is a member of conversation: {e}")
            return False

    @database_sync_to_async
    def save_message(self, user_id, conversation_id, content):
        user = User.objects.get(id=user_id)
        conversation = Conversation.objects.get(id=conversation_id)

        message = Message.objects.create(
            conversation=conversation,
            sender=user,
            content=content,
        )

        # Use the serializer to format the message
        message = json.loads(JSONRenderer().render(MessageSerializer(message).data))
        return message

    # @database_sync_to_async
    # def update_conversation_timestamp(self, conversation_id):
    #     conversation = Conversation.objects.get(id=conversation_id)
    #     conversation.updated_at = timezone.now()
    #     conversation.save()
