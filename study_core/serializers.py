# study_core/serializers.py - FULLY UPDATED
from rest_framework import serializers
from .models import StudySession, StudyTopic, Topic, Course
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
        model = Topic
        fields = ('id', 'name', 'description', 'is_active', 'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at')


class CourseSerializer(serializers.ModelSerializer):
    # This ensures the API returns topic names, not just IDs
    topics = TopicSerializer(many=True, read_only=True)
    
    # Custom field for writable topic IDs when creating/updating courses
    topic_ids = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Topic.objects.all(), 
        source='topics',
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Course
        fields = [
            'id', 'name', 'slug', 'description', 'topics', 'topic_ids',
            'duration_hours', 'is_published', 'created_at', 'updated_at'
        ]
        read_only_fields = ['slug', 'created_at', 'updated_at']


class UserSerializer(serializers.ModelSerializer):
    """Serializer for reading user data (Admin View)."""
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'is_staff', 'is_active', 'is_superuser', 'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']