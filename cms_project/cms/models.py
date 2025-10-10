from django.db import models
from django.urls import reverse
from django.utils.text import slugify

class Page(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    content_md = models.TextField(help_text="Write your content in Markdown")
    seo_description = models.CharField(max_length=160, blank=True, help_text="Brief description for SEO")
    seo_keywords = models.CharField(max_length=200, blank=True, help_text="Comma-separated keywords")
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse('page_detail', kwargs={'slug': self.slug})