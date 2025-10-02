from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, TemplateViewSet, PageViewSet, SectionViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'templates', TemplateViewSet)
router.register(r'pages', PageViewSet)
router.register(r'sections', SectionViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
