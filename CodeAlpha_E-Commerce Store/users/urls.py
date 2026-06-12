from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

app_name = 'users'

urlpatterns = [
    # Custom registration view
    path('register/', views.register, name='register'),
    
    # Custom Login View
    path('login/', views.custom_login, name='login'),
    
    # Built-in Logout View (handles clearing the session cookie securely)
    path('logout/', auth_views.LogoutView.as_view(next_page='/'), name='logout'),
    
    # User Profile View
    path('profile/', views.profile, name='profile'),
]
