from django.contrib import admin
from django.urls import path, include
from cms_app.views import RegisterView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),  # Login
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),  # Refresh
    path("api/token/logout/", TokenBlacklistView.as_view(), name="token_blacklist"),  # Logout
    path("api/", include("cms_app.urls")),  # app routes (users, pages, etc.)
    path("api/register/", RegisterView.as_view(), name="register"),  # ✅ fixed
]
