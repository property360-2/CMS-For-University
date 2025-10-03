from rest_framework import serializers
from .models import User, Template, Page, Section

# -----------------------------
# User Serializer
# -----------------------------
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"
        extra_kwargs = {'password': {'write_only': True}}

    # Hash password on creation
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

# -----------------------------
# Template Serializer
# -----------------------------
class TemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Template
        fields = "__all__"

# -----------------------------
# Page Serializer
# -----------------------------
class PageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Page
        fields = "__all__"

    def validate_slug(self, value):
        user = self.context['request'].user
        if Page.objects.filter(user=user, slug=value).exists():
            raise serializers.ValidationError("Slug already exists for this user.")
        return value

# -----------------------------
# Section Serializer
# -----------------------------
class SectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = "__all__"

    def validate_order(self, value):
        page = self.initial_data.get('page') or getattr(self.instance, 'page', None)
        if not page:
            raise serializers.ValidationError("Page must be specified for section.")
        if Section.objects.filter(page=page, order=value).exists():
            raise serializers.ValidationError("This order value is already used in this page.")
        return value
