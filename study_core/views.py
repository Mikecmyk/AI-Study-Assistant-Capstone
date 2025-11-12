from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import StudySession, StudyTopic
from .serializers import StudySessionSerializer, StudyTopicSerializer
from django.shortcuts import get_object_or_404 
from django.views.decorators.csrf import csrf_exempt # 1. IMPORT THIS
from django.utils.decorators import method_decorator # 2. IMPORT THIS

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


@method_decorator(csrf_exempt, name='dispatch') 
class StudySessionListCreateView(generics.ListCreateAPIView):
    # ... (rest of the class remains the same)
    queryset = StudySession.objects.all()
    serializer_class = StudySessionSerializer
    permission_classes = [permissions.IsAuthenticated]