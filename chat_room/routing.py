from django.urls import re_path, path
from . import consumers

websocket_urlspatterns = [
    re_path(r'test-room',consumers.ChatConsumer.as_asgi()),
    # re_path(r'^test-room/(?P<room_name>\w+)/$',consumers.ChatConsumer.as_asgi()),
    # path('test-room/<slug:slug>/',consumers.ChatConsumer.as_asgi()),
]