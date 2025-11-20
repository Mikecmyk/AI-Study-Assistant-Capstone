# study_core/urls.py - FIXED VERSION

from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Import all necessary function-based views directly
from .views import (
    topics_view, 
    study_tools_view, 
    user_data_view, 
    session_generation_view,
    quiz_generate_view,
    study_history_view,
)

# Import ViewSets
from .views import TopicViewSet, CourseViewSet, UserViewSet

# Setup Router for ViewSets
router = DefaultRouter()
router.register(r'admin/topics', TopicViewSet)
router.register(r'admin/courses', CourseViewSet)
router.register(r'admin/users', UserViewSet)

urlpatterns = [
    #  FIXED: Learner API Routes (will be: /api/topics/, /api/user-data/, etc.)
    path('topics/', topics_view, name='topics'),
    path('user-data/', user_data_view, name='user-data'),
    path('sessions/', session_generation_view, name='study-sessions'),
    path('study-tools/', study_tools_view, name='study-tools'),
    path('quiz-generate/', quiz_generate_view, name='quiz-generate'),
    path('study-history/', study_history_view, name='study-history'),
    
    #  FIXED: Admin API Routes (will be: /api/admin/topics/, /api/admin/courses/, etc.)
    # The router URLs are automatically included here
    path('', include(router.urls)),
]