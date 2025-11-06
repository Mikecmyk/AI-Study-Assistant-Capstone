# study_config/urls.py

from django.contrib import admin
from django.urls import path, include
from django.views.generic.base import RedirectView 

urlpatterns = [
    path('admin/', admin.site.urls),
    

    path('api/', include('study_core.urls')), 
    
    path('api/auth/', include('users.urls')),

    
    path('', RedirectView.as_view(url='api/', permanent=True)), 
]