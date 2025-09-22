
---

# **AI-Assisted CMS Data Dictionary — Phase 3**

## **1. Users Table (Django default)**

| Column       | Type     | Description                      |
| ------------ | -------- | -------------------------------- |
| id           | int      | Primary key (auto-increment)     |
| username     | varchar  | Unique username                  |
| email        | varchar  | Unique email address             |
| password     | varchar  | Hashed password (Django default) |
| is\_staff    | boolean  | Admin/staff flag                 |
| is\_active   | boolean  | Active user flag                 |
| date\_joined | datetime | Timestamp when user was created  |

> Notes: Phase 3 uses Django’s built-in `User` model for authentication.

---

## **2. Templates Table**

| Column      | Type     | Description                                 |
| ----------- | -------- | ------------------------------------------- |
| id          | UUID     | Primary key                                 |
| name        | varchar  | Template name                               |
| description | text     | Optional description                        |
| structure   | JSON     | Layout info (sections, elements, positions) |
| theme       | varchar  | Theme name or color scheme                  |
| created\_at | datetime | Timestamp of creation                       |
| updated\_at | datetime | Timestamp of last update                    |

---

## **3. Pages Table**

| Column        | Type              | Description                                       |
| ------------- | ----------------- | ------------------------------------------------- |
| id            | UUID              | Primary key                                       |
| user\_id      | FK → Users.id     | Creator/owner of page                             |
| template\_id  | FK → Templates.id | Optional base template                            |
| title         | varchar           | Page title                                        |
| slug          | varchar           | SEO-friendly URL slug (auto-generated if missing) |
| content\_json | JSON              | AI-generated content / drag-drop layout           |
| status        | varchar           | `draft`, `published`, `archived`                  |
| seo\_meta     | JSON              | SEO metadata: title, description, keywords        |
| created\_at   | datetime          | Timestamp of creation                             |
| updated\_at   | datetime          | Timestamp of last update                          |

---

## **4. Elements Table**

| Column      | Type          | Description                                             |
| ----------- | ------------- | ------------------------------------------------------- |
| id          | UUID          | Primary key                                             |
| page\_id    | FK → Pages.id | Page this element belongs to                            |
| name        | varchar       | Element name                                            |
| type        | varchar       | Element type: text, image, button, etc.                 |
| properties  | JSON          | JSON with element properties (size, color, text, links) |
| order       | int           | Ordering index (optional)                               |
| created\_at | datetime      | Timestamp of creation                                   |
| updated\_at | datetime      | Timestamp of last update                                |

---

## **5. AI\_Logs Table**

| Column      | Type          | Description                    |
| ----------- | ------------- | ------------------------------ |
| id          | UUID          | Primary key                    |
| page\_id    | FK → Pages.id | Page linked to this AI request |
| user\_id    | FK → Users.id | User who requested AI          |
| prompt      | text          | AI input from user             |
| output      | text          | AI-generated content           |
| model\_name | varchar       | AI model used (e.g., GPT-4)    |
| created\_at | datetime      | Timestamp of request           |

---

## **Notes**

* **Foreign keys:**

  * `Pages.user → Users.id` (1-to-many)
  * `Pages.template → Templates.id` (1-to-many, optional)
  * `Elements.page → Pages.id` (1-to-many)
  * `AI_Logs.page → Pages.id` and `AI_Logs.user → Users.id` (1-to-many)

* **JSON fields:**

  * `Pages.content_json`
  * `Templates.structure`
  * `Elements.properties`
    Allow flexible layouts and AI-generated content without changing schema.

* **Status field in Pages:** must be lowercase: `draft`, `published`, `archived`.

* **Slug:** auto-generated from title if missing.

---
