from django.http import JsonResponse
from .models import ChatMessage

def get_messages(request):
    messages = ChatMessage.objects.all().order_by('-timestamp')[:50]
    message_list = [
        {
            'id': message.id,
            'username': message.username,
            'message': message.message,
            'timestamp': message.timestamp.isoformat()
        }
        for message in messages
    ]
    return JsonResponse({'messages': message_list}) 