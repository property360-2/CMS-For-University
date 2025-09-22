from rest_framework import viewsets, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Page, Template, Element, AI_Log
from .serializers import (
    PageSerializer,
    TemplateSerializer,
    ElementSerializer,
    AILogSerializer,
    UserSerializer,
    RegisterSerializer
)

# -----------------------------
# Registration API
# -----------------------------
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {"message": "User created successfully", "user_id": user.id},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# -----------------------------
# Users (read-only)
# -----------------------------
class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

# -----------------------------
# Pages CRUD + AI Content
# -----------------------------
class PageViewSet(viewsets.ModelViewSet):
    queryset = Page.objects.all()
    serializer_class = PageSerializer

    @action(detail=True, methods=["post"])
    def generate_ai_content(self, request, pk=None):
        page = self.get_object()
        prompt = request.data.get("prompt", "")

        # Mock AI output
        ai_output = f"Generated content for: {prompt}"

        # Save AI log
        AI_Log.objects.create(
            user=page.user,
            page=page,
            prompt=prompt,
            output_json={"content": ai_output},
            model_name="mock-model"
        )

        return Response({
            "message": "AI content generated",
            "output": ai_output
        })

# -----------------------------
# Templates CRUD
# -----------------------------
class TemplateViewSet(viewsets.ModelViewSet):
    queryset = Template.objects.all()
    serializer_class = TemplateSerializer

# -----------------------------
# Elements CRUD
# -----------------------------
class ElementViewSet(viewsets.ModelViewSet):
    queryset = Element.objects.all()
    serializer_class = ElementSerializer

# -----------------------------
# AI Logs CRUD
# -----------------------------
class AILogViewSet(viewsets.ModelViewSet):
    queryset = AI_Log.objects.all()
    serializer_class = AILogSerializer
