# Phase Context: Structural Cleanup & Script Consolidation

**Phase:** 01
**Goal:** Clean the project root, organize automation tools into a professional structure, and unify data sources.
**Status:** Decisions Captured

## Domain Boundary
This phase focuses on **Codebase Orchestration and Infrastructure Organization**. It does not involve UI changes or new feature development, but rather the relocation of existing assets and the updating of internal references to ensure system stability.

## Decisions

### 1. Script Organization
- **Structure:** All `*.py` and `*.sh` files from the root will be moved to a new `/scripts` directory with functional subfolders.
- **Subfolders:**
    - `/scripts/sync/`: Media synchronization and Bunny.net logic.
    - `/scripts/deploy/`: Build and deployment orchestration.
    - `/scripts/processing/`: Asset processing and generation.
    - `/scripts/archive/`: Legacy patches and one-off fix scripts.
- **Action:** Any script identified as a "one-off patch" (e.g., `fix_h3.py`) will be archived. Useful tools will be centralized.

### 2. Versioning & Structure
- **Professional Standard:** The active production code (`index.html`, `style.css`, `portfolio.js`) remains at the root for Vercel compatibility.
- **Legacy Migration:** Redundant versions (`V1/`, `v2/`) will be moved to a `/legacy` directory.
- **Backward Compatibility:** `vercel.json` will be updated to ensure existing links to `/v1` continue to resolve correctly.

### 3. Data Unification
- **Source of Truth:** `site-content.json` (V3 schema) will be the sole data source.
- **Deprecation:** `content.json` will be deprecated and removed once its contents are verified as merged into `site-content.json`.
- **Logic Update:** Both `portfolio.js` and `admin/admin-v4.js` must be updated to reference `site-content.json` exclusively.

### 4. Privacy & Security
- **Privacy Gate:** `/Curriculum/private` remains the only specifically restricted directory mentioned. No other files require additional URL-level hiding beyond standard secret management (Phase 2).

## Code Context
- **Entry Points:** `index.html` (Portfolio), `admin/index.html` (Admin CMS).
- **Core Orchestrator:** `sync_bunny.py` (Must be updated to handle new paths).
- **Routing:** `vercel.json` (Critical for maintaining path mapping during refactor).

## Canonical Refs
- [PROJECT.md](../../PROJECT.md) — Vision and constraints.
- [REQUIREMENTS.md](../../REQUIREMENTS.md) — Specific success criteria.
- [vercel.json](../../../vercel.json) — Routing and environment config.
- [site-content.json](../../../site-content.json) — Unified data schema.

---
*Created: 2026-05-09*
