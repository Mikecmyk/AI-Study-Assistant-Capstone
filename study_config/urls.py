# study_config/urls.py - UPDATED VERSION

from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic.base import RedirectView 
from django.views.generic import TemplateView  # ADD THIS
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
    
    # 🔥 ADD THIS CATCH-ALL ROUTE FOR REACT (MUST BE LAST)
    re_path(r'^(?!api/|admin/).*$', TemplateView.as_view(template_name='index.html')),
]

# Serve static files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)