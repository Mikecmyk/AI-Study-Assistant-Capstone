# Add this URL pattern to your study_core/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'admin/topics', views.TopicViewSet)
router.register(r'admin/courses', views.CourseViewSet)
router.register(r'admin/users', views.UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    
    # Existing endpoints
    path('topics/', views.topics_view, name='topics'),
    path('user-data/', views.user_data_view, name='user-data'),
    path('sessions/', views.session_generation_view, name='session-generation'),
    path('study-tools/', views.study_tools_view, name='study-tools'),
    path('quiz-generate/', views.quiz_generate_view, name='quiz-generate'),
    path('study-history/', views.study_history_view, name='study-history'),
    
    # NEW: Document upload endpoint
    path('upload-summarize/', views.upload_summarize_view, name='upload-summarize'),

     path('ai-tutor/chat/', views.ai_tutor_chat_view, name='ai-tutor-chat'),

     path('ai-recommendations/', views.ai_recommendations_view, name='ai-recommendations'),
]