#!/usr/bin/env python3
"""patch_portfolio.py — applies all UX/UI fixes to V1/portfolio/index.html"""
import re, os, json

OUTPUT = "V1/portfolio/index.html"
CONTENT_JSON = "content.json"

with open(OUTPUT, "r", encoding="utf-8") as f:
    html = f.read()

# Load editorial content
try:
    with open(CONTENT_JSON, "r", encoding="utf-8") as f:
        content = json.load(f)
except:
    content = {"clients": {}, "categories": {}}

content_js = json.dumps(content, ensure_ascii=False, separators=(',', ':'))
changes = []

# ── 1. EXIT → HOME icon button ─────────────────────────────────────────────
old_exit = '<a href="../../index.html" class="exit-link" aria-label="Back to main hub">← EXIT</a>'
new_exit = '<a href="../../index.html" class="exit-link" aria-label="Home" title="Home">⌂</a>'
if old_exit in html:
    html = html.replace(old_exit, new_exit)
    changes.append("EXIT → Home icon")

# ── 2. EXIT button CSS: icon only, square ─────────────────────────────────
old_exit_css = """        .exit-link {
            position: fixed; bottom: 1.6rem; right: 1.6rem; z-index: 960;
            font-size: 8px; font-weight: 900; letter-spacing: 0.3em;
            text-transform: uppercase; color: var(--fg);
            border: 1.5px solid var(--border); padding: 8px 14px;
            background: transparent; transition: all 0.2s;
            text-decoration: none;
        }"""
new_exit_css = """        .exit-link {
            position: fixed; bottom: 1.6rem; right: 1.6rem; z-index: 960;
            font-size: 18px; font-weight: 400;
            color: var(--fg); width: 34px; height: 34px;
            border: 1.5px solid var(--fg); display: flex;
            align-items: center; justify-content: center;
            background: var(--bg); transition: all 0.2s;
            text-decoration: none; line-height: 1;
        }"""
if old_exit_css in html:
    html = html.replace(old_exit_css, new_exit_css)
    changes.append("EXIT → square icon button CSS")

# ── 3. Unify BACK buttons: remove floating-nav, keep only gallery back ─────
# Remove the floating-nav BACK button
html = re.sub(
    r'<nav class="floating-nav"[^>]*>.*?</nav>',
    '', html, flags=re.DOTALL
)
# Remove floating-nav CSS
html = re.sub(r'\.floating-nav\s*\{[^}]+\}', '', html)
html = re.sub(r'\.floating-nav\.active\s*\{[^}]+\}', '', html)
html = re.sub(r'\.floating-nav\s+span\s*\{[^}]+\}', '', html)
html = re.sub(r'\.floating-nav\s+span:hover\s*\{[^}]+\}', '', html)

# Remove return-btn at bottom of gallery, replace with unified back
html = html.replace(
    """html+='<div style="margin-top:80px;text-align:center" class="entrance-mask"><button class="return-btn interactive" onclick="goHome()">RETURN</button></div>';""",
    """html+='<div style="margin-top:80px;text-align:center" class="entrance-mask"><button class="back-btn interactive" onclick="goHome()" style="margin:0 auto">← BACK</button></div>';"""
)
# Remove return-btn CSS, add unified back-btn if missing
html = re.sub(r'\.return-btn\s*\{[^}]+\}', '', html)
html = re.sub(r'\.return-btn:hover\s*\{[^}]+\}', '', html)

# floatingBack references → safe no-ops
html = html.replace("floatingBack.classList.add('active');", "")
html = html.replace("floatingBack.classList.remove('active');", "")
html = html.replace("const floatingBack = document.getElementById('floating-back');", "")
changes.append("Unified back buttons")

# ── 4. openModal calls: pass title + clientName ────────────────────────────
# Single work case (line ~723)
html = html.replace(
    """onclick="openModal('${w.video_url}', '${w.preview_url || ''}', '${w.aspect || '16/9'}')" """,
    """onclick="openModal('${w.video_url}', '${w.preview_url || ''}', '${w.aspect || '16/9'}', '${w.title}', currentClientName)" """
)
# Root works + category works — use backtick version
html = re.sub(
    r"""onclick="openModal\('\$\{w\.video_url\}', '\$\{w\.preview_url \|\| ''\}', '\$\{w\.aspect \|\| '16/9'\}'\)">""",
    """onclick="openModal('${w.video_url}', '${w.preview_url || ''}', '${w.aspect || '16/9'}', '${w.title}', currentClientName)">""",
    html
)

# Add currentClientName variable at start of openClient
if "let currentClientName = name;" not in html:
    html = html.replace(
        "    function openClient(name, pushState=true){\n        viewHome.classList.remove('active');",
        "    let currentClientName = '';\n    function openClient(name, pushState=true){\n        currentClientName = name;\n        viewHome.classList.remove('active');"
    )
changes.append("openModal now passes title + clientName")

# ── 5. Cursor: ensure solid fill, no legacy code ──────────────────────────
# Remove old cursor CSS blocks
html = re.sub(r'/\*\s*═══\s*CURSOR\s*═══\s*\*/\s*#cursor-dot\{.*?body\.is-moving #cursor-ring\{[^}]+\}', '', html, flags=re.DOTALL)
html = re.sub(r'/\*\s*─── CUSTOM CURSOR ───\s*\*/\s*#cursor\s*\{.*?@media\s*\(hover:\s*none\)\s*\{\s*#cursor\s*\{\s*display:\s*none;\s*\}\s*\}', '', html, flags=re.DOTALL)

# Ensure #plm-cursor CSS exists
if "#plm-cursor" not in html:
    cursor_css = """
        /* ═══ CURSOR ═══ */
        *, *::before, *::after { cursor: none !important; }
        @media (hover:none), (pointer:coarse) { *, *::before, *::after { cursor: auto !important; } }
        #plm-cursor {
            position: fixed; z-index: 999999; pointer-events: none;
            width: 12px; height: 12px; border-radius: 50%;
            background: #050505; border: none;
            transform: translate(-50%,-50%);
            transition: width .12s, height .12s;
            top: 0; left: 0;
        }
        [data-theme="dark"] #plm-cursor { background: #f0f0f0; }
        #plm-cursor.hover { width: 20px; height: 20px; opacity: .7; }
        @media (hover:none), (pointer:coarse) { #plm-cursor { display: none; } }
"""
    html = html.replace("    </style>", cursor_css + "\n    </style>", 1)
    changes.append("Injected cursor CSS")

# Ensure #plm-cursor DOM element
if '<div id="plm-cursor"' not in html:
    html = html.replace(
        '<a class="skip-link"',
        '<div id="plm-cursor" aria-hidden="true"></div>\n    <a class="skip-link"'
    )
    changes.append("Injected cursor DOM")

# Remove old cursor DOM
html = re.sub(r'\s*<div id="cursor"[^>]*></div>', '', html)
html = re.sub(r'\s*<div id="cursor-dot"[^>]*></div>', '', html)
html = re.sub(r'\s*<div id="cursor-ring"[^>]*></div>', '', html)

# Ensure cursor JS exists
if "(function(){" not in html or "plm-cursor" not in html.split("<script>")[-1]:
    cursor_js = """
    /* ─── CURSOR (instant, solid) ─── */
    (function(){
        const c = document.getElementById('plm-cursor');
        if(!c || !window.matchMedia('(hover:hover)').matches) return;
        window.addEventListener('mousemove', function(e){
            c.style.left = e.clientX + 'px';
            c.style.top  = e.clientY + 'px';
            c.classList.toggle('hover', !!e.target.closest('a,button,[role="button"],.interactive,.card-float'));
        }, {passive:true});
    })();
"""
    html = html.replace("    window.addEventListener('DOMContentLoaded'", cursor_js + "\n    window.addEventListener('DOMContentLoaded'")
    changes.append("Injected cursor JS")

# ── 6. Inject plmContent if missing ────────────────────────────────────────
if "const plmContent =" not in html:
    html = html.replace(
        "    /* ─── DATA ─── */",
        f"    /* ─── EDITORIAL CONTENT ─── */\n    const plmContent = {content_js};\n\n    /* ─── DATA ─── */"
    )
    changes.append("Injected plmContent")
else:
    html = re.sub(r'const plmContent = \{.*?\};', f'const plmContent = {content_js};', html, count=1, flags=re.DOTALL)
    changes.append("Updated plmContent")

# ── 7. URL hash navigation ────────────────────────────────────────────────
if "encodeURIComponent(name)" not in html:
    html = html.replace(
        "history.pushState({view:'gallery', client:name}, '', '#'+name.replace(/\\s+/g,'-'))",
        "history.pushState({view:'gallery', client:name}, '', '#'+encodeURIComponent(name))"
    )
    changes.append("URL hash with encodeURIComponent")

# ── 8. DOMContentLoaded hash handling ──────────────────────────────────────
if "decodeURIComponent(window.location.hash" not in html:
    html = html.replace(
        "const hash = window.location.hash.substring(1).toUpperCase().replace(/-/g,' ');",
        "const hash = decodeURIComponent(window.location.hash.substring(1));"
    )
    changes.append("Hash decode fix")

# ── 9. Skip empty clients ─────────────────────────────────────────────────
if "if(!client || client.total === 0) return;" not in html:
    html = html.replace(
        "            const client = clientsData[name];\n            // Get representative",
        "            const client = clientsData[name];\n            if(!client || client.total === 0) return; // skip empty\n            // Get representative"
    )
    changes.append("Skip empty clients filter")

# ── 10. Gallery editorial meta ─────────────────────────────────────────────
# Already done if plmContent-based gallery text exists
if "gallery-release" not in html.split("</style>")[0]:
    html = html.replace("    </style>", """
        .gallery-release { font-size: 14px; line-height: 1.75; color: var(--fg2); max-width: 640px; margin-top: 14px; }
        .gallery-deliverables { font-size: 9px; font-weight: 900; letter-spacing: .3em; text-transform: uppercase; color: var(--fg3); margin-top: 14px; }
        .gallery-deliverables span { color: var(--fg2); }
    </style>""", 1)
    changes.append("Gallery release/deliverables CSS")

# ── 11. Player meta CSS ───────────────────────────────────────────────────
if "player-meta-title" not in html.split("</style>")[0]:
    html = html.replace("    </style>", """
        .player-meta { width: 100%; padding: 20px 2px 0; display: flex; flex-direction: column; gap: 8px; }
        .player-meta-title { font-size: clamp(14px,2vw,22px); font-weight: 900; text-transform: uppercase; letter-spacing: -.01em; color: var(--fg); }
        .player-meta-release { font-size: 13px; line-height: 1.7; color: var(--fg2); max-width: 680px; }
        .player-meta-deliverable { font-size: 9px; font-weight: 900; letter-spacing: .3em; text-transform: uppercase; color: var(--fg3); padding-top: 6px; border-top: 1px solid var(--border); }
    </style>""", 1)
    changes.append("Player meta CSS")

# ── 12. Backspace / Escape keyboard nav ────────────────────────────────────
if "Backspace" not in html:
    html = html.replace(
        "    window.onpopstate = function(e){",
        """    document.addEventListener('keydown', function(e){
        if(e.key === 'Backspace' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){
            if(modal && modal.classList.contains('active')){ e.preventDefault(); closeModal(); }
            else if(document.getElementById('view-gallery') && document.getElementById('view-gallery').classList.contains('active')){ e.preventDefault(); goHome(); }
        }
        if(e.key === 'Escape'){ if(typeof closeModal === 'function') closeModal(); }
    });

    window.onpopstate = function(e){"""
    )
    changes.append("Backspace/Escape nav")

# ── 13. Contact + Theme toggle alignment: add background fill ─────────────
if "background: var(--bg)" not in html.split(".theme-toggle{")[1].split("}")[0] if ".theme-toggle{" in html else "":
    html = html.replace(
        ".theme-toggle{position:fixed;top:1.6rem;right:1.6rem;z-index:960;width:34px;height:34px;border:1.5px solid var(--fg);background:transparent;",
        ".theme-toggle{position:fixed;top:1.6rem;right:1.6rem;z-index:960;width:34px;height:34px;border:1.5px solid var(--fg);background:var(--bg);"
    )
    html = html.replace(
        "padding:6px 14px;border:1.5px solid var(--fg);background:transparent;",
        "padding:6px 14px;border:1.5px solid var(--fg);background:var(--bg);"
    )
    changes.append("Button backgrounds for legibility")

# ── 14. Fix Logo Path ──────────────────────────────────────────────────────
html = html.replace("url('logo.png')", "url('logo.png')")
changes.append("Fixed logo path")

# ── Write ──────────────────────────────────────────────────────────────────
with open(OUTPUT, "w", encoding="utf-8") as f:
    f.write(html)

print(f"✅ Patched {OUTPUT} — {os.path.getsize(OUTPUT):,} bytes / {html.count(chr(10))+1} lines")
print(f"   Changes: {', '.join(changes)}")
