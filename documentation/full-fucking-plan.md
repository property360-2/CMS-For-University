# UniCMS — Complete Implementation Spec (AI/dev-ready)

---

> Table of contents
>
> 1. Goals & constraints
> 2. Architecture & monorepo layout
> 3. Data model (complete JSON schemas)
> 4. API contract (endpoints + examples)
> 5. Backend skeleton (server.js, models, controllers, routes)
> 6. Auth & security patterns
> 7. Storage & media handling (S3 + local dev)
> 8. Frontend architecture (Vite + React; workspace)
> 9. Vite/Tailwind/ESLint configs and package.json workspaces
> 10. Shared UI components (JSX)
> 11. Admin pages (full JSX for each page)
> 12. Public site pages & block components (full JSX)
> 13. Visual editor: UX details, drag/drop, inline edit, undo/redo, autosave, versioning
> 14. Serialization: how pages are stored & migrated
> 15. Testing strategy (unit, integration, e2e)
> 16. Accessibility checklist & guidelines
> 17. CI/CD, Docker, infra config, deployment & monitoring
> 18. Roadmap & sprint plan (phases)
> 19. Developer onboarding & docs to include in repo

---

# 1 — Goals & constraints

* A slide-like CMS for the university: admins create pages visually like Google Slides — drag, drop blocks, inline edit, reorder, resize.
* Public website reads content from CMS; SEO friendly, fast.
* Editor usable by non-technical staff (64-year-old admins): big UI, clear labels, autosave, confirmations.
* Everything in **JSX** (React) — no TypeScript required.
* Modular: add new block types quickly.
* CI/CD, Docker-based local dev, S3-compatible storage for media uploads.
* Persistent version history and basic conflict handling.

---

# 2 — Architecture & monorepo layout

```
/unicms
  /apps
    /web             # Public site (Vite + React, PageRenderer)
    /admin           # Admin CMS (Vite + React, PageBuilder)
  /api
    /src
      /controllers
      /models
      /routes
      /middlewares
      server.js
      config.js
  /packages
    /ui              # shared components (Button, Modal, Input, Card, Toolbar)
    /hooks           # shared hooks (useDebounced, useAutosave)
    /utils           # helpers (slugify, validators)
  /infra
    docker-compose.yml
    nginx.conf
    Dockerfile.api
    Dockerfile.web
  /docs
    architecture.md
    api.md
    editor.md
    deploy.md
  .github/workflows/ci.yml
  package.json       # root workspace config
  README.md
  .env.example
```

---

# 3 — Data model (complete JSON schemas)

All pages are JSON documents. Each block is serializable.

## Page document

```json
{
  "_id": "ObjectId",
  "title": "Home",
  "slug": "/",
  "status": "draft|published|archived",
  "meta": {
    "title": "string",
    "description": "string",
    "ogImage": "string"
  },
  "themeId": "ObjectId",
  "contentBlocks": [
    {
      "id": "uuid",
      "type": "hero|text|image|gallery|video|grid|cta|divider|courses|news",
      "props": { /* block-specific props object */ },
      "position": 0,
      "style": { /* optional per-block style overrides */ }
    }
  ],
  "createdBy": "userId",
  "updatedBy": "userId",
  "createdAt": "ISODate",
  "updatedAt": "ISODate",
  "version": 1,             // increment on edit/publish
  "history": [
    {
      "version": 1,
      "snapshot": { /* full page snapshot */ },
      "userId": "userId",
      "timestamp": "ISODate",
      "message": "Autosave or commit message"
    }
  ]
}
```

## User

```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string",
  "passwordHash": "string",
  "role": "admin|editor|viewer",
  "createdAt": "ISODate",
  "lastLoginAt": "ISODate"
}
```

## Theme

```json
{
  "_id": "ObjectId",
  "name": "string",
  "tokens": {
    "primaryColor":"#HEX",
    "accentColor":"#HEX",
    "background":"#HEX",
    "fontFamily":"Inter, system-ui",
    "headingScale": [32,24,20,16]
  },
  "createdAt":"ISODate"
}
```

## Media

```json
{
  "_id":"ObjectId",
  "filename":"hero.jpg",
  "url":"https://cdn...",
  "mimeType":"image/jpeg",
  "width":1920,
  "height":600,
  "uploadedBy":"userId",
  "createdAt":"ISODate"
}
```

---

# 4 — API contract (REST) — full endpoints & examples

**Auth**

* `POST /api/auth/login`
  Body: `{ email, password }`
  Response: `{ user, accessToken, refreshToken }`

* `POST /api/auth/refresh`
  Body: `{ refreshToken }` → returns new accessToken

* `POST /api/auth/logout`
  Body: `{ refreshToken }` → revoke refresh token

**Pages**

* `GET /api/pages`
  Query: `?status=published&limit=20&page=1&q=admissions`
  Response: list with pagination.

* `GET /api/pages/:slug`
  Public page JSON used by PageRenderer.

* `POST /api/pages` (auth admin/editor)
  Body: full page JSON (without _id) → creates draft.

* `PUT /api/pages/:id` (auth)
  Body: full page JSON → apply update; returns updated page + new version.

* `POST /api/pages/:id/publish` (auth)
  Publishes page: sets `status=published`, increments `version`, updates sitemap.

* `DELETE /api/pages/:id` (auth)
  Soft-delete (set status archived) or hard delete depending on admin role.

**Media**

* `POST /api/media/upload`
  multipart/form-data: file, optional metadata. Returns media object with URL.

* `GET /api/media`
  filter & pagination.

**Themes**

* `GET /api/themes`
* `POST /api/themes` (auth)
* `PUT /api/themes/:id` (auth)
* `POST /api/themes/:id/apply` — set as site default

**Users**

* `GET /api/users` (admin)
* `POST /api/users` (admin) — create user
* `PUT /api/users/:id` — update role, name

**Admin utilities**

* `GET /api/stats` — visitors (proxy to analytics)
* `POST /api/pages/:id/rollback` — body `{ version }` → rollback to snapshot

**Examples**

`GET /api/pages/home` → returns:

```json
{
  "title":"Home",
  "slug":"/",
  "contentBlocks":[{ "id":"b1", "type":"hero","props":{...},"position":0 }]
}
```

---

# 5 — Backend skeleton (ESM, Node 22+): key files

### `api/src/config.js`

```js
import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 5000;
export const MONGO_URI = process.env.MONGO_URI;
export const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
export const S3_ENDPOINT = process.env.S3_ENDPOINT;
export const S3_KEY = process.env.S3_KEY;
export const S3_SECRET = process.env.S3_SECRET;
export const S3_BUCKET = process.env.S3_BUCKET;
```

### `api/src/server.js`

```js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import { MONGO_URI, PORT } from "./config.js";
import pageRoutes from "./routes/pageRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import mediaRoutes from "./routes/mediaRoutes.js";

const app = express();
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use(morgan("dev"));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/pages", pageRoutes);
app.use("/api/media", mediaRoutes);

// error middleware placeholder
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "server error" });
});

mongoose.connect(MONGO_URI)
  .then(() => console.log("Mongo connected"))
  .catch(console.error);

app.listen(PORT, () => console.log(`API listening ${PORT}`));
```

### `api/src/models/Page.js` (Mongoose)

```js
import mongoose from "mongoose";
const BlockSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  props: { type: mongoose.Schema.Types.Mixed, default: {} },
  position: { type: Number, default: 0 },
  style: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { _id: false });

const HistorySchema = new mongoose.Schema({
  version: Number, snapshot: mongoose.Schema.Types.Mixed, userId: String, timestamp: Date, message: String
}, { _id: false });

const PageSchema = new mongoose.Schema({
  title: String,
  slug: { type: String, index: true },
  status: { type: String, default: "draft" },
  meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  themeId: { type: mongoose.Schema.Types.ObjectId, ref: "Theme" },
  contentBlocks: [BlockSchema],
  createdBy: String,
  updatedBy: String,
  version: { type: Number, default: 1 },
  history: [HistorySchema]
}, { timestamps: true });

export default mongoose.model("Page", PageSchema);
```

### `api/src/controllers/pageController.js`

```js
import Page from "../models/Page.js";

export async function listPages(req, res) {
  const { status, q, limit = 20, page = 1 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (q) filter.title = { $regex: q, $options: "i" };
  const pages = await Page.find(filter).limit(Number(limit)).skip((page - 1) * limit).sort({ updatedAt: -1 });
  res.json({ data: pages });
}

export async function getPageBySlug(req, res) {
  const { slug } = req.params;
  const page = await Page.findOne({ slug, status: "published" });
  if (!page) return res.status(404).json({ error: "Not found" });
  res.json(page);
}

export async function createPage(req, res) {
  const payload = req.body;
  payload.createdBy = req.user?.id;
  const p = await Page.create(payload);
  res.json(p);
}

export async function updatePage(req, res) {
  const { id } = req.params;
  const payload = req.body;
  const page = await Page.findById(id);
  if (!page) return res.status(404).json({ error: "Not found" });
  // push to history (snapshot)
  page.history.push({ version: page.version, snapshot: page.toObject(), userId: req.user?.id, timestamp: new Date(), message: payload.message || "edit" });
  // apply update
  Object.assign(page, payload);
  page.version = (page.version || 1) + 1;
  await page.save();
  res.json(page);
}

export async function publishPage(req, res) {
  const { id } = req.params;
  const page = await Page.findById(id);
  if (!page) return res.status(404).json({ error: "Not found" });
  page.status = "published";
  page.version = (page.version || 1) + 1;
  page.history.push({ version: page.version, snapshot: page.toObject(), userId: req.user?.id, timestamp: new Date(), message: "publish" });
  await page.save();
  // TODO: update sitemap, CDN purge
  res.json({ success: true, page });
}
```

### `api/src/routes/pageRoutes.js`

```js
import express from "express";
import { listPages, getPageBySlug, createPage, updatePage, publishPage } from "../controllers/pageController.js";
import { authMiddleware, requireRole } from "../middlewares/auth.js";

const router = express.Router();
router.get("/", listPages);
router.get("/:slug", getPageBySlug);
router.post("/", authMiddleware, requireRole(["admin","editor"]), createPage);
router.put("/:id", authMiddleware, requireRole(["admin","editor"]), updatePage);
router.post("/:id/publish", authMiddleware, requireRole(["admin"]), publishPage);
export default router;
```

(Other controllers/routes similar pattern: authRoutes, mediaRoutes, userRoutes.)

---

# 6 — Auth & security

* Use **JWT** with accessToken short-lived (e.g., 15m) + refreshToken (httpOnly cookie) or NextAuth if you want sessions.
* Passwords hashed with `bcrypt` (`bcryptjs` for Node).
* Rate limit login endpoint with `express-rate-limit`.
* Use `helmet` to set security headers.
* Validate incoming block props on server — never store raw HTML or run it unsafely.
* Media upload via signed S3 URLs or server proxy to avoid direct credentials in client.
* Use role-based middleware `requireRole(['admin', 'editor'])`.

Example `api/src/middlewares/auth.js` (skeleton):

```js
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";

export function authMiddleware(req, res, next) {
  const auth = req.headers.authorization?.split(" ");
  if (!auth || auth[0] !== "Bearer") return res.status(401).json({ error: "Unauthorized" });
  try {
    const token = auth[1];
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function requireRole(roles = []) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: "Forbidden" });
    next();
  };
}
```

---

# 7 — Storage & media handling

Two modes: local dev and S3 production.

* Local dev: store uploads in `/api/uploads`, serve static via Express `app.use('/uploads', express.static('./uploads'))`.
* Production: upload to S3-compatible bucket (AWS S3, DigitalOcean Spaces, etc.) with proper ACL, private by default; return public URL or signed URL for private content.

Media upload flow:

1. Client uploads file to `/api/media/upload` (multipart).
2. Server validates MIME, resizes/compresses large images (sharp), uploads to S3 (or saves locally).
3. Server returns `{ id, url, width, height, mimeType }`.
4. Editor stores `url` inside block `props`.

Security:

* Limit file size.
* Validate image types only for image blocks.
* On upload, strip EXIF for privacy.

---

# 8 — Frontend architecture (Vite + React)

Monorepo using npm/yarn/pnpm workspaces. Two Vite apps: `apps/web` and `apps/admin`. Shared components live in `packages/ui`.

Each frontend app:

* `src/main.jsx` or `src/main.js`
* `src/App.jsx`
* `src/routes/*`
* `src/pages/*`
* `src/components/*`
* `src/blocks/*` (for admin & public)

State:

* Use **Zustand** for local editor state (small, simple) or Redux Toolkit if you prefer structured store.
* Keep editor state local in admin; persist to server via API.

Routing:

* React Router for client routes.

Networking:

* Axios wrapper with auth interceptor for access tokens.

---

# 9 — Vite & Tailwind config + package.json (workspaces)

### Root `package.json` (workspaces)

```json
{
  "name": "unicms",
  "private": true,
  "workspaces": ["apps/*","packages/*"],
  "scripts": {
    "dev:web": "pnpm --filter apps/web dev",
    "dev:admin": "pnpm --filter apps/admin dev",
    "dev": "concurrently \"pnpm dev:web\" \"pnpm dev:admin\"",
    "build:web": "pnpm --filter apps/web build",
    "build:admin": "pnpm --filter apps/admin build",
    "start:api": "node api/src/server.js"
  },
  "devDependencies": {
    "concurrently":"^8.0.0",
    "pnpm":"^8.0.0"
  }
}
```

> You can substitute npm/yarn; I recommend `pnpm` for monorepo speed.

### Example `apps/admin/package.json`

```json
{
  "name":"admin",
  "private":true,
  "version":"0.0.1",
  "scripts":{
    "dev":"vite",
    "build":"vite build",
    "preview":"vite preview"
  },
  "dependencies":{
    "react":"latest",
    "react-dom":"latest",
    "react-router-dom":"latest",
    "axios":"latest",
    "tailwindcss":"latest",
    "framer-motion":"latest",
    "zustand":"latest",
    "lucide-react":"latest",
    "shadcn/ui":"latest"
  }
}
```

### `vite.config.js` (apps/admin)

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 5174 },
  resolve: {
    alias: { "@": "/src" }
  }
});
```

### `tailwind.config.cjs`

```js
module.exports = {
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
        accent: "#facc15"
      }
    }
  },
  plugins: []
};
```

---

# 10 — Shared UI components (JSX)

Place in `packages/ui/src` and export via package.

### `packages/ui/src/Button.jsx`

```jsx
import React from "react";

export default function Button({ children, onClick, className="", icon=null, size="md", ...props }) {
  const base = "inline-flex items-center justify-center rounded-2xl font-medium shadow-sm";
  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-5 py-3 text-lg"
  };
  return (
    <button onClick={onClick} className={`${base} ${sizes[size]} ${className}`} {...props}>
      {icon && <span className="mr-2">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
```

### `packages/ui/src/Input.jsx`

```jsx
export default function Input({ label, ...props }) {
  return (
    <label className="block">
      <div className="text-sm font-medium mb-1">{label}</div>
      <input className="w-full rounded-xl border px-3 py-2" {...props} />
    </label>
  );
}
```

### `packages/ui/src/Modal.jsx`

```jsx
export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-600">Close</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
```

(Other components: Card, Toolbar, Sidebar, IconButton.)

---

# 11 — Admin pages (JSX) — full files (paste-ready)

All pages are React function components (JSX). Put them in `apps/admin/src/pages/`.

### `Login.jsx`

```jsx
import React, { useState } from "react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function submit(e){
    e.preventDefault();
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      // store token - use secure cookie or localStorage depending on chosen auth
      localStorage.setItem("accessToken", res.data.accessToken);
      window.location.href = "/admin/dashboard";
    } catch (e) {
      setErr(e.response?.data?.error || "Login failed");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={submit} className="w-full max-w-md bg-white rounded-2xl p-8 shadow">
        <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
        {err && <div className="text-red-600 mb-3">{err}</div>}
        <Input label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <div className="mt-4"><Input label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
        <Button className="mt-6 w-full" size="lg">Sign in</Button>
      </form>
    </main>
  );
}
```

### `Dashboard.jsx`

(see earlier example — add widgets for pages, last edits, quick actions)

### `Pages.jsx`

```jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Button from "@/components/Button";

export default function Pages() {
  const [pages, setPages] = useState([]);
  async function load(){
    const res = await axios.get("/api/pages?limit=100");
    setPages(res.data.data || []);
  }
  useEffect(()=>{ load(); }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Pages</h1>
        <Button onClick={()=>window.location.href="/admin/page/new"}>+ New Page</Button>
      </div>
      <div className="grid gap-4">
        {pages.map(page=>(
          <div key={page._id} className="bg-white p-4 rounded-2xl shadow flex justify-between items-center">
            <div>
              <div className="font-semibold">{page.title}</div>
              <div className="text-sm text-gray-500">{page.slug} • {page.status}</div>
            </div>
            <div>
              <Button onClick={()=>window.location.href=`/admin/page/${page._id}`}>Edit</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### `PageBuilder.jsx` — the heavy hitter (Google Slides behavior)

This is the core editor. Below is a single-file simplified JSX that demonstrates UI and the client-side structures. In real build, break into components.

```jsx
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import Button from "@/components/Button";
import Sidebar from "@/components/Sidebar";
import BlockSettings from "@/components/BlockSettings";
import { Draggable, Droppable } from "@/lib/dragdrop"; // assume simple drag lib or react-beautiful-dnd

export default function PageBuilder({ pageId }) {
  const [page, setPage] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const autosaveRef = useRef(null);
  const undoStackRef = useRef([]);
  const redoStackRef = useRef([]);

  useEffect(()=> {
    async function load() {
      if (pageId === "new") {
        const p = { title: "Untitled", slug: "", contentBlocks: [] };
        setPage(p);
        setBlocks([]);
      } else {
        const res = await axios.get(`/api/pages/${pageId}`);
        setPage(res.data);
        setBlocks(res.data.contentBlocks || []);
      }
    }
    load();
  }, [pageId]);

  // add block
  function addBlock(type) {
    const b = { id: uuidv4(), type, props: getDefaultProps(type), position: blocks.length };
    pushUndo();
    setBlocks(prev => [...prev, b]);
    setSelectedBlockId(b.id);
    scheduleAutosave();
  }

  // remove block
  function removeBlock(blockId) {
    pushUndo();
    setBlocks(prev => prev.filter(b => b.id !== blockId).map((b,i)=>({...b, position:i})));
    scheduleAutosave();
  }

  // reorder blocks (from drag drop)
  function reorderBlocks(newBlocks) {
    pushUndo();
    setBlocks(newBlocks.map((b,i)=>({...b, position:i})));
    scheduleAutosave();
  }

  // update block props
  function updateBlock(blockId, deltaProps) {
    pushUndo();
    setBlocks(prev => prev.map(b => b.id === blockId ? {...b, props: {...b.props, ...deltaProps}} : b));
    scheduleAutosave();
  }

  // Undo/redo stacks (client-side)
  function pushUndo() {
    undoStackRef.current.push(JSON.stringify(blocks));
    if (undoStackRef.current.length > 50) undoStackRef.current.shift(); // keep size limit
    redoStackRef.current = [];
  }
  function undo() {
    const s = undoStackRef.current.pop();
    if (!s) return;
    redoStackRef.current.push(JSON.stringify(blocks));
    setBlocks(JSON.parse(s));
  }
  function redo() {
    const s = redoStackRef.current.pop();
    if (!s) return;
    undoStackRef.current.push(JSON.stringify(blocks));
    setBlocks(JSON.parse(s));
  }

  // autosave (debounced)
  function scheduleAutosave() {
    if (autosaveRef.current) clearTimeout(autosaveRef.current);
    autosaveRef.current = setTimeout(() => saveDraft(), 3000);
  }

  async function saveDraft() {
    if (!page) return;
    setIsSaving(true);
    const payload = { ...page, contentBlocks: blocks };
    if (pageId === "new") {
      const res = await axios.post("/api/pages", payload);
      // redirect to edit with id
      window.location.href = `/admin/page/${res.data._id}`;
    } else {
      await axios.put(`/api/pages/${page._id}`, payload);
    }
    setIsSaving(false);
  }

  async function publish() {
    // call publish endpoint
    await saveDraft();
    await axios.post(`/api/pages/${page._id}/publish`);
    alert("Published!");
  }

  if (!page) return <div>Loading...</div>;
  return (
    <div className="flex h-screen">
      <Sidebar onAddBlock={addBlock} />
      <div className="flex-1 p-6 overflow-auto bg-gray-50">
        <header className="flex justify-between items-center mb-4">
          <div>
            <input className="text-2xl font-semibold bg-transparent border-none focus:ring-0" value={page.title} onChange={e=>setPage({...page, title:e.target.value})} />
            <div className="text-sm text-gray-500">{page.slug || "(no slug)"}</div>
          </div>
          <div className="space-x-2">
            <Button onClick={undo}>Undo</Button>
            <Button onClick={redo}>Redo</Button>
            <Button onClick={saveDraft}>{isSaving ? "Saving..." : "Save"}</Button>
            <Button onClick={publish} className="bg-green-600 text-white">Publish</Button>
          </div>
        </header>

        <div className="mx-auto max-w-5xl">
          {/* Canvas: use react-beautiful-dnd or similar - simplified here */}
          <div className="bg-white rounded-2xl p-6 shadow">
            {blocks.length === 0 && <div className="text-gray-400 py-20 text-center">Drop blocks here — add text, image, hero, gallery...</div>}
            {blocks.map((b, idx) => (
              <div key={b.id} className={`border rounded-lg p-4 mb-4 ${selectedBlockId === b.id ? "outline outline-2 outline-blue-300" : ""}`} onClick={()=>setSelectedBlockId(b.id)}>
                <div className="flex justify-between items-start">
                  <div className="font-medium">{b.type.toUpperCase()}</div>
                  <div className="space-x-2">
                    <button onClick={(e)=>{ e.stopPropagation(); removeBlock(b.id); }} className="text-sm text-red-500">Delete</button>
                    <button onClick={(e)=>{ e.stopPropagation(); pushUndo(); setBlocks(prev=>{ const a = [...prev]; if (idx>0){ [a[idx-1], a[idx]] = [a[idx], a[idx-1]]; return a;} return a; }); }} className="text-sm">↑</button>
                    <button onClick={(e)=>{ e.stopPropagation(); pushUndo(); setBlocks(prev=>{ const a = [...prev]; if (idx < prev.length-1){ [a[idx+1], a[idx]] = [a[idx], a[idx+1]]; return a;} return a; }); }} className="text-sm">↓</button>
                  </div>
                </div>
                <div className="mt-2">
                  {/* Render a lightweight preview of block (public blocks are components) */}
                  <div className="text-gray-700">{JSON.stringify(b.props).slice(0,100)}...</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <BlockSettings block={blocks.find(b=>b.id===selectedBlockId)} onChange={updateBlock} />
    </div>
  );
}

function getDefaultProps(type) {
  switch(type) {
    case "hero": return { title: "New hero", subtitle: "subtitle", backgroundUrl: "" };
    case "text": return { heading: "Heading", body: "Your text here" };
    case "image": return { url: "", alt: "" };
    default: return {};
  }
}
```

> Notes: Use a proper drag-and-drop lib (react-beautiful-dnd or dnd-kit) for production. The above demonstrates state shape and undo/redo.

### `ThemeEditor.jsx`, `Users.jsx`, `MediaLibrary.jsx`

* Implement similarly: ThemeEditor uses color pickers & font selector and applies tokens to a preview; MediaLibrary uploads files to /api/media/upload and provides URLs.

---

# 12 — Public site & block components (full JSX)

Public `PageRenderer.jsx` (apps/web/src/pages/PageRenderer.jsx):

```jsx
import React from "react";
import HeroBlock from "../blocks/HeroBlock";
import TextBlock from "../blocks/TextBlock";
import ImageBlock from "../blocks/ImageBlock";
import GalleryBlock from "../blocks/GalleryBlock";

const BLOCKS = { hero: HeroBlock, text: TextBlock, image: ImageBlock, gallery: GalleryBlock };

export default function PageRenderer({ page }) {
  return (
    <div>
      {page.contentBlocks.sort((a,b)=>a.position-b.position).map(b => {
        const Comp = BLOCKS[b.type] || (() => null);
        return <Comp key={b.id} {...b.props} />;
      })}
    </div>
  );
}
```

### Example block components

`HeroBlock.jsx`

```jsx
export default function HeroBlock({ title, subtitle, backgroundUrl }) {
  return (
    <section className="py-24 bg-cover bg-center rounded-2xl" style={{ backgroundImage: `url(${backgroundUrl})` }}>
      <div className="max-w-4xl mx-auto text-center text-white px-6">
        <h1 className="text-4xl font-bold">{title}</h1>
        <p className="mt-3 text-lg">{subtitle}</p>
      </div>
    </section>
  );
}
```

`TextBlock.jsx`

```jsx
export default function TextBlock({ heading, body }) {
  return (
    <section className="py-8">
      {heading && <h2 className="text-2xl font-semibold">{heading}</h2>}
      <div className="mt-3 text-lg" dangerouslySetInnerHTML={{ __html: body }} />
    </section>
  );
}
```

`ImageBlock.jsx`

```jsx
export default function ImageBlock({ url, alt, caption }) {
  return (
    <figure className="py-6">
      <img src={url} alt={alt} className="w-full rounded-xl" />
      {caption && <figcaption className="text-sm text-gray-500 mt-2">{caption}</figcaption>}
    </figure>
  );
}
```

`GalleryBlock.jsx` — grid of images with lightbox behavior.

---

# 13 — Visual editor behaviors (detailed, Google Slides style)

This section must be followed precisely by implementers.

## Canvas / layout

* Canvas width represents a max content width (e.g., 1200px) centered in a page preview inside admin.
* Blocks are stacked vertically. Future enhancement: absolute positioning for overlapping blocks, but start with stacked approach.

## Block library (left)

* Categorized groups: Hero, Content, Media, Layout, Advanced.
* Click or drag to canvas. Drag shows ghost preview.

## Block header controls

* Grab-handle for drag.
* Duplicate
* Delete (confirmation)
* Move up / move down quick buttons
* Lock (prevents editing)

## Inline editing

* For text blocks, support `contentEditable` for quick write.
* For other block types, use right-side settings: inputs, image uploader, color pickers.

## Undo / Redo

* Client-side stacks (undoStack & redoStack) for immediate UX.
* Save snapshots to server history every N operations or on save/publish.
* Keep up to `N=50` undo states client-side.

## Autosave

* Debounced saves: 3s after last change.
* Save drafts: `PUT /api/pages/:id` stores page state and appends to history as "autosave".
* Visual indicator: "Saved" / "Saving..." toast.

## Versioning & history

* Server stores `history` array for each page.
* Each publish increments `version`.
* Rollback endpoint: `POST /api/pages/:id/rollback { version }`.

## Conflict resolution (multi-admin)

* Each page has `version` (server). Client tracks page version on load.
* On save, include `clientVersion`. Server checks if `clientVersion === currentVersion`. If mismatch:

  * Server returns `409 Conflict` with `latestSnapshot`.
  * Client shows merge UI: show diff (visual) with options:

    * Overwrite (force save)
    * Merge (manual)
    * Cancel and reload latest.
* For better collaboration, implement optimistic locks: when an admin opens page, server can set `editingBy` with timestamp; show “Currently editing by X” indicator, and optionally allow override.

## Accessibility in editor

* Provide keyboard shortcuts: Cmd/Ctrl+S (save), Cmd/Ctrl+Z (undo), Cmd/Ctrl+Y (redo).
* All buttons focusable, aria labels supplied.
* Tooltips for icons.

---

# 14 — Serialization & migration strategy

* Pages stored as JSON in Mongo. Keep block schema versioning: each block can have `blockVersion`.
* Migration script pattern: `scripts/migrations/<timestamp>-migration.js` — load pages, transform `contentBlocks` if block schema changed, write back.
* For backward compatibility, PageRenderer should check for legacy props and adapt.

---

# 15 — Testing strategy

* Unit tests: Jest + React Testing Library for components (packages/ui, blocks).
* Backend unit: Jest + Supertest for controllers routes (api).
* E2E tests: Playwright to simulate admin flows: login → create page → add blocks → publish → view on public site.
* Accessibility tests: axe-core integrated to CI run.
* CI step: run lint, tests, build, then deploy.

Example Playwright test: create page, add text block, save, publish, visit slug, assert content exists.

---

# 16 — Accessibility & UX checklist (must be enforced)

* All interactive controls keyboard accessible.
* Buttons minimum size: 44x44 px.
* Focus visible and logical order.
* Contrast ratio >= 4.5:1 for body text.
* Aria labels for icon-only buttons.
* Alt text required for images before publish.
* Skip link to jump to main content on public site.
* Provide language attribute on HTML `<html lang="en">`.
* Use `prefers-reduced-motion` to reduce animations.

---

# 17 — CI/CD, Docker, infra, deployment & monitoring

### Docker

`infra/Dockerfile.api`

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=prod
COPY . .
CMD ["node","src/server.js"]
```

`infra/docker-compose.yml`

```yaml
version: "3.9"
services:
  api:
    build: ./api
    environment:
      - MONGO_URI=mongodb://mongo:27017/unicms
      - JWT_SECRET=${JWT_SECRET}
    ports:
      - "5000:5000"
    depends_on:
      - mongo

  mongo:
    image: mongo:7
    volumes:
      - mongo_data:/data/db

  web:
    build: ./apps/web
    ports:
      - "5173:5173"

volumes:
  mongo_data:
```

### Nginx

`infra/nginx.conf`: reverse proxy `/admin` and `/` to appropriate frontends; cache static assets; set headers.

### GitHub Actions (`.github/workflows/ci.yml`)

* On push: checkout, setup node, install pnpm, install workspaces, run lint, run tests, build apps, upload build artifacts, (optional) deploy to staging via `vercel` or Render.

### Monitoring

* Use Sentry for error tracking (both frontend & backend).
* Use Prometheus/Datadog for server metrics (if infra supports).
* Use a simple privacy-friendly analytics (Plausible) for public site.

# 19 — Developer onboarding & docs to include in repo

Create `docs/`:

* `architecture.md` — diagrams & flows
* `api.md` — full endpoint list with example requests/responses
* `editor.md` — block model, how to add a block type
* `deploy.md` — environment variables, deploy steps to Vercel/Render
* `contributing.md` — branch policy, PR template
* `ops.md` — backup/restore instructions

Important `.env.example`:

```
MONGO_URI=mongodb://localhost:27017/unicms
PORT=5000
JWT_SECRET=supersecret
S3_ENDPOINT=
S3_KEY=
S3_SECRET=
S3_BUCKET=
```

---

