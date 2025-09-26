# **Phase 4: Frontend MVP (React + TypeScript + JWT + CRUD)**

---

## **1. Project Setup**


```bash
npm create vite@latest cms-frontend
cd cms-frontend
npm install axios react-router-dom @reduxjs/toolkit react-redux tailwindcss postcss autoprefixer react-dnd @dnd-kit/core
```

**Folder Structure (recommended):**

```
src/
├── api/         # axios instances, API helpers
├── components/  # reusable UI components
├── features/    # Redux slices or Zustand stores
├── pages/       # route-level components
├── hooks/       # custom hooks
├── utils/       # helpers, constants
└── App.tsx      # main app component with routes
```

---

## **2. Authentication Flow**

* **Login Page**

  * Email + Password form
  * On success → save JWT in Redux/Zustand
* **Protected Routes**

  * Redirect to `/login` if not authenticated
* **Logout**

  * Clear JWT from state
  * Redirect to login page

---

## **3. Dashboard & Navigation**

* Layout: Sidebar (Users, Templates, Pages, Elements) + Topbar
* Dashboard page: show quick stats (total users, pages, templates)
* Navigation links to CRUD pages and editor

---

## **4. CRUD Interfaces**

| Entity        | Features                                   |
| ------------- | ------------------------------------------ |
| **Users**     | List, Create, Update, Delete               |
| **Templates** | List, Create, Update, Delete               |
| **Pages**     | List, Create, Update, Delete, View content |
| **Elements**  | List, Create, Update, Delete               |

**CRUD Implementation Details:**

* List pages/tables with pagination
* Modal or form for Create & Update
* Delete with confirmation dialog
* Fetch API data using axios with JWT in headers

---

## **5. Basic Page Editor (MVP)**

* **Sidebar** with available elements (Text, Image, Button)
* **Canvas** area for drag-and-drop layout
* Save → sends layout JSON to backend (`Pages.content_json`)
* Load → fetch JSON and render layout dynamically
* Minimal styling for MVP (Tailwind CSS optional)

---

## **6. AI Content Integration**

* “Generate with AI” button inside editor
* Sends prompt to backend → receives AI-generated content JSON
* Content auto-inserts into editor and can be manually edited
* Save updated content to backend

---

## **7. API Integration**

* Create `axios` instance with JWT interceptor
* Main endpoints used:

| Method | Endpoint          | Description             |
| ------ | ----------------- | ----------------------- |
| POST   | `/api/token/`     | Login                   |
| GET    | `/api/users/`     | Fetch all users         |
| GET    | `/api/pages/`     | Fetch all pages         |
| POST   | `/api/pages/`     | Create new page         |
| GET    | `/api/templates/` | Fetch all templates     |
| GET    | `/api/elements/`  | Fetch all elements      |
| POST   | `/api/ailogs/`    | Send AI prompt & output |

---

## **8. Deliverables**

* ✅ Login & JWT auth
* ✅ Dashboard + navigation
* ✅ CRUD UIs (Users, Pages, Templates, Elements)
* ✅ Basic drag-and-drop page editor
* ✅ AI content integration
* ✅ Backend API connections fully functional

---

## **9. Testing Flow**

1. **Login** → `POST /api/token/`
2. **Store JWT** in frontend state
3. **Perform CRUD** actions on all entities
4. **Open Page Editor** → drag elements + save
5. **Generate with AI** → backend returns JSON → render in editor
6. **Verify API integration** and content persistence

---

