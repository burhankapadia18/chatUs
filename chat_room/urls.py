from django.urls import path
from .views import chat_roomViewSet
from rest_framework.routers import DefaultRouter
# from django.conf.urls import url

router = DefaultRouter()
router.register('chat-room', chat_roomViewSet,basename='lol')

# urlpatterns = [
#     path('main-view/', main_view, name = "chat_room"),
# ]