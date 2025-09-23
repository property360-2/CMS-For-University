
# **Phase 3: Backend Logic (Django REST API + CRUD + JWT Auth)**

---

## **1. Serializers (`cms_app/serializers.py`)**

```python
from rest_framework import serializers
from .models import User, Template, Page, Element, AILog
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'password', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user


class TemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Template
        fields = '__all__'


class PageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Page
        fields = '__all__'


class ElementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Element
        fields = '__all__'


class AILogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AILog
        fields = '__all__'
```

---

## **2. Views (`cms_app/views.py`)**

```python
from rest_framework import viewsets, permissions
from django.contrib.auth import get_user_model
from .models import Template, Page, Element, AILog
from .serializers import (
    UserSerializer,
    TemplateSerializer,
    PageSerializer,
    ElementSerializer,
    AILogSerializer,
)

User = get_user_model()

# User CRUD
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


# Template CRUD
class TemplateViewSet(viewsets.ModelViewSet):
    queryset = Template.objects.all()
    serializer_class = TemplateSerializer
    permission_classes = [permissions.IsAuthenticated]


# Page CRUD
class PageViewSet(viewsets.ModelViewSet):
    queryset = Page.objects.all()
    serializer_class = PageSerializer
    permission_classes = [permissions.IsAuthenticated]


# Element CRUD
class ElementViewSet(viewsets.ModelViewSet):
    queryset = Element.objects.all()
    serializer_class = ElementSerializer
    permission_classes = [permissions.IsAuthenticated]


# AI Log CRUD
class AILogViewSet(viewsets.ModelViewSet):
    queryset = AILog.objects.all()
    serializer_class = AILogSerializer
    permission_classes = [permissions.IsAuthenticated]
```

---

## **3. Routes (`cms_app/urls.py`)**

```python
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
```

---

## **4. Available Endpoints**

With JWT auth enabled (Phase 2), here’s what you can call:

| Method | Endpoint              | Description       |
| ------ | --------------------- | ----------------- |
| POST   | `/api/token/`         | Login, get tokens |
| POST   | `/api/token/refresh/` | Refresh token     |
| POST   | `/api/token/logout/`  | Logout/blacklist  |
| GET    | `/api/users/`         | List users        |
| POST   | `/api/users/`         | Create user       |
| GET    | `/api/templates/`     | List templates    |
| POST   | `/api/templates/`     | Create template   |
| GET    | `/api/pages/`         | List pages        |
| POST   | `/api/pages/`         | Create page       |
| GET    | `/api/elements/`      | List elements     |
| POST   | `/api/elements/`      | Create element    |
| GET    | `/api/ailogs/`        | List AI logs      |
| POST   | `/api/ailogs/`        | Create AI log     |

> ⚠️ All `/api/...` endpoints require `Authorization: Bearer <access_token>` header.

---

## **5. Testing Flow**

1. **Create Superuser**

   ```bash
   python manage.py createsuperuser
   ```

2. **Login (POST → `/api/token/`)**

   ```json
   { "email": "admin@example.com", "password": "123456" }
   ```

   → returns `{ "access": "xxx", "refresh": "yyy" }`

3. **Use Access Token in Headers**

   ```
   Authorization: Bearer xxx
   ```

4. **Test CRUD** (Users, Templates, Pages, Elements, AILogs)
