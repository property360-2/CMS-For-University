Nice — here’s the **single, comprehensive plan** in **Markdown** (no phases, everything included) for a **pure-Python Django CMS** that lets users **build websites like making Google Slides**, publish SEO-indexable sites, has global themes (Light/Dark/Purple), admin-only management dashboard, content categorization, searchability, and high UX/UI. I kept it practical and implementation-ready so Claude (or any engineer) can use it as a spec.

# SlideSite — Complete Product Plan (Markdown)

---

## Summary

SlideSite is a Django (Python) app where users create an entire website using a **slide-like visual editor** (pages = slides). Each site can be published as a **server-rendered, SEO-friendly website**. The platform includes:

- User auth & per-user websites
- Visual editor with slides/sections/elements (text, images, shapes)
- Publish/unpublish with SEO meta, sitemap, robots
- Developer-built global dashboard (public) with dynamic articles and categories
- Admin-only management dashboard (hidden URL)
- Global themes: `light`, `dark`, `purple`
- High UX: keyboard shortcuts, autosave, HTMX partial updates, responsive layout

---

## Tech stack & libs (recommended)

- Python 3.13
- Django 
- SQLite (dev) — easy to swap to PostgreSQL
- django-htmx (for HTMX integration)
- TailwindCSS (for UI / theming)
- Pillow (image handling)
- WeasyPrint or ReportLab (PDF export)
- (Optional small JS) `interactjs` or custom micro-vanilla for drag/resize (editor UX)
- django.contrib.sitemaps (sitemap)
- django.contrib.postgres.search (if using Postgres for search later)

Install:

```bash
pip install Django==5.2.* pillow django-htmx weasyprint
# plus tailwind setup via npm if using tailwind CLI
```

---

## Project structure (example)

```
slidesite/
├─ manage.py
├─ slidesite/                 # project settings, urls
├─ accounts/                  # auth (login/register/profile)
├─ websites/                  # main app: Website, Page, Section, Element
├─ dashboard/                 # developer public dashboard & admin dashboard views
├─ media/                     # uploaded images
├─ static/                    # tailwind, themes, icons
```

---

## Data models (core)

```python
# websites/models.py (simplified)
class Website(models.Model):
    id = UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = ForeignKey(User, on_delete=CASCADE, related_name='websites')
    title = CharField(max_length=255)
    slug = SlugField(unique=True)
    description = TextField(blank=True)
    theme = CharField(max_length=20, choices=[('light','Light'),('dark','Dark'),('purple','Purple')], default='light')
    is_published = BooleanField(default=False)
    created, updated = DateTimeFields...

class Page(models.Model):   # each "slide" becomes a page
    website = FK(Website, related_name='pages')
    title = CharField(max_length=255)
    slug = SlugField()
    order = PositiveIntegerField(default=0)
    is_homepage = BooleanField(default=False)

class Section(models.Model):  # content blocks inside a page (maps to slides' sections)
    page = FK(Page, related_name='sections')
    heading = CharField(max_length=255, blank=True)
    body = TextField(blank=True)           # HTML/Markdown stored
    image = ImageField(upload_to='sections/', null=True, blank=True)
    category = FK(Category, null=True, blank=True)   # optional
    order = PositiveIntegerField(default=0)

class Element(models.Model):  # visual element on a slide-like canvas
    section = FK(Section, related_name='elements')
    type = CharField(choices=[('text','text'),('image','image'),('shape','shape')])
    x,y,width,height = FloatFields()
    z_index = IntegerField(default=0)
    content = TextField(blank=True)        # for text elements (HTML)
    image = ImageField(upload_to='elements/', null=True, blank=True)
    style = JSONField(default=dict, blank=True)

class Category(models.Model):
    name = CharField(max_length=100)
    slug = SlugField(unique=True)
```

Notes:

- `Element` provides precise visual layout (normalized coords relative to canvas).
- `Section` maps to logical blocks users drag onto "slides" (makes editing + publishing easier).
- `Page` = slide; `Section` = block on slide; `Element` = fine-grain positioned object.

---

## Permissions & roles

- `Owner` (site owner): create/edit/publish/delete website and pages.
- `Editor` (optional collaborator): edit content.
- `Viewer`: public visitor.
- Admin (platform) account: full access to management dashboard (hidden URL).
- Access control:

  - Editor/Owner endpoints protected with decorators (object-level permission checks).
  - Published content is publicly viewable at public URLs.

---

## URLs / Endpoints (full list)

Public:

```
/                      -> public developer dashboard (dynamic, SEO)
/robots.txt
/sitemap.xml
/accounts/login/
/accounts/register/
/u/<username>/<site_slug>/            -> website homepage (public, SEO)
/u/<username>/<site_slug>/<page_slug> -> page (public, SEO)
/articles/<slug>/                      -> article detail (public)
```

Authenticated (user):

```
/dashboard/                  -> user dashboard (their websites)
/websites/create/            -> create website
/websites/<uuid>/edit/      -> visual editor (slide-like)
/websites/<uuid>/save/      -> HTMX save endpoint (autosave)
/websites/<uuid>/publish/   -> set is_published
/websites/<uuid>/export/pdf/-> generate PDF
```

Admin management (hidden):

```
/cms/                       -> admin CMS home (hidden to non-admins)
/cms/articles/              -> manage articles & categories
/cms/websites/              -> manage published websites
```

API-like HTMX endpoints (examples):

```
POST /websites/<uuid>/pages/         -> create page
PATCH /websites/<uuid>/pages/<id>/   -> update page order/meta
POST /sections/<id>/elements/        -> add element
PATCH /elements/<id>/                -> update element position/style
DELETE /elements/<id>/               -> remove element
```

---

## Templates & pages (all template names included)

- `base.html` — global layout, includes theme CSS class on `<body>`: `theme-{{ website.theme }}` or default site theme.
- `dashboard/public.html` — developer dashboard (public).
- `dashboard/admin.html` — hidden admin CMS view.
- `accounts/login.html`, `accounts/register.html`, `accounts/profile.html`
- `user/dashboard.html` — user’s website list and actions.
- `websites/create.html` — create new site form (choose theme).
- `websites/editor.html` — **main visual editor** (Google Slides-like)

  - sub-HTMX partials:

    - `_thumbnails.html` — left rail thumbnails
    - `_canvas.html` — center editable canvas (page content)
    - `_properties.html` — right rail element/page properties

- `public/website_home.html` — public homepage for site
- `public/page_detail.html` — public page with sections
- `articles/list.html`, `articles/detail.html`
- `sitemap.xml` template (or use Django sitemap framework)

---

## Visual Editor UX (must feel like Google Slides)

Editor layout: 3 columns

- Left rail: slide thumbnails + add/duplicate/delete/reorder
- Center canvas: WYSIWYG visual canvas — each Page shown sized to site width, elements positioned absolutely
- Right rail: properties panel (selected element styles, text formatting, image replace, link-to-page, category assign)

Key editor interactions:

- Double-click a text element → `contenteditable` in place → HTMX autosave on blur.
- Drag & drop element → JS updates `x,y` → HTMX `PATCH /elements/<id>/`.
- Resize via handles → JS updates `width,height` → HTMX save.
- Add image → opens asset picker / upload modal → stores in `media/`.
- Add section block (predefined templates) — e.g., Hero, Two-column, Gallery.
- Slide/page reorder via dragging thumbnails → endpoint to update `Page.order`.
- Element z-index controls and duplicate/delete buttons.

UX polish:

- Debounced autosave (500ms) with success toasts.
- Undo/Redo (client-side for short history).
- Keyboard shortcuts:

  - `N` = new page
  - `D` = duplicate
  - `Del` = delete selected
  - `Ctrl/Cmd+S` = save
  - Arrow keys nudge element by 1px (shift for 10px)

- Loading skeletons, optimistic UI, and subtle transitions.

Implementation note:

- Use HTMX to update partials and persist changes quickly, keeping pages fully server-rendered so published pages are plain HTML for SEO.

---

## Theme system (global)

- `Website.theme` has values `light`, `dark`, `purple`.
- `base.html` body class: `<body class="theme-{{website.theme|default:'light'}}">`
- Use Tailwind with custom theme classes:

  - `.theme-light { @apply bg-white text-gray-900 }`
  - `.theme-dark  { @apply bg-gray-900 text-gray-100 }`
  - `.theme-purple{ background: linear-gradient(...); color: white }`

- Also apply themed components (buttons, headings) based on the body class.
- Admin/dev dashboard can choose which themes are available platform-wide (config setting).

---

## SEO, discoverability, sitemap, robots, metadata

- Use `django.contrib.sitemaps` to generate `/sitemap.xml` including:

  - Published `Website` homepages
  - All `Page` entries for published websites
  - Global `articles`

- Each public template must include:

  ```html
  <title>{{ page.title }} — {{ website.title }}</title>
  <meta
    name="description"
    content="{{ website.description|truncatechars:160 }}"
  />
  <link rel="canonical" href="{{ request.build_absolute_uri }}" />
  <meta property="og:title" content="{{ page.title }}" />
  <meta property="og:description" content="{{ website.description }}" />
  <meta property="og:image" content="{{ first_section_image_url }}" />
  <meta name="robots" content="index, follow" />
  ```

- Add JSON-LD `schema.org` for `WebSite` and `Article` where appropriate.
- `robots.txt` served at root:

  ```
  User-agent: *
  Allow: /
  Sitemap: https://example.com/sitemap.xml
  ```

- Allow webmaster to submit sitemap to Google Search Console for indexing.

---

## Searchability (site search & SEO)

- Public pages are server-rendered so Google indexes easily.
- Implement platform search:

  - For dev: simple `__icontains` on Title/Body.
  - For production: Postgres full-text search or Elastic/Meilisearch.

- Provide internal search endpoints:

  - `/search/?q=term` → returns matching websites/pages/articles (public only).

- Markup pages with appropriate h1/h2 structure for SEO.

---

## Developer dashboard (public-facing but managed by you)

- A static template `dashboard/public.html` that queries:

  - Featured websites (by flag or weight)
  - Latest articles (category filter)
  - Announcements (stored in DB by admin)

- Admin-only management page (`/cms/`) to add/remove featured items, create site-level announcements, add global links or static blocks that appear on the public dashboard.
- Public dashboard snippets are server-rendered and cached with `per-site` cache (Redis or file-based) for speed; invalidated when admin updates content.

---

## Admin/Management (hidden)

- URL: `/cms/` (or secret path) protected to staff users only.
- Features:

  - Articles & category CRUD
  - Manage featured websites & spotlight
  - Add global dashboard blocks (links, banners)
  - Moderation queue for reported websites
  - Site analytics overview (views, published sites)
  - Sitemap trigger & robots editor

- Admin UI uses Django admin for heavy tasks + custom pages for content blocks.

---

## Publishing workflow

1. User finishes editing, clicks **Publish**.
2. Backend marks `Website.is_published=True` and `Page` items as active.
3. Optionally create static cache snapshot for homepage using template render → cached HTML (still served via Django, but cached for speed).
4. Sitemap updated automatically (or queued to regenerate).
5. Public URL becomes accessible and indexable.

---

## Asset & media management

- Media stored under `/media/` in dev; in production use S3 if desired.
- Asset manager UI: view uploaded images; insert into elements/sections with alt text.
- On upload: create thumbnails for article lists and OG images.
- Validate file types and size; optional image optimization.

---

## Export & sharing

- Export website to PDF: each Page becomes a PDF page via WeasyPrint or ReportLab.
- Share links:

  - Public canonical URL
  - Optional share token for unlisted preview (e.g., `?preview_token=abc`) — only if user wants unlisted sharing.

- Social sharing meta tags (OpenGraph, Twitter cards).

---

## Analytics & logging

- Track page views (simple DB table) or use Matomo/Google Analytics snippet in public templates.
- Admin analytics show top pages, visits per site, recent activity.
- Error logging to Sentry (optional).

---

## Security & best practices

- CSRF protection (Django default).
- Media upload validation.
- Validate HTML input (sanitize) if allowing user-supplied HTML (or store as sanitized).
- Rate-limit upload endpoints.
- Use HTTPS and secure cookies in production.
- Content preview tokens expire; admin CMS only accessible to staff.

---

## Caching & performance

- Template fragment cache for public dashboards and popular pages.
- Use `Cache-Control` headers for static assets.
- Optional CDN for static assets and images.

---

## Testing

- Unit tests for models, views, and permissions.
- End-to-end tests for publish workflow and public accessibility.
- JS integration tests for drag/resize behaviors (optional).

---

## Dev & deployment checklist

- `python manage.py makemigrations && migrate`
- Create superuser
- Configure `ALLOWED_HOSTS`, `STATIC_ROOT`, `MEDIA_ROOT`
- `collectstatic`
- Use Gunicorn + Nginx (serve static + media)
- Configure HTTPS (Let's Encrypt)
- Add sitemap to Google Search Console

---

## Sample template snippets

`base.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    {% block head %}
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>
      {% block title %}{{ website.title|default:"SlideSite" }}{% endblock %}
    </title>
    {% endblock %}
  </head>
  <body class="theme-{{ website.theme|default:'light' }}">
    {% block body %}
    <header>...global header...</header>
    <main>{% block content %}{% endblock %}</main>
    <footer>...footer...</footer>
  </body>
</html>
```

`public/page_detail.html`

```html
{% extends "base.html" %} {% block title %}{{ page.title }} — {{ website.title
}}{% endblock %} {% block content %} {% for s in page.sections.all %}
<article class="py-8">
  {% if s.image %}<img src="{{ s.image.url }}" alt="{{ s.heading }}" />{% endif
  %}
  <h2>{{ s.heading }}</h2>
  <div>{{ s.body|safe }}</div>
</article>
{% endfor %} {% endblock %}
```

---

## Final notes — UX focus

- Keep editor interactions snappy (HTMX updates + small client-side motion).
- Provide templates/presets for common website sections so users can build fast.
- Prioritize accessibility (semantic HTML, alt text, keyboard navigation).
- Make publish/unpublish and preview flows obvious.
- Make themes consistent across components, with good contrast.

---

If you want, I can now:

- produce the **exact models, views, urls, and minimal templates** for you to drop into a Django project, or
- output a **concise checklist** for the first sprint (wireframes, migrations, core editor UI).

Which one do you want next?
