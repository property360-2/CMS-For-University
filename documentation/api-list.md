
## **API List**

### **1. Users**

| Endpoint                | Method | Description                   | Body (JSON)                                                               |
| ----------------------- | ------ | ----------------------------- | ------------------------------------------------------------------------- |
| `/api/users/`           | GET    | List all users (admin only)   | N/A                                                                       |
| `/api/users/`           | POST   | Create new user (admin only)  | `{ "name": "John Doe", "email": "john@example.com", "password": "1234" }` |
| `/api/users/<uuid:id>/` | GET    | Get user details (admin only) | N/A                                                                       |
| `/api/users/<uuid:id>/` | PUT    | Update user (admin only)      | `{ "name": "John Updated", "email": "john@example.com" }`                 |
| `/api/users/<uuid:id>/` | DELETE | Delete user (admin only)      | N/A                                                                       |
| `/api/register/`        | POST   | Public registration           | `{ "name": "John Doe", "email": "john@example.com", "password": "1234" }` |

---

### **2. Authentication**

| Endpoint              | Method | Description         | Body (JSON)                                           |
| --------------------- | ------ | ------------------- | ----------------------------------------------------- |
| `/api/token/`         | POST   | Obtain JWT token    | `{ "email": "john@example.com", "password": "1234" }` |
| `/api/token/refresh/` | POST   | Refresh JWT token   | `{ "refresh": "<refresh_token>" }`                    |
| `/api/logout/`        | POST   | Blacklist JWT token | `{ "refresh": "<refresh_token>" }`                    |

---

### **3. Templates**

| Endpoint                    | Method | Description          | Body (JSON)                                                                                                                                             |
| --------------------------- | ------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/api/templates/`           | GET    | List all templates   | N/A                                                                                                                                                     |
| `/api/templates/`           | POST   | Create a template    | `{ "name": "Default Template", "description": "Main layout", "structure": [{ "type": "heading", "properties": {"text":"Welcome"} }], "theme": "dark" }` |
| `/api/templates/<uuid:id>/` | GET    | Get template details | N/A                                                                                                                                                     |
| `/api/templates/<uuid:id>/` | PUT    | Update template      | `{ "name": "Updated Template", "theme": "light" }`                                                                                                      |
| `/api/templates/<uuid:id>/` | DELETE | Delete template      | N/A                                                                                                                                                     |

---

### **4. Pages**

| Endpoint                | Method | Description                                                  | Body (JSON)                                                                                                                                                  |
| ----------------------- | ------ | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/api/pages/`           | GET    | List all pages for user/admin                                | N/A                                                                                                                                                          |
| `/api/pages/`           | POST   | Create a page (automatically creates sections from template) | `{ "title": "Admissions 2025", "slug": "admissions-2025", "status": "draft", "template": "<template_uuid>", "seo_meta": {"description":"Admissions page"} }` |
| `/api/pages/<uuid:id>/` | GET    | Get page details                                             | N/A                                                                                                                                                          |
| `/api/pages/<uuid:id>/` | PUT    | Update page                                                  | `{ "title": "Admissions Updated", "status": "published" }`                                                                                                   |
| `/api/pages/<uuid:id>/` | DELETE | Delete page                                                  | N/A                                                                                                                                                          |

---

### **5. Sections**

> **Note:** Direct section creation is **disabled**; sections are created via templates when a page is created.

| Endpoint                   | Method | Description                             | Body (JSON)                                                              |
| -------------------------- | ------ | --------------------------------------- | ------------------------------------------------------------------------ |
| `/api/sections/`           | GET    | List all sections (admin or owner only) | N/A                                                                      |
| `/api/sections/<uuid:id>/` | GET    | Get section details                     | N/A                                                                      |
| `/api/sections/<uuid:id>/` | PUT    | Update section (admin or owner only)    | `{ "properties": {"text":"Updated heading"}, "theme_key": "dark-mode" }` |
| `/api/sections/<uuid:id>/` | DELETE | Delete section (admin or owner only)    | N/A                                                                      |

---

### **6. SSR Page Rendering**

| Endpoint                         | Method | Description                                | Body (JSON) |
| -------------------------------- | ------ | ------------------------------------------ | ----------- |
| `/api/pages/<slug:slug>/render/` | GET    | Render a page on the server (returns HTML) | N/A         |

**Example Response** (HTML returned by Django template):

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Admissions Page 2025</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="prose mx-auto p-6">
  <h1 class="text-3xl font-bold mb-4">Admissions Page 2025</h1>
  <h2 class="text-2xl font-semibold my-2">Heading Section</h2>
  <p class="my-2">Paragraph section content</p>
  <a href="#" class="px-4 py-2 bg-blue-600 text-white rounded-lg">Apply Now</a>
</body>
</html>
```

---
