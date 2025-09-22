from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Page, Template, Element, AI_Log
from django.utils.text import slugify

# -----------------------------
# Register Serializer
# -----------------------------
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"]
        )
        return user

# -----------------------------
# User Serializer (read-only)
# -----------------------------
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]

# -----------------------------
# Page Serializer
# -----------------------------
class PageSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    template = serializers.PrimaryKeyRelatedField(queryset=Template.objects.all(), required=False, allow_null=True)
    slug = serializers.CharField(required=False)

    class Meta:
        model = Page
        fields = "__all__"

    def validate_status(self, value):
        if value.lower() not in ['draft', 'published', 'archived']:
            raise serializers.ValidationError('Status must be draft, published, or archived.')
        return value.lower()

    def create(self, validated_data):
        if not validated_data.get('slug') and validated_data.get('title'):
            validated_data['slug'] = slugify(validated_data['title'])
        return super().create(validated_data)

# -----------------------------
# Template Serializer
# -----------------------------
class TemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Template
        fields = "__all__"

# -----------------------------
# Element Serializer
# -----------------------------
class ElementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Element
        fields = "__all__"

# -----------------------------
# AI Log Serializer
# -----------------------------
class AILogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AI_Log
        fields = "__all__"
