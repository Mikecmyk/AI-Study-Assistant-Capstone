from rest_framework import serializers
from .models import StudySession, StudyTopic

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