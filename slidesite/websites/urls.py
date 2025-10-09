from django.urls import path
from . import views

app_name = 'websites'

urlpatterns = [
    # Website management
    path('create/', views.create_website, name='create'),
    path('<uuid:website_id>/', views.website_detail, name='detail'),
    path('<uuid:website_id>/edit/', views.website_editor, name='editor'),
    path('<uuid:website_id>/delete/', views.delete_website, name='delete'),
    path('<uuid:website_id>/publish/', views.toggle_publish, name='toggle_publish'),
    
    # HTMX endpoints for editor
    path('<uuid:website_id>/save/', views.save_website, name='save'),
    path('<uuid:website_id>/pages/create/', views.create_page, name='create_page'),
    path('<uuid:website_id>/pages/<uuid:page_id>/update/', views.update_page, name='update_page'),
    path('<uuid:website_id>/pages/<uuid:page_id>/delete/', views.delete_page, name='delete_page'),
    
    # Section management
    path('sections/<uuid:section_id>/update/', views.update_section, name='update_section'),
    path('sections/<uuid:section_id>/delete/', views.delete_section, name='delete_section'),
    path('pages/<uuid:page_id>/sections/create/', views.create_section, name='create_section'),
    
    # Element management
    path('elements/<uuid:element_id>/update/', views.update_element, name='update_element'),
    path('elements/<uuid:element_id>/delete/', views.delete_element, name='delete_element'),
    path('sections/<uuid:section_id>/elements/create/', views.create_element, name='create_element'),
]