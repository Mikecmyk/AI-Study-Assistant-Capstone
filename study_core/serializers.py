from rest_framework import serializers
from .models import StudySession, StudyTopic
from .models import Topic
from .models import Course, Topic
from django.contrib.auth.models import User

class StudyTopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyTopic
        fields = ('id', 'name', 'slug')


class StudySessionSerializer(serializers.ModelSerializer):
    
    user = serializers.ReadOnlyField(source='user.username')
    
    class Meta:
        model = StudySession
        fields = (
            'id', 
            'user', 
            'topic_name', 
            'duration_input', 
            'generated_content', 
            'created_at'
        )
        read_only_fields = ('generated_content', 'created_at') 


class TopicSerializer(serializers.ModelSerializer):
    """Serializer for the Topic model to handle JSON conversion."""
    
    class Meta:
        model = Topic # type: ignore
        # Define all fields we want to expose through the API
        fields = ('id', 'name', 'description', 'is_active', 'created_at')
        # Only the 'created_at' field should be read-only (set by Django)
        read_only_fields = ('created_at',)

class CourseSerializer(serializers.ModelSerializer):
    # This ensures the API returns topic names, not just IDs
    topics = TopicSerializer(many=True, read_only=True)
    
    # You will need a custom field for writable topic IDs if you want to update them

    class Meta:
        model = Course
        fields = [
            'id', 'name', 'slug', 'description', 'topics', 
            'duration_hours', 'is_published', 'created_at'
        ]
        read_only_fields = ['slug']

class UserSerializer(serializers.ModelSerializer):
    """Serializer for reading user data (Admin View)."""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff', 'is_active', 'date_joined']
        read_only_fields = ['id', 'date_joined']