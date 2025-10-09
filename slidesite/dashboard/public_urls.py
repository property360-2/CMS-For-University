from django.urls import path
from . import views

urlpatterns = [
    # Public homepage/dashboard
    path('', views.public_dashboard, name='home'),
    
    # Public website URLs
    path('u/<str:username>/<slug:site_slug>/', views.website_home, name='website_home'),
    path('u/<str:username>/<slug:site_slug>/<slug:page_slug>/', views.page_detail, name='page_detail'),
]