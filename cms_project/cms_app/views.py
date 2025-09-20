from rest_framework import viewsets
from .models import User, Page, Template, Element, AI_Log
from .serializers import UserSerializer, PageSerializer, TemplateSerializer, ElementSerializer, AI_LogSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class TemplateViewSet(viewsets.ModelViewSet):
    queryset = Template.objects.all()
    serializer_class = TemplateSerializer

class PageViewSet(viewsets.ModelViewSet):
    queryset = Page.objects.all()
    serializer_class = PageSerializer

class ElementViewSet(viewsets.ModelViewSet):
    queryset = Element.objects.all()
    serializer_class = ElementSerializer

class AI_LogViewSet(viewsets.ModelViewSet):
    queryset = AI_Log.objects.all()
    serializer_class = AI_LogSerializer
