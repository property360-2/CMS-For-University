from django.shortcuts import render, get_object_or_404
from django.db.models import Q
import markdown2
from .models import Page

def page_list(request):
    pages = Page.objects.filter(is_published=True)
    return render(request, 'cms/page_list.html', {'pages': pages})

def page_detail(request, slug):
    page = get_object_or_404(Page, slug=slug, is_published=True)
    content_html = markdown2.markdown(
        page.content_md, 
        extras=["fenced-code-blocks", "tables", "break-on-newline", "code-friendly"]
    )
    return render(request, 'cms/page_detail.html', {
        'page': page,
        'content_html': content_html
    })

def search(request):
    query = request.GET.get('q', '')
    results = []
    if query:
        results = Page.objects.filter(
            Q(title__icontains=query) | Q(content_md__icontains=query),
            is_published=True
        )
    return render(request, 'cms/search.html', {
        'query': query,
        'results': results
    })

def cheat_sheet(request):
    return render(request, 'cms/cheat_sheet.html')