# admin/views.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
import json

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_analytics(request):
    """
    Get analytics data for admin dashboard
    """
    try:
        # Get all users (excluding staff/admin users for learner count)
        total_users = User.objects.count()
        active_learners = User.objects.filter(is_staff=False).count()
        
        # Calculate recent activity (last 7 days)
        one_week_ago = timezone.now() - timedelta(days=7)
        recent_users = User.objects.filter(date_joined__gte=one_week_ago).count()
        
        # You would replace this with your actual StudySession model data
        # For now, we'll use some placeholder data
        total_study_sessions = 0
        avg_study_duration = "0 mins"
        
        # Try to get data from localStorage simulation
        # In a real app, you'd have a StudySession model
        try:
            # This is a simulation - in reality you'd query your database models
            # For now, we'll return some calculated data
            pass
        except:
            # Fallback data
            pass
        
        return Response({
            'totalSessions': total_study_sessions,
            'activeLearners': active_learners,
            'popularTopic': "Mathematics: Calculus",  # You'd calculate this from actual data
            'avgStudyDuration': avg_study_duration,
            'completionRate': "68%",
            'totalTopics': 42,  # You'd get this from your Topic model
            'totalCourses': 15,
            'totalUsers': total_users,
            'recentUsers': recent_users
        })
        
    except Exception as e:
        return Response(
            {'error': f'Error fetching analytics: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAdminUser])
def recent_activities(request):
    """
    Get recent activities for admin dashboard
    """
    try:
        # Get recent user registrations
        recent_users = User.objects.filter(is_staff=False).order_by('-date_joined')[:5]
        
        activities = []
        
        for user in recent_users:
            activities.append({
                'type': 'user_registered',
                'message': f'New user registered: {user.username}',
                'timestamp': user.date_joined.isoformat(),
                'user': user.username
            })
        
        # Add some system activities
        activities.append({
            'type': 'system',
            'message': 'System maintenance completed',
            'timestamp': timezone.now().isoformat(),
            'user': 'System'
        })
        
        # Sort by timestamp (newest first)
        activities.sort(key=lambda x: x['timestamp'], reverse=True)
        
        # Return only the 5 most recent
        return Response(activities[:5])
        
    except Exception as e:
        return Response(
            {'error': f'Error fetching activities: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAdminUser])
def user_management_data(request):
    """
    Get user data for admin user management
    """
    try:
        users = User.objects.all().values(
            'id', 'username', 'email', 'date_joined', 
            'is_active', 'is_staff', 'last_login'
        )
        
        user_list = list(users)
        
        return Response(user_list)
        
    except Exception as e:
        return Response(
            {'error': f'Error fetching user data: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )