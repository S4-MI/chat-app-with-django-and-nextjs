import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import ChatMessage

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'global_chat'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        username = text_data_json['username']
        
        # Save message to database
        message_obj = await self.save_message(username, message)
        
        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'id': message_obj.id,
                'message': message_obj.message,
                'username': message_obj.username,
                'timestamp': message_obj.timestamp.isoformat()
            }
        )
    
    # Receive message from room group
    async def chat_message(self, event):
        message = event['message']
        username = event['username']
        id = event['id']
        timestamp = event['timestamp']
        
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'id': id,
            'message': message,
            'username': username,
            'timestamp': timestamp
        }))
    
    @database_sync_to_async
    def save_message(self, username, message):
        message_obj = ChatMessage.objects.create(username=username, message=message) 
        return message_obj