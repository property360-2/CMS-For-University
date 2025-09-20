from rest_framework.routers import DefaultRouter
from .views import UserViewSet, TemplateViewSet, PageViewSet, ElementViewSet, AI_LogViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'templates', TemplateViewSet)
router.register(r'pages', PageViewSet)
router.register(r'elements', ElementViewSet)
router.register(r'ai_logs', AI_LogViewSet)

urlpatterns = router.urls
