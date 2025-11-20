# study_core/views.py - FIXED topics_view
import time
import json
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework import status
from rest_framework import viewsets
from rest_framework import permissions
from google import genai
from django.conf import settings 
from django.contrib.auth.models import User
from .models import Course, Topic, StudySession, StudyTopic
from .serializers import CourseSerializer, TopicSerializer, UserSerializer, StudySessionSerializer, StudyTopicSerializer

# --- SETUP ---
client = genai.Client(api_key=settings.GEMINI_API_KEY)
GEMINI_MODEL = 'gemini-2.5-flash'

# --- HELPER FUNCTION WITH RETRY LOGIC ---
def generate_with_retry(prompt, max_retries=3):
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt
            )
            return response.text
        except Exception as e:
            error_str = str(e).lower()
            if 'overload' in error_str or '503' in error_str or 'unavailable' in error_str:
                if attempt < max_retries - 1:
                    wait_time = 2 ** (attempt + 1)
                    print(f"API overloaded. Retrying in {wait_time} seconds... (Attempt {attempt + 1})")
                    time.sleep(wait_time)
                    continue
                else:
                    return "AI service is temporarily overloaded. Please try again in a few minutes."
            else:
                return f"AI service error: {str(e)}"
    return "Failed to generate content after multiple attempts."


# --- VIEWSETS FOR ADMIN DASHBOARD (CRUD) ---

class TopicViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows topics to be viewed, created, edited, or deleted.
    Accessed via /api/admin/topics/
    """
    queryset = Topic.objects.all().order_by('name')
    serializer_class = TopicSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        """Optionally filter by active status"""
        queryset = Topic.objects.all().order_by('name')
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            is_active = is_active.lower() == 'true'
            queryset = queryset.filter(is_active=is_active)
        return queryset


class CourseViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows courses to be viewed, created, edited, or deleted.
    Accessed via /api/admin/courses/
    """
    queryset = Course.objects.all().order_by('name')
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        """Optionally filter by published status"""
        queryset = Course.objects.all().order_by('name')
        is_published = self.request.query_params.get('is_published', None)
        if is_published is not None:
            is_published = is_published.lower() == 'true'
            queryset = queryset.filter(is_published=is_published)
        return queryset


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed and edited.
    Accessed via /api/admin/users/
    """
    queryset = User.objects.all().order_by('date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
    
    # Restrict methods if needed
    http_method_names = ['get', 'patch', 'put', 'head', 'options']


# --- VIEWS FOR LEARNER DASHBOARD (READ-ONLY/FUNCTIONAL) ---

@api_view(['GET'])
def topics_view(request):
    """
    🔥 CRITICAL FIX: Returns the list of available study topics for LEARNERS.
    Fetches only active topics from the database.
    """
    try:
        # Use the database model to fetch ONLY ACTIVE topics for learners
        active_topics = Topic.objects.filter(is_active=True).order_by('name')
        serializer = TopicSerializer(active_topics, many=True)
        
        print(f"📚 Returning {len(active_topics)} active topics for learner dashboard")
        
        return Response({
            "topics": serializer.data,
            "count": len(active_topics)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"Error in topics_view: {e}")
        return Response(
            {"error": "Failed to load topics", "details": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def user_data_view(request):
    """Returns placeholder user data."""
    user_data = {
        "id": 1,
        "username": "Michael",
        "email": "michael@example.com",
    }
    return Response(user_data, status=status.HTTP_200_OK)


@api_view(['POST'])
def session_generation_view(request):
    """Generates a study plan with subtopic support."""
    try:
        data = request.data
        topic_name = data.get("topic_name")
        duration = data.get("duration_input")
        subtopics = data.get("subtopics", [])
        main_subject = data.get("main_subject", "")
        specific_area = data.get("specific_area", "")

        if not topic_name or not duration:
            return Response(
                {"error": "Missing topic or duration."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Build a more detailed prompt with subtopics
        if subtopics:
            prompt = f"""
            Create a detailed study plan for: {topic_name}
            Focus specifically on: {', '.join(subtopics)}
            Duration: {duration}
            
            Format the plan with:
            1. Clear daily objectives
            2. Specific learning activities
            3. Time allocation for each subtopic
            4. Review sessions
            
            Make it practical and achievable.
            """
        else:
            prompt = f"""
            Create a detailed study plan for: {topic_name}
            Duration: {duration}
            
            Format with clear daily tasks, learning objectives, and time allocation.
            """

        # Use retry logic for generation
        generated_content = generate_with_retry(prompt)
        
        return Response({
            "topic_name": topic_name, 
            "generated_content": generated_content,
            "subtopics": subtopics
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"Study plan generation error: {e}")
        return Response(
            {"error": "Failed to generate study plan. Please try again."}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def study_tools_view(request):
    """Generates comprehensive study notes using Gemini with retry logic."""
    try:
        data = request.data
        topic = data.get("topic")
        subtopics = data.get("subtopics", [])

        if not topic:
            return Response(
                {"error": "Topic not provided"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Build enhanced prompt with subtopics
        if subtopics:
            prompt = (
                f"Generate comprehensive, well-structured study notes "
                f"for the topic: '{topic}' focusing specifically on: {', '.join(subtopics)}.\n\n"
                f"Format the notes with:\n"
                f"- Clear headings and subheadings\n"
                f"- Key concepts and definitions\n" 
                f"- Examples and practical applications\n"
                f"- Summary points for review\n"
                f"- Use markdown formatting for better readability"
            )
        else:
            prompt = (
                f"Generate concise, comprehensive, and well-structured study notes "
                f"for the topic: '{topic}'. The notes should be formatted clearly "
                f"using markdown for headings, bullet points, and key concepts."
            )

        generated_notes = generate_with_retry(prompt)
        
        return Response({"notes": generated_notes}, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"Gemini Error in notes generation: {e}")
        return Response(
            {"error": "Failed to generate notes. Please try again in a few moments."}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def quiz_generate_view(request):
    """Generates a multiple-choice quiz using Gemini with retry logic."""
    try:
        data = request.data
        topic = data.get("topic")
        subtopics = data.get("subtopics", [])

        if not topic:
            return Response(
                {"error": "Topic not provided"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Build enhanced prompt with subtopics
        if subtopics:
            prompt = (
                f"Create a multiple-choice quiz with 5 questions "
                f"about: '{topic}' focusing specifically on: {', '.join(subtopics)}.\n\n"
                f"Format requirements:\n"
                f"- Each question should have 4 options (A, B, C, D)\n"
                f"- Clearly indicate the correct answer on a new line after each question\n"
                f"- Include a mix of conceptual and application questions\n"
                f"- Make the questions challenging but fair\n"
                f"- End with an answer key that explains why each answer is correct"
            )
        else:
            prompt = (
                f"Create a short, multiple-choice quiz with 5 questions "
                f"about the topic: '{topic}'. For each question, provide 4 options "
                f"and clearly indicate the correct answer on a new line after the question."
            )

        generated_quiz = generate_with_retry(prompt)
        
        return Response({"quiz": generated_quiz}, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"Gemini Error in quiz generation: {e}")
        return Response(
            {"error": "Failed to generate quiz. Please try again in a few moments."}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def study_history_view(request):
    """Returns study history - FIXED to prevent infinite loops"""
    try:
        # Simple placeholder - in real app, fetch from database
        history_data = {
            "history": [
                {"id": 1, "topic": "Physics: Quantum Mechanics", "date": "2025-11-19", "duration": "2 hours"},
                {"id": 2, "topic": "Mathematics: Calculus", "date": "2025-11-18", "duration": "1.5 hours"},
            ]
        }
        return Response(history_data, status=status.HTTP_200_OK)
    except Exception as e:
        print(f"Study history error: {e}")
        return Response({"history": []}, status=status.HTTP_200_OK)