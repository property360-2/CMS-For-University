from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenBlacklistView

urlpatterns = [
    path('admin/', admin.site.urls),

    # ✅ include cms_app URLs under /api/
    path("api/", include("cms_app.urls")),

    # Logout (blacklist token)
    path("api/logout/", TokenBlacklistView.as_view(), name="token_blacklist"),
]
