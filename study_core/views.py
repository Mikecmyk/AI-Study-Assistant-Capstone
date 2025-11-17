# study_core/views.py

# --- 1. IMPORTS ---
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework import viewsets
from google import genai
from django.conf import settings 
from rest_framework import permissions
from .models import Course
from .serializers import CourseSerializer
from django.contrib.auth.models import User
from .serializers import UserSerializer

# --- NEW IMPORTS for Models/Serializers ---
from .models import Topic
from .serializers import TopicSerializer
# ------------------------------------------


# --- 2. SETUP ---

# NOTE: The hardcoded TOPICS list has been REMOVED.

# Initialize the Gemini Client 
client = genai.Client(api_key=settings.GEMINI_API_KEY)
GEMINI_MODEL = 'gemini-2.5-flash'


# --- 3. VIEWS FOR ADMIN DASHBOARD (CRUD) ---

class TopicViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows topics to be viewed, created, edited, or deleted.
    Accessed via /api/admin/topics/
    """
    queryset = Topic.objects.all().order_by('name')
    serializer_class = TopicSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


# --- 4. VIEWS FOR LEARNER DASHBOARD (READ-ONLY/FUNCTIONAL) ---

@api_view(['GET'])
def topics_view(request):
    """
    Returns the list of available study topics. 
    Fetches data from the database.
    """
    # Use the database model to fetch topics
    active_topics = Topic.objects.filter(is_active=True).order_by('name')
    serializer = TopicSerializer(active_topics, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


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
    """Generates a study plan (Placeholder logic)."""
    topic_name = request.data.get("topic_name")
    duration = request.data.get("duration_input") 

    if not topic_name or not duration:
        return Response({"error": "Missing topic or duration."}, status=status.HTTP_400_BAD_REQUEST)
    
    # Placeholder for the study plan
    generated_content = (
        f"**Study Plan for {topic_name}** ({duration})\n\n"
        f"Day 1: Review Key Concepts\n"
        f"Day 2: Practice Problems\n"
        f"Day 3: Self-Assessment"
    )

    return Response({"topic_name": topic_name, "generated_content": generated_content}, status=status.HTTP_200_OK)


@api_view(['POST'])
def study_tools_view(request):
    """Generates comprehensive study notes using Gemini."""
    topic = request.data.get("topic")

    if not topic:
        return Response({"error": "Topic not provided"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        prompt = (
            f"Generate concise, comprehensive, and well-structured study notes "
            f"for the topic: '{topic}'. The notes should be formatted clearly "
            f"using markdown for headings and bullet points."
        )

        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt
        )
        
        generated_notes = response.text
        
        return Response({"notes": generated_notes}, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"Gemini Error in notes generation: {e}")
        return Response(
            {"error": "Failed to generate notes using AI."}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def quiz_generate_view(request):
    """Generates a multiple-choice quiz using Gemini."""
    topic = request.data.get("topic")

    if not topic:
        return Response({"error": "Topic not provided"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        prompt = (
            f"Create a short, multiple-choice quiz with 5 questions "
            f"about the topic: '{topic}'. For each question, provide 4 options "
            f"and clearly indicate the correct answer (e.g., by placing it on the next line or bolding it)."
        )

        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt
        )
        
        generated_quiz = response.text
        
        return Response({"quiz": generated_quiz}, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"Gemini Error in quiz generation: {e}")
        return Response(
            {"error": "Failed to generate quiz using AI."}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
class CourseViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows courses to be viewed, created, edited, or deleted.
    Used for Admin Dashboard management.
    """
    queryset = Course.objects.all().order_by('name')
    serializer_class = CourseSerializer
    # Allow read-only access for anyone, but require auth for write operations
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users (Learners) to be viewed and their status edited.
    """
    queryset = User.objects.all().order_by('date_joined')
    serializer_class = UserSerializer
    
    # Restrict actions: Admins can View, Edit (PATCH/PUT), but we might restrict POST/DELETE
    permission_classes = [permissions.IsAdminUser] 
    
    # Optionally restrict methods if you only want to view/update staff/active status
    http_method_names = ['get', 'patch', 'put', 'head', 'options']