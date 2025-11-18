# study_config/urls.py

from django.contrib import admin
from django.urls import path, include
from django.views.generic.base import RedirectView 
from rest_framework import routers
from study_core.views import TopicViewSet


# Create a router instance
router = routers.DefaultRouter()
router.register(r'admin/topics', TopicViewSet, basename='admin-topic')


urlpatterns = [
    # 1. Admin path
    path('admin/', admin.site.urls),
    
    # 2. HIGH PRIORITY: AUTH/LOGIN/REGISTER URLs should be checked first
    path('api/auth/', include('users.urls')),

    # 3. Other API paths (study_core)
    path('api/', include('study_core.urls')), 
    
    # 4. Generic Router paths should be last in the /api/ group
    path('api/', include(router.urls)),
    
    # 5. Redirect
    path('', RedirectView.as_view(url='api/', permanent=True)), 

    path('api/auth/', include('study_core.urls')),
]