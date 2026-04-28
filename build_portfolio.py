#!/usr/bin/env python3
"""
build_portfolio.py
─────────────────────────────────────────────────────────────────────────────
Copies index_backup_pre_hub_redesign.html to V1/portfolio/index.html
and applies minimal UX patches without touching the working player system.

Run this once to rebuild the file. After that, sync_bunny.py handles
all clientsData/clientDescriptions injection automatically on each deploy.
─────────────────────────────────────────────────────────────────────────────
"""
import os, re, shutil

SRC    = "index_backup_pre_hub_redesign.html"
OUTPUT = "index.html"

# ── 1. Read source ────────────────────────────────────────────────────────────
with open(SRC, "r", encoding="utf-8") as f:
    html = f.read()

# ── 2. Fix hero name: "Felipe / Conceição" → "PELIMOTION" ────────────────────
html = html.replace(
    '<div class="hero-name">Felipe<br>Conceição</div>',
    '<div class="hero-name">PELIMOTION</div>'
)

# ── 3. Restore left-panel hero overlay (split hero visual) ────────────────────
# The pre-hub backup has hero-overlay-left set to display:none.
# Restore it for the brutalist split look.
html = html.replace(
    '.hero-overlay-left{display:none}',
    '.hero-overlay-left{position:absolute;top:0;left:0;width:50%;height:100%;background:var(--bg);z-index:2;pointer-events:none;transition:background .4s}'
)

# ── 4. Add EXIT link (back to landing hub) if not present ────────────────────
exit_css = """
        /* ═══ EXIT LINK ═══ */
        .exit-link {
            position: fixed; bottom: 1.6rem; right: 1.6rem; z-index: 960;
            font-size: 8px; font-weight: 900; letter-spacing: 0.3em;
            text-transform: uppercase; color: var(--fg);
            border: 1.5px solid var(--border); padding: 8px 14px;
            background: transparent; transition: all 0.2s;
            text-decoration: none;
        }
        .exit-link:hover { background: var(--fg); color: var(--bg); }
        @media (max-width: 767px) { .exit-link { bottom: 4rem; right: 1rem; } }
"""
if '.exit-link' not in html:
    html = html.replace('    </style>', exit_css + '\n    </style>', 1)

exit_html = '\n    <a href="../../index.html" class="exit-link" aria-label="Back to main hub">← EXIT</a>'
if 'exit-link' not in html or exit_html.strip() not in html:
    html = html.replace(
        '<button class="theme-toggle',
        exit_html + '\n    <button class="theme-toggle',
        1
    )

# ── 5. Ensure sync_bunny.py regex can match the data block ───────────────────
# The pre-hub backup has clientsData + clientDescriptions + categoryDescriptions.
# sync_bunny.py regex must cover all three. Update it if needed (see sync_bunny.py).

# ── 6. Write output ───────────────────────────────────────────────────────────
with open(OUTPUT, "w", encoding="utf-8") as f:
    f.write(html)

size = os.path.getsize(OUTPUT)
lines = html.count('\n') + 1
print(f"✅ Built {OUTPUT}")
print(f"   Size : {size:,} bytes / {lines} lines")
print(f"   Source: {SRC}")
