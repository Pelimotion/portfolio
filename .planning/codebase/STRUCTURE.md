# Codebase Structure

**Analysis Date:** 2026-05-09

## Directory Layout

```
Pelimotion/Portfolio/
├── admin/              # Admin CMS Dashboard (Vanilla JS/CSS)
├── assets/             # Static assets (fonts, icons, local images)
├── Curriculum/         # CV / Private Portfolio section
├── V1/                 # Stable version of the portfolio
│   └── portfolio/      # Main entry for the V1 SPA
├── api/                # Vercel Serverless Functions
├── contra_pipeline/    # Automated media pipeline for Contra projects
├── backups/            # Local backups of JSON data
├── site-content.json   # Central project data (Source of Truth)
├── content.json        # Legacy project data (Legacy/Compatibility)
├── portfolio.js        # Main portfolio engine
├── style.css           # Global brutalist styles
├── theme.js            # Light/Dark mode logic
├── index.html          # Main application entry point
├── vercel.json         # Hosting configuration and rewrites
└── *.py                # Extensive suite of automation/patch scripts
```

## Directory Purposes

**admin/**
- Purpose: Content management interface for editing the portfolio.
- Contains: HTML, CSS, and JS (`admin-v4.js`) for the dashboard.
- Key files: `admin-v4.js` (Core CMS logic), `style.css`.

**V1/portfolio/**
- Purpose: The primary stable version of the portfolio application.
- Contains: Its own `index.html`, `script.js`, and `style.css`.
- Key files: `script.js`.

**Curriculum/**
- Purpose: Interactive CV and professional experience page.
- Contains: Portfolio-style rendering for personal experience and skills.
- Key files: `index.html`, `style.css`.

**api/**
- Purpose: Serverless backend functionality.
- Key files: `upload-frame.js`.

**contra_pipeline/**
- Purpose: Automation for creating social-media ready media drafts.
- Subdirectories: `drafts/`.

## Key File Locations

**Entry Points:**
- `index.html`: Main portfolio entry point.
- `admin/index.html`: Admin panel entry point.
- `Curriculum/index.html`: CV entry point.

**Configuration:**
- `vercel.json`: Vercel routing and deployment config.
- `site-content.json`: Project and client data.

**Core Logic:**
- `portfolio.js`: Portfolio rendering and navigation.
- `sync_bunny.py`: Media synchronization logic.
- `theme.js`: Theming engine.

**Automation (Root):**
- `deploy_system.py`: Deployment orchestration.
- `generate_media.py`: Asset processing.
- `optimize_portfolio.py`: Code/media optimization.

## Naming Conventions

**Files:**
- `snake_case.py`: Python automation scripts.
- `kebab-case.js`: JavaScript modules (mostly).
- `kebab-case.css`: Stylesheets.
- `UPPERCASE_DESCRIPTION.md`: Specification and documentation files.

**Directories:**
- `PascalCase` or `kebab-case`: Feature directories.

## Where to Add New Code

**New Portfolio Feature:**
- Logic: `portfolio.js` or new module in root.
- Styles: `style.css`.

**New Admin Tool:**
- Logic: `admin/admin-v4.js`.
- Template: `admin/index.html`.

**New Automation Script:**
- Implementation: Root directory as a `.py` file.

**New Client/Project:**
- Method: Upload to Bunny.net and run `sync_bunny.py`.

---

*Structure analysis: 2026-05-09*
*Update when directory structure changes*
