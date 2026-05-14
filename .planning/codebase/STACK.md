# Technology Stack

**Analysis Date:** 2026-05-09

## Languages

**Primary:**
- HTML5 - Structure of the portfolio and admin panel.
- CSS3 - Styling, including a brutalist aesthetic.
- JavaScript (Vanilla ES6+) - Client-side logic for the portfolio, admin CMS, and media playback.

**Secondary:**
- Python 3.x - Extensive suite of automation scripts for media processing, deployment, and content synchronization.

## Runtime

**Environment:**
- Modern Web Browsers - For the frontend application.
- Python 3.x - For running the `sync_bunny.py`, `generate_portfolio.py`, and various `patch_*.py` scripts.

**Package Manager:**
- None (Frontend) - The project uses vanilla JS without a bundler or `npm`.
- pip (Python) - Used for Python dependencies (e.g., `requests` if present, though many scripts use `urllib`).

## Frameworks

**Core:**
- Vanilla JavaScript - No frontend framework (React/Vue/etc.) is used.
- Vercel - Serverless hosting and routing platform.

**Testing:**
- Custom Python scripts (e.g., `test_bunny.py`, `check_js_error.py`) for automated verification.

**Build/Dev:**
- Custom Python-based build system (e.g., `build_portfolio.py`, `generate_portfolio.py`).
- shell scripts (e.g., `watch_and_deploy.sh`) for workflow automation.

## Key Dependencies

**Critical:**
- `urllib.request` (Python built-in) - Used for communicating with the Bunny.net API.
- `json` (Python/JS built-in) - Core data format for `content.json` and `site-content.json`.
- `ffmpeg` (External) - Likely required by media generation scripts (though not found in the root, it's a common dependency for these types of projects).

**Infrastructure:**
- Vercel Redirects/Rewrites - Configured in `vercel.json` to handle SPA-like routing and path mapping.

## Configuration

**Environment:**
- `vercel.json` - Defines routing, redirects, and environment settings.
- Hardcoded configuration in scripts (e.g., `API_KEY` in `sync_bunny.py`).

**Build:**
- No standard build config (like `webpack.config.js`). Configuration is embedded in Python scripts.

## Platform Requirements

**Development:**
- macOS (indicated by `.DS_Store` and user metadata).
- Python 3 environment.

**Production:**
- Vercel - Primary hosting platform.
- Bunny.net - Media storage and CDN delivery.

---

*Stack analysis: 2026-05-09*
*Update after major dependency changes*
