# from django.shortcuts import render, HttpResponse
from django.shortcuts import render
from rest_framework.views import APIView
# from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.viewsets import ModelViewSet
from rest_framework import viewsets
from rest_framework.decorators import action
import uuid

# Create your views here.

class chat_roomViewSet(ModelViewSet):
    permission_classes = (IsAuthenticated,)

    @action(detail=False, methods=("post",), url_path="main-view")
    def main_view(self, request):
        return Response(status=status.HTTP_200_OK)


def test_room(request):
    data = {'room_name':str(uuid.uuid4())}
    print(data)
    return render(request, 'chat_room/room.html', data)
