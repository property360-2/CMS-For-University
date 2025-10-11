from django.contrib import admin
from django.contrib.admin import AdminSite
from django.utils import timezone
from datetime import timedelta
from .models import Page

# Custom Admin Site
class CustomAdminSite(AdminSite):
    site_header = 'MarkCMS Administration'
    site_title = 'MarkCMS Admin'
    index_title = 'Dashboard'
    
    def index(self, request, extra_context=None):
        # Add statistics to context
        extra_context = extra_context or {}
        
        # Calculate statistics
        total_pages = Page.objects.count()
        published_pages = Page.objects.filter(is_published=True).count()
        
        # Pages created in last 7 days
        seven_days_ago = timezone.now() - timedelta(days=7)
        recent_pages = Page.objects.filter(created_at__gte=seven_days_ago).count()
        
        extra_context.update({
            'total_pages': total_pages,
            'published_pages': published_pages,
            'recent_pages': recent_pages,
        })
        
        return super().index(request, extra_context)

# Create custom admin site instance
admin_site = CustomAdminSite(name='custom_admin')

@admin.register(Page, site=admin_site)
class PageAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'is_published', 'created_at', 'updated_at')
    list_filter = ('is_published', 'created_at', 'updated_at')
    search_fields = ('title', 'content_md', 'seo_description', 'seo_keywords')
    prepopulated_fields = {'slug': ('title',)}
    date_hierarchy = 'created_at'
    list_per_page = 25
    
    fieldsets = (
        ('Content', {
            'fields': ('title', 'slug', 'content_md', 'is_published'),
            'description': 'Main content of your page. Use Markdown syntax for formatting.'
        }),
        ('SEO & Meta', {
            'fields': ('seo_description', 'seo_keywords'),
            'classes': ('collapse',),
            'description': 'Optimize your page for search engines.'
        }),
    )
    
    class Media:
        css = {
            'all': ('admin/css/custom_admin.css',)
        }

# Register built-in models with custom admin site
from django.contrib.auth.models import User, Group
from django.contrib.auth.admin import UserAdmin, GroupAdmin

admin_site.register(User, UserAdmin)
admin_site.register(Group, GroupAdmin)