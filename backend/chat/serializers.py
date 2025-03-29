from rest_framework import serializers

from accounts.models import User
from accounts.serializers import UserMinimalSerializer
from .service import ConversationService
from .models import (
    Conversation,
    Message,
)


class MessageSerializer(serializers.ModelSerializer):
    sender = UserMinimalSerializer(read_only=True)
    is_own_message = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Message
        fields = ["id", "content", "created_at", "sender", "is_own_message", "type"]
        read_only_fields = ["created_at", "is_own_message", "type"]

    def get_is_own_message(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.sender.id == request.user.id

        return False


class ConversationsSerializer(serializers.ModelSerializer):
    members = UserMinimalSerializer(many=True, read_only=True)
    member_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )

    class Meta:
        model = Conversation
        fields = [
            "id",
            "title",
            "is_group",
            "icon",
            "created_at",
            "updated_at",
            "members",
            "member_ids",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        # For direct messages, replace the title with the other member's name
        if not instance.is_group:
            current_user = self.context.get("request").user
            other_member = instance.members.exclude(id=current_user.id).first()
            if other_member:
                representation["title"] = (
                    other_member.first_name or other_member.username
                )

        return representation

    def validate(self, attrs):
        is_group = attrs.get("is_group", False)
        member_ids = attrs.get("member_ids", [])

        # checks for invalid user ids
        invalid_user_ids = set(member_ids) - set(
            User.objects.filter(id__in=member_ids).values_list("id", flat=True)
        )
        if invalid_user_ids:
            raise serializers.ValidationError(
                f"Invalid user IDs: {', '.join(map(str, invalid_user_ids))}"
            )

        if self.context["request"].user.id in member_ids:
            raise serializers.ValidationError(
                "You cannot add yourself to the conversation"
            )

        # For direct messages, validate exactly one other user
        if not is_group and len(member_ids) != 1:
            raise serializers.ValidationError(
                {"member_ids": "Direct messages must have exactly one other user"}
            )

        # For group chats, validate at least one other user
        if is_group and len(member_ids) < 1:
            raise serializers.ValidationError(
                {"member_ids": "Group conversations must have at least one other user"}
            )

        # Validate name for group chats
        if is_group and not attrs.get("title"):
            raise serializers.ValidationError(
                {"title": "Group conversations must have a title"}
            )

        # Check if direct conversation already exists
        if (
            not is_group
            and Conversation.objects.filter(
                is_group=False,
                members__user=self.context["request"].user,
                members__user__in=member_ids,
            ).exists()
        ):
            raise serializers.ValidationError("Direct conversation already exists")

        return attrs

    def create(self, validated_data):
        member_ids = validated_data.pop("member_ids")
        current_user = self.context["request"].user

        # Convert IDs to User objects
        member_objects = User.objects.filter(id__in=member_ids)

        if validated_data.get("is_group", False):
            conversation = ConversationService.create_group_conversation(
                group_name=validated_data["title"],
                user=current_user,
                other_users=member_objects,
            )
        else:
            conversation = ConversationService.create_direct_message_conversation(
                user=current_user, other_user=member_objects[0]
            )

        return conversation


class ConversationDetailSerializer(serializers.ModelSerializer):
    members = UserMinimalSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = [
            "id",
            "title",
            "is_group",
            "icon",
            "created_at",
            "updated_at",
            "members",
        ]
        read_only_fields = ["created_at", "updated_at"]
