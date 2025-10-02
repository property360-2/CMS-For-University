from django.urls import path, include
from rest_framework.routers import DefaultRouter
from cms_app.views import UserViewSet, TemplateViewSet, PageViewSet, SectionViewSet

from rest_framework_simplejwt.views import TokenBlacklistView
from django.urls import path

router = DefaultRouter()
router.register(r"users", UserViewSet)
router.register(r"templates", TemplateViewSet)
router.register(r"pages", PageViewSet)
router.register(r"sections", SectionViewSet)

urlpatterns = [
    path("api/", include(router.urls)),
    path("api/logout/", TokenBlacklistView.as_view(), name="token_blacklist"),
    path("api-auth/", include("rest_framework.urls")),
]
