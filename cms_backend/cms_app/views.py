from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import User, Template, Page, Section
from .serializers import UserSerializer, TemplateSerializer, PageSerializer, SectionSerializer

# -----------------------------
# Custom permission
# -----------------------------
class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Only allow owners of the related Page or admins to edit/delete.
    """
    def has_object_permission(self, request, view, obj):
        # Admins can always edit
        if request.user.is_staff:
            return True
        # For sections → check page.user
        if hasattr(obj, "page") and obj.page.user == request.user:
            return True
        # For pages → check directly
        if hasattr(obj, "user") and obj.user == request.user:
            return True
        return False

# -----------------------------
# UserViewSet
# -----------------------------
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]  # only admins can CRUD users

# -----------------------------
# User Registration Endpoint
# -----------------------------
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_user(request):
    """
    Register a new user with hashed password.
    """
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
