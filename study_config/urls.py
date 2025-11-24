# study_config/urls.py - API-ONLY VERSION

from django.contrib import admin
from django.urls import path, include
from django.views.generic.base import RedirectView 
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # 1. Admin path
    path('admin/', admin.site.urls),
    
    # 2. AUTH/LOGIN/REGISTER URLs
    path('api/auth/', include('users.urls')),

    # 3. Study core URLs
    path('api/', include('study_core.urls')), 
    
    # 4. Redirect root to API
    path('', RedirectView.as_view(url='api/', permanent=True)), 
    
    #  REMOVED catch-all route for React - frontend handles its own routing
]

# Serve static files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)