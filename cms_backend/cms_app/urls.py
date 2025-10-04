from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, TemplateViewSet, PageViewSet, SectionViewSet,
    register_user, render_page
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r"users", UserViewSet)
router.register(r"templates", TemplateViewSet)
router.register(r"pages", PageViewSet)
router.register(r"sections", SectionViewSet)

urlpatterns = [
    # SSR / Page render (must come first!)
    path('pages/<slug:slug>/render/', render_page, name='render_page'),

    # REST API routes
    path("", include(router.urls)),
    path("register/", register_user, name="register_user"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
