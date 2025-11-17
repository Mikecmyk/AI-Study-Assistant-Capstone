# study_core/views.py

# --- 1. IMPORTS ---
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from google import genai  # <-- NEW: Using Gemini API client
from django.conf import settings 


# --- 2. SETUP ---

# Sample topics (Required for topics_view)
TOPICS = [
    {"id": 1, "name": "Mathematics"},
    {"id": 2, "name": "Physics"},
    {"id": 3, "name": "Chemistry"},
    {"id": 4, "name": "Biology"},
]

# Initialize the Gemini Client 
client = genai.Client(api_key=settings.GEMINI_API_KEY)
GEMINI_MODEL = 'gemini-2.5-flash'


# --- 3. VIEWS ---

# Endpoint: GET /api/topics/
@api_view(['GET'])
def topics_view(request):
    """Returns the list of available study topics."""
    return Response(TOPICS, status=status.HTTP_200_OK)


# Endpoint: GET /api/user-data/
@api_view(['GET'])
def user_data_view(request):
    """Returns placeholder user data."""
    user_data = {
        "id": 1,
        "username": "Michael",
        "email": "michael@example.com",
    }
    return Response(user_data, status=status.HTTP_200_OK)


# Endpoint: POST /api/sessions/ (For Study Plan Generation)
@api_view(['POST'])
def session_generation_view(request):
    """Generates a study plan (Placeholder logic, can be enhanced with AI)."""
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


# Endpoint: POST /api/study-tools/ (For Notes Generation using Gemini)
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

        # --- Gemini API Call for Notes ---
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


# Endpoint: POST /api/quiz-generate/ (For Quiz Generation using Gemini)
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

        # --- Gemini API Call for Quiz ---
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt
        )
        
        generated_quiz = response.text
        
        return Response({"quiz": generated_quiz}, status=status.HTTP_200_OK)

    except Exception as e:
        # This will catch quota, authentication, or other API issues
        print(f"Gemini Error in quiz generation: {e}")
        return Response(
            {"error": "Failed to generate quiz using AI."}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )