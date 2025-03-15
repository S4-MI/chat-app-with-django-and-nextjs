from django.contrib import admin
from .models import ChatMessage

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('username', 'message', 'timestamp')
    search_fields = ('username', 'message')
    list_filter = ('timestamp',) 