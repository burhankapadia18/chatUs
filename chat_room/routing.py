from django.urls import re_path
from . import consumers

websocket_urlspatterns = [
    re_path(r'test-room',consumers.ChatConsumer.as_asgi()),
]