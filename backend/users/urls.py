"""
User authentication URLs
"""
from django.urls import path
from . import views

urlpatterns = [
    path('demo-login/', views.demo_login, name='demo-login'),
    path('login/', views.login, name='login'),
    path('profile/', views.profile, name='profile'),
]