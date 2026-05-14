# SPEC_01 — Admin Panel Architecture
**Project:** Pelimotion Hub  
**Model target:** Nemotron 3 Super  
**Scope:** Admin panel restructure — page listing, navigation, visual editor access  
**Depends on:** None (foundational spec)  
**Next spec:** SPEC_02_PORTFOLIO_CONTENT_EDITOR

---

## CONTEXT

This is the admin panel of a creative portfolio site (Pelimotion Hub) built with a custom CMS-like structure, deployed on Vercel, assets on Bunny.net, source on GitHub. The current admin panel lacks intuitive navigation and does not list all pages (especially private/unlisted ones). The goal is a fully restructured admin that feels like a lightweight CMS.

---

## OBJECTIVE

Rebuild the admin panel UI so that:
1. All pages of the site are listed — public, private, unlisted, and draft
2. Each page can be accessed and edited individually from the admin
3. The interface is visual-first, not code-first
4. The admin is the single source of truth for page management

---

## REQUIREMENTS

### R1 — Page Index (Master List)
- On load, the admin must fetch and display ALL pages registered in the system
- Each page entry must show:
  - Page title
  - URL slug
  - Status badge: `PUBLIC` / `PRIVATE` / `DRAFT` / `UNLISTED`
  - Last modified date
  - Quick-action buttons: `Edit` | `Preview` | `Toggle visibility`
- Pages must be grouped by type:
  - **Site pages** (Home, CV, About, Contact)
  - **Portfolio pages** (one per client/project)
  - **System pages** (404, redirects, hidden routes)
- List must update in real time after any edit — no manual refresh

### R2 — Page Status Control
- Each page must have a visibility toggle accessible directly from the list
- Status changes must persist immediately (no save button required for status)
- Private pages must still be accessible from the admin for editing
- Status must be stored in the page's metadata/config, not hardcoded

### R3 — Visual Page Editor (per page)
- Clicking `Edit` on any page opens a split-view editor:
  - **Left panel:** editable fields for that page's content
  - **Right panel:** live preview that updates as fields change
- Editor must NOT require knowledge of code or data structure
- Fields must be rendered as appropriate input types:
  - Short text → `<input type="text">`
  - Long text / description → `<textarea>` or rich text
  - Images → file picker with Bunny.net upload integration
  - Toggle fields → `<switch>`
- Save button commits changes and triggers redeploy or revalidation

### R4 — Navigation UX
- Admin sidebar must be always visible with:
  - Logo / studio name at top
  - Page list (grouped, collapsible)
  - Quick links: `+ New Page`, `Analytics`, `Settings`
- Active page highlighted in sidebar
- Breadcrumb at top of editor: `Admin > Portfolio > Fast Shipping`
- Mobile-responsive (collapsible sidebar on small screens)

### R5 — Access & Auth
- Admin must be protected by authentication (current auth system must be preserved)
- No changes to existing auth logic — only wrap new UI around it
- Session must persist across page edits without re-login

---

## TECHNICAL CONSTRAINTS

- Framework: [insert — Next.js / Astro / etc. — check repo]
- Styling: match existing site design system (dark background, monospace/sans typography)
- Do NOT introduce new databases — use existing data layer
- Do NOT break existing public-facing routes
- All new admin routes must be under `/admin/*`
- New components must be isolated — no side effects on public pages

---

## OUT OF SCOPE FOR THIS SPEC

- Portfolio content fields (texts, descriptions per project) → SPEC_02
- Media management beyond upload trigger → future spec
- Multi-user / role system → future spec

---

## DELIVERABLES EXPECTED FROM NEMOTRON

1. Updated admin layout component with sidebar + page index
2. Page list component with status badges and quick actions
3. Generic visual editor shell (field renderer by type)
4. Status toggle logic (persistence layer)
5. Routing structure for `/admin/pages/[slug]`

---

## PROMPT TO USE WITH NEMOTRON

```
You are working on the admin panel of a creative portfolio site called Pelimotion Hub.
Read SPEC_01_ADMIN_PANEL_ARCHITECTURE.md fully before writing any code.

Your task:
1. Audit the current admin panel structure in the codebase
2. Identify all existing page definitions and how their visibility/status is currently stored
3. Build the new admin layout as described in R1 through R5
4. List every file you will create or modify before touching anything
5. Make changes incrementally — one component at a time
6. After each component, confirm it does not affect any public-facing route

Constraints:
- Dark UI matching existing design system
- No new database or auth system
- All admin routes under /admin/*
- Output clean, commented code

Start by mapping the current file structure and page registry. Do not write code yet.
```
