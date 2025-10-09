from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from websites.models import Website, Page


def public_dashboard(request):
    """Public homepage with featured websites"""
    featured_websites = Website.objects.filter(
        is_published=True,
        is_featured=True
    )[:6]
    
    recent_websites = Website.objects.filter(
        is_published=True
    ).order_by('-created_at')[:12]
    
    context = {
        'featured_websites': featured_websites,
        'recent_websites': recent_websites,
    }
    return render(request, 'dashboard/public.html', context)


@login_required
def user_dashboard(request):
    """User's personal dashboard with their websites"""
    websites = request.user.websites.all()
    
    context = {
        'websites': websites,
    }
    return render(request, 'dashboard/user.html', context)


def website_home(request, username, site_slug):
    """Public view of a published website homepage"""
    user = get_object_or_404(User, username=username)
    website = get_object_or_404(Website, owner=user, slug=site_slug, is_published=True)
    
    # Get homepage or first page
    homepage = website.pages.filter(is_homepage=True).first()
    if not homepage:
        homepage = website.pages.first()
    
    # Increment view count
    website.view_count += 1
    website.save(update_fields=['view_count'])
    
    context = {
        'website': website,
        'page': homepage,
        'pages': website.pages.all(),
    }
    return render(request, 'public/website_home.html', context)


def page_detail(request, username, site_slug, page_slug):
    """Public view of a specific page"""
    user = get_object_or_404(User, username=username)
    website = get_object_or_404(Website, owner=user, slug=site_slug, is_published=True)
    page = get_object_or_404(Page, website=website, slug=page_slug)
    
    context = {
        'website': website,
        'page': page,
        'pages': website.pages.all(),
    }
    return render(request, 'public/page_detail.html', context)