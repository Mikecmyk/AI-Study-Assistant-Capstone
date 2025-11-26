

from django.contrib import admin
from django.urls import path, include
from django.views.generic.base import RedirectView 
from django.conf import settings
from django.conf.urls.static import static
from admin.views import admin_analytics, recent_activities, user_management_data  

urlpatterns = [
    
    path('admin/', admin.site.urls),
    
    
    path('api/auth/', include('users.urls')),

    
    path('api/', include('study_core.urls')), 
    
    
    path('api/admin/analytics/', admin_analytics, name='admin-analytics'),
    path('api/admin/recent-activities/', recent_activities, name='recent-activities'),
    path('api/admin/users/', user_management_data, name='user-management'),
    
    
    path('', RedirectView.as_view(url='api/', permanent=True)), 
    
    
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)