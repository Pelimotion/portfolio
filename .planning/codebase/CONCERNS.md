# Technical Debt and Concerns

**Analysis Date:** 2026-05-09

## Tech Debt and Architecture Issues

**Data Source Fragmentation:**
- **Issue:** The project maintains both `site-content.json` (V3 unified schema) and `content.json` (Legacy schema).
- **Files:** `site-content.json`, `content.json`, `sync_bunny.py`, `portfolio.js`.
- **Why:** Transitioning to a new CMS schema while maintaining backward compatibility for older versions of the portfolio.
- **Impact:** Increased risk of state drift and synchronization errors. Changes made to one might not propagate to the other without running specific scripts.
- **Fix approach:** Fully migrate the frontend to use only `site-content.json` and deprecate `content.json`.

**"Patch Script" Proliferation:**
- **Issue:** There are over 20 specialized Python scripts in the root directory (e.g., `patch_admin.py`, `fix_h3.py`, `inject_translator.py`) for one-off fixes and injections.
- **Files:** Root directory (`*.py`).
- **Why:** Rapid, ad-hoc fixes to the vanilla codebase across different versions and environments.
- **Impact:** High maintenance overhead, difficult to understand the "clean" state of the codebase, and risk of overlapping patches causing conflicts.
- **Fix approach:** Consolidate patch logic into a centralized `cli.py` or a more robust build/deployment system.

**Version Fragmentation:**
- **Issue:** Multiple versions of the portfolio coexist (`V1/`, `v2/` - though empty, root `index.html`).
- **Files:** `V1/`, `v2/`, `/`.
- **Why:** Iterative redesigns without a clean cutover.
- **Impact:** Confusion about which version is currently "active" or "primary" for certain routes.
- **Fix approach:** Consolidate into a single versioned structure or use git branches for experimental redesigns.

## Known Bugs

**Filename Pattern Sensitivity:**
- **Symptoms:** Media might be incorrectly categorized or missing previews/posters.
- **Trigger:** Assets uploaded to Bunny.net without strict naming conventions (e.g., forgetting the `_preview.mp4` suffix).
- **Files:** `sync_bunny.py` (lines ~107-130).
- **Workaround:** Manually rename assets on Bunny.net and re-run sync.
- **Root cause:** Logic relies on exact string matches (`vertical`, `9x16`, `_preview`) for metadata generation.
- **Fix:** Implement more robust metadata detection or use Bunny.net's API metadata fields if available.

## Security Considerations

**Hardcoded API Credentials:**
- **Risk:** Sensitive Bunny.net Storage API keys are hardcoded in the source code.
- **Files:** `sync_bunny.py` (line 10), `V1/portfolio/sync_bunny.py`.
- **Impact:** Potential unauthorized access to the Bunny.net storage zone if the repository is ever made public or shared.
- **Recommendations:** Move all secrets to environment variables (e.g., `BUNNY_API_KEY`) and use a `.env` file for local development.

**Client-Side Admin Auth:**
- **Risk:** Authentication for the admin panel appears to be handled primarily on the client-side.
- **Files:** `admin/admin-v4.js`.
- **Impact:** Vulnerable to bypass by a determined user.
- **Recommendations:** Implement server-side session verification if possible within the Vercel/Serverless environment.

## Performance Bottlenecks

**Large JSON Payloads:**
- **Problem:** `site-content.json` contains full metadata for every project and media item.
- **Measurement:** As the client list grows, the file size increases linearly.
- **Impact:** Slower initial page load as the browser must fetch and parse the entire data set before rendering.
- **Improvement path:** Implement pagination or slice the JSON into category-specific chunks.

## Fragile Areas

**Vercel Routing vs. Client-Side Routing:**
- **Files:** `vercel.json`, `portfolio.js`.
- **Why fragile:** Deep-links depend on `vercel.json` rewrites perfectly matching the expectations of the `portfolio.js` router.
- **Common failures:** Adding a new route in JS without updating `vercel.json` leads to 404s on refresh.
- **Safe modification:** Always update both files when adding top-level navigation items.

---

*Concerns audit: 2026-05-09*
*Update as issues are fixed or new ones discovered*
