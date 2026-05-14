# Requirements: Pelimotion Portfolio Refactor

## 1. Structural Organization
- [ ] **[REQ-01] Script Centralization:** All Python scripts (`*.py`) and Shell scripts (`*.sh`) currently in the root must be moved to a `/scripts` directory.
- [ ] **[REQ-02] Path Updating:** All references to moved scripts (in `package.json`, `vercel.json`, or other scripts) must be updated to use the new paths.
- [ ] **[REQ-03] Version Cleanup:** Analyze and merge `V1/` and `v2/` into a single, clean production structure. Remove redundant legacy files.
- [ ] **[REQ-04] Dependency Management:** Create a `requirements.txt` for the Python automation layer.

## 2. Security & Privacy
- [ ] **[REQ-05] Secret Management:** Move the Bunny.net `API_KEY` from `sync_bunny.py` and other scripts to environment variables.
- [ ] **[REQ-06] Local Security:** Ensure the `.env` file and other sensitive configurations are added to `.gitignore`.
- [ ] **[REQ-07] Privacy Gates:** Verify that the `private/` folder in `Curriculum` is correctly protected via `vercel.json` or other access control methods.
- [ ] **[REQ-08] Admin Hardening:** Review and propose improvements for the admin panel's authentication to ensure it cannot be bypassed client-side.

## 3. Optimization
- [ ] **[REQ-09] Media Delivery:** Audit the media playback system to ensure it utilizes Bunny.net's optimized CDN paths and doesn't cause browser bottlenecks.
- [ ] **[REQ-10] Payload Reduction:** Optimize the size of `site-content.json` or implement a strategy to avoid loading the entire dataset on initial mount.
- [ ] **[REQ-11] Code Cleanup:** Remove unused "patch" files once their logic is consolidated or no longer needed.

## 4. Documentation
- [ ] **[REQ-12] Developer Guide:** Create a `README.md` that explains the new organized structure and how to run the synchronization/deploy workflows.

---
*Requirements frozen: 2026-05-09*
