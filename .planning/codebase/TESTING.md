# Testing Patterns

**Analysis Date:** 2026-05-09

## Test Infrastructure

**Runner:**
- No formal test runner (e.g., Jest, Pytest) is configured.
- Testing is performed via custom Python and JavaScript scripts.

**Validation Commands:**
```bash
python3 check_js_error.py      # Scans JS files for common errors
python3 test_bunny.py          # Verifies connection to Bunny.net Storage API
python3 check_broken.py        # Checks for broken links or missing assets
```

## Testing File Organization

**Location:**
- Test scripts are located in the project root.
- No dedicated `tests/` directory.

**Naming:**
- `check_*.py` - Validation and integrity scripts.
- `test_*.py` - Connectivity and API verification scripts.

## Test Types

**Manual UAT (User Acceptance Testing):**
- The primary method of verification for frontend changes.
- Involves manual navigation through the portfolio and admin panel to ensure rendering and logic correctness.

**Data Integrity Tests:**
- Scripts like `sync_bunny.py` include validation logic to ensure that media objects in `site-content.json` contain the required fields (URLs, posters, mosaics).

**Connectivity Tests:**
- `test_bunny.py` and `test_xattr.py` verify that the local environment can successfully interact with external services and the filesystem.

**Deployment Verification:**
- Manual verification of the live site on Vercel after running `watch_and_deploy.sh`.

## Common Patterns

**Media Verification:**
- The `detect_format()` and `clean_title()` functions in `sync_bunny.py` act as a form of unit-tested logic for asset normalization.

**Error Scanning:**
- `check_js_error.py` likely scans for common syntax errors or unresolved variable references in the vanilla JS codebase.

---

*Testing analysis: 2026-05-09*
*Update when formal testing is implemented*
