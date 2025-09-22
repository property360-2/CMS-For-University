
---

# **AI-Assisted CMS — Phase 3: Backend & Authentication**

## **Goal**

Implement **CRUD APIs, JWT authentication, and AI content integration** for core models: Pages, Templates, Elements, AI Logs.

---

## **1. Install Dependencies**

```bash
pip install djangorestframework djangorestframework-simplejwt
```

---

## **2. Update Settings**

📂 `cms_project/settings.py`

```python
INSTALLED_APPS = [
    ...
    'rest_framework',
    'rest_framework_simplejwt',
    'pages',
]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    )
}
```

---

## **3. Serializers**

📂 `pages/serializers.py`

```python
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Page, Template, Element, AI_Log

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]

class PageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Page
        fields = "__all__"

class TemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Template
        fields = "__all__"

class ElementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Element
        fields = "__all__"

class AILogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AI_Log
        fields = "__all__"
```

---

## **4. Views**

📂 `pages/views.py`

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Page, Template, Element, AI_Log
from .serializers import PageSerializer, TemplateSerializer, ElementSerializer, AILogSerializer, UserSerializer

# Users (read-only)
class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

# Pages CRUD + AI content
class PageViewSet(viewsets.ModelViewSet):
    queryset = Page.objects.all()
    serializer_class = PageSerializer

    @action(detail=True, methods=["post"])
    def generate_ai_content(self, request, pk=None):
        page = self.get_object()
        prompt = request.data.get("prompt", "")
        ai_output = f"Generated content for: {prompt}"  # mock AI output
        AI_Log.objects.create(page=page, prompt=prompt, output=ai_output, model_name="mock-model")
        return Response({"message": "AI content generated", "output": ai_output})

class TemplateViewSet(viewsets.ModelViewSet):
    queryset = Template.objects.all()
    serializer_class = TemplateSerializer

class ElementViewSet(viewsets.ModelViewSet):
    queryset = Element.objects.all()
    serializer_class = ElementSerializer

class AILogViewSet(viewsets.ModelViewSet):
    queryset = AI_Log.objects.all()
    serializer_class = AILogSerializer
```

---

## **5. Routes**

📂 `pages/urls.py`

```python
from rest_framework.routers import DefaultRouter
from .views import PageViewSet, TemplateViewSet, ElementViewSet, AILogViewSet, UserViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'pages', PageViewSet)
router.register(r'templates', TemplateViewSet)
router.register(r'elements', ElementViewSet)
router.register(r'ailogs', AILogViewSet)

urlpatterns = router.urls
```

📂 `cms_project/urls.py`

```python
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("pages.urls")),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
```

---

## **6. Authentication Flow**

1. Register users (via admin or API).
2. Login to get JWT:

```http
POST /api/token/
{
  "username": "admin",
  "password": "password123"
}
```

Response:

```json
{
  "access": "jwt-access-token",
  "refresh": "jwt-refresh-token"
}
```

3. Use token for protected endpoints:

```http
GET /api/pages/
Authorization: Bearer jwt-access-token
```

---

## **7. Testing**

```bash
python manage.py runserver
```

* Test endpoints via Postman:

  * `POST /api/token/` → get JWT
  * `GET /api/pages/` → fetch pages
  * `POST /api/pages/{id}/generate_ai_content/` → AI content
* Check `/admin` for users, pages, templates, AI logs management.

---

## **Phase 3 Outcome**

* Full CRUD APIs for Users, Pages, Templates, Elements, AI Logs.
* JWT authentication implemented.
* Mock AI content generation endpoint functional.
* Backend ready for frontend integration.

---
