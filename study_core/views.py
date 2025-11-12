# study_core/views.py

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import StudySession, StudyTopic
from .serializers import StudySessionSerializer, StudyTopicSerializer
from django.shortcuts import get_object_or_404 
from django.views.decorators.csrf import csrf_exempt 
from django.utils.decorators import method_decorator 

# --- CORRECT AND UNIFIED DEFINITION ---

# Apply the decorator directly above the class to exempt it from CSRF checks
@method_decorator(csrf_exempt, name='dispatch') 
class StudySessionListCreateView(generics.ListCreateAPIView):
    serializer_class = StudySessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Returns sessions only for the currently logged-in user."""
        return StudySession.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        """
        Overrides the create method to inject the user and trigger AI generation.
        """
        topic_name = serializer.validated_data.get('topic_name')
        duration = serializer.validated_data.get('duration_input')

        # This is the AI placeholder response
        ai_response = f"Placeholder AI Study Plan for {topic_name} over {duration}: Day 1 - Review concepts. Day 2 - Practice quiz. Day 3 - Final assessment."
        
        serializer.save(
            user=self.request.user, 
            generated_content=ai_response
        )


class StudyTopicListView(generics.ListAPIView):
    """Provides a list of general Study Topics (e.g., Python, React, Solfege)."""
    queryset = StudyTopic.objects.all()
    serializer_class = StudyTopicSerializer
    permission_classes = [permissions.AllowAny]