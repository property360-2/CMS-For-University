from rest_framework import serializers
from .models import User, Page, Template, Element, AI_Log

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"

class TemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Template
        fields = "__all__"

class PageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Page
        fields = "__all__"

class ElementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Element
        fields = "__all__"

class AI_LogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AI_Log
        fields = "__all__"
