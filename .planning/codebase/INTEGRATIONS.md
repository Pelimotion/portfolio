# External Integrations

**Analysis Date:** 2026-05-09

## APIs & External Services

**Media Storage & Delivery:**
- Bunny.net - Primary storage and CDN for video and image assets.
  - SDK/Client: REST API via Python `urllib.request`.
  - Auth: API Key hardcoded in `sync_bunny.py`.
  - Endpoints used: Storage API (`storage.bunnycdn.com`) for file management and Pull Zone for delivery.

**Hosting & Routing:**
- Vercel - Web hosting and deployment.
  - Integration method: Git-based deployment.
  - Routing: Custom redirects and rewrites configured in `vercel.json`.

## Data Storage

**Databases:**
- None (File-based) - The project uses JSON files as the "database."
  - `content.json`: Primary data source for the portfolio.
  - `site-content.json`: Unified schema for the admin CMS and portfolio sync.

**File Storage:**
- Bunny.net Storage - Stores project media (videos, posters, mosaics).
- Local filesystem - Stores the application code and small static assets.

## Authentication & Identity

**Auth Provider:**
- Custom PIN-based Auth (implied by previous conversation summaries) - Local SHA-256 PIN-based authentication for the admin panel.

## CI/CD & Deployment

**Hosting:**
- Vercel - SPA hosting.
  - Deployment: Automatic on git push via Vercel integration.
  - Configuration: `vercel.json` in the root.

**CI Pipeline:**
- Custom Shell Scripts - `watch_and_deploy.sh` and `optimized_deploy.py` handle the deployment workflow.

## Environment Configuration

**Development:**
- Local environment on Mac.
- Python scripts for syncing local state with Bunny.net.

**Production:**
- Live site on Vercel.
- Assets served via Bunny.net CDN (`pelimotion-portfolio.b-cdn.net`).

## Webhooks & Callbacks

**Incoming:**
- None detected.

**Outgoing:**
- None detected.

---

*Integration audit: 2026-05-09*
*Update when adding/removing external services*
