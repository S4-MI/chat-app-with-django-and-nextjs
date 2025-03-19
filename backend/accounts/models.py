from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.enums import TextChoices

class User(AbstractUser):
    
    class UserRole(TextChoices):
        ADMIN = 'admin', 'Admin'
        USER = 'user', 'User'
    
    email = models.EmailField(verbose_name='email', unique=True)
    role = models.CharField(verbose_name='role', max_length=32, choices=UserRole.choices, default=UserRole.USER)
    is_verified = models.BooleanField(verbose_name='is_verified', default=False)

    def __str__(self):
        return self.username
