
## **Phase 2: Backend & Database Mini Roadmap**

### **Goal:**

Set up your Django backend, database schema, and basic APIs for your AI CMS.

---

### **1. Setup Django Project**

```bash
django-admin startproject cms_project
cd cms_project
python manage.py startapp pages
```

* `cms_project` → main project folder
* `pages` → app handling Pages, Templates, Elements, AI logs

---

### **2. Configure Database**

* In `settings.py`, set your DB (PostgreSQL recommended):

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'cms_db',
        'USER': 'db_user',
        'PASSWORD': 'password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

* Or use SQLite for **quick testing**:

```python
'ENGINE': 'django.db.backends.sqlite3',
'NAME': BASE_DIR / "db.sqlite3",
```

---

### **3. Define Models**

* Example `pages/models.py`:

```python
from django.db import models
from django.contrib.postgres.fields import JSONField  # optional for PostgreSQL

class Page(models.Model):
    title = models.CharField(max_length=255)
    content_json = JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Template(models.Model):
    name = models.CharField(max_length=100)
    layout_json = JSONField()

class Element(models.Model):
    page = models.ForeignKey(Page, on_delete=models.CASCADE, related_name="elements")
    type = models.CharField(max_length=50)
    props = JSONField()
    order = models.IntegerField()
```

* Add **AI logs table** if needed:

```python
class AI_Log(models.Model):
    page = models.ForeignKey(Page, on_delete=models.CASCADE)
    prompt = models.TextField()
    output = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
```

---

### **4. Make & Apply Migrations**

```bash
python manage.py makemigrations
python manage.py migrate
```

---

### **5. Create Superuser (Admin)**

```bash
python manage.py createsuperuser
```

* Allows you to log in at `/admin` and manage pages, templates, elements.

---

### **6. Setup Basic APIs**

* Use Django REST Framework:

```bash
pip install djangorestframework
```

* Example `pages/serializers.py`:

```python
from rest_framework import serializers
from .models import Page

class PageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Page
        fields = "__all__"
```

* Example `pages/views.py`:

```python
from rest_framework import viewsets
from .models import Page
from .serializers import PageSerializer

class PageViewSet(viewsets.ModelViewSet):
    queryset = Page.objects.all()
    serializer_class = PageSerializer
```

* Connect routes in `urls.py`:

```python
from rest_framework.routers import DefaultRouter
from .views import PageViewSet

router = DefaultRouter()
router.register(r'pages', PageViewSet)

urlpatterns = router.urls
```

---

### **7. Test**

* Run server:

```bash
python manage.py runserver
```

* Use **Postman** or browser to test API endpoints:

```
GET /pages/
POST /pages/
```

* Check admin at `/admin`.

---

### **Phase 2 Outcome**

* Database tables are set up (`Page`, `Template`, `Element`, optional `AI_Log`).
* Basic CRUD API is working.
* Backend is ready for **AI integration** and frontend drag-and-drop.

---
