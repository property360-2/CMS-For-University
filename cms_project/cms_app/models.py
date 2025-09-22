from django.db import models
import uuid

# --------------------------
# Users Table
# --------------------------
class User(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)  # hashed password
    role = models.CharField(max_length=50)       # admin, editor, etc.
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


# --------------------------
# Templates Table
# --------------------------
class Template(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    structure = models.JSONField()  # layout info
    theme = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


# --------------------------
# Pages Table
# --------------------------
class Page(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived')
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="pages")
    template = models.ForeignKey(Template, on_delete=models.SET_NULL, null=True, blank=True)
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    content_json = models.JSONField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    seo_meta = models.JSONField(blank=True, null=True)  # title, description, keywords
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


# --------------------------
# Elements Table (optional)
# --------------------------
class Element(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    page = models.ForeignKey(Page, on_delete=models.CASCADE, related_name="elements")
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=50)  # text, image, button, etc.
    properties = models.JSONField()          # size, color, text, links
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


# --------------------------
# AI_Logs Table (optional)
# --------------------------
class AI_Log(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="ai_logs")
    page = models.ForeignKey(Page, on_delete=models.CASCADE, null=True, blank=True, related_name="ai_logs")
    prompt = models.TextField()
    output_json = models.JSONField()
    model_name = models.CharField(max_length=50)  # e.g., GPT-4
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"AI Log {self.id} by {self.user.name}"
