from rest_framework import status
from rest_framework.generics import CreateAPIView, RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authentication import TokenAuthentication


from accounts.models import User
from accounts.services import UserService
from accounts.serializers import RegisterSerializer, LoginSerializer, UserSerializer


class RegisterView(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = []

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Use service for user creation
        user, token_key = UserService.register_user(
            name=serializer.validated_data['name'],
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password']
        )
        
        headers = self.get_success_headers(serializer.data)
        
        # TODO: Send verification email
        # send_verification_email(user)

        return Response({
            'token': token_key,
            'user': UserSerializer(user).data,
        }, status=status.HTTP_201_CREATED, headers=headers)


class LoginView(APIView):
    serializer_class = LoginSerializer
    permission_classes = []

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        user, token_key = UserService.authenticate_user(email, password)

        if user:
            return Response({
                'token': token_key,
                'user': UserSerializer(user).data,
            }, status=status.HTTP_200_OK)
            
        return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        UserService.logout_user(request.auth)
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserProfileView(RetrieveAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    
    def get_object(self):
        return self.request.user
