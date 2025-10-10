from django.contrib import admin
from .models import Website, Page, Section, Element, Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "created_at"]
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ["name"]


@admin.register(Website)
class WebsiteAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "owner",
        "theme",
        "is_published",
        "is_featured",
        "view_count",
        "created_at",
    ]
    list_filter = ["is_published", "is_featured", "theme", "created_at"]
    search_fields = ["title", "owner__username", "description"]
    readonly_fields = ["id", "created_at", "updated_at", "view_count"]
    list_editable = ["is_published", "is_featured"]

    fieldsets = (
        ("Basic Info", {"fields": ("id", "owner", "title", "slug", "description")}),
        ("Settings", {"fields": ("theme", "is_published", "is_featured")}),
        ("Stats", {"fields": ("view_count", "created_at", "updated_at")}),
    )


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = ["title", "website", "order", "is_homepage", "created_at"]
    list_filter = ["is_homepage", "created_at"]
    search_fields = ["title", "website__title"]
    readonly_fields = ["id", "created_at", "updated_at"]


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ["heading", "page", "order", "category", "created_at"]
    list_filter = ["category", "created_at"]
    search_fields = ["heading", "body", "page__title"]
    readonly_fields = ["id", "created_at", "updated_at"]


@admin.register(Element)
class ElementAdmin(admin.ModelAdmin):
    list_display = ["element_type", "section", "z_index", "created_at"]
    list_filter = ["element_type", "created_at"]
    readonly_fields = ["id", "created_at", "updated_at"]
