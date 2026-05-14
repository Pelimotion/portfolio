# Roadmap: Pelimotion Portfolio Refactor

## Milestone: v1.0 — Professionalization & Security

**Goal:** Transform the codebase into a secure, organized, and optimized professional project.

### Phase 1: Structural Cleanup & Script Consolidation
**Goal:** Clean the root directory and organize all automation tools.
- [ ] **Plan 1.1:** Create `/scripts` and move all `*.py` and `*.sh` files.
- [ ] **Plan 1.2:** Update all internal script references and `vercel.json` paths.
- [ ] **Plan 1.3:** Set up `requirements.txt` for Python dependencies.

### Phase 2: Security Hardening
**Goal:** Remove hardcoded secrets and implement proper environment configuration.
- [ ] **Plan 2.1:** Implement `.env` support in Python scripts and move Bunny.net keys.
- [ ] **Plan 2.2:** Update `.gitignore` and audit for any leaked secrets in history.
- [ ] **Plan 2.3:** Review admin panel authentication logic.

### Phase 3: Version Unification
**Goal:** Resolve the fragmentation between `V1/`, `v2/`, and the root application.
- [ ] **Plan 3.1:** Map differences between `V1/` and current root.
- [ ] **Plan 3.2:** Consolidate into a single stable production structure.
- [ ] **Plan 3.3:** Clean up redundant JSON files (`content.json` vs `site-content.json`).

### Phase 4: Optimization & Verification
**Goal:** Final polish and performance checks.
- [ ] **Plan 4.1:** Optimize JSON data loading in `portfolio.js`.
- [ ] **Plan 4.2:** Final audit of media delivery paths.
- [ ] **Plan 4.3:** Create project documentation (README.md).

---
*Roadmap established: 2026-05-09*
