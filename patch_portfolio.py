#!/usr/bin/env python3
"""
patch_portfolio.py
─────────────────────────────────────────────────────────────────────────────
Applies all pending UX/UI fixes to V1/portfolio/index.html in-place.
Run after build_portfolio.py + sync_bunny.py.
─────────────────────────────────────────────────────────────────────────────
"""
import re, os

OUTPUT = "V1/portfolio/index.html"

with open(OUTPUT, "r", encoding="utf-8") as f:
    html = f.read()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FIX 1: Move setTimeout(renderHome) AFTER the data declarations
#         The data consts are at ~line 658; renderHome is called at ~line 656.
#         Just change the call to run after DOM is ready at end of <script>.
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Remove the premature call
html = html.replace(
    "    // Call renderHome after data is loaded (which is hardcoded for now, but script updates it)\n    setTimeout(renderHome, 100);",
    "    // renderHome is called at end of script after data consts are declared"
)
# Insert a reliable call just before </script>
html = html.replace(
    "    </script>\n</body>",
    "    // ── Init ─────────────────────────────────────────\n    window.addEventListener('DOMContentLoaded', function(){\n        renderHome();\n        const hash = window.location.hash.substring(1).toUpperCase().replace(/-/g,' ');\n        if(hash && clientsData[hash]) setTimeout(()=>openClient(hash, false), 600);\n    });\n    </script>\n</body>"
)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FIX 2: Skip empty clients (total === 0) in renderHome
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
html = html.replace(
    "        Object.keys(clientsData).forEach(name => {\n            const client = clientsData[name];\n            // Get representative work (first from root or first category)",
    "        Object.keys(clientsData).forEach(name => {\n            const client = clientsData[name];\n            if(!client || client.total === 0) return; // skip empty clients\n            // Get representative work (first from root or first category)"
)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FIX 3: Staggered parallax sizes in renderHome — 3 card size variants
#         plus data-speed for parallax
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
old_card_open = """            html += `
                <div role="listitem" class="card-float interactive entrance-mask" onclick="openClient('${name}')" tabindex="0">"""
new_card_open = """            const cardSizes = ['card-size-lg','card-size-md','card-size-tall'];
            const cardSpeeds = ['-0.5','0.4','-0.3','0.45','-0.4','0.35','-0.45','0.3'];
            const cardIdx = Object.keys(clientsData).filter(k=>clientsData[k].total>0).indexOf(name);
            const szCls = cardSizes[cardIdx % cardSizes.length];
            const spd   = cardSpeeds[cardIdx % cardSpeeds.length];
            html += `
                <div role="listitem" class="card-float ${szCls} interactive entrance-mask" data-speed="${spd}" onclick="openClient('${name}')" tabindex="0">"""
html = html.replace(old_card_open, new_card_open, 1)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FIX 4: Add card-size CSS + parallax CSS + grid stagger + cursor CSS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
extra_css = """
        /* ═══ CARD SIZE VARIANTS (staggered grid) ═══ */
        .grid-brutal { grid-template-columns: repeat(2,1fr); align-items: start; }
        @media(max-width:767px) { .grid-brutal { grid-template-columns: 1fr; } }
        .grid-brutal > :nth-child(even) { margin-top: 8vw; }
        .card-size-lg .client-card-img-wrap { aspect-ratio: 4/3; }
        .card-size-md .client-card-img-wrap { aspect-ratio: 1/1; }
        .card-size-tall .client-card-img-wrap { aspect-ratio: 3/4; }

        /* ═══ PARALLAX CARD ═══ */
        .card-float { will-change: transform; transition: box-shadow 0.3s; }
        .card-float:hover { box-shadow: 0 20px 60px rgba(0,0,0,0.12); }

        /* ═══ CUSTOM CURSOR (simple ring, always visible) ═══ */
        *, *::before, *::after { cursor: none !important; }
        @media(hover:none),(pointer:coarse) { *, *::before, *::after { cursor: auto !important; } }
        #plm-cursor {
            position: fixed; top: 0; left: 0; z-index: 99999; pointer-events: none;
            width: 20px; height: 20px; border: 1.5px solid var(--fg); border-radius: 50%;
            transform: translate(-50%,-50%);
            transition: transform 0.08s linear, width 0.15s, height 0.15s, background 0.15s, border-color 0.15s;
            mix-blend-mode: difference;
        }
        #plm-cursor.hover {
            width: 36px; height: 36px; background: rgba(255,255,255,0.08);
        }
        @media(hover:none),(pointer:coarse) { #plm-cursor { display: none; } }

        /* ═══ HEADER BUTTONS (CONTACT + THEME) protected legibility ═══ */
        .header-actions {
            position: fixed; top: 1.4rem; right: 1.4rem; z-index: 960;
            display: flex; align-items: center; gap: 8px;
        }
        .header-actions .theme-toggle,
        .header-actions .contact-trigger {
            position: static !important; top: auto !important; right: auto !important;
            height: 34px; display: flex; align-items: center; justify-content: center;
            backdrop-filter: blur(8px);
            background: rgba(var(--bg-rgb, 245,245,245), 0.82) !important;
        }
        [data-theme="dark"] .header-actions .theme-toggle,
        [data-theme="dark"] .header-actions .contact-trigger {
            background: rgba(8,8,8,0.82) !important;
        }

        /* ═══ BACK BUTTON (single, animated) ═══ */
        .floating-nav {
            transition: opacity 0.4s, transform 0.4s, background 0.2s, color 0.2s !important;
        }
        .floating-nav:hover { background: var(--fg) !important; color: var(--bg) !important; }
        .floating-nav span::before { content: '←  '; }
        /* Hide the secondary RETURN button (we unify to floating-nav) */
        .return-btn { display: none !important; }

        /* ═══ SINGLE WORK / PLAYER PAGE ═══ */
        .single-work-container {
            max-width: 900px; margin: 0 auto;
        }
        .single-work-desc {
            margin-top: 20px; padding: 0 4px;
            font-size: 13px; line-height: 1.7; color: var(--fg2);
            max-width: 680px;
        }
        .single-work-title-lg {
            font-size: clamp(16px, 2vw, 22px); font-weight: 900;
            text-transform: uppercase; letter-spacing: 0.05em; color: var(--fg);
            margin-bottom: 8px;
        }

        /* ═══ WORK CARD ASPECT RATIO ═══ */
        .client-card-img-wrap.vertical { aspect-ratio: 9/16; }
        .client-card-img-wrap.wide     { aspect-ratio: 21/9; }
        .client-card-img-wrap.square   { aspect-ratio: 1/1;  }
        .client-card-img-wrap.default  { aspect-ratio: 16/9; }

        /* ═══ FOOTER ═══ */
        .plm-footer {
            border-top: 1.5px solid var(--border);
            padding: 10vw 96px 6vw;
            display: flex; flex-direction: column; gap: 64px;
        }
        @media(max-width:1100px){ .plm-footer { padding: 10vw 60px 6vw; } }
        @media(max-width:767px){ .plm-footer { padding: 80px 20px 60px; gap: 48px; } }

        .footer-statement {
            font-family: 'Space Grotesk', 'Helvetica Neue', sans-serif;
            font-size: clamp(22px, 4vw, 52px);
            font-weight: 700; letter-spacing: -0.02em; line-height: 1.15;
            color: var(--fg); max-width: 800px;
        }
        .footer-contacts {
            display: flex; flex-direction: column; gap: 16px;
        }
        .footer-contact-label {
            font-size: 8px; font-weight: 900; letter-spacing: 0.5em;
            text-transform: uppercase; color: var(--fg3);
            margin-bottom: 4px;
        }
        .footer-contact-email {
            font-size: 12px; font-weight: 700; letter-spacing: 0.1em;
            text-transform: uppercase; color: var(--fg);
            text-decoration: none; transition: opacity 0.2s;
            display: inline-block; margin-bottom: 16px;
        }
        .footer-contact-email:hover { opacity: 0.5; }
        .footer-social {
            display: flex; flex-wrap: wrap; gap: 12px; align-items: center;
        }
        .footer-social-link {
            font-size: 9px; font-weight: 900; letter-spacing: 0.35em;
            text-transform: uppercase; color: var(--fg);
            text-decoration: none; border: 1.5px solid var(--border);
            padding: 7px 16px;
            transition: background 0.2s, color 0.2s, border-color 0.2s;
        }
        .footer-social-link:hover { background: var(--fg); color: var(--bg); border-color: var(--fg); }
        .footer-divider {
            border: none; border-top: 1.5px solid var(--border); margin: 0;
        }
        .footer-tagline {
            font-size: 9px; font-weight: 900; letter-spacing: 0.45em;
            text-transform: uppercase; color: var(--fg3);
            padding-bottom: 4px;
        }
"""

# Insert before closing </style>
html = html.replace("    </style>", extra_css + "\n    </style>", 1)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FIX 5: Wrap CONTACT + THEME toggle in .header-actions div
#         and remove standalone positioning
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
old_buttons = """    <button class="theme-toggle interactive" onclick="toggleTheme()" aria-label="Toggle light/dark mode">◧</button>
    <button class="contact-trigger interactive" id="contact-btn" onclick="toggleContact()" aria-label="Contact">CONTACT</button>"""
new_buttons = """    <div class="header-actions">
        <button class="contact-trigger interactive" id="contact-btn" onclick="toggleContact()" aria-label="Contact">CONTACT</button>
        <button class="theme-toggle interactive" onclick="toggleTheme()" aria-label="Toggle light/dark mode">◧</button>
    </div>"""
if old_buttons in html:
    html = html.replace(old_buttons, new_buttons, 1)
else:
    # Try alternate ordering
    alt = """    <button class="contact-trigger interactive" id="contact-btn" onclick="toggleContact()" aria-label="Contact">CONTACT</button>
    <button class="theme-toggle interactive" onclick="toggleTheme()" aria-label="Toggle light/dark mode">◧</button>"""
    html = html.replace(alt, new_buttons, 1)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FIX 6: Replace the complex old cursor HTML/JS with the simple ring cursor
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Remove old cursor div
html = html.replace('    <div id="cursor"></div>\n', '')

# Add simple cursor div after <body>
html = html.replace(
    '</svg>\n    <a class="skip-link"',
    '</svg>\n    <div id="plm-cursor" aria-hidden="true"></div>\n    <a class="skip-link"'
)

# Replace old cursor JS block
old_cursor_js = """    /* ─── CUSTOM CURSOR ─── */
    if(!('ontouchstart' in window)){
        let mouseX = 0, mouseY = 0;
        let curX = 0, curY = 0;
        window.addEventListener('mousemove', e => {
            mouseX = e.clientX; mouseY = e.clientY;
            if(e.target.closest('.interactive')) cursor.classList.add('hover');
            else cursor.classList.remove('hover');
        });
        function animCursor(){
            curX += (mouseX - curX) * 0.2;
            curY += (mouseY - curY) * 0.2;
            cursor.style.left = curX + 'px';
            cursor.style.top = curY + 'px';
            requestAnimationFrame(animCursor);
        }
        animCursor();
    }"""
new_cursor_js = """    /* ─── SIMPLE RING CURSOR ─── */
    (function(){
        const c = document.getElementById('plm-cursor');
        if(!c || window.matchMedia('(hover:none)').matches) return;
        let mx=0, my=0, cx=0, cy=0, raf;
        window.addEventListener('mousemove', e=>{
            mx = e.clientX; my = e.clientY;
            c.classList.toggle('hover', !!e.target.closest('a,button,[role="button"],.interactive'));
        }, {passive:true});
        (function tick(){
            cx += (mx-cx)*0.18; cy += (my-cy)*0.18;
            c.style.left = cx+'px'; c.style.top = cy+'px';
            requestAnimationFrame(tick);
        })();
    })();"""
html = html.replace(old_cursor_js, new_cursor_js)

# Remove old cursor const reference
html = html.replace("    const cursor = document.getElementById('cursor');\n", "")

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FIX 7: Add parallax to card-float elements on scroll (home view scroll)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Inject parallax listener after renderHome is declared
parallax_js = """
    /* ─── CARD PARALLAX ON SCROLL ─── */
    function applyCardParallax(scrollEl) {
        const sY = scrollEl.scrollTop;
        scrollEl.querySelectorAll('.card-float[data-speed]').forEach(card => {
            const spd = parseFloat(card.getAttribute('data-speed') || '0');
            const rect = card.getBoundingClientRect();
            const dist = (rect.top + rect.height/2 - window.innerHeight/2) / window.innerHeight;
            card.style.transform = `translate3d(0,${dist * spd * 80}px,0)`;
        });
        scrollEl.querySelectorAll('.entrance-mask:not(.visible)').forEach(m=>{
            if(m.getBoundingClientRect().top < window.innerHeight * 0.92) m.classList.add('visible');
        });
    }
    const _viewHome = document.getElementById('view-home');
    if(_viewHome) _viewHome.addEventListener('scroll', ()=>applyCardParallax(_viewHome), {passive:true});
"""
html = html.replace(
    "    // ── Init ─────────────────────────────────────────",
    parallax_js + "\n    // ── Init ─────────────────────────────────────────"
)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FIX 8: Add project description to the single-work-container
#         (inject after the work-card-foot inside single-work-container)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
old_single = """                <div class="work-card-foot" style="border:none;padding:0"><div class="work-title" style="font-size:18px">${w.title}</div></div>
            </div>`"""
new_single = """                <div class="work-card-foot" style="border:none;padding:0">
                    <div class="single-work-title-lg">${w.title}</div>
                    <p class="single-work-desc">${clientDescriptions[name] || ''}</p>
                </div>
            </div>`"""
html = html.replace(old_single, new_single, 1)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FIX 9: Replace the back/return duplicate buttons in gallery with single link
#         The existing return-btn is hidden via CSS; the floating-nav is the only button.
#         But ensure floating-nav label reads "BACK" not "← BACK" (CSS adds arrow)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
html = html.replace(
    '<span onclick="goHome()" tabindex="0" role="button" aria-label="Go to home" class="interactive">← BACK</span>',
    '<span onclick="goHome()" tabindex="0" role="button" aria-label="Go to home" class="interactive">BACK</span>'
)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FIX 10: Add FOOTER to #view-home (inside .content-section, after grid)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
footer_html = """
        <footer class="plm-footer entrance-mask" role="contentinfo">
            <p class="footer-statement">Visual systems built for those who set the pace, not just follow it.</p>
            <div class="footer-contacts">
                <p class="footer-contact-label">Get in touch</p>
                <a href="mailto:pelimotionart@gmail.com" class="footer-contact-email">pelimotionart@gmail.com</a>
                <div class="footer-social">
                    <a href="https://www.linkedin.com/in/pelife/" target="_blank" rel="noopener" class="footer-social-link">LinkedIn</a>
                    <a href="https://www.instagram.com/pelimotion/" target="_blank" rel="noopener" class="footer-social-link">Instagram</a>
                    <a href="https://www.behance.net/pelimotion" target="_blank" rel="noopener" class="footer-social-link">Behance</a>
                </div>
            </div>
            <hr class="footer-divider">
            <p class="footer-tagline">Systemize the motion, elevate the branding.</p>
        </footer>"""

# Insert footer right before the closing </div> of .content-section inside view-home
html = html.replace(
    '        </div>\n    </div>\n\n    <!-- VIEW: GALLERY',
    f'        </div>{footer_html}\n    </div>\n\n    <!-- VIEW: GALLERY'
)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Write
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
with open(OUTPUT, "w", encoding="utf-8") as f:
    f.write(html)

size = os.path.getsize(OUTPUT)
lines = html.count('\n') + 1
print(f"✅ Patched {OUTPUT}")
print(f"   Size : {size:,} bytes / {lines} lines")
