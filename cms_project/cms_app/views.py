from rest_framework import viewsets, permissions, generics
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

# User CRUD (protected)
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


# Register (open for anyone)
class RegisterView(generics.CreateAPIView):  # ✅ use CreateAPIView, not ViewSet
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]


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
