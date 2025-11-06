# users/views.py

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.views import ObtainAuthToken
from .serializers import UserSerializer

class RegisterView(APIView):
    """
    Custom view for user registration.
    """
    def post(self, request, format=None):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Use Django REST Framework's default view for token-based login
# This view handles username and password and returns a token.
class LoginView(ObtainAuthToken):
    """
    Endpoint for user login, returning an authentication token.
    """
    pass