# SPEC_02 — Portfolio Content Editor
**Project:** Pelimotion Hub  
**Model target:** Nemotron 3 Super  
**Scope:** Visual text/content editing for individual client and project pages  
**Depends on:** SPEC_01_ADMIN_PANEL_ARCHITECTURE (admin shell must exist first)  
**Next spec:** SPEC_03 (TBD)

---

## CONTEXT

Pelimotion Hub has a portfolio section with one page per client or project. Currently, editing any content on these pages requires going into the codebase. The goal is to make every text field, description, tag, and metadata on each portfolio page editable directly from the admin — no code required.

---

## OBJECTIVE

Create a content editor specific to portfolio/project pages so that:
1. Every client or project page has a dedicated edit view in the admin
2. All text content is editable via form fields (no markdown knowledge required)
3. Changes are saved and reflected on the public page immediately
4. The editor matches the structure of the portfolio page exactly

---

## REQUIREMENTS

### R1 — Portfolio Page Registry
- Admin must auto-detect all existing portfolio/client pages
- Each must appear in the admin sidebar under "Portfolio" grouped section
- Detection must be dynamic — adding a new project file should auto-add it to the list
- Each entry shows: client name, project count, last edited date, public/private status

### R2 — Project Page Editor Fields
For each project/client page, the editor must expose these editable fields:

**Header block:**
- Client name (text)
- Project title (text)
- Tagline / short description (text, max ~120 chars)
- Cover image (file picker → Bunny.net upload)
- Status: public / private / draft (toggle)

**Body block:**
- Full project description (rich text — bold, italic, line breaks minimum)
- Services delivered (tag list — add/remove tags)
- Tools used (tag list — add/remove tags)
- Year / date (date picker or text)
- Project URL (optional external link)

**Works / gallery block:**
- List of individual works within the project
- Each work: title, description, embed URL or file upload, thumbnail
- Reorderable via drag-and-drop
- Add new work / remove work

**Meta block:**
- SEO title (text)
- SEO description (text, max ~160 chars)
- OG image (file picker)
- Slug (text — with warning if changed, as it affects public URL)

### R3 — Live Preview
- Editor is split-view: fields on left, preview on right
- Preview renders the actual portfolio page template with current field values
- Preview updates on field blur (not on every keystroke — avoid performance hit)
- Preview shows both desktop and mobile toggle

### R4 — Save & Publish Flow
- `Save Draft` — saves without making public
- `Publish` — saves and triggers revalidation/redeploy of that specific page only
- Change log: show last 5 saves with timestamp (no full version history needed)
- If slug is changed: show modal warning with old URL → new URL diff

### R5 — New Project Creation
- `+ New Project` button in admin sidebar
- Opens a blank editor with all fields empty
- Requires: client name + slug at minimum before first save
- On first save, creates the page entry in the data layer

---

## DATA STRUCTURE EXPECTED

Each project should map to a structured object. If not already structured this way, Nemotron should propose and implement the migration:

```json
{
  "slug": "fast-shipping",
  "client": "Fast Shipping",
  "title": "Full Motion Branding",
  "tagline": "From identity to kinetic system.",
  "status": "public",
  "coverImage": "https://cdn.pelimotion.com/projects/fast-shipping/cover.jpg",
  "description": "...",
  "services": ["Motion Branding", "Art Direction", "Motion Media Kit"],
  "tools": ["After Effects", "Illustrator", "Premiere"],
  "year": "2024",
  "projectUrl": "",
  "works": [
    {
      "id": "w1",
      "title": "Brand Launch Film",
      "description": "...",
      "embedUrl": "https://...",
      "thumbnail": "https://..."
    }
  ],
  "seo": {
    "title": "Fast Shipping — Pelimotion",
    "description": "...",
    "ogImage": "https://..."
  }
}
```

---

## TECHNICAL CONSTRAINTS

- Must use admin shell from SPEC_01 — no duplicate layout code
- Rich text editor: use an existing lightweight lib already in the project, or propose `tiptap` (minimal config) — NO full CKEditor or Quill
- Drag-and-drop for works reorder: use existing lib or propose `@dnd-kit/core`
- Bunny.net upload: use existing upload utility if present, or create one thin wrapper
- No new database — persist to existing data layer (JSON files, CMS API, or equivalent)
- Do NOT touch the public portfolio page template — only feed it new data

---

## OUT OF SCOPE FOR THIS SPEC

- Admin panel shell and page listing → SPEC_01
- Media library / asset manager → future spec
- Analytics per project page → future spec
- Client-facing preview links → future spec

---

## DELIVERABLES EXPECTED FROM NEMOTRON

1. Portfolio page list component (sidebar + main index)
2. Project editor form (all field types from R2)
3. Live preview integration with existing portfolio template
4. Save/publish flow with revalidation trigger
5. New project creation flow
6. Data migration script if current structure doesn't match expected schema

---

## PROMPT TO USE WITH NEMOTRON

```
You are working on the portfolio content editor for Pelimotion Hub.
You must have completed or reviewed SPEC_01_ADMIN_PANEL_ARCHITECTURE first.
Now read SPEC_02_PORTFOLIO_CONTENT_EDITOR.md fully before writing any code.

Your task:
1. Audit the current data structure for portfolio/project pages
2. Compare it against the expected schema in this spec
3. If migration is needed, write and run the migration script first — confirm output before continuing
4. Build the project editor form with all fields from R2
5. Integrate the live preview using the existing portfolio page template
6. Implement save draft and publish flows

Constraints:
- Reuse admin shell from SPEC_01 — no new layout code
- No new database
- Lightweight rich text editor only
- Output one component at a time, confirm it works before moving to the next

Start by auditing the current portfolio data structure. Show me what you find before writing anything.
```
