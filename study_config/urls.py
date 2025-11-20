# study_config/urls.py - FIXED VERSION

from django.contrib import admin
from django.urls import path, include
from django.views.generic.base import RedirectView 

urlpatterns = [
    # 1. Admin path
    path('admin/', admin.site.urls),
    
    # 2. AUTH/LOGIN/REGISTER URLs
    path('api/auth/', include('users.urls')),

    # 🔥 CRITICAL FIX: Only ONE include for study_core URLs
    # This ONE line includes ALL study_core URLs (both function-based and ViewSets)
    path('api/', include('study_core.urls')), 
    
    # 5. Redirect root to API
    path('', RedirectView.as_view(url='api/', permanent=True)), 
    
    # 🚨 REMOVED: This duplicate line was causing the double "api/api/" prefix
    # path('api/auth/', include('study_core.urls')),  # DELETE THIS LINE
]