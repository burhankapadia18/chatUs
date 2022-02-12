from curses import use_default_colors
from django.db import models
from django.contrib.auth.models import (AbstractBaseUser, BaseUserManager, PermissionsMixin)
from rest_framework_simplejwt.tokens import RefreshToken

# Create your models here.

class UserManager(BaseUserManager):

    def create_user(self, username=None, email=None, password = None, name=None, surname=None):
        if username is None:
            raise TypeError('User should have a username')
        if email is None:
            raise TypeError('User should have a email')
        if name is None:
            raise TypeError('User should have a name')
        if surname is None:
            raise TypeError('User should have a surname')

        user = self.model(username=username, email=self.normalize_email(email), name=name, surname=surname)
        user.set_password(password)
        user.save()
        return user
    
    def create_superuser(self, email, password=None):
        if email is None:
            raise TypeError('superuser should have a email')
        # if password is None:
        #     raise TypeError('superuser should have a password')
        
        user = self.create_user(email=email, username='admin', password=password)
        user.is_superuser = True
        user.is_staff = True
        user.save()
        return user

class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=255, default="0")
    email = models.EmailField(max_length=255, unique=True, db_index = True)
    name = models.CharField(max_length=50,blank=True)
    surname = models.CharField(max_length=50,blank=True)
    created_at = models.DateTimeField(auto_now_add = True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    # REQUIRED_FIELDS = ['username']
        
    objects = UserManager()


    def __str__(self):
        return self.email

    def tokens(self):
        refresh = RefreshToken.for_user(self)

        return {
            'refresh' : str(refresh),
            'access': str(refresh.access_token)
        }