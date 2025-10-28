

from django.urls import path
from .views import StudySessionListCreateView, StudyTopicListView

urlpatterns = [
    
    path('topics/', StudyTopicListView.as_view(), name='topic-list'),
    
    
    path('sessions/', StudySessionListCreateView.as_view(), name='session-list-create'),
]