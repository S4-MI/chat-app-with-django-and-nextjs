from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token

from accounts.models import User


class UserService:
    @staticmethod
    def register_user(name, email, password):
        """
        Register a new user and create auth token
        """
        user = User.objects.create(
            username=email,
            email=email,
            first_name=name
        )
        user.set_password(password)
        user.save()
        
        token, _ = Token.objects.get_or_create(user=user)
        
        return user, token.key
    
    @staticmethod
    def authenticate_user(email, password):
        """
        Authenticate a user with email and password
        """
        user = authenticate(username=email, password=password)
        if not user:
            return None, None
        
        token, _ = Token.objects.get_or_create(user=user)
        return user, token.key
        
    @staticmethod
    def logout_user(token):
        """
        Logout a user by deleting their auth token
        """
        if token:
            token.delete()
            return True
        return False