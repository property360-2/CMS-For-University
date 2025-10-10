from django.urls import path
from . import views

urlpatterns = [
    path('', views.page_list, name='page_list'),
    path('search/', views.search, name='search'),
    path('cheat-sheet/', views.cheat_sheet, name='cheat_sheet'),
    path('<slug:slug>/', views.page_detail, name='page_detail'),
]