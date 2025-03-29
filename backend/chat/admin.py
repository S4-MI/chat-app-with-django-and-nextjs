from django.contrib import admin
from .models import Conversation, Message


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "is_group", "created_at", "updated_at")
    search_fields = ("title",)
    list_filter = ("is_group", "created_at")


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("id", "sender", "content", "conversation", "created_at")
    search_fields = ("sender__username", "content", "conversation__title")
    list_filter = ("created_at",)
