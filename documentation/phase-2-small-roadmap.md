---

# **Phase 2: Database & Migrations (Django + JWT Auth)**

## **1. Setup Virtual Environment**

Use Conda or venv. (Using Python 3.11 for Django compatibility.)

```bash
conda create -n cms python=3.11
conda activate cms
```

---

## **2. Install Dependencies**

```bash
pip install django djangorestframework psycopg2-binary djangorestframework-simplejwt
```

* `django` → main framework
* `djangorestframework` → REST APIs
* `psycopg2-binary` → PostgreSQL connector
* `djangorestframework-simplejwt` → JWT authentication (access/refresh tokens)

---

## **3. Start Project + App**

```bash
django-admin startproject cms_project
cd cms_project
python manage.py startapp cms_app
```

---

## **4. Configure Installed Apps**

In `cms_project/settings.py`:

```python
INSTALLED_APPS = [
    ...
    'rest_framework',
    'rest_framework_simplejwt.token_blacklist',  # for logout/blacklist
    'cms_app',
]
```

---

## **5. REST Framework + JWT Settings**

Also in `settings.py`:

```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}
```

---

## **6. Define Models (`cms_app/models.py`)**

Updated with **no user role**, only single user type:

```python
from django.db import models
import uuid
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager

# Custom User Manager
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)

# Custom User Model (no role field)
class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    objects = UserManager()

    def __str__(self):
        return self.email


class Template(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    structure = models.JSONField()
    theme = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Page(models.Model):
    STATUS_CHOICES = [
        ("draft", "draft"),
        ("published", "published"),
        ("archived", "archived"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="pages")
    template = models.ForeignKey(Template, on_delete=models.SET_NULL, null=True, related_name="pages")
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    content_json = models.JSONField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    seo_meta = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Element(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=50)
    properties = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class AILog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="ai_logs")
    prompt = models.TextField()
    output_json = models.JSONField()
    model_name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
```

---

## **7. Configure Custom User in Settings**

In `cms_project/settings.py`:

```python
AUTH_USER_MODEL = 'cms_app.User'
```

---

## **8. Apply Migrations**

Generate and apply DB schema:

```bash
python manage.py makemigrations
python manage.py migrate
```

---

## **9. Create Superuser**

```bash
python manage.py createsuperuser
```

---

## **10. JWT Authentication Routes**

In `cms_project/urls.py`:

```python
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # Login
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # Refresh
    path('api/token/logout/', TokenBlacklistView.as_view(), name='token_blacklist'),  # Logout
    path('api/', include('cms_app.urls')),  # future app routes
]
```

---

## **11. Authentication Workflow**

* **Login (POST)** → `/api/token/`
  Payload:

  ```json
  { "email": "admin@example.com", "password": "123456" }
  ```

  Response:

  ```json
  { "access": "xxx", "refresh": "yyy" }
  ```

* **Refresh (POST)** → `/api/token/refresh/`
  Payload: `{ "refresh": "yyy" }`

* **Logout (POST)** → `/api/token/logout/`
  Payload: `{ "refresh": "yyy" }` → refresh token blacklisted

* **Protected API Call**
  Add header:

  ```
  Authorization: Bearer <access_token>
  ```


