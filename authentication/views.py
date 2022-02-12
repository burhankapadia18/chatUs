from django.shortcuts import render
from rest_framework import generics, status
from .serializers import RegisterSerializer, LoginSerilizer
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from authentication.models import User

# Create your views here.

class RegisterView(generics.GenericAPIView):

    serializer_class = RegisterSerializer

    def post(self, request):
        user = request.data
        serializer = self.serializer_class(data=user)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        user_data = serializer.data
        user = User.objects.get(email=user_data['email'])
        token = RefreshToken.for_user(user).access_token

        return Response(user_data, status = status.HTTP_201_CREATED)

            
class LoginApiView(generics.GenericAPIView)        :

    serializer_class = LoginSerilizer
    def post(self, request):
        serilizer = self.serializer_class(data = request.data)
        serilizer.is_valid(raise_exception = True)
        return Response(serilizer.data, status=status.HTTP_200_OK)