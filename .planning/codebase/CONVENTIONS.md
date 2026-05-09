# Coding Conventions

**Analysis Date:** 2026-05-09

## Language-Specific Conventions

### JavaScript (Frontend)
-   **Style:** Vanilla JavaScript (ES6+). No frameworks or bundlers.
-   **Structure:** Logic is often contained in single, large files (e.g., `portfolio.js`, `admin-v4.js`) or small functional modules.
-   **Global Scope:** Functions are frequently attached to the `window` object to ensure visibility across different scripts and the admin panel.
-   **Asynchrony:** Heavy use of `async/await` for fetching JSON data and interacting with media assets.
-   **DOM Manipulation:** Direct use of `document.querySelector` and template literals for dynamic rendering.

### CSS
-   **Aesthetic:** Brutalist/Minimalist.
-   **Theming:** Extensive use of CSS Variables (Custom Properties) for light/dark mode and brand colors.
-   **Selectors:** Primarily class-based. Uses a mix of utility-first classes and component-specific styles.
-   **Animations:** Focus on high-performance CSS transitions and clip-path animations.

### Python (Automation)
-   **Style:** Procedural script style.
-   **Naming:** `snake_case` for functions and variables; `UPPER_CASE` for constants (e.g., `API_KEY`).
-   **Structure:** Scripts follow the `if __name__ == "__main__":` pattern for direct execution.
-   **Error Handling:** Basic `try/except` blocks with descriptive print statements for debugging.
-   **Dependencies:** Prefer built-in libraries (e.g., `urllib.request`, `json`, `re`) to minimize environment setup.

## General Patterns

-   **Manual Scripting:** Many tasks (patching, deployments, fixes) are handled by specialized one-off Python scripts rather than a monolithic build tool.
-   **Data Consistency:** `site-content.json` is treated as the source of truth, but `content.json` is maintained for legacy compatibility.
-   **Media Optimization:** Naming conventions for media are strict to allow for automated processing (e.g., `_preview.mp4` for video previews, `_50.jpg` for posters).

## Naming Conventions

**Files:**
-   `portfolio.js`, `theme.js`, `style.css` (Standard frontend files).
-   `admin-v4.js` (Versioned admin logic).
-   `sync_bunny.py`, `generate_portfolio.py` (Action-oriented script names).

**Directories:**
-   `V1/`, `v2/` (Versioned application directories).
-   `Curriculum/` (Title-case feature directory).

---

*Conventions analysis: 2026-05-09*
*Update when coding standards evolve*
