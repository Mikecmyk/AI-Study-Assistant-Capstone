# study_config/urls.py

from django.contrib import admin
from django.urls import path, include
from django.views.generic.base import RedirectView # Import for redirecting root

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API endpoints for the core app
    path('api/', include('study_core.urls')), 
    
    # Redirect root path (/) to the API for easy testing during development
    path('', RedirectView.as_view(url='api/', permanent=True)), 
]