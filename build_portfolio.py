#!/usr/bin/env python3
"""
Build V1/portfolio/index.html merging:
  - Layout/design from: index_backup_20260419_003508.html (original smooth parallax design)
  - Data/player system from: current Bunny.net clientsData injection (sync_bunny.py)
"""
import os, re, json

BACKUP = "index_backup_20260419_003508.html"
OUTPUT = "V1/portfolio/index.html"

with open(BACKUP, "r", encoding="utf-8") as f:
    backup = f.read()

# ── Preserve current clientsData block from V1/portfolio/index.html ──────────
with open(OUTPUT, "r", encoding="utf-8") as f:
    current = f.read()

data_match = re.search(
    r'(const clientsData = \{.*?\};)\s*(const clientDescriptions = \{.*?\};)',
    current, re.DOTALL
)
if data_match:
    clients_block = data_match.group(1)
    desc_block    = data_match.group(2)
else:
    clients_block = "const clientsData = {};"
    desc_block    = "const clientDescriptions = {};"

# ── Extra CSS to add (mosaic preview + contact popover + exit link) ──────────
extra_css = """
        /* ═══ MOSAIC PREVIEW ═══ */
        .mosaic-preview {
            position: absolute; inset: 0;
            display: grid; grid-template-columns: repeat(3, 1fr);
            opacity: 0; transition: opacity 0.5s ease;
            pointer-events: none;
        }
        .card-float:hover .mosaic-preview { opacity: 1; }
        .mosaic-item {
            background-size: cover; background-position: center;
            filter: contrast(1.1);
        }

        /* ═══ CONTACT POPOVER ═══ */
        .contact-trigger {
            position: fixed; top: 1.6rem; right: 4.2rem; z-index: 960;
            font-size: 8px; font-weight: 900; letter-spacing: 0.3em;
            text-transform: uppercase; color: var(--fg);
            border: 1.5px solid var(--border); padding: 8px 14px;
            background: transparent; transition: all 0.2s; cursor: none;
        }
        .contact-trigger:hover { background: var(--fg); color: var(--bg); }
        @media (max-width: 767px) { .contact-trigger { cursor: auto; top: 1rem; right: 3.5rem; } }

        .contact-popover {
            position: fixed; top: 4.8rem; right: 1.6rem; z-index: 970;
            background: var(--overlay); border: 1.5px solid var(--border);
            backdrop-filter: blur(16px); padding: 24px;
            min-width: 280px; opacity: 0; pointer-events: none;
            transform: translateY(-8px); transition: opacity 0.3s, transform 0.3s;
        }
        .contact-popover.open { opacity: 1; pointer-events: all; transform: translateY(0); }
        .contact-popover-header {
            font-size: 9px; font-weight: 900; letter-spacing: 0.4em;
            text-transform: uppercase; color: var(--fg-muted); margin-bottom: 16px;
        }
        .contact-popover a {
            display: flex; align-items: center; gap: 12px;
            padding: 12px 0; border-bottom: 1px solid var(--border);
            text-decoration: none; color: var(--fg);
            font-size: 12px; font-weight: 600; transition: opacity 0.2s;
        }
        .contact-popover a:last-child { border-bottom: none; }
        .contact-popover a:hover { opacity: 0.6; }
        .contact-icon { font-size: 18px; }
        .contact-label { font-size: 10px; color: var(--fg-secondary); font-weight: 400; }

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

        /* ═══ LANG TOGGLE ═══ */
        .lang-toggle {
            position: fixed; bottom: 1.6rem; left: 50%; z-index: 960;
            transform: translateX(-50%);
            font-size: 8px; font-weight: 900; letter-spacing: 0.3em;
            text-transform: uppercase; color: var(--fg-muted);
            border: 1.5px solid var(--border); padding: 6px 14px;
            background: var(--overlay); backdrop-filter: blur(8px);
            display: flex; gap: 6px; align-items: center; cursor: none;
        }
        .lang-toggle:hover { background: var(--fg); color: var(--bg); cursor: pointer; }
        .lang-toggle span { cursor: none; }
        .lang-toggle span.active { color: var(--fg); }
        @media (max-width: 767px) { .lang-toggle { cursor: auto; } .lang-toggle span { cursor: auto; } }

        /* ═══ MODAL VIDEO FIX ═══ */
        .player-outer { width: 88vw; max-width: 1400px; }
        .player-container {
            position: relative; width: 100%; padding-top: 56.25%;
            border: 1.5px solid var(--border); background: #000;
            resize: none;
        }
        .player-container video {
            position: absolute; inset: 0; width: 100%; height: 100%;
        }
        .hd-toggle {
            position: absolute; bottom: 16px; right: 16px; z-index: 10;
            font-size: 8px; font-weight: 900; letter-spacing: 0.2em;
            border: 1.5px solid #fff; color: #fff; padding: 4px 10px;
            background: transparent; transition: all 0.2s; cursor: pointer;
        }
        .hd-toggle.active { background: #fff; color: #000; }

        /* ═══ GALLERY: category tabs ═══ */
        .cat-tabs {
            display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 32px;
        }
        .cat-tab {
            font-size: 8px; font-weight: 900; letter-spacing: 0.3em;
            text-transform: uppercase; color: var(--fg);
            border: 1.5px solid var(--border); padding: 6px 14px;
            background: transparent; transition: all 0.2s; cursor: none;
        }
        .cat-tab:hover, .cat-tab.active { background: var(--fg); color: var(--bg); }
        @media (max-width: 767px) { .cat-tab { cursor: auto; } }

        /* ═══ HERO NAME ═══ */
        .hero-name {
            font-size: clamp(32px, 6vw, 72px);
            font-weight: 900; letter-spacing: -0.03em;
            line-height: 1; color: var(--fg); margin-bottom: 8px;
        }
        .hero-role {
            font-size: clamp(11px, 1.2vw, 15px);
            font-weight: 400; letter-spacing: 0.25em;
            text-transform: uppercase; color: var(--fg-secondary);
            margin-bottom: 20px;
        }
"""

# ── New JS to replace the <script> block in the backup ───────────────────────
new_js = f"""<script>
    /* ── INJECTED DATA ── */
    {clients_block}
    {desc_block}

    /* ── STATE ── */
    let isMobile = window.innerWidth < 768;
    const ST = {{
        lang: localStorage.getItem('plm-lang') || 'pt',
        theme: localStorage.getItem('plm-theme') || 'light',
        view: 'home',
        client: null
    }};
    let currentVOD = {{ hd: '', preview: '' }};

    /* ── THEME ── */
    (function(){{
        const s = localStorage.getItem('plm-theme') || 'light';
        document.documentElement.setAttribute('data-theme', s);
    }})();
    function toggleTheme() {{
        const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('plm-theme', next);
    }}

    /* ── LANG ── */
    function applyLanguage() {{
        document.querySelectorAll('[data-pt]').forEach(el => {{
            el.innerHTML = el.getAttribute('data-' + ST.lang);
        }});
        const ptEl = document.getElementById('lang-pt');
        const enEl = document.getElementById('lang-en');
        if(ptEl) ptEl.classList.toggle('active', ST.lang === 'pt');
        if(enEl) enEl.classList.toggle('active', ST.lang === 'en');
        localStorage.setItem('plm-lang', ST.lang);
    }}
    function toggleLang() {{
        ST.lang = ST.lang === 'pt' ? 'en' : 'pt';
        applyLanguage();
    }}

    /* ── CURSOR ── */
    const cDot  = document.getElementById('cursor-dot');
    const cRing = document.getElementById('cursor-ring');
    let moveTimer = null;
    if (!isMobile) {{
        if(cDot)  cDot.style.display  = 'block';
        if(cRing) cRing.style.display = 'block';
    }}
    window.addEventListener('mousemove', e => {{
        if(isMobile) return;
        if(cDot)  {{ cDot.style.left  = e.clientX+'px'; cDot.style.top  = e.clientY+'px'; }}
        if(cRing) {{ cRing.style.left = e.clientX+'px'; cRing.style.top = e.clientY+'px'; }}
        document.body.classList.add('is-moving');
        clearTimeout(moveTimer);
        moveTimer = setTimeout(() => document.body.classList.remove('is-moving'), 120);
    }});
    document.body.addEventListener('mouseover', e => {{
        if(e.target.closest('.interactive, a, button, [role="button"]'))
            document.body.classList.add('is-hovering');
    }});
    document.body.addEventListener('mouseout', e => {{
        if(e.target.closest('.interactive, a, button, [role="button"]'))
            document.body.classList.remove('is-hovering');
    }});

    /* ── REACTION-DIFFUSION CANVAS ── */
    const CELL = 4;
    let caGrid = [], caW = 0, caH = 0, currentScrollY = 0;
    function generateNoiseGrid() {{
        caW = Math.ceil(24 / CELL);
        caH = Math.ceil(window.innerHeight / CELL) + 12;
        caGrid = [];
        for(let r = 0; r < caH; r++) {{
            const row = [];
            for(let c = 0; c < caW; c++) row.push(Math.random() > 0.45 ? 1 : 0);
            caGrid.push(row);
        }}
    }}
    function evolveNoise() {{
        for(let i = 0; i < caW * 2; i++) {{
            const rr = Math.floor(Math.random() * caH);
            const cc = Math.floor(Math.random() * caW);
            if(caGrid[rr]) caGrid[rr][cc] = caGrid[rr][cc] === 1 ? 0 : 1;
        }}
    }}
    function drawCA(canvasId) {{
        const c = document.getElementById(canvasId); if(!c) return;
        const W = 24, H = window.innerHeight;
        if(c.width !== W || c.height !== H) {{ c.width = W; c.height = H; }}
        const ctx = c.getContext('2d');
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--pattern-bg').trim();
        ctx.fillRect(0,0,W,H);
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--pattern-fg').trim();
        const scrollRow = Math.floor(currentScrollY / CELL) % Math.max(1, caH);
        for(let r = 0; r < caH; r++) {{
            const srcR = (r + scrollRow) % caH;
            if(!caGrid[srcR]) continue;
            for(let cCol = 0; cCol < caW; cCol++) {{
                if(caGrid[srcR][cCol]) ctx.fillRect(cCol * CELL, r * CELL, CELL, CELL);
            }}
        }}
    }}
    function rafPattern() {{
        drawCA('ca-left'); drawCA('ca-right');
        requestAnimationFrame(rafPattern);
    }}
    generateNoiseGrid(); rafPattern(); setInterval(evolveNoise, 150);

    /* ── VIEWS ── */
    const viewHome    = document.getElementById('view-home');
    const viewGallery = document.getElementById('view-gallery');
    const floatingBack = document.getElementById('floating-back');

    const maskObs = new IntersectionObserver(entries => {{
        entries.forEach(e => {{
            if(e.isIntersecting) {{ e.target.classList.add('visible'); maskObs.unobserve(e.target); }}
        }});
    }}, {{threshold: 0.08}});

    /* ── PARALLAX ── */
    function applyParallax(scrollEl) {{
        const sY = scrollEl.scrollTop;
        currentScrollY = sY;
        if(scrollEl === viewHome) {{
            const ratio = Math.min(sY / window.innerHeight, 1);
            const lp = document.getElementById('logo-p');
            const ll = document.getElementById('logo-l');
            const lm = document.getElementById('logo-m');
            const mosaic  = document.getElementById('hero-mosaic');
            const release = document.getElementById('hero-release');
            if(lp && ll && lm) {{
                const lift = ratio * 150, spread = ratio * 10;
                const o = Math.max(0, 1 - ratio * 1.5);
                lp.style.transform = `translate3d(${{-spread}}%,${{-lift}}px,0)`; lp.style.opacity = o;
                ll.style.transform = `translate3d(${{spread}}%,${{-lift}}px,0)`;  ll.style.opacity = o;
                lm.style.transform = `translate3d(0,${{-lift*1.2}}px,0)`;         lm.style.opacity = o;
            }}
            if(mosaic)  mosaic.style.transform  = `translate3d(0,${{sY*0.22}}px,0)`;
            if(release) {{
                release.style.transform = `translate3d(0,${{-sY*0.65}}px,0)`;
                release.style.opacity   = Math.max(0, 1 - ratio * 2.5);
            }}
        }}
        scrollEl.querySelectorAll('.card-float').forEach(card => {{
            const spd  = parseFloat(card.getAttribute('data-speed') || '0');
            const rect = card.getBoundingClientRect();
            const dist = (rect.top + rect.height/2 - window.innerHeight/2) / window.innerHeight;
            card.style.transform = `translate3d(0,${{dist * spd * 80}}px,0)`;
        }});
        scrollEl.querySelectorAll('.entrance-mask:not(.visible)').forEach(m => {{
            if(m.getBoundingClientRect().top < window.innerHeight * 0.9) m.classList.add('visible');
        }});
    }}
    viewHome.addEventListener('scroll',    () => applyParallax(viewHome),    {{passive: true}});
    viewGallery.addEventListener('scroll', () => applyParallax(viewGallery), {{passive: true}});
    viewHome.querySelectorAll('.entrance-mask').forEach(m => maskObs.observe(m));

    /* ── HOME GRID RENDER ── */
    function buildHomeGrid() {{
        const container = document.getElementById('clients-container');
        if(!container) return;
        container.innerHTML = '';

        const sizes = ['card-size-lg','card-size-md','card-size-tall'];
        const speeds = ['-0.5','0.4','-0.3','0.45','-0.4','0.35','-0.5','0.4','-0.3','0.45'];
        let i = 0;

        Object.keys(clientsData).forEach(name => {{
            const client = clientsData[name];
            let works = client.root || [];
            if(!works.length && client.categories) {{
                works = Object.values(client.categories).flat();
            }}
            const rep = works[0]; if(!rep) return;

            const total = client.total || works.length;
            const poster = rep.mosaic?.[1] || rep.poster_url || '';
            const tagline = clientDescriptions[name] || '';
            const sz  = sizes[i % sizes.length];
            const spd = speeds[i % speeds.length];

            let mosaicHtml = '';
            if(rep.mosaic && rep.mosaic.length === 3) {{
                mosaicHtml = rep.mosaic.map(u =>
                    `<div class="mosaic-item" style="background-image:url('${{u}}')"></div>`
                ).join('');
            }}

            container.innerHTML += `
                <div role="listitem" class="card-float ${{sz}} interactive entrance-mask" data-speed="${{spd}}"
                     onclick="openClient('${{name}}')" tabindex="0"
                     onkeydown="if(event.key==='Enter')openClient('${{name}}')">
                    <div class="client-card-wrap">
                        <div class="client-card-img-wrap">
                            <img class="client-card-img" src="${{poster}}"
                                 alt="${{name}} portfolio thumbnail" loading="lazy">
                            <div class="mosaic-preview" aria-hidden="true">${{mosaicHtml}}</div>
                            <div class="card-hover-tagline" aria-hidden="true">${{tagline}}</div>
                        </div>
                        <div class="client-card-footer">
                            <span class="client-name">${{name}}</span>
                            <span class="client-count">${{String(total).padStart(2,'0')}} WORKS</span>
                        </div>
                    </div>
                </div>`;
            i++;
        }});

        container.querySelectorAll('.entrance-mask').forEach(m => maskObs.observe(m));
    }}

    /* ── GALLERY ── */
    let activeClient = null;
    let activeCat = '__all__';

    function openClient(name) {{
        activeClient = name; activeCat = '__all__';
        viewHome.classList.remove('active');
        if(floatingBack) floatingBack.classList.add('active');
        renderGallery();
        setTimeout(() => {{
            if(isMobile) {{ viewHome.style.display='none'; viewGallery.style.display='block'; window.scrollTo(0,0); }}
            viewGallery.classList.add('active');
            viewGallery.scrollTop = 0;
            viewGallery.querySelectorAll('.entrance-mask').forEach(m => maskObs.observe(m));
        }}, 460);
    }}

    function renderGallery() {{
        const client = clientsData[activeClient]; if(!client) return;
        const titleEl = document.getElementById('gallery-title');
        const countEl = document.getElementById('gallery-count');
        const worksEl = document.getElementById('works-container');
        const catsEl  = document.getElementById('cats-container');
        if(titleEl) titleEl.innerText = activeClient;

        // Build category tabs
        const cats = Object.keys(client.categories || {{}});
        if(catsEl) {{
            catsEl.innerHTML = '';
            if(cats.length > 0) {{
                const allBtn = document.createElement('button');
                allBtn.className = 'cat-tab interactive' + (activeCat==='__all__' ? ' active' : '');
                allBtn.textContent = 'ALL'; allBtn.onclick = () => {{ activeCat='__all__'; renderGallery(); }};
                catsEl.appendChild(allBtn);
                cats.forEach(cat => {{
                    const btn = document.createElement('button');
                    btn.className = 'cat-tab interactive' + (activeCat===cat ? ' active' : '');
                    btn.textContent = cat; btn.onclick = () => {{ activeCat=cat; renderGallery(); }};
                    catsEl.appendChild(btn);
                }});
            }}
        }}

        // Collect works
        let works = [];
        if(activeCat === '__all__') {{
            works = [...(client.root||[])];
            cats.forEach(c => works.push(...(client.categories[c]||[])));
        }} else {{
            works = client.categories[activeCat] || [];
        }}
        if(countEl) countEl.innerText = String(works.length).padStart(2,'0');

        if(!worksEl) return;
        worksEl.innerHTML = '';
        works.forEach((w, idx) => {{
            const poster = w.mosaic?.[1] || w.poster_url || '';
            const v2cls  = w.format === 'vertical' ? 'v2' : (idx % 4 === 0 ? 'v2' : '');
            const safeHD  = (w.video_url   || '').replace(/'/g, "\\'");
            const safePRV = (w.preview_url || w.video_url || '').replace(/'/g, "\\'");
            const safeASP = (w.aspect      || '16/9').replace(/'/g, "\\'");
            worksEl.innerHTML += `
                <div role="listitem" class="interactive entrance-mask work-card-wrap ${{v2cls}}"
                     onclick="openModal('${{safeHD}}','${{safePRV}}','${{safeASP}}')" tabindex="0"
                     onkeydown="if(event.key==='Enter')openModal('${{safeHD}}','${{safePRV}}','${{safeASP}}')">
                    <img class="work-card-img" src="${{poster}}" alt="${{w.title}}" loading="lazy"
                         style="${{poster?'':'background:#222;'}}">
                    <div class="work-card-foot">
                        <div class="work-title">${{w.title}}</div>
                    </div>
                </div>`;
        }});
        worksEl.querySelectorAll('.entrance-mask').forEach(m => maskObs.observe(m));
    }}

    function goHome() {{
        viewGallery.classList.remove('active');
        if(floatingBack) floatingBack.classList.remove('active');
        setTimeout(() => {{
            if(isMobile) {{ viewGallery.style.display='none'; viewHome.style.display='block'; window.scrollTo(0,0); }}
            viewHome.classList.add('active');
        }}, 460);
    }}

    /* ── MODAL ── */
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');

    function openModal(hd, preview, aspect) {{
        currentVOD = {{ hd: hd || '', preview: preview || hd || '' }};
        if(!hd) return;
        const asp = aspect || '16/9';
        modalContent.innerHTML = `
            <div class="player-container" style="padding-top:calc(100% / (${{asp.replace('/','/')}}))">
                <video id="v-main" autoplay playsinline controls style="position:absolute;inset:0;width:100%;height:100%;background:#000">
                    <source src="${{hd}}" type="video/mp4">
                </video>
                <button class="hd-toggle active" id="hd-btn" onclick="toggleHD()">HD</button>
            </div>`;
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
        document.querySelector('.close-modal')?.focus();
    }}
    function toggleHD() {{
        const v   = document.getElementById('v-main'); if(!v) return;
        const btn = document.getElementById('hd-btn');
        const t   = v.currentTime;
        const isHD = btn.classList.toggle('active');
        v.src = isHD ? currentVOD.hd : currentVOD.preview;
        v.currentTime = t; v.play();
    }}
    function closeModal() {{
        modal.classList.remove('active');
        setTimeout(() => {{ modal.style.display = 'none'; modalContent.innerHTML = ''; }}, 420);
    }}

    /* ── CONTACT POPOVER ── */
    function toggleContact() {{
        document.getElementById('contact-popover')?.classList.toggle('open');
    }}
    document.addEventListener('click', e => {{
        const pop = document.getElementById('contact-popover');
        const btn = document.getElementById('contact-btn');
        if(pop && btn && !pop.contains(e.target) && e.target !== btn) pop.classList.remove('open');
    }});

    /* ── KEYBOARD: close modal with Escape ── */
    document.addEventListener('keydown', e => {{
        if(e.key === 'Escape') closeModal();
    }});

    /* ── HASH DEEP LINK ── */
    window.addEventListener('DOMContentLoaded', () => {{
        applyLanguage();
        buildHomeGrid();
        const hash = window.location.hash.substring(1).toUpperCase();
        if(hash && clientsData[hash]) {{
            setTimeout(() => openClient(hash), 600);
        }}
    }});
</script>"""

# ── Inject extra CSS before </style> ─────────────────────────────────────────
new_html = backup.replace('    </style>', extra_css + '\n    </style>', 1)

# ── Add contact popover + exit + lang toggle + CA after <body ...> ────────────
body_tag_end = '<body data-theme="light">'
contact_block = """
    <!-- Contact Popover -->
    <button class="contact-trigger interactive" id="contact-btn" onclick="toggleContact()" aria-label="Contact">CONTACT</button>
    <div class="contact-popover" id="contact-popover">
        <div class="contact-popover-header">Get In Touch</div>
        <a href="https://wa.me/5547999664274" target="_blank" rel="noopener" class="interactive">
            <span class="contact-icon">💬</span>
            <div><strong>WhatsApp</strong><br><span class="contact-label">Chat now</span></div>
        </a>
        <a href="mailto:conceicao@pelimotion.com" class="interactive">
            <span class="contact-icon">✉</span>
            <div><strong>Email</strong><br><span class="contact-label">conceicao@pelimotion.com</span></div>
        </a>
    </div>
    <!-- Exit back to landing -->
    <a href="../../index.html" class="exit-link interactive" aria-label="Back to main menu">← EXIT</a>
    <!-- Language Toggle -->
    <div class="lang-toggle interactive" onclick="toggleLang()">
        <span id="lang-pt" class="active">PT</span>
        <span>/</span>
        <span id="lang-en">EN</span>
    </div>"""
new_html = new_html.replace(body_tag_end, body_tag_end + contact_block, 1)

# ── Inject gallery category container into view-gallery ─────────────────────
gallery_header_old = '<div class="grid-works" id="works-container" role="list"></div>'
gallery_header_new = '<div class="cat-tabs" id="cats-container"></div>\n            <div class="grid-works" id="works-container" role="list"></div>'
new_html = new_html.replace(gallery_header_old, gallery_header_new, 1)

# ── Replace the entire <script>…</script> block at end of backup ─────────────
new_html = re.sub(r'<script>.*?</script>', lambda m: new_js, new_html, count=1, flags=re.DOTALL)

# ── Write output ─────────────────────────────────────────────────────────────
with open(OUTPUT, "w", encoding="utf-8") as f:
    f.write(new_html)

print(f"✅ Built {OUTPUT} successfully.")
print(f"   Total size: {len(new_html):,} bytes / {new_html.count(chr(10))+1} lines")
