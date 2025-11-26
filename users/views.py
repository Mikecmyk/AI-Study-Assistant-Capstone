# users/views.py

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny
from .serializers import UserSerializer

class RegisterView(APIView):
    """
    Custom view for user registration.
    """
    permission_classes = [AllowAny]
    
    def post(self, request, format=None):
        # Make sure we have a username (use email if not provided)
        data = request.data.copy()
        if 'email' in data and 'username' not in data:
            data['username'] = data['email']
        
        serializer = UserSerializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Create token for the new user
            token, created = Token.objects.get_or_create(user=user)
            
            return Response({
                'user': serializer.data,
                'token': token.key,
                'message': 'User created successfully'
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(ObtainAuthToken):
    """
    Custom login view that accepts email instead of username.
    Returns user role information for admin detection.
    """
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        # Get email and password from request
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response(
                {'error': 'Please provide both email and password'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Find user by email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'Invalid credentials'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Authenticate with username and password
        user = authenticate(username=user.username, password=password)
        
        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user_id': user.id,
                'email': user.email,
                'username': user.username,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser
            })
        else:
            return Response(
                {'error': 'Invalid credentials'}, 
                status=status.HTTP_400_BAD_REQUEST
            )