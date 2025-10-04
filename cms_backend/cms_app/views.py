from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404, render
from django.http import JsonResponse
from .models import User, Template, Page, Section
from .serializers import UserSerializer, TemplateSerializer, PageSerializer, SectionSerializer
from .theme_presets import theme_presets  # your dictionary of CSS classes
from urllib.parse import unquote

handler404 = 'myapp.views.custom_404'

# In views.py
from django.shortcuts import render

def custom_404(request, exception):
    return render(request, '404.html', status=404)

# -----------------------------
# Custom permission
# -----------------------------
class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        if hasattr(obj, "page") and obj.page.user == request.user:
            return True
        if hasattr(obj, "user") and obj.user == request.user:
            return True
        return False

# -----------------------------
# UserViewSet
# -----------------------------
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

# -----------------------------
# User registration
# -----------------------------
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        user.set_password(request.data.get('password'))
        user.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# -----------------------------
# TemplateViewSet
# -----------------------------
class TemplateViewSet(viewsets.ModelViewSet):
    queryset = Template.objects.all()
    serializer_class = TemplateSerializer
    permission_classes = [permissions.IsAuthenticated]

# -----------------------------
# PageViewSet
# -----------------------------
class PageViewSet(viewsets.ModelViewSet):
    queryset = Page.objects.all()
    serializer_class = PageSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def perform_create(self, serializer):
        page = serializer.save(user=self.request.user)
        if page.template and page.template.structure:
            for idx, section_data in enumerate(page.template.structure):
                Section.objects.create(
                    page=page,
                    type=section_data['type'],
                    properties=section_data.get('properties', {}),
                    order=idx + 1
                )

# -----------------------------
# SectionViewSet
# -----------------------------
class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def create(self, request, *args, **kwargs):
        return Response(
            {"detail": "Direct section creation is not allowed. Create a Page with a Template instead."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

# -----------------------------
# Page Renderer (SSR)
# -----------------------------
def render_page(request, slug):
    print(f"Slug received: '{slug}'")  # debug line
    slug = unquote(slug).strip()  # Decode and remove leading/trailing whitespace
    page = get_object_or_404(Page, slug=slug)
    sections = page.sections.all()
    theme_class = theme_presets.get(page.template.theme if page.template else "default", "")

    return render(request, "page_detail.html", {
        "page": page,
        "sections": sections,
        "theme_class": theme_class
    })

