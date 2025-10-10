# 🧩 Project Plan: Simple Markdown-Based CMS (Django + Python)

## 🧠 Overview

A **simple, full-stack content management system (CMS)** built using **Django (Python)**.  
The CMS allows **admins** to manage website content written in **Markdown**, which is rendered as **HTML** with selectable design themes.  
The **public** can view, search, and share the published content, which is also **SEO-friendly and Google-indexable**.

---

## 🎯 Objectives

- ✅ Create a **lightweight CMS** that uses Markdown for content.
- ✅ Allow **admins** to create, edit, and delete content through Django Admin.
- ✅ Automatically **render Markdown to HTML** with styling and themes.
- ✅ Allow **public viewing and searching** of content.
- ✅ Implement **basic SEO features** (meta tags, titles, slugs, sitemap).
- ✅ Include a **Markdown cheat sheet** for admins.
- ✅ Offer **three visual themes**: light, dark, and purple.
- ✅ Host on **Render** for live public access.

---

## ⚙️ Tech Stack

| Layer | Technology | Notes |
|-------|-------------|-------|
| Backend | **Django (Python)** | Core framework |
| Database | **SQLite** | Simple local DB (can switch to PostgreSQL for production) |
| Frontend | **Django Templates + Tailwind CSS** | For styling and themes |
| Markdown Rendering | **markdown2** or **django-markdownx** | Convert Markdown → HTML |
| Hosting | **Render** | Easy, free-tier-friendly hosting |
| Version Control | **GitHub** | For deployment & collaboration |

---

## 🧱 Project Structure

```

cms_project/
│
├── cms/                      # Main CMS app
│   ├── models.py             # Page model (Markdown content)
│   ├── views.py              # Rendering logic
│   ├── urls.py               # CMS URLs
│   ├── sitemaps.py           # For SEO and indexing
│   ├── templates/cms/        # HTML templates
│   │   ├── base.html         # Global layout + theme switch
│   │   ├── page_list.html    # Homepage (list of pages)
│   │   ├── page_detail.html  # Individual Markdown-rendered page
│   │   ├── search.html       # Search results
│   │   └── cheat_sheet.html  # Markdown cheat sheet
│   └── static/cms/           # Static assets
│       ├── css/
│       └── js/
│
├── cms_project/settings.py   # Django settings
├── cms_project/urls.py       # Root URLs
├── manage.py
└── requirements.txt

````

---

## 🧩 Models

### `Page` Model

```python
from django.db import models

class Page(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    content_md = models.TextField()
    seo_description = models.CharField(max_length=160, blank=True)
    seo_keywords = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
````

---

## 🧠 Core Features

### 1. Markdown Rendering

Use `markdown2` to convert Markdown to safe HTML:

```python
import markdown2
from django.shortcuts import render, get_object_or_404
from .models import Page

def page_detail(request, slug):
    page = get_object_or_404(Page, slug=slug)
    content_html = markdown2.markdown(page.content_md, extras=["fenced-code-blocks"])
    return render(request, "cms/page_detail.html", {
        "page": page,
        "content_html": content_html
    })
```

---

### 2. Search Functionality

Simple search via title or content:

```python
def search(request):
    q = request.GET.get("q", "")
    results = Page.objects.filter(title__icontains=q) if q else []
    return render(request, "cms/search.html", {"query": q, "results": results})
```

---

### 3. Themes (Light / Dark / Purple)

Handled via Tailwind CSS classes and a simple JS toggle:

```html
<!-- base.html -->
<html class="theme-light">
  <body>
    <header>
      <button id="toggle-theme">Switch Theme</button>
    </header>

    {% block content %}{% endblock %}

    <script>
      const themes = ['light', 'dark', 'purple']
      let i = 0
      document.getElementById('toggle-theme').onclick = () => {
        i = (i + 1) % themes.length
        document.documentElement.className = 'theme-' + themes[i]
      }
    </script>
  </body>
</html>
```

---

### 4. SEO Support

Each page will have meta tags dynamically rendered:

```html
<!-- page_detail.html -->
{% extends "cms/base.html" %}
{% block title %}{{ page.title }}{% endblock %}
{% block head %}
<meta name="description" content="{{ page.seo_description }}">
<meta name="keywords" content="{{ page.seo_keywords }}">
{% endblock %}
{% block content %}
<article class="prose">
  <h1>{{ page.title }}</h1>
  {{ content_html|safe }}
</article>
{% endblock %}
```

---

### 5. Sitemap for Google Indexing

`cms/sitemaps.py`:

```python
from django.contrib.sitemaps import Sitemap
from .models import Page

class PageSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.8

    def items(self):
        return Page.objects.all()

    def lastmod(self, obj):
        return obj.updated_at
```

In `urls.py`:

```python
from django.contrib.sitemaps.views import sitemap
from .sitemaps import PageSitemap

sitemaps = {'pages': PageSitemap}

urlpatterns = [
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps}),
]
```

---

### 6. robots.txt

Allow Google to crawl:

```
User-agent: *
Disallow:
Sitemap: https://yourdomain.com/sitemap.xml
```

---

### 7. Markdown Cheat Sheet Page

Static template showing Markdown syntax examples:

```
/cheat-sheet/
```

---

### 8. Admin Panel

* Use **Django’s built-in admin** for simplicity.
* Admins can add/edit pages with Markdown in a textarea.
* Optionally use `django-markdownx` for live preview.

---

## 🚀 Deployment on Render

### Steps

1. Push project to GitHub.
2. Create a new Render web service.
3. Add environment variables:

   * `SECRET_KEY`
   * `DEBUG=False`
   * `ALLOWED_HOSTS=yourdomain.onrender.com`
4. Build command:

   ```bash
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py collectstatic --noinput
   ```
5. Auto deploy from GitHub.

---

## 🧩 Requirements.txt

```
Django>=5.0
markdown2
gunicorn
whitenoise
```

---

## 📄 Optional Enhancements

| Feature             | Description                                             |
| ------------------- | ------------------------------------------------------- |
| **Comments**        | Add comment section using Django models or Disqus embed |
| **Tags/Categories** | Add tagging for better content organization             |
| **RSS Feed**        | Optional RSS feed generation                            |
| **Custom Domain**   | Connect Render app to a custom domain                   |
| **Analytics**       | Add Google Analytics or Plausible for traffic insights  |

---

## ✅ Deliverables

* Functional Django CMS project
* Markdown to HTML rendering
* Theme switcher (light/dark/purple)
* Search functionality
* SEO-optimized, indexable public pages
* Sitemap and robots.txt
* Static Markdown cheat sheet
* Render deployment ready

---