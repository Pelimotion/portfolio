/* GLOBAL REFS */
const ST = {
    lang: localStorage.getItem('plm_lang') || 'pt',
    theme: localStorage.getItem('plm_theme') || 'dark',
    view: 'home',
    client: null,
    isTransitioning: false
};

const DOM = {
    curtain: document.getElementById('radial-curtain'),
    logo: document.getElementById('main-logo'),
    modal: document.getElementById('modal'),
    modalContent: document.getElementById('modal-content'),
    galleryContent: document.getElementById('gallery-content'),
    cursor: document.getElementById('cursor'),
    contactPopover: document.getElementById('contact-popover'),
    contactBtn: document.getElementById('contact-btn')
};

/* ORCHESTRATOR */
function openView(viewId, params = {}) {
    if(ST.isTransitioning) return;
    ST.isTransitioning = true;

    // Start Transition
    DOM.curtain.classList.add('active');
    
    setTimeout(() => {
        // Hide all views
        document.querySelectorAll('.view-wrapper').forEach(v => v.classList.remove('active'));
        
        // Show target view
        const targetView = document.getElementById(`view-${viewId}`);
        if(targetView) targetView.classList.add('active');
        
        ST.view = viewId;
        ST.client = params.client || null;

        // Update UI State
        if(viewId === 'home') {
            DOM.logo.classList.remove('is-icon');
            renderHomeGrid();
        } else {
            DOM.logo.classList.add('is-icon');
            if(viewId === 'gallery' && params.client) renderGallery(params.client);
        }

        window.scrollTo(0, 0);
        applyLanguage();
        
        // Browser History
        if(!params._fromPop) {
            const url = viewId === 'home' ? '/' : (viewId === 'gallery' ? `#${params.client.replace(/\\s+/g,'-')}` : `#${viewId}`);
            history.pushState({view: viewId, client: params.client}, '', url);
        }

        // End Transition
        setTimeout(() => {
            DOM.curtain.classList.remove('active');
            ST.isTransitioning = false;
        }, 100);
    }, 900);
}

/* RENDERING */
function renderHomeGrid() {
    const container = document.getElementById('clients-grid');
    if(!container) return;
    let html = '';
    Object.keys(clientsData).forEach(name => {
        const client = clientsData[name];
        // Ensure at least one work exists to display the card
        let representativeWork = client.root?.[0] || Object.values(client.categories || {})[0]?.[0];
        if (!representativeWork) return; // Skip if no works are found for this client

        const poster = representativeWork.mosaic?.[1] || representativeWork.poster_url || '';
        const tagline = clientDescriptions[name] || '';
        
        // Dynamically create mosaic thumbs
        let mosaicHtml = '';
        if (representativeWork.mosaic && representativeWork.mosaic.length === 3) {
            mosaicHtml = representativeWork.mosaic.map(mosaicUrl => 
                `<div class="mosaic-item" style="background-image:url('${mosaicUrl}')"></div>`
            ).join('');
        } else {
            // Fallback if mosaic data is incomplete
            mosaicHtml = `<div class="mosaic-item" style="background-image:url('${poster}')"></div>`;
        }

        html += `
            <div class="card-float interactive entrance-mask" onclick="openView('gallery', {client:'${name}'})" tabindex="0">
                <div class="client-card-wrap">
                    <div class="client-card-img-wrap ${representativeWork.format || 'default'}">
                        <img class="client-card-img" src="${poster}" alt="${name}" loading="lazy">
                        <div class="mosaic-preview">${mosaicHtml}</div>
                        <div class="card-hover-tagline">${tagline}</div>
                    </div>
                    <div class="client-card-footer">
                        <span class="client-name">${name}</span>
                        <span class="client-count">${String(client.total).padStart(2,'0')} WORKS</span>
                    </div>
                </div>
            </div>`;
    });
    container.innerHTML = html;
    observeEntrance();
}

function renderGallery(name) {
    const client = clientsData[name];
    if(!client) return;
    let html = `<div class="gallery-hero entrance-mask">
        <nav class="inner-nav" style="margin-bottom:40px"><span onclick="openView('home')" class="interactive">← BACK</span></nav>
        <h1 class="gallery-title">${name}</h1>
        <p class="gallery-desc">${clientDescriptions[name] || ''}</p>
        <p class="gallery-meta"><span>${String(client.total).padStart(2,'0')}</span> EXECUTIONS</p>
    </div>`;

    // Root
    const roots = (client.root || []).filter(w => w.video_url);
    if(roots.length > 0) {
        html += `<div class="gallery-featured grid-works">`;
        roots.forEach(w => html += renderWorkCard(w));
        html += `</div>`;
    }

    // Categories
    Object.keys(client.categories || {}).sort().forEach(cat => {
        const works = client.categories[cat].filter(w => w.video_url);
        if(works.length === 0) return;
        html += `<div class="category-section entrance-mask" style="margin-top:10vh">
            <div class="category-header"><span class="category-name">${cat}</span></div>
            <div class="grid-works">${works.map(w => renderWorkCard(w)).join('')}</div>
        </div>`;
    });
    
    html += `<div style="margin-top:100px;text-align:center" class="entrance-mask"><button class="brutal-btn interactive" onclick="openView('home')">BACK TO COLLECTIONS</button></div>`;

    DOM.galleryContent.innerHTML = html;
    observeEntrance();
}

function renderWorkCard(w) {
    const poster = w.mosaic?.[1] || w.poster_url || '';
    let mosaicHtml = '';
    if (w.mosaic && w.mosaic.length === 3) {
        mosaicHtml = w.mosaic.map(mosaicUrl => 
            `<div class="mosaic-item" style="background-image:url('${mosaicUrl}')"></div>`
        ).join('');
    } else {
        // Fallback if mosaic data is incomplete
        mosaicHtml = `<div class="mosaic-item" style="background-image:url('${poster}')"></div>`;
    }

    return `
        <div class="interactive work-card-wrap entrance-mask" onclick="openModal('${w.video_url}', '${w.preview_url || ''}', '${w.aspect || '16/9'}')">
            <div class="client-card-img-wrap ${w.format || 'default'}">
                <img src="${poster}" class="work-card-img" loading="lazy">
                <div class="mosaic-preview">${mosaicHtml}</div>
            </div>
            <div class="work-card-foot"><div class="work-title">${w.title}</div></div>
        </div>`;
}

/* MODAL PLAYER */
let currentVOD = { hd: '', preview: '' };
function openModal(hd, preview, aspect) {
    currentVOD = { hd, preview: preview || hd };
    DOM.modal.style.display = 'flex';
    DOM.modalContent.innerHTML = `
        <div id="modal-player" class="active" style="display:flex; flex-direction:column; align-items:center; justify-content:center; width:100%; height:100%">
            <button class="close-modal interactive" onclick="closeModal()" aria-label="Close video">CLOSE ✕</button>
            <div class="player-outer">
                <div class="player-container" style="aspect-ratio:${aspect || '16/9'}">
                    <video id="v-main" autoplay playsinline controls style="width:100%;height:100%;background:#000">
                        <source src="${hd}" type="video/mp4">
                    </video>
                    <div class="player-controls-mini" style="position:absolute; bottom:20px; right:20px; z-index:100">
                        <button class="player-hd-toggle active" id="hd-btn" onclick="toggleHD()" style="background:var(--bg); color:var(--fg); border:1.5px solid var(--fg); padding:5px 10px; font-size:10px; font-weight:900; cursor:pointer">HD</button>
                    </div>
                </div>
            </div>
        </div>`;
    setTimeout(() => DOM.modal.classList.add('active'), 10);
}

function toggleHD() {
    const v = document.getElementById('v-main');
    const btn = document.getElementById('hd-btn');
    const time = v.currentTime;
    const isHD = btn.classList.toggle('active');
    v.src = isHD ? currentVOD.hd : currentVOD.preview;
    v.currentTime = time;
    v.play();
}

function closeModal() {
    DOM.modal.classList.remove('active');
    setTimeout(() => { DOM.modal.style.display='none'; DOM.modalContent.innerHTML='' }, 400);
}

/* BILINGUAL */
function applyLanguage() {
    document.querySelectorAll('[data-' + ST.lang + ']').forEach(el => {
        el.innerHTML = el.getAttribute('data-' + ST.lang);
    });
    document.getElementById('lang-pt').classList.toggle('active', ST.lang === 'pt');
    document.getElementById('lang-en').classList.toggle('active', ST.lang === 'en');
    localStorage.setItem('plm_lang', ST.lang);
}
function toggleLang() { ST.lang = ST.lang === 'pt' ? 'en' : 'pt'; applyLanguage(); }

/* THEME & CONTACT */
function toggleTheme() {
    ST.theme = ST.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', ST.theme);
    localStorage.setItem('plm_theme', ST.theme);
}
function toggleContact() { DOM.contactPopover.classList.toggle('open'); }

/* CURSOR */
if(!('ontouchstart' in window)){
    let mx = 0, my = 0, cx = 0, cy = 0;
    window.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        if(DOM.cursor) DOM.cursor.classList.toggle('hover', !!e.target.closest('.interactive'));
    });
    const anim = () => {
        cx += (mx - cx) * 0.2; cy += (my - cy) * 0.2;
        if(DOM.cursor) {
            DOM.cursor.style.left = cx + 'px'; DOM.cursor.style.top = cy + 'px';
        }
        requestAnimationFrame(anim);
    };
    anim();
}

/* UTILS */
function observeEntrance() {
    const obs = new IntersectionObserver(ents => {
        ents.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible') });
    }, { threshold: 0.1 });
    document.querySelectorAll('.entrance-mask').forEach(m => obs.observe(m));
}

/* INIT */
window.onpopstate = (e) => {
    if(e.state) openView(e.state.view, { ...e.state.params, _fromPop: true });
    else openView('home', { _fromPop: true });
};

window.addEventListener('DOMContentLoaded', () => {
    // Apply initial state
    document.documentElement.setAttribute('data-theme', ST.theme);
    applyLanguage();
    renderHomeGrid();
    
    // Handle Hash Deep Linking
    const hash = window.location.hash.substring(1).toLowerCase().replace(/[-\s]+/g, ' '); // Handle spaces and hyphens
    let foundClient = null;
    Object.keys(clientsData).forEach(k => { if(k.toLowerCase() === hash) foundClient = k; });
    
    if(foundClient) {
        setTimeout(() => openView('gallery', { client: foundClient }), 500);
    } else if(hash === 'hub') {
        setTimeout(() => openView('hub'), 500);
    }
    
    // Initialize Cellular Automata if elements exist
    if(document.getElementById('automata-left')) initAutomata('automata-left');
    if(document.getElementById('automata-right')) initAutomata('automata-right');
});

window.addEventListener('click', e => {
    if(DOM.contactPopover && !DOM.contactPopover.contains(e.target) && e.target !== DOM.contactBtn) DOM.contactPopover.classList.remove('open');
});

/* CELLULAR AUTOMATA (Preserved) */
function initAutomata(id){
    const c = document.getElementById(id); if(!c) return;
    const ctx = c.getContext('2d');
    let w, h, rows, cols, grid;
    const resize = () => {
        w = c.width = c.offsetWidth; h = c.height = c.offsetHeight;
        if(!w) return;
        cols = 12; rows = Math.ceil(h / (w/cols));
        grid = Array.from({length:rows*cols}, ()=>Math.random()>.85?1:0);
    };
    const draw = () => {
        ctx.clearRect(0,0,w,h);
        const fg = getComputedStyle(document.documentElement).getPropertyValue('--fg').trim();
        ctx.fillStyle = fg;
        const cw = w/cols;
        for(let i=0; i<rows; i++){
            for(let j=0; j<cols; j++) if(grid[i*cols+j]) ctx.fillRect(j*cw, i*cw, cw-1, cw-1);
        }
        let next = [...grid];
        for(let i=1; i<rows; i++){
            for(let j=0; j<cols; j++){
                const p = (i-1)*cols;
                next[i*cols+j] = (grid[p + (j-1+cols)%cols] ^ grid[p + (j+1)%cols]);
            }
        }
        grid = [...next.slice(cols), ...Array.from({length:cols}, ()=>Math.random()>.95?1:0)];
    };
    resize(); window.addEventListener('resize', resize);
    setInterval(draw, 120);
}

/* Additional function to handle mosaic generation in JS */
function generateMosaicHtml(work) {
    if (work.mosaic && work.mosaic.length === 3) {
        return work.mosaic.map(mosaicUrl => 
            `<div class="mosaic-item" style="background-image:url('${mosaicUrl}')"></div>`
        ).join('');
    } else {
        // Fallback if mosaic data is incomplete or not available
        const poster = work.poster_url || '';
        return `<div class="mosaic-item" style="background-image:url('${poster}')"></div>`;
    }
}

// Example of how to use it within renderHomeGrid and renderWorkCard
// (Already integrated above for demonstration)
