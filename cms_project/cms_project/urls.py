from django.urls import path, include
from django.contrib.sitemaps.views import sitemap
from cms.sitemaps import PageSitemap
from cms.admin import admin_site  # Import custom admin site

sitemaps = {
    'pages': PageSitemap,
}

urlpatterns = [
    path('admin/', admin_site.urls),  # Use custom admin site
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='sitemap'),
    path('', include('cms.urls')),
]