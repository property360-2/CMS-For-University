from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpResponseForbidden
from django.views.decorators.http import require_http_methods
from django.contrib import messages
from .models import Website, Page, Section, Element, Category
import json


@login_required
def create_website(request):
    """Create a new website"""
    if request.method == "POST":
        title = request.POST.get("title")
        description = request.POST.get("description", "")
        theme = request.POST.get("theme", "light")

        website = Website.objects.create(
            owner=request.user, title=title, description=description, theme=theme
        )

        # Create default homepage
        homepage = Page.objects.create(
            website=website, title="Home", slug="home", is_homepage=True, order=0
        )

        messages.success(request, f'Website "{title}" created successfully!')
        return redirect("websites:editor", website_id=website.id)

    return render(request, "websites/create.html")


@login_required
def website_detail(request, website_id):
    """View website details"""
    website = get_object_or_404(Website, id=website_id, owner=request.user)
    return render(request, "websites/detail.html", {"website": website})


@login_required
def website_editor(request, website_id):
    """Main visual editor view"""
    website = get_object_or_404(Website, id=website_id, owner=request.user)
    pages = website.pages.all()

    context = {
        "website": website,
        "pages": pages,
        "categories": Category.objects.all(),
    }
    return render(request, "websites/editor.html", context)


@login_required
def delete_website(request, website_id):
    """Delete a website"""
    website = get_object_or_404(Website, id=website_id, owner=request.user)

    if request.method == "POST":
        title = website.title
        website.delete()
        messages.success(request, f'Website "{title}" deleted successfully!')
        return redirect("dashboard:user_dashboard")

    return render(request, "websites/delete_confirm.html", {"website": website})


@login_required
@require_http_methods(["POST"])
def toggle_publish(request, website_id):
    """Publish or unpublish a website"""
    website = get_object_or_404(Website, id=website_id, owner=request.user)
    website.is_published = not website.is_published
    website.save()

    status = "published" if website.is_published else "unpublished"
    messages.success(request, f"Website {status} successfully!")

    return redirect("websites:detail", website_id=website.id)


@login_required
@require_http_methods(["POST"])
def save_website(request, website_id):
    """HTMX autosave endpoint"""
    website = get_object_or_404(Website, id=website_id, owner=request.user)

    try:
        data = json.loads(request.body)

        if "title" in data:
            website.title = data["title"]
        if "description" in data:
            website.description = data["description"]
        if "theme" in data:
            website.theme = data["theme"]

        website.save()

        return JsonResponse({"success": True, "message": "Saved!"})
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=400)


# Page Management
@login_required
@require_http_methods(["POST"])
def create_page(request, website_id):
    """Create a new page"""
    website = get_object_or_404(Website, id=website_id, owner=request.user)

    try:
        data = json.loads(request.body)
        title = data.get("title", "New Page")

        # Get max order
        max_order = website.pages.aggregate(models.Max("order"))["order__max"] or 0

        page = Page.objects.create(website=website, title=title, order=max_order + 1)

        return JsonResponse(
            {
                "success": True,
                "page": {
                    "id": str(page.id),
                    "title": page.title,
                    "slug": page.slug,
                    "order": page.order,
                },
            }
        )
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=400)


@login_required
@require_http_methods(["PATCH", "POST"])
def update_page(request, website_id, page_id):
    """Update page properties"""
    website = get_object_or_404(Website, id=website_id, owner=request.user)
    page = get_object_or_404(Page, id=page_id, website=website)

    try:
        data = json.loads(request.body)

        if "title" in data:
            page.title = data["title"]
        if "order" in data:
            page.order = data["order"]
        if "is_homepage" in data:
            page.is_homepage = data["is_homepage"]

        page.save()

        return JsonResponse({"success": True})
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=400)


@login_required
@require_http_methods(["DELETE", "POST"])
def delete_page(request, website_id, page_id):
    """Delete a page"""
    website = get_object_or_404(Website, id=website_id, owner=request.user)
    page = get_object_or_404(Page, id=page_id, website=website)

    # Don't allow deleting the last page
    if website.pages.count() <= 1:
        return JsonResponse(
            {"success": False, "error": "Cannot delete the last page"}, status=400
        )

    page.delete()
    return JsonResponse({"success": True})


# Section Management
@login_required
@require_http_methods(["POST"])
def create_section(request, page_id):
    """Create a new section"""
    page = get_object_or_404(Page, id=page_id)

    # Check ownership
    if page.website.owner != request.user:
        return JsonResponse(
            {"success": False, "error": "Permission denied"}, status=403
        )

    try:
        data = json.loads(request.body)

        max_order = page.sections.aggregate(models.Max("order"))["order__max"] or 0

        section = Section.objects.create(
            page=page,
            heading=data.get("heading", ""),
            body=data.get("body", ""),
            order=max_order + 1,
        )

        return JsonResponse(
            {
                "success": True,
                "section": {
                    "id": str(section.id),
                    "heading": section.heading,
                    "body": section.body,
                    "order": section.order,
                },
            }
        )
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=400)


@login_required
@require_http_methods(["PATCH", "POST"])
def update_section(request, section_id):
    """Update section content"""
    section = get_object_or_404(Section, id=section_id)

    if section.page.website.owner != request.user:
        return JsonResponse(
            {"success": False, "error": "Permission denied"}, status=403
        )

    try:
        data = json.loads(request.body)

        if "heading" in data:
            section.heading = data["heading"]
        if "body" in data:
            section.body = data["body"]
        if "order" in data:
            section.order = data["order"]

        section.save()
        return JsonResponse({"success": True})
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=400)


@login_required
@require_http_methods(["DELETE", "POST"])
def delete_section(request, section_id):
    """Delete a section"""
    section = get_object_or_404(Section, id=section_id)

    if section.page.website.owner != request.user:
        return JsonResponse(
            {"success": False, "error": "Permission denied"}, status=403
        )

    section.delete()
    return JsonResponse({"success": True})


# Element Management
@login_required
@require_http_methods(["POST"])
def create_element(request, section_id):
    """Create a new element"""
    section = get_object_or_404(Section, id=section_id)

    if section.page.website.owner != request.user:
        return JsonResponse(
            {"success": False, "error": "Permission denied"}, status=403
        )

    try:
        data = json.loads(request.body)

        element = Element.objects.create(
            section=section,
            element_type=data.get("type", "text"),
            x=data.get("x", 0),
            y=data.get("y", 0),
            width=data.get("width", 100),
            height=data.get("height", 100),
            content=data.get("content", ""),
            style=data.get("style", {}),
        )

        return JsonResponse(
            {
                "success": True,
                "element": {
                    "id": str(element.id),
                    "type": element.element_type,
                    "x": element.x,
                    "y": element.y,
                    "width": element.width,
                    "height": element.height,
                    "content": element.content,
                },
            }
        )
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=400)


@login_required
@require_http_methods(["PATCH", "POST"])
def update_element(request, element_id):
    """Update element position/content"""
    element = get_object_or_404(Element, id=element_id)

    if element.section.page.website.owner != request.user:
        return JsonResponse(
            {"success": False, "error": "Permission denied"}, status=403
        )

    try:
        data = json.loads(request.body)

        if "x" in data:
            element.x = data["x"]
        if "y" in data:
            element.y = data["y"]
        if "width" in data:
            element.width = data["width"]
        if "height" in data:
            element.height = data["height"]
        if "content" in data:
            element.content = data["content"]
        if "style" in data:
            element.style = data["style"]
        if "z_index" in data:
            element.z_index = data["z_index"]

        element.save()
        return JsonResponse({"success": True})
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=400)


@login_required
@require_http_methods(["DELETE", "POST"])
def delete_element(request, element_id):
    """Delete an element"""
    element = get_object_or_404(Element, id=element_id)

    if element.section.page.website.owner != request.user:
        return JsonResponse(
            {"success": False, "error": "Permission denied"}, status=403
        )

    element.delete()
    return JsonResponse({"success": True})


# Need to add models import at top
from django.db import models
