# **Section-Based CMS Developmental Plan (Phase-by-Phase)**

---

## **Phase 1: Research & Planning** ✅ / Done

**Goal:** Define system structure, templates, sections, and workflow before coding.

**Tasks:**

1. Review requirements: dynamic content + static design + templates/themes.
2. Define page & section types (heading, paragraph, table, button, image).
3. Decide database schema (User, Template, Page, Section).
4. Finalize tech stack: Django REST Framework, PostgreSQL, React + TSX, Tailwind + shadcn/ui.
5. Prepare data dictionary and ERD.

---

## **Phase 2: Database & Migrations** 

**Goal:** Build a stable DB structure for pages, templates, sections.

**Tasks:**

1. Install PostgreSQL and create virtual environment.
2. Initialize Django project and app.
3. Define models (`User`, `Template`, `Page`, `Section`).
4. Create and apply migrations.
5. Create superuser for testing.

---

## **Phase 3: Backend APIs & CRUD**

**Goal:** Enable full CRUD operations and frontend connectivity.

**Tasks:**

1. Create serializers (`serializers.py`) for all models.
2. Implement viewsets / class-based views for API endpoints.
3. Setup URL routing (`urls.py`).
4. Implement authentication (JWT or Django auth).
5. Test all API endpoints (Postman/HTTPie).


todo : 📝 TODO (next steps)

 Test API endpoints via Postman/Thunder Client (/api/users/, /api/pages/, /api/sections/)

 Verify JWT login with admin@gmail.com / 1234

 Add more seed data (Admissions, Contact Us pages)

 Prepare 1–2 additional templates with different themes (Phase 4 kickoff)
---

## **Phase 3.5: Backend-Side Rendering Layer**

**Goal:** Ensure public-facing pages are rendered by the backend with Tailwind styling, solving SEO and crawler issues.

**Tasks:**

1. Configure **Django Template Engine (Jinja2/Django templates)** to render published pages.
2. Create a **PageRenderer service** in Django:

   * Fetch page + sections from DB.
   * Loop through sections and render as HTML.
3. Integrate **Tailwind CSS** into Django build pipeline (via `django-tailwind`, `Whitenoise`, or PostCSS build).
4. Store rendered HTML in cache for faster serving (e.g., Redis).
5. Expose public routes:

   * `/p/<slug>` → Rendered page (SSR).
   * `/admin/` → React frontend (Admin UI).
6. Ensure SEO tags (`<title>`, `<meta>`) and schema markup are injected server-side.


---

## **Phase 4: Template & Theme System**

**Goal:** Provide static design and consistent styling for pages.

**Tasks:**

1. Create Template model structure with `theme` field.
2. Define JSON structure for default sections.
3. Implement frontend mapping of `theme_key` to Tailwind classes.
4. Create at least 2 sample templates with different themes for testing.

---

## **Phase 5: Section Rendering System**

**Goal:** Render dynamic content using JSON and shadcn/ui components.

**Tasks:**

1. Implement SectionRenderer in React.
2. Map section types (`heading`, `paragraph`, `table`, `button`, `image`) to components.
3. Apply template theme or `theme_key` overrides.
4. Test dynamic rendering with example pages and sections.

---

## **Phase 6: Page Creation & Editing UI**

**Goal:** Build frontend interface for creating and editing pages.

**Tasks:**

1. Fetch templates and display them for selection.
2. Add/edit/delete/reorder sections in the frontend.
3. Implement live preview of page rendering.
4. Connect frontend changes to backend APIs (create/update page & sections).
5. Handle validation and errors.

---

## **Phase 7: SEO & Accessibility**

**Goal:** Ensure pages are discoverable and usable.

**Tasks:**

1. Implement meta tags (title, description) from page metadata.
2. Ensure semantic HTML for headings, tables, lists, buttons.
3. Implement ARIA roles and keyboard navigation support.
4. Test responsiveness on mobile and desktop.
5. Optimize image rendering and lazy load where necessary.

---

## **Phase 8: Testing & QA**

**Goal:** Ensure system is stable, bug-free, and UX is smooth.

**Tasks:**

1. Write unit tests for backend models and serializers.
2. Write integration tests for API endpoints.
3. Test frontend rendering of sections with various templates.
4. Conduct cross-browser testing.
5. Fix bugs and refine UI/UX.

---

## **Phase 9: Deployment & Monitoring**

**Goal:** Publish CMS and ensure it runs smoothly.

**Tasks:**

1. Containerize backend with Docker.
2. Deploy backend + DB (AWS/GCP/Heroku).
3. Deploy frontend (Vercel/Netlify).
4. Setup CI/CD pipelines (GitHub Actions/GitLab CI).
5. Add basic monitoring (Sentry, logs) and error handling.

---

## **Phase 10: Optional Enhancements**

**Goal:** Future-proof the CMS for new features.

**Tasks:**

1. Media library (images/videos for sections).
2. Page versioning and rollback.
3. Section-level theme overrides.
4. Multi-language support.
5. Multi-user roles and permissions.
