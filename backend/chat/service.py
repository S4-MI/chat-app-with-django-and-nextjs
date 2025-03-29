from accounts.models import User
from .models import Conversation


class ConversationService:

    @staticmethod
    def create_direct_message_conversation(
        user: User, other_user: User
    ) -> Conversation:
        """
        Create a conversation which is a direct message between two users
        """
        conversation = Conversation.objects.create(is_group=False)
        conversation.members.set([user, other_user])

        return conversation

    @staticmethod
    def create_group_conversation(
        group_name: str, user: User, other_users: list[User]
    ) -> Conversation:
        """
        Create a conversation which is a group conversation between two or more users
        """
        conversation = Conversation.objects.create(is_group=True, title=group_name)
        conversation.members.set([user, *other_users])

        return conversation
