from django.contrib.sitemaps import Sitemap
from .models import Website, Page


class WebsiteSitemap(Sitemap):
    """Sitemap for published websites"""
    changefreq = "weekly"
    priority = 0.8

    def items(self):
        return Website.objects.filter(is_published=True)

    def lastmod(self, obj):
        return obj.updated_at

    def location(self, obj):
        return obj.get_absolute_url()


class PageSitemap(Sitemap):
    """Sitemap for published pages"""
    changefreq = "weekly"
    priority = 0.6

    def items(self):
        return Page.objects.filter(
            website__is_published=True
        ).exclude(is_homepage=True)

    def lastmod(self, obj):
        return obj.updated_at

    def location(self, obj):
        return obj.get_absolute_url()