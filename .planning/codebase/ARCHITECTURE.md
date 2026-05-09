# Architecture and Design

**Analysis Date:** 2026-05-09

## High-Level Architecture

The Pelimotion Portfolio is a **Decoupled SPA (Single Page Application)** built with a "Vanilla" philosophy, utilizing client-side rendering and a Python-driven automation layer for content management.

### System Components

1.  **Portfolio Frontend (Client):**
    - Built with Vanilla JS, HTML, and CSS.
    - Implements a **Brutalist Design System** with kinetic typography and high-performance media playback.
    - Uses `site-content.json` as a local data store to render projects, categories, and client info.

2.  **Admin CMS (Client):**
    - A dedicated administrative interface in `/admin`.
    - Handles project editing, sorting, and manual content overrides.
    - Persists changes back to the JSON data store via a custom API/Patch system.

3.  **Automation & Sync Layer (Python):**
    - A suite of Python scripts that manage the "Source of Truth" between local files and Bunny.net Storage.
    - `sync_bunny.py`: Performs a "Smart Merge" between Bunny.net asset state and `site-content.json`, preserving editorial fields while refreshing asset URLs.
    - `build_portfolio.py` / `generate_portfolio.py`: Handles static generation tasks and local asset processing.

4.  **Hosting & Routing (Vercel):**
    - Vercel handles all request routing.
    - Deep-linking is achieved via `vercel.json` rewrites that map clean URLs (e.g., `/portfolio/client-name`) to the SPA entry point while preserving the path for client-side routing.

## Data Flow

1.  **Asset Upload:** User uploads video/image to Bunny.net Storage.
2.  **Synchronization:** `sync_bunny.py` is executed (locally or via CI). It scans Bunny.net, cleans filenames into professional titles, and updates `site-content.json`.
3.  **Editorial Update:** User logs into `/admin`, modifies descriptions or order. The admin panel patches `site-content.json`.
4.  **Deployment:** Git push triggers Vercel. `site-content.json` is deployed as part of the static bundle.
5.  **Rendering:** Browser loads `index.html` -> `portfolio.js` fetches `site-content.json` -> UI is rendered.

## Core Design Patterns

-   **Vanilla Everything:** Zero dependencies on frontend frameworks (React/Vue). All state management and DOM manipulation are handled via native browser APIs.
-   **Smart Merge Persistence:** The synchronization logic distinguishes between "Bunny-owned" fields (URLs, dimensions) and "Admin-owned" fields (titles, descriptions) to prevent automation from overwriting manual edits.
-   **Brutalist Aesthetic:** Heavy use of bold typography, high-contrast colors, and raw layout structures.
-   **Media-First Navigation:** Navigation is driven by high-quality video previews and interactive mosaics.

## Entry Points

-   **Portfolio:** `index.html` (Main entry) -> `portfolio.js`.
-   **Admin:** `admin/index.html` -> `admin-v4.js`.
-   **Curriculum:** `Curriculum/index.html` -> `Curriculum/style.css`.
-   **Routing:** `vercel.json` (Configuration of all public entry points).

---

*Architecture analysis: 2026-05-09*
*Update when major architectural changes occur*
