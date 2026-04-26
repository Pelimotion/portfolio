import os
import re

# --- 1. PATCH INDEX.HTML (Landing Page) ---
idx_path = 'index.html'
with open(idx_path, 'r', encoding='utf-8') as f:
    idx_content = f.read()

# CSS injection
light_css = "\n[data-theme=\"light\"] { --bg:#f5f5f5; --fg:#050505; --accent:#050505; --border:rgba(10,10,10,.1); }\nhtml{background:var(--bg); color:var(--fg);}\n"
if '[data-theme="light"]' not in idx_content:
    idx_content = idx_content.replace(':root{--bg:#0a0a0a;--fg:#f0ede8;--accent:#f0ede8;--green:#34d399;--border:rgba(240,237,232,.1)}', 
                                    ':root{--bg:#0a0a0a;--fg:#f0ede8;--accent:#f0ede8;--green:#34d399;--border:rgba(240,237,232,.1)}' + light_css)

# HTML Tag injection
idx_content = idx_content.replace('<html lang="en">', '<html lang="en" data-theme="dark">')

# Nav injection
old_nav = '<button id="custom-lang-toggle" class="nav-link lang-toggle" onclick="toggleLanguage()" style="margin-left: 10px;">PT</button>'
new_nav = '<button class="nav-link lang-toggle" onclick="toggleTheme()" title="Toggle Theme">◐</button>\n    <button id="custom-lang-toggle" class="nav-link lang-toggle" onclick="toggleLanguage()">PT</button>'
if 'onclick="toggleTheme()"' not in idx_content:
    idx_content = idx_content.replace(old_nav, new_nav)

# JS injection
if 'theme.js' not in idx_content:
    idx_content = idx_content.replace('</head>', '<script src="theme.js"></script>\n</head>')

with open(idx_path, 'w', encoding='utf-8') as f:
    f.write(idx_content)
print("Patched index.html")


# --- 2. PATCH CURRICULUM FILES ---
cv_files = [
    'Curriculum/index.html',
    'Curriculum/private/app.html',
    'Curriculum/private/cv.html',
    'Curriculum/private/near.html',
    'Curriculum/private/cl.html'
]

for path in cv_files:
    if not os.path.exists(path): continue
    with open(path, 'r', encoding='utf-8') as f:
        c_content = f.read()
    
    # CSS injection - Curriculum uses Tailwind classes, but also CSS variables. Let's just define the light mode variables and some global overrides for Tailwind's text-white, etc.
    cv_light_css = """
    <style>
    [data-theme="light"] { --bg: #f5f5f5; --fg: #050505; --border: rgba(10,10,10,.1); }
    [data-theme="light"] body { background: var(--bg); color: var(--fg); }
    [data-theme="light"] .text-white { color: var(--fg); }
    [data-theme="light"] .bg-black { background: var(--bg); }
    [data-theme="light"] .border-white\\/10 { border-color: var(--border); }
    [data-theme="light"] .text-white\\/40, [data-theme="light"] .text-white\\/50, [data-theme="light"] .text-white\\/70 { color: rgba(5,5,5,.5); }
    [data-theme="light"] .hover\\:bg-white\\/5:hover { background: rgba(5,5,5,.05); }
    [data-theme="light"] .bg-white { background: var(--fg); }
    [data-theme="light"] .text-black { color: var(--bg); }
    </style>
    """
    if '[data-theme="light"] body' not in c_content:
        c_content = c_content.replace('</head>', cv_light_css + '\n<script src="../../theme.js"></script>\n</head>')
    
    # HTML Tag injection
    c_content = c_content.replace('<html lang="en">', '<html lang="en" data-theme="dark">')
    
    # Nav injection
    old_nav_cv = '<button id="custom-lang-toggle" class="lang-toggle" onclick="toggleLanguage()">PT</button>'
    new_nav_cv = '<button class="lang-toggle" onclick="toggleTheme()" title="Toggle Theme" style="margin-right:8px;">◐</button>\n                        <button id="custom-lang-toggle" class="lang-toggle" onclick="toggleLanguage()">PT</button>'
    if 'onclick="toggleTheme()"' not in c_content:
        c_content = c_content.replace(old_nav_cv, new_nav_cv)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(c_content)
    print("Patched", path)


# --- 3. PATCH PORTFOLIO ---
port_path = 'V1/portfolio/index.html'
if os.path.exists(port_path):
    with open(port_path, 'r', encoding='utf-8') as f:
        p_content = f.read()

    # Change to dark mode default
    p_content = p_content.replace('<html lang="en" data-theme="light">', '<html lang="en" data-theme="dark">')
    
    # Inject theme.js
    if 'theme.js' not in p_content:
        p_content = p_content.replace('</head>', '<script src="../../theme.js"></script>\n</head>')

    # Fix plmContent bug!
    bug_search = ".then(d => {\n        portfolioData = d.portfolio || {};"
    bug_fix = ".then(d => {\n        window.plmContent = d;\n        portfolioData = d.portfolio || {};"
    if 'window.plmContent = d;' not in p_content:
        p_content = p_content.replace(bug_search, bug_fix)

    # Replace Hero and Floating buttons with Landing Page design
    old_buttons_and_hero = """    <a href="../../index.html" class="exit-link" aria-label="Home" title="Home">⌂</a>
    <button class="theme-toggle plm-btn interactive" onclick="toggleTheme()" aria-label="Toggle light/dark mode">◧</button>
    <button class="contact-trigger plm-btn interactive" id="contact-btn" onclick="toggleContact()" aria-label="Contact">CONTACT</button>
    <div class="contact-popover" id="contact-popover">
        <div class="contact-popover-header">Get in touch</div>
        <a href="https://wa.me/5547999664274" target="_blank" rel="noopener" class="interactive">
            <span class="contact-icon">💬</span>
            <div><strong>WhatsApp</strong><br><span class="contact-label">Chat now</span></div>
        </a>
        <a href="mailto:conceicao.felipe@gmail.com" class="interactive">
            <span class="contact-icon">✉</span>
            <div><strong>Email</strong><br><span class="contact-label">conceicao.felipe@gmail.com</span></div>
        </a>
    </div>

    

    <div id="view-home" class="view-wrapper active" role="main">
        <section class="hero-section" id="hero-section" aria-label="Hero">
            <div class="hero-mosaic" id="hero-mosaic" aria-hidden="true"><img src="https://drive.google.com/thumbnail?id=1qo8sAAWeO2nZoLPiytnPzZikITGUCuS0&sz=w600" alt="" loading="eager">
<img src="https://drive.google.com/thumbnail?id=1wpQudGW3Kqd6tUWo2B4zwBDrG7YnS4l6&sz=w600" alt="" loading="eager">
<img src="https://drive.google.com/thumbnail?id=1Lk4PJYqVZIdWYIDDs_OuH7sXbjHLh6ZW&sz=w600" alt="" loading="eager">
<img src="https://drive.google.com/thumbnail?id=1Ar7WkoQ0LcOzjpJsppRYYP1fvmQm6Lud&sz=w600" alt="" loading="eager">
<img src="https://drive.google.com/thumbnail?id=1h4d3inwgxq15Bk3asUTl5k1JH00tTxWB&sz=w600" alt="" loading="eager">
<img src="https://drive.google.com/thumbnail?id=1pOQgnyNyCZas4IpXVYUdEZLEXpIq2T5n&sz=w600" alt="" loading="eager">
<img src="https://drive.google.com/thumbnail?id=1tpX1wdU_DVoNSy8PFF_xgSP0UFGaKTGI&sz=w600" alt="" loading="eager">
<img src="https://drive.google.com/thumbnail?id=1092gVEeHYgsi-xLz7JclM8FasA2sDCCZ&sz=w600" alt="" loading="eager">
</div>
            <div class="hero-overlay-left"></div>
            <div class="hero-overlay-right"></div>
            <div class="hero-content">
                <div class="plm-master-logo" id="hero-logo-wrap" aria-label="Pelimotion PLM logo">
                    <div class="logo-part" id="logo-p" aria-hidden="true"></div>
                    <div class="logo-part" id="logo-l" aria-hidden="true"></div>
                    <div class="logo-part" id="logo-m" aria-hidden="true"></div>
                </div>
                <div class="hero-text" id="hero-release">
                    <div class="hero-name" id="p-hero-name">PELIMOTION</div>
                    <div class="hero-role" id="p-hero-role">Motion Branding &amp; Creative Direction</div>
                    <p class="hero-body" id="p-hero-body">A creative hub focused on giving body and movement to bold ideas. We blend design, technology, and narrative to build rhythmic identities and high-impact content across diverse industries.</p>
                    <span class="hero-tagline">If your brand moves, we design the system.</span>
                </div>
            </div>
            <div class="scroll-hint" aria-hidden="true">SCROLL ↓</div>
        </section>"""

    # We use a regex or string replacement because the mosaic might have slightly different spaces. Let's just find <section class="hero-section" and slice.
    
    if '<section class="hero-section"' in p_content:
        # Cut from <a href="../../index.html" class="exit-link" up to </section>
        start_idx = p_content.find('<a href="../../index.html" class="exit-link"')
        end_idx = p_content.find('</section>') + len('</section>')
        
        if start_idx != -1 and end_idx != -1:
            new_hero = """
<style>
/* Mimic Landing Page Nav */
#site-nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 2.5rem; height: 64px; border-bottom: 1px solid var(--border);
    position: sticky; top: 0; z-index: 1000; background: var(--bg); transition: background .4s, border-color .4s;
}
.nav-logo { font-size: 13px; font-weight: 900; letter-spacing: .3em; text-transform: uppercase; color: var(--fg); text-decoration: none; }
.nav-links { display: flex; align-items: center; gap: 2rem; }
.nav-link { font-size: 10px; font-weight: 700; letter-spacing: .25em; text-transform: uppercase; color: var(--fg2); text-decoration: none; transition: color .2s; cursor: pointer; background:none; border:none; }
.nav-link:hover { color: var(--fg); }
.lang-toggle { font-family: monospace; border: 1px solid var(--border); padding: 4px 8px; }

#port-hero {
    height: 50vh; display: flex; align-items: flex-end; padding: 4rem 2.5rem;
    border-bottom: 1px solid var(--border); position: relative;
}
</style>
<nav id="site-nav">
  <a href="../../index.html" class="nav-logo">PLM</a>
  <div class="nav-links">
    <button class="nav-link lang-toggle" onclick="toggleTheme()" title="Toggle Theme">◐</button>
    <button id="custom-lang-toggle" class="nav-link lang-toggle" onclick="toggleLanguage()">PT</button>
    <a href="../../index.html#contact" class="nav-link">CONTACT</a>
  </div>
</nav>

<div id="view-home" class="view-wrapper active" role="main" style="position:static; opacity:1; visibility:visible; pointer-events:all;">
    <section id="port-hero" class="entrance-mask visible">
        <div>
            <div style="font-size:9px;font-weight:700;letter-spacing:.45em;text-transform:uppercase;color:var(--fg3);margin-bottom:1.2rem;" data-pt="ARQUIVO COMPLETO" data-en="FULL ARCHIVE">FULL ARCHIVE</div>
            <h1 style="font-size:clamp(3.5rem,8vw,6rem);font-weight:900;letter-spacing:-.03em;line-height:.9;text-transform:uppercase;color:var(--fg)" id="p-hero-name" data-pt="Portfólio" data-en="Portfolio">PORTFOLIO</h1>
        </div>
    </section>
"""
            p_content = p_content[:start_idx] + new_hero + p_content[end_idx:]
            
            with open(port_path, 'w', encoding='utf-8') as f:
                f.write(p_content)
            print("Patched V1/portfolio/index.html")
