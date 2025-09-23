from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, TemplateViewSet, PageViewSet, ElementViewSet, AILogViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'templates', TemplateViewSet, basename='template')
router.register(r'pages', PageViewSet, basename='page')
router.register(r'elements', ElementViewSet, basename='element')
router.register(r'ailogs', AILogViewSet, basename='ailog')

urlpatterns = [
    path('', include(router.urls)),
]
