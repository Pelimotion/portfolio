# Project: Pelimotion Portfolio Refactor

## What This Is
A high-end, brutalist-design portfolio for Pelimotion, featuring a vanilla JS frontend and an automated media management pipeline. The project is currently in a "brownfield" state with significant technical debt in terms of file organization, security (exposed credentials), and version fragmentation.

## Core Value
Professionalism through organization and security. The goal is to transform the codebase from a collection of ad-hoc scripts and fragmented versions into a clean, secure, and optimized professional production environment.

## Context
- **Target:** High-end clients looking for motion design/creative work.
- **Constraints:** Must maintain the "Vanilla" (no-framework) philosophy and the existing brutalist aesthetic.
- **Infrastructure:** Vercel (Hosting), Bunny.net (Media CDN).

## Requirements

### Validated
- ✓ Core Portfolio Rendering — existing vanilla JS engine works.
- ✓ Media Synchronization — `sync_bunny.py` correctly maps CDN assets to JSON.
- ✓ Brutalist UI — established design system and kinetic typography.
- ✓ Admin CMS — basic editing functionality is operational.

### Active
- [ ] **Structural Consolidation** — Move all utility/patch scripts to a `/scripts` or `/tools` directory.
- [ ] **Version Unification** — Standardize the project structure (resolving `V1/` and `v2/` fragmentation).
- [ ] **Security Hardening** — Remove hardcoded secrets and implement Environment Variables for Bunny.net keys.
- [ ] **Privacy Guarding** — Ensure sensitive paths and data are protected (specifically `/curriculum/private` and internal JSON structures).
- [ ] **Optimization** — Improve asset loading and script execution efficiency.

### Out of Scope
- [ ] Full Rewrite in Framework (React/Next.js) — The user explicitly wants to maintain the current stack/philosophy.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| **Script Consolidation** | Cluttered root directory makes maintenance difficult and error-prone. | — Pending |
| **Env Var Migration** | Hardcoded API keys in `sync_bunny.py` are a critical security risk. | — Pending |
| **Professional Refactor** | Professionalizing the structure ensures long-term scalability. | — Pending |

---
*Last updated: 2026-05-09 after initialization*
