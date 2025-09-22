from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PageViewSet,
    TemplateViewSet,
    ElementViewSet,
    AILogViewSet,
    UserViewSet,
    RegisterView
)

# Create a router and register viewsets
router = DefaultRouter()
router.register(r'users', UserViewSet, basename="user")
router.register(r'pages', PageViewSet, basename="page")
router.register(r'templates', TemplateViewSet, basename="template")
router.register(r'elements', ElementViewSet, basename="element")
router.register(r'ailogs', AILogViewSet, basename="ailog")

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),  # User registration
]
