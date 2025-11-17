# study_core/urls.py
from django.urls import path

# Import all necessary function-based views directly
from .views import (
    topics_view, 
    study_tools_view, 
    user_data_view, 
    session_generation_view,
    quiz_generate_view, # <-- New Quiz View
)

urlpatterns = [
    # GET /api/topics/ (Fetches the topic list)
    path('topics/', topics_view, name='topics'),
    
    # GET /api/user-data/ (Fetches user info)
    path('user-data/', user_data_view, name='user-data'),
    
    # POST /api/sessions/ (Generates Study Plan)
    path('sessions/', session_generation_view, name='study-sessions'),
    
    # POST /api/study-tools/ (Generates AI Notes)
    path('study-tools/', study_tools_view, name='study-tools'),
    
    # POST /api/quiz-generate/ (Generates AI Quiz)
    path('quiz-generate/', quiz_generate_view, name='quiz-generate'), 
]