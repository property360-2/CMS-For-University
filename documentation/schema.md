# AI-Assisted CMS Data Dictionary

## **1. Users Table**

| Column     | Type       | Description                     |
| ---------- | ---------- | ------------------------------- |
| id         | UUID / int | Primary key                     |
| name       | varchar    | Full name                       |
| email      | varchar    | Unique user email               |
| password   | varchar    | Hashed password                 |
| created_at | datetime   | Timestamp of creation           |
| updated_at | datetime   | Timestamp of last update        |

---

## **2. Templates Table**

| Column      | Type     | Description                                 |
| ----------- | -------- | ------------------------------------------- |
| id          | UUID/int | Primary key                                 |
| name        | varchar  | Template name                               |
| description | text     | Optional description                        |
| structure   | JSON     | Layout info (sections, elements, positions) |
| theme       | varchar  | Theme name or color scheme                  |
| created_at  | datetime | Timestamp of creation                       |
| updated_at  | datetime | Timestamp of last update                    |

---

## **3. Pages Table**

| Column       | Type              | Description                                |
| ------------ | ----------------- | ------------------------------------------ |
| id           | UUID/int          | Primary key                                |
| user_id      | FK → Users.id     | Creator/owner of page                      |
| template_id  | FK → Templates.id | Base template used                         |
| title        | varchar           | Page title                                 |
| slug         | varchar           | SEO-friendly URL slug                      |
| content_json | JSON              | AI-generated content and drag-drop layout  |
| status       | varchar           | Draft / Published / Archived               |
| seo_meta     | JSON              | SEO metadata: title, description, keywords |
| created_at   | datetime          | Timestamp of creation                      |
| updated_at   | datetime          | Timestamp of last update                   |

---

## **4. Elements Table (optional)**

| Column     | Type     | Description                                             |
| ---------- | -------- | ------------------------------------------------------- |
| id         | UUID/int | Primary key                                             |
| name       | varchar  | Element name                                            |
| type       | varchar  | Type: text, image, button, etc.                         |
| properties | JSON     | JSON with element properties (size, color, text, links) |
| created_at | datetime | Timestamp of creation                                   |
| updated_at | datetime | Timestamp of last update                                |

---

## **5. AI_Logs Table (optional)**

| Column      | Type          | Description                 |
| ----------- | ------------- | --------------------------- |
| id          | UUID/int      | Primary key                 |
| user_id     | FK → Users.id | Who requested AI            |
| prompt      | text          | AI input from user          |
| output_json | JSON          | AI-generated content        |
| model_name  | varchar       | AI model used (e.g., GPT-4) |
| created_at  | datetime      | Timestamp of request        |

---

## **Notes**

- **JSON fields** (Pages.content_json, Templates.structure, Elements.properties, AI_Logs.output_json) allow **flexible layouts and AI-generated content** without schema changes.
- **Users → Pages** is **1-to-many**.
- **Templates → Pages** is **1-to-many**.
- Optional tables (**Elements, AI_Logs**) provide modular features without affecting core Pages structure.
- SEO and accessibility considerations are included via `seo_meta` in Pages.
