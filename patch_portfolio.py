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

# ── 1. CURSOR: remove old CSS + inject solid-fill no-lag cursor ───────────────
# Remove duplicate cursor CSS blocks (keep only one)
html = re.sub(r'/\* .*?CURSOR.*?\*/.*?@media \(hover: none\) \{ #cursor \{ display: none; \} \}',
              '', html, flags=re.DOTALL)
# Remove #cursor-dot / #cursor-ring legacy CSS
html = re.sub(r'#cursor-dot\{[^}]+\}\s*#cursor-ring\{[^}]+\}\s*body\.is-hovering[^}]+\}\s*body\.is-hovering[^}]+\}\s*body\.is-moving[^}]+\}', '', html)
# Remove #plm-cursor block if already added
html = re.sub(r'/\* ═══ CUSTOM CURSOR.*?coarse\) \{ #plm-cursor \{ display: none; \} \}', '', html, flags=re.DOTALL)

cursor_css = """
        /* ═══ CURSOR ═══ */
        *, *::before, *::after { cursor: none !important; }
        @media (hover:none), (pointer:coarse) { *, *::before, *::after { cursor: auto !important; } }
        #plm-cursor {
            position: fixed; z-index: 999999; pointer-events: none;
            width: 12px; height: 12px; border-radius: 50%;
            background: #050505;
            border: none;
            transform: translate(-50%,-50%);
            transition: width .12s, height .12s;
            top: 0; left: 0;
        }
        [data-theme="dark"] #plm-cursor { background: #f0f0f0; }
        #plm-cursor.hover { width: 20px; height: 20px; opacity: .7; }
        @media (hover:none), (pointer:coarse) { #plm-cursor { display: none; } }
"""
html = html.replace("    </style>", cursor_css + "\n    </style>", 1)

# ── 2. CURSOR: remove old cursor DOM elements, add #plm-cursor ───────────────
html = re.sub(r'\s*<div id="cursor"[^>]*></div>', '', html)
html = re.sub(r'\s*<div id="cursor-dot"[^>]*></div>', '', html)
html = re.sub(r'\s*<div id="cursor-ring"[^>]*></div>', '', html)
html = re.sub(r'\s*<div id="plm-cursor"[^>]*></div>', '', html)  # remove if already there
# Add after <svg aria-hidden>
html = html.replace(
    '</svg>\n    <a class="skip-link"',
    '</svg>\n    <div id="plm-cursor" aria-hidden="true"></div>\n    <a class="skip-link"'
)

# ── 3. CURSOR: replace all old cursor JS with simple instant version ──────────
old_cursor_blocks = [
    re.compile(r'/\* ─── SIMPLE RING CURSOR ─── \*/.*?\}\)\(\);', re.DOTALL),
    re.compile(r'/\* ─── CUSTOM CURSOR ─── \*/.*?animCursor\(\);[\s\n]*\}', re.DOTALL),
    re.compile(r'if\(!.*?ontouchstart.*?animCursor\(\);\s*\}', re.DOTALL),
]
for pat in old_cursor_blocks:
    html = pat.sub('', html)

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
# Remove stale const cursor refs
html = html.replace("    const cursor = document.getElementById('cursor');\n", "")
# Inject cursor JS before closing script
html = html.replace("    /* ─── CELLULAR AUTOMATA ─── */", cursor_js + "\n    /* ─── CELLULAR AUTOMATA ─── */", 1)

# ── 4. MODAL: full player rewrite CSS ────────────────────────────────────────
old_modal_css = re.compile(
    r'/\* ─── MODAL PLAYER REFINEMENT ─── \*/.*?\.medium-player \{.*?\}',
    re.DOTALL
)
new_modal_css = """/* ─── MODAL PLAYER (v2) ─── */
        #modal {
            display: none; position: fixed; inset: 0; z-index: 10000;
            background: var(--modal-bg);
            flex-direction: column; align-items: center; justify-content: center;
            opacity: 0; transition: opacity .25s;
            padding: 0;
        }
        #modal.active { display: flex; opacity: 1; }
        .modal-inner {
            display: flex; flex-direction: column; align-items: center;
            width: 92vw; max-width: 1400px;
            max-height: 96vh; overflow-y: auto;
        }
        .player-outer {
            position: relative; width: 100%;
        }
        .player-container {
            position: relative; width: 100%; background: #000;
            overflow: hidden;
        }
        .player-container video {
            display: block; width: 100%; height: auto;
            max-height: 72vh; object-fit: contain;
        }
        /* Controls bar */
        .player-controls {
            display: flex; align-items: center; gap: 12px;
            padding: 10px 16px; background: var(--bg);
            border: 1.5px solid var(--fg); border-top: none;
        }
        .play-btn {
            background: none; border: none; color: var(--fg); font-weight: 900;
            font-size: 11px; letter-spacing: .15em; cursor: pointer; font-family: inherit;
            padding: 4px 0; flex-shrink: 0;
        }
        .player-seek {
            flex: 1; height: 4px; background: rgba(128,128,128,.25);
            position: relative; cursor: pointer; border-radius: 2px;
        }
        .player-seek-fill {
            position: absolute; top: 0; left: 0; height: 100%;
            background: var(--fg); pointer-events: none; border-radius: 2px;
        }
        #player-time {
            font-size: 9px; font-weight: 700; letter-spacing: .1em; color: var(--fg2); flex-shrink: 0;
        }
        .player-hd-toggle {
            font-size: 9px; font-weight: 900; padding: 3px 9px;
            background: none; color: var(--fg); border: 1.2px solid var(--fg2);
            cursor: pointer; text-transform: uppercase; font-family: inherit; flex-shrink: 0;
        }
        .player-hd-toggle.active { background: var(--fg); color: var(--bg); border-color: var(--fg); }
        /* Close btn */
        .close-modal {
            position: absolute; top: 20px; right: 20px; z-index: 10010;
            font-size: 9px; font-weight: 900; letter-spacing: .3em; text-transform: uppercase;
            color: var(--fg); background: var(--bg); border: 1.5px solid var(--fg);
            padding: 8px 16px; cursor: pointer; font-family: inherit;
            transition: background .2s, color .2s;
        }
        .close-modal:hover { background: var(--fg); color: var(--bg); }
        /* Video meta below player */
        .player-meta {
            width: 100%; padding: 20px 2px 0; display: flex; flex-direction: column; gap: 8px;
        }
        .player-meta-title {
            font-size: clamp(14px,2vw,22px); font-weight: 900; text-transform: uppercase;
            letter-spacing: -.01em; color: var(--fg);
        }
        .player-meta-release {
            font-size: 13px; line-height: 1.7; color: var(--fg2); max-width: 680px;
        }
        .player-meta-deliverable {
            font-size: 9px; font-weight: 900; letter-spacing: .3em; text-transform: uppercase;
            color: var(--fg3); padding-top: 6px; border-top: 1px solid var(--border);
        }
        /* Loader */
        .player-loader {
            position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
            background: #000; z-index: 5; transition: opacity .3s; pointer-events: none;
        }
        .player-loader.hidden { opacity: 0; pointer-events: none; }
        .spinner { width: 32px; height: 32px; border: 2px solid rgba(255,255,255,.15); border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        /* Single work inline player */
        .medium-player { width: 100%; border: 1.5px solid var(--fg); margin-bottom: 20px; cursor: zoom-in; position: relative; }"""
html = old_modal_css.sub(new_modal_css, html)

# ── 5. Skip empty clients ────────────────────────────────────────────────────
if "if(!client || client.total === 0) return;" not in html:
    html = html.replace(
        "            const client = clientsData[name];\n            // Get representative",
        "            const client = clientsData[name];\n            if(!client || client.total === 0) return; // skip empty clients\n            // Get representative"
    )

# ── 6. Inject content.json data as JS const ──────────────────────────────────
if "const plmContent =" not in html:
    html = html.replace(
        "    /* ─── DATA ─── */",
        f"    /* ─── EDITORIAL CONTENT ─── */\n    const plmContent = {content_js};\n\n    /* ─── DATA ─── */"
    )
else:
    html = re.sub(r'const plmContent = \{.*?\};', f'const plmContent = {content_js};', html, flags=re.DOTALL)

# ── 7. URL hash: openClient pushes #client-name ──────────────────────────────
# Already has pushState — update the hash format
html = html.replace(
    "history.pushState({view:'gallery', client:name}, '', '#'+name.replace(/\\s+/g,'-'))",
    "history.pushState({view:'gallery', client:name}, '', '#'+encodeURIComponent(name))"
)
# Fix popstate restore
html = html.replace(
    "const hash = window.location.hash.substring(1).toUpperCase().replace(/-/g,' ');",
    "const hash = decodeURIComponent(window.location.hash.substring(1));"
)
html = html.replace(
    "if(hash && clientsData[hash]) setTimeout(()=>openClient(hash, false), 600);",
    "if(hash && clientsData[hash]) setTimeout(()=>openClient(hash, false), 200);"
)

# ── 8. Gallery: show release + deliverables from plmContent ──────────────────
OLD_GALLERY_META = "        if(clientDescriptions[name])html+='<p class=\"gallery-desc\">'+clientDescriptions[name]+'</p>';"
NEW_GALLERY_META = """        const _cContent = (plmContent.clients && plmContent.clients[name]) || {};
        if(_cContent.description || clientDescriptions[name])
            html+='<p class="gallery-desc">'+(_cContent.description || clientDescriptions[name])+'</p>';
        if(_cContent.release)
            html+='<p class="gallery-release">'+_cContent.release+'</p>';
        if(_cContent.deliverables && _cContent.deliverables.length)
            html+='<p class="gallery-deliverables"><span>DELIVERABLES</span> '+_cContent.deliverables.join(' &middot; ')+'</p>';"""
if OLD_GALLERY_META in html:
    html = html.replace(OLD_GALLERY_META, NEW_GALLERY_META)

# ── 9. Category sections: release + deliverables ─────────────────────────────
OLD_CAT_DESC = "                if(categoryDescriptions[cat])html+='<p class=\"category-desc\">'+categoryDescriptions[cat]+'</p>';"
NEW_CAT_DESC = """                const _catC = (plmContent.categories && plmContent.categories[cat]) || {};
                const _catDesc = (_catC.description || categoryDescriptions[cat] || '');
                if(_catDesc) html+='<p class="category-desc">'+_catDesc+'</p>';
                if(_catC.release) html+='<p class="gallery-release" style="margin-bottom:12px">'+_catC.release+'</p>';
                if(_catC.deliverables && _catC.deliverables.length)
                    html+='<p class="gallery-deliverables"><span>DELIVERABLES</span> '+_catC.deliverables.join(' &middot; ')+'</p>';"""
if OLD_CAT_DESC in html:
    html = html.replace(OLD_CAT_DESC, NEW_CAT_DESC)

# ── 10. openModal: pass title + clientName so player shows meta ───────────────
# Update openModal calls in gallery to include title and clientName
html = re.sub(
    r"onclick=\"openModal\('(\$\{w\.video_url\})', '(\$\{w\.preview_url[^']*\})', '(\$\{w\.aspect[^']*\})'\)\"",
    r"onclick=\"openModal('\1','\2','\3',\`\${w.title}\`,name)\"",
    html
)

# ── 11. openModal function: rewrite to use new CSS + meta ────────────────────
old_open_modal = re.compile(r"function openModal\(hdUrl, previewUrl, aspect\)\{.*?setTimeout\(\(\)=>modal\.classList\.add\('active'\),10\);", re.DOTALL)

new_open_modal = r"""function openModal(hdUrl, previewUrl, aspect, title, clientName){
        currentVideoData = { hd: hdUrl, preview: previewUrl || hdUrl };
        const asp = aspect || '16/9';

        // Infer deliverable from category context or content.json
        const _wc = (plmContent.clients && plmContent.clients[clientName]) || {};
        const _deliverable = (_wc.deliverables && _wc.deliverables[0]) ? _wc.deliverables.join(' · ') : '';
        const _release = _wc.release || '';
        const _vtitle = (title || '').replace(/'/g,"'");

        modal.style.display='flex';
        modalContent.innerHTML=`
            <div class="modal-inner">
                <div class="player-outer" style="aspect-ratio:${asp}">
                    <div class="player-container" style="aspect-ratio:${asp}">
                        <div class="player-loader" id="modal-loader"><div class="spinner"></div></div>
                        <video id="modal-video" autoplay playsinline style="aspect-ratio:${asp};max-height:72vh">
                            <source src="${hdUrl}" type="video/mp4">
                        </video>
                    </div>
                    <div class="player-controls">
                        <button class="play-btn" id="player-play-pause">PAUSE</button>
                        <div class="player-seek" id="player-seek-bar"><div class="player-seek-fill" id="player-seek-fill"></div></div>
                        <span id="player-time">0:00 / 0:00</span>
                        <button class="player-hd-toggle active" id="hd-toggle" onclick="toggleHD()">HD</button>
                    </div>
                </div>
                <div class="player-meta">
                    ${_vtitle ? '<div class="player-meta-title">'+_vtitle+'</div>' : ''}
                    ${_release ? '<p class="player-meta-release">'+_release+'</p>' : ''}
                    ${_deliverable ? '<p class="player-meta-deliverable">Deliverable: '+_deliverable+'</p>' : ''}
                </div>
            </div>`;

        setTimeout(()=>modal.classList.add('active'),10);"""
if old_open_modal.search(html):
    html = old_open_modal.sub(new_open_modal, html, count=1)

# ── 12. Backspace closes modal ───────────────────────────────────────────────
if "Backspace" not in html:
    html = html.replace(
        "    window.onpopstate = function(e){",
        """    document.addEventListener('keydown', function(e){
        if(e.key === 'Backspace' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){
            if(modal && modal.classList.contains('active')){ e.preventDefault(); closeModal(); }
            else if(document.getElementById('view-gallery') && document.getElementById('view-gallery').classList.contains('active')){ e.preventDefault(); goHome(); }
        }
        if(e.key === 'Escape'){ closeModal && closeModal(); }
    });

    window.onpopstate = function(e){"""
    )

# ── 13. CSS for gallery-release + gallery-deliverables ───────────────────────
if "gallery-release" not in html:
    html = html.replace("    </style>", """
        .gallery-release { font-size: 14px; line-height: 1.75; color: var(--fg2); max-width: 640px; margin-top: 14px; }
        .gallery-deliverables { font-size: 9px; font-weight: 900; letter-spacing: .3em; text-transform: uppercase; color: var(--fg3); margin-top: 14px; }
        .gallery-deliverables span { color: var(--fg2); }
    </style>""", 1)

# ── 14. Fix Wolfgarten: sync_bunny uses 'WOLFEGARTEN' path (typo in CDN) ──────
# Already mapped in data — just make sure empty-client filter works (done in step 5)

# ── 15. Stagger grid, card sizes ─────────────────────────────────────────────
if "card-size-lg" not in html:
    html = html.replace("    </style>", """
        .grid-brutal { grid-template-columns: repeat(2,1fr) !important; align-items: start; }
        @media(max-width:767px){ .grid-brutal { grid-template-columns: 1fr !important; } }
        .grid-brutal > :nth-child(even) { margin-top: 8vw; }
        .card-size-lg .client-card-img-wrap { aspect-ratio: 4/3; }
        .card-size-md .client-card-img-wrap { aspect-ratio: 1/1; }
        .card-size-tall .client-card-img-wrap { aspect-ratio: 3/4; }
    </style>""", 1)

# ── 16. Add DOMContentLoaded init if missing ─────────────────────────────────
if "DOMContentLoaded" not in html:
    html = html.replace(
        "    </script>\n</body>",
        """    window.addEventListener('DOMContentLoaded', function(){
        renderHome();
        const _h = decodeURIComponent(window.location.hash.substring(1));
        if(_h && clientsData[_h]) setTimeout(()=>openClient(_h,false),200);
    });
    </script>\n</body>"""
    )
# Remove premature setTimeout(renderHome) call
html = html.replace(
    "    // Call renderHome after data is loaded (which is hardcoded for now, but script updates it)\n    setTimeout(renderHome, 100);", ""
)
html = html.replace("    setTimeout(renderHome, 100);\n", "")

# ── Write ──────────────────────────────────────────────────────────────────────
with open(OUTPUT, "w", encoding="utf-8") as f:
    f.write(html)

print(f"✅ Patched {OUTPUT} — {os.path.getsize(OUTPUT):,} bytes / {html.count(chr(10))+1} lines")
