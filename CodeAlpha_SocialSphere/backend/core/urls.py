from django.urls import path
from . import views

urlpatterns = [
    path('', views.landing_view, name='landing'),
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('feed/', views.feed_view, name='feed'),
    path('profile/edit/', views.edit_profile_view, name='edit_profile'),
    path('profile/<str:username>/', views.profile_view, name='profile'),
    path('post/create/', views.create_post_view, name='create_post'),
    path('post/<int:pk>/', views.post_detail_view, name='post_detail'),
    path('post/<int:pk>/edit/', views.edit_post_view, name='edit_post'),
    path('post/<int:pk>/delete/', views.delete_post_view, name='delete_post'),
    path('post/<int:pk>/like/', views.toggle_like_view, name='toggle_like'),
    path('comment/<int:pk>/delete/', views.delete_comment_view, name='delete_comment'),
    path('profile/<str:username>/follow/', views.toggle_follow_view, name='toggle_follow'),
    path('profile/<str:username>/followers/', views.followers_list_view, name='followers_list'),
    path('profile/<str:username>/following/', views.following_list_view, name='following_list'),
    path('notifications/', views.notifications_view, name='notifications'),
    path('settings/', views.settings_view, name='settings'),
]
