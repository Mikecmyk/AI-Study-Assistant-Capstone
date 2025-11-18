# users/urls.py (Suggested Fix)

from django.urls import path, re_path # Keep re_path for optional slash fix
from . import views # <-- Change the import to bring in the entire views module

urlpatterns = [
    # Reference the views using 'views.RegisterView'
    re_path(r'^register/?$', views.RegisterView.as_view(), name='register'),
    
    # Reference the views using 'views.LoginView'
    re_path(r'^login/?$', views.LoginView.as_view(), name='login'),
]