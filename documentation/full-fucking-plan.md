# 1) High-level summary (goal)

Build a WYSIWYG, slide-like CMS for a university:

- Public site (SEO, fast) that reads content from CMS
- Admin app at `/admin` where admins create pages using a drag/drop canvas (blocks = slides)
- UX: extremely simple, big tap targets, clear language — usable by 64-year-old admins
- Editor experience = Google Slides: add/remove/resize/reorder blocks, inline edit, preview, save/publish, undo/redo, autosaves, version history

---

# 2) Tech stack (latest stable chosen for 2025 — use these exact versions)

Frontend

- React 19.2.0 (JSX; no TSX). ([React][1])
- Vite 7.x (fast dev, JSX friendly)
- Tailwind CSS v4.1.13 (utility-first styling). ([GitHub][2])
- Framer Motion 12.23.22 (animations). (npm release info) ([npm][3])

Backend & DB

- Node.js 24.x (LTS). ([endoflife.date][4])
- Express v5.1.0 (REST API). ([Express][5])
- MongoDB Server 8.0 (production DB). ([MongoDB][6])
- Mongoose 8.19.1 (ODM)

Infra / Tools

- Authentication: NextAuth (optional) or JWT for simplicity
- Storage: S3-compatible (DigitalOcean Spaces / AWS S3) for media
- CI/CD: GitHub Actions
- Hosting: Frontend on Vercel; Backend on Render / Railway (or AWS ECS)
- Monitoring: Sentry for errors, Plausible or Google Analytics for traffic
- DevOps: Docker + docker-compose for local dev

> NOTE: these are stable releases (as of Oct 2025). Use the exact versions in the package.json snippet below.

---

# 3) Project structure (root-level)

```
/unicms
  /apps
    /web         -> React public site (Vite + JSX)
    /admin       -> React admin app (Vite + JSX)
  /packages
    /ui          -> shared UI components (JSX)
    /hooks       -> shared hooks
    /utils       -> shared utilities
  /api
    /src
      /controllers
      /models
      /routes
      /middlewares
      server.js   -> Express entry
  /infra
    docker-compose.yml
    nginx.conf
  .github/workflows/ci.yml
  README.md
```

---

# 4) package.json (root templates) — install with exact versions

Example `admin`/`web` frontend dependencies (use `npm i`):

```json
{
  "dependencies": {
    "react": "19.2.0",
    "react-dom": "19.2.0",
    "vite": "^7.0.0",
    "tailwindcss": "4.1.13",
    "framer-motion": "12.23.22",
    "react-router-dom": "^6.17.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "eslint": "^9.60.0",
    "prettier": "^3.0.0",
    "husky": "^9.0.0",
    "lint-staged": "^13.0.0"
  }
}
```

Backend `api/package.json`:

```json
{
  "dependencies": {
    "express": "5.1.0",
    "mongoose": "8.19.1",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "multer": "^1.4.5",
    "cors": "^2.8.5",
    "helmet": "^8.0.0"
  }
}
```

(You can substitute NextAuth if you prefer session-based auth; for a simple start use JWT with Refresh Tokens.)

---

# 5) Database models (MongoDB documents)

**Page**

```js
{
  _id,
  title: String,
  slug: String,            // '/about', '/admissions'
  status: 'draft'|'published',
  meta: { title, description, ogImage },
  themeId,                // reference to theme
  contentBlocks: [
    {
      id,                 // block unique id
      type: 'hero'|'text'|'image'|'gallery'|'video'|'grid'|'cta'|'divider',
      props: {...},       // block-specific props (text, url, alignment, styles)
      position: number
    }
  ],
  createdBy: userId,
  createdAt,
  updatedAt,
  history: [{snapshot, userId, timestamp}]
}
```

**Theme**

```js
{
  _id,
  name,
  primaryColor,
  secondaryColor,
  accentColor,
  font: {family, weightSet},
  globalSpacing,
  buttonRadius,
  logoUrl,
  createdAt
}
```

**User**

```js
{
  _id,
  name,
  email,
  passwordHash,
  role: 'admin'|'editor'|'viewer',
  lastLoginAt,
  createdAt
}
```

**Media**

```js
{
  _id,
    filename,
    url, // S3 URL
    mimeType,
    width,
    height,
    uploadedBy,
    uploadedAt;
}
```

---

# 6) API contract (main endpoints) — REST style

Auth

- `POST /api/auth/login` — body: `{email, password}` → returns `{accessToken, refreshToken, user}`
- `POST /api/auth/refresh` — refresh token → new access token

Pages

- `GET /api/pages` → list (filters: status, slug, q)
- `GET /api/pages/:slug` → public page JSON for renderer
- `POST /api/pages` → create page (admin only)
- `PUT /api/pages/:id` → update
- `DELETE /api/pages/:id` → delete
- `POST /api/pages/:id/publish` → publish

Media

- `POST /api/media/upload` — `multipart/form-data` upload -> returns URL
- `GET /api/media` — list

Themes

- `GET /api/themes`
- `POST /api/themes`
- `PUT /api/themes/:id/apply` — apply global theme

Users

- `GET /api/users`
- `POST /api/users` — create admin/editor

Extras

- `GET /api/stats/site-views` — basic analytics (or proxy to real analytics)

---

# 7) Component and page list (all JSX; minimal, accessible, elder-friendly)

**Shared UI**

- `ui/Button.jsx` — large, icon + label, `size="lg"` default
- `ui/Card.jsx`
- `ui/Modal.jsx`
- `ui/Input.jsx` — big inputs
- `ui/Sidebar.jsx`
- `ui/Toolbar.jsx` — top-right save/publish buttons

**Admin pages (JSX files)**

`/apps/admin/src/pages/Login.jsx` — login form

```jsx
export default function Login() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <form className="w-full max-w-md bg-white rounded-2xl p-8 shadow">
        <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
        <label className="block mb-2">Email</label>
        <input className="input" type="email" />
        <label className="block mt-4 mb-2">Password</label>
        <input className="input" type="password" />
        <button className="btn btn-primary mt-6 w-full">Sign in</button>
      </form>
    </main>
  );
}
```

`/apps/admin/src/pages/Dashboard.jsx` — overview; we gave an earlier example.

`/apps/admin/src/pages/Pages.jsx` — pages list (earlier example; add search, tags)

`/apps/admin/src/pages/PageBuilder.jsx` — full visual editor (skeleton)

```jsx
import Block from "../components/Block";
export default function PageBuilder({ pageId }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-72 p-4 border-r bg-white">
        <h3 className="font-bold">Blocks</h3>
        {/* draggable block buttons */}
      </aside>

      <main className="flex-1 p-6 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Editing: Home</h2>
          <div className="space-x-2">
            <button className="btn">Preview</button>
            <button className="btn btn-primary">Save</button>
            <button className="btn btn-success">Publish</button>
          </div>
        </div>

        <div className="mx-auto max-w-4xl bg-white rounded-2xl p-6 shadow">
          {/* Canvas: droppable area */}
          <div id="canvas">
            {/* render contentBlocks */}
            <Block type="hero" />
            <Block type="text" />
          </div>
        </div>
      </main>

      <aside className="w-72 p-4 border-l bg-white">
        <h3 className="font-bold">Block settings</h3>
        {/* settings for selected block */}
      </aside>
    </div>
  );
}
```

`/apps/admin/src/pages/ThemeEditor.jsx` — theme controls (color pickers + font selector + preview)

`/apps/admin/src/pages/Users.jsx` — user list + add user modal

`/apps/admin/src/pages/MediaLibrary.jsx` — uploads + thumbnails + search

**Public site pages (JSX)** — all rendered via one dynamic `PageRenderer.jsx` which takes the `contentBlocks` JSON and maps block types to components.

`/apps/web/src/pages/PageRenderer.jsx` (very important — engine that converts blocks -> DOM)

```jsx
import HeroBlock from "../blocks/HeroBlock";
import TextBlock from "../blocks/TextBlock";
import ImageBlock from "../blocks/ImageBlock";

const BLOCK_MAP = {
  hero: HeroBlock,
  text: TextBlock,
  image: ImageBlock,
};

export default function PageRenderer({ page }) {
  return (
    <div>
      {page.contentBlocks.map((block) => {
        const Comp = BLOCK_MAP[block.type] || (() => null);
        return <Comp key={block.id} {...block.props} />;
      })}
    </div>
  );
}
```

**Block examples (JSX snippets)**

`/apps/web/src/blocks/TextBlock.jsx`

```jsx
export default function TextBlock({ heading, body, alignment = "left" }) {
  return (
    <section className="py-8">
      {heading && <h2 className="text-2xl font-semibold">{heading}</h2>}
      <div className="mt-3 text-lg">{body}</div>
    </section>
  );
}
```

`/apps/web/src/blocks/HeroBlock.jsx`

```jsx
export default function HeroBlock({ title, subtitle, backgroundUrl }) {
  return (
    <header
      className="relative py-20 rounded-2xl"
      style={{ backgroundImage: `url(${backgroundUrl})` }}
    >
      <div className="max-w-4xl mx-auto text-center text-white">
        <h1 className="text-4xl font-bold">{title}</h1>
        <p className="mt-3">{subtitle}</p>
      </div>
    </header>
  );
}
```

All block props should be small JSON objects (no functions) so the page JSON is serializable.

---

# 8) Visual editor UX details (how it behaves)

Editor canvas must support:

- Drag blocks from left library → drop onto canvas
- Blocks have small header (grab-handle, duplicate, delete)
- Click a block to open right-side settings (text editor, color, spacing)
- Inline text editing: double-click a text block to edit inline content (content editable)
- Undo/Redo stack (persisted for session; server-side history on save)
- Autosave every 10s & on change (local & server)
- Live preview toggle (desktop / tablet / mobile)
- Accessibility: keyboard navigation, focus outlines, readable tooltips
- Confirm modals for destructive actions (delete page, publish)
- Big primary CTA (Save/Publish) on top-right, always visible

---

# 9) UI/Design system (tailwind + design tokens)

Centralized tokens (in `packages/ui/tokens.js`):

```js
export const tokens = {
  colors: { primary: "#2563eb", accent: "#facc15", bg: "#f9fafb" },
  radii: { sm: "8px", lg: "16px" },
  font: { base: "Inter, system-ui, -apple-system" },
  spacing: { base: 16 },
};
```

Tailwind config loads tokens and exposes CSS variables for theme switching. Use Tailwind JIT for dynamic classes.

---

# 10) Accessibility checklist

- All interactive elements keyboard-focusable
- Input sizes >= 44px touch target
- High contrast (WCAG AA)
- ARIA labels on complex controls
- Skip link to jump to main content
- Alt text required before publishing images
- Screen reader announcements on save/publish

---

# 11) Security & auth

- Use HTTPS everywhere
- Store only hashed passwords (bcrypt)
- Use JWT with short expiry + refresh tokens stored in HTTP-only cookies OR NextAuth sessions
- Rate-limit login endpoint
- Helmet middleware for security headers
- Validate/sanitize block props on server (no raw HTML)
- Signed URLs for media upload or use server-side upload proxy
- Role-based authorization for page actions (Admin, Editor, Viewer)

---

# 12) Performance & SEO

- Public site pre-renders known pages (SSG-like) where possible (Vercel) or use server-side caching on GET /pages/:slug
- Images: lazy-load, responsive srcset, auto-compress on upload
- Generate sitemap.xml on publish
- Meta tags (title, description, og:image) from page.meta
- Use CDN for static assets (Vercel / Cloudflare)

---

# 13) Testing & QA

- Unit tests: Jest + React Testing Library for components
- E2E tests: Playwright (simulate admin flows: create page, add block, publish, view)
- Linting: ESLint + Prettier + Husky pre-commit
- Accessibility tests: axe-core in CI

---

# 14) CI/CD (GitHub Actions) – minimal pipeline

- `push` to `main` triggers:

  - install dependencies
  - run `npm run lint` and `npm test`
  - build admin & web bundles
  - on success, deploy admin & web to Vercel via Vercel CLI or Deploy previews

- Backend deploy to Render on merge to main (or use Render GitHub integration)

---

# 15) Monitoring & observability

- Sentry for error tracking (frontend + backend)
- Basic server metrics: CPU, memory (Render/AWS)
- Uptime checks (UptimeRobot)
- Basic analytics: Plausible for privacy or GA4 for deep analytics

---

# 16) Dev workflow (day-to-day)

- Branch: `feature/<name>` -> PR -> review -> merge
- PR checklist: lint pass, tests pass, accessibility checks, screenshots
- Use Figma/Sketch mockups only for branding + key screens — keep implementation in JSX components, not raw Figma copy
- Local dev: `docker-compose` spins API + MongoDB, frontends run with Vite

# 17) Example: Full edit flow (detailed)

1. Admin logs into `/admin` (JWT token set as httpOnly cookie).
2. Click “New Page” → picks template or blank.
3. Canvas opens. Left: block library. Right: settings.
4. Admin drags a Hero block into top of canvas.
5. Click Hero → inline edit title, upload hero image (drop zone uploads to S3, returns URL).
6. Admin clicks Save → frontend calls `PUT /api/pages/:id` with full `contentBlocks` payload.
7. Save confirmation toaster appears and autosave snapshot is created server-side for rollback.
8. Click Publish → `POST /api/pages/:id/publish` → server sets `status=published`, triggers sitemap update, CDN purge.
9. Public site immediately shows new page (or after short cache TTL).

---

# 18) Example JSON page (what the editor stores)

```json
{
  "title": "Home",
  "slug": "/",
  "status": "published",
  "meta": { "title": "University - Home", "description": "Welcome" },
  "contentBlocks": [
    {
      "id": "b1",
      "type": "hero",
      "props": {
        "title": "Welcome",
        "subtitle": "Apply now",
        "backgroundUrl": "https://cdn.../hero.jpg"
      },
      "position": 0
    },
    {
      "id": "b2",
      "type": "text",
      "props": { "heading": "About us", "body": "Our university..." },
      "position": 1
    }
  ]
}
```

---

# 19) Developer checklist / commands (quick start)

Local

```bash
# backend
cd api
npm install
npm run dev  # nodemon server.js

# admin
cd apps/admin
npm install
npm run dev  # Vite dev server

# web
cd apps/web
npm install
npm run dev
```

Deploy

- Frontend: connect Vercel to repo, set env vars (API_BASE, S3 creds)
- Backend: Render/Heroku/Render; set MONGO_URI, JWT_SECRET, S3 creds

---

# 20) Documentation & handover (for the AI to base on)

Create a living `docs/` directory in repo with:

- `docs/architecture.md` — diagram & tech choices
- `docs/api.md` — full API contract with examples (curl)
- `docs/editor.md` — block model & how to add a new block type
- `docs/deploy.md` — environment variables, secrets, deploy steps
- `docs/accessibility.md` — checklist & examples
- `docs/ux-guidelines.md` — fonts, spacing, color usage
- `docs/maintenance.md` — backup schedule, DB maintenance

This set is everything an AI (or dev) would need to create, improve, and maintain the system.

---
