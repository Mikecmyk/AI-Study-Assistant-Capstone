# study_config/urls.py

from django.contrib import admin
from django.urls import path, include
from django.views.generic.base import RedirectView 
from rest_framework import routers
from study_core.views import TopicViewSet


# Create a router instance
router = routers.DefaultRouter()
# Register the Topic ViewSet with the router
# This creates /api/admin/topics/ for List/Create and /api/admin/topics/{id}/ for Retrieve/Update/Delete
router.register(r'admin/topics', TopicViewSet, basename='admin-topic')


urlpatterns = [
    path('admin/', admin.site.urls),
    
    path('api/', include('study_core.urls')), 
    
    path('api/auth/', include('users.urls')),

    path('', RedirectView.as_view(url='api/', permanent=True)), 

    path('api/', include(router.urls)),
]