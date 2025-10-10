from django.contrib import admin
from django.urls import path, include
from django.contrib.sitemaps.views import sitemap
from cms.sitemaps import PageSitemap

sitemaps = {
    'pages': PageSitemap,
}

urlpatterns = [
    path('admin/', admin.site.urls),
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='sitemap'),
    path('', include('cms.urls')),
]