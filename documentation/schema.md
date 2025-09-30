# **Data Dictionary for Section-Based School CMS**

---

## **1. User**

| Field      | Type           | Description                 | Notes                      |
| ---------- | -------------- | --------------------------- | -------------------------- |
| id         | UUID           | Primary key                 | Unique identifier for user |
| name       | CharField(255) | Full name of user           |                            |
| email      | EmailField     | User's email                | Unique, used for login     |
| is_staff   | Boolean        | Admin/staff flag            | Default False              |
| created_at | DateTime       | Timestamp when user created | Auto now add               |
| updated_at | DateTime       | Timestamp when user updated | Auto now                   |

---

## **2. Template**

| Field       | Type           | Description                     | Notes                           |
| ----------- | -------------- | ------------------------------- | ------------------------------- |
| id          | UUID           | Primary key                     | Unique identifier for template  |
| name        | CharField(255) | Template name                   |                                 |
| description | TextField      | Template description            | Optional                        |
| structure   | JSONField      | Default sections for pages      | Stores array of section objects |
| theme       | CharField(100) | Theme key or name               | Determines page styling         |
| created_at  | DateTime       | Timestamp when template created | Auto now add                    |
| updated_at  | DateTime       | Timestamp when template updated | Auto now                        |

---

## **3. Page**

| Field       | Type                 | Description                 | Notes                        |
| ----------- | -------------------- | --------------------------- | ---------------------------- |
| id          | UUID                 | Primary key                 | Unique identifier for page   |
| user_id     | ForeignKey(User)     | Owner of page               | On delete cascade            |
| template_id | ForeignKey(Template) | Template used for page      | Nullable, on delete set null |
| title       | CharField(255)       | Page title                  |                              |
| slug        | SlugField            | URL-friendly identifier     | Unique                       |
| status      | CharField(20)        | Draft/Published             | Default draft                |
| seo_meta    | JSONField            | SEO metadata                | Optional, stores meta tags   |
| created_at  | DateTime             | Timestamp when page created | Auto now add                 |
| updated_at  | DateTime             | Timestamp when page updated | Auto now                     |

---

## **4. Section**

| Field      | Type             | Description                    | Notes                                                  |
| ---------- | ---------------- | ------------------------------ | ------------------------------------------------------ |
| id         | UUID             | Primary key                    | Unique identifier for section                          |
| page_id    | ForeignKey(Page) | Page this section belongs to   | On delete cascade                                      |
| type       | CharField(50)    | Section type                   | e.g., heading, paragraph, table, button, image         |
| properties | JSONField        | Section content/properties     | Stores text, table rows, image URLs, button text, etc. |
| theme_key  | CharField(50)    | Optional theme override        | Overrides template theme if needed                     |
| order      | PositiveInteger  | Section order in page          | Determines rendering sequence                          |
| created_at | DateTime         | Timestamp when section created | Auto now add                                           |
| updated_at | DateTime         | Timestamp when section updated | Auto now                                               |

---

### **Notes:**

* **User → Page**: One-to-many relationship, user owns pages.
* **Template → Page**: One-to-many, template provides layout and theme.
* **Page → Section**: One-to-many, sections are ordered building blocks of page content.
* **Sections inherit template/theme** unless `theme_key` is set for override.
* **JSONFields** allow flexible storage of dynamic content per se
