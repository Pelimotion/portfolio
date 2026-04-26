
    /* ─── GLOBAL REFS ─── */
    const viewHome = document.getElementById('view-home');
    const viewGallery = document.getElementById('view-gallery');
    const contactPopover = document.getElementById('contact-popover');
    const contactBtn = document.getElementById('contact-btn');
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');
    const galleryContent = document.getElementById('gallery-content');

    /* ─── CURSOR (solid fill, instant, no delay) ─── */
    (function(){
        const c = document.getElementById('plm-cursor');
        if(!c || !window.matchMedia('(hover:hover)').matches) return;
        window.addEventListener('mousemove', function(e){
            c.style.left = e.clientX + 'px';
            c.style.top  = e.clientY + 'px';
            c.classList.toggle('hover', !!e.target.closest('a,button,[role="button"],.interactive,.card-float'));
        }, {passive:true});
    })();

    /* ─── CELLULAR AUTOMATA ─── */
    function initAutomata(canvasId){
        const canvas = document.getElementById(canvasId);
        if(!canvas) return;
        const ctx = canvas.getContext('2d');
        let w, h, rows, cols, grid;
        function resize(){
            w = canvas.width = canvas.offsetWidth;
            h = canvas.height = canvas.offsetHeight;
            cols = 12; rows = Math.ceil(h / (w/cols));
            grid = Array.from({length:rows*cols}, ()=>Math.random()>.85?1:0);
        }
        function draw(){
            ctx.clearRect(0,0,w,h);
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--fg').trim();
            const cw = w/cols;
            for(let i=0; i<rows; i++){
                for(let j=0; j<cols; j++){
                    if(grid[i*cols+j]) ctx.fillRect(j*cw, i*cw, cw-1, cw-1);
                }
            }
            let next = [...grid];
            for(let i=1; i<rows; i++){
                for(let j=0; j<cols; j++){
                    const prevRow = (i-1)*cols;
                    const left = grid[prevRow + (j-1+cols)%cols];
                    const mid = grid[prevRow + j];
                    const right = grid[prevRow + (j+1)%cols];
                    next[i*cols+j] = (left ^ right);
                }
            }
            grid = [...next.slice(cols), ...Array.from({length:cols}, ()=>Math.random()>.95?1:0)];
        }
        resize(); window.addEventListener('resize', resize);
        setInterval(draw, 120);
    }
    initAutomata('automata-left'); initAutomata('automata-right');

    /* ─── SCROLL & INTERSECTION ─── */
    const maskObs = new IntersectionObserver(entries=>{
        entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')});
    },{threshold:.1});

    let isMobile = window.innerWidth < 768;
    window.addEventListener('resize', ()=>{isMobile = window.innerWidth < 768});

    function updateHeroPanelWidth(){
        const wrap = document.getElementById('hero-logo-wrap');
        const release = document.getElementById('hero-release');
        if(wrap && release){
            const rect = wrap.getBoundingClientRect();
            const releaseRect = release.getBoundingClientRect();
            const panelW = Math.max(rect.width, releaseRect.width) + 40;
            document.documentElement.style.setProperty('--hero-panel-w', panelW + 'px');
        }
    }
    if(window.ResizeObserver){
        const heroObs = new ResizeObserver(updateHeroPanelWidth);
        const heroContent = document.querySelector('.hero-content');
        if(heroContent) heroObs.observe(heroContent);
    }
    // also update on animation frame as logo animates its size
    let heroPanelRaf = 0, heroPanelFrames = 0;
    function trackHeroPanelDuringAnim(){
        updateHeroPanelWidth();
        heroPanelFrames++;
        if(heroPanelFrames < 200) requestAnimationFrame(trackHeroPanelDuringAnim); // track for ~3s
    }
    requestAnimationFrame(trackHeroPanelDuringAnim);
    window.addEventListener('resize', updateHeroPanelWidth, {passive:true});

/* ─── RENDER HOME ─── */
    function renderHome(){
        const container = document.getElementById('clients-container');
        if(!container) return;
        let html = '';
        Object.keys(clientsData).forEach(name => {
            const client = clientsData[name];
            if(!client || client.total === 0) return; // skip empty
            // Get representative work (first from root or first category)
            let rep = client.root && client.root[0] ? client.root[0] : null;
            if(!rep && client.categories) {
                const firstCat = Object.keys(client.categories)[0];
                if(firstCat) rep = client.categories[firstCat][0];
            }
            
            const aspectClass = rep ? rep.format : 'default';
            // Use middle frame of mosaic as poster if available, better chance of being ready than the auto-poster
            const poster = (rep && rep.mosaic && rep.mosaic[1]) ? rep.mosaic[1] : (rep ? rep.poster_url : '');
            const tagline = clientDescriptions[name] || '';

            html += `
                <div role="listitem" class="card-float interactive entrance-mask" onclick="openClient('${name}')" tabindex="0">
                    <div class="client-card-wrap">
                        <div class="client-card-img-wrap ${aspectClass}">
                            <img class="client-card-img" src="${poster}" alt="${name}" loading="lazy" onerror="this.src='https://via.placeholder.com/600.png?text=Preview+Loading...'">
                            <div class="card-hover-tagline" aria-hidden="true">${tagline}</div>
                        </div>
                        <div class="client-card-footer">
                            <span class="client-name">${name}</span>
                            <span class="client-count">${String(client.total).padStart(2,'0')} WORKS</span>
                        </div>
                    </div>
                </div>`;
        });
        container.innerHTML = html;
        container.querySelectorAll('.entrance-mask').forEach(m => maskObs.observe(m));
    }

    /* ─── DATA — fetched from site-content.json (SPEC_02 unified source) ─── */
    let clientsData = {}, clientDescriptions = {}, categoryDescriptions = {}, portfolioData = {};
    fetch('../../site-content.json')
      .then(r => r.json())
      .then(d => {
        window.plmContent = d;
        portfolioData = d.portfolio || {};
        
        // Inject Hero text
        if(portfolioData.heroName) { const el=document.getElementById('p-hero-name'); if(el) el.innerHTML=portfolioData.heroName; }
        if(portfolioData.heroTitle) { const el=document.getElementById('p-hero-role'); if(el) el.innerHTML=portfolioData.heroTitle; }
        if(portfolioData.heroRelease) { const el=document.getElementById('p-hero-body'); if(el) el.innerHTML=portfolioData.heroRelease; }

        // Map SPEC_02 schema → shape the existing rendering functions expect
        Object.keys(d.clients).forEach(name => {
          const c = d.clients[name];
          // Skip private clients on the public-facing portfolio
          if (c.status === 'private') return;
          clientsData[name]        = c.media || { root: [], categories: {}, total: 0 };
          clientDescriptions[name] = c.tagline || '';
        });
        Object.keys(d.categoryMeta || {}).forEach(cat => {
          categoryDescriptions[cat] = (d.categoryMeta[cat] || {}).description || '';
        });
        renderHome();
        renderFooter();
      })
      .catch(err => console.error('[PLM] Failed to load site-content.json:', err));

    let currentClientName = '';
    function openClient(name, pushState=true){
        currentClientName = name;
        viewHome.classList.remove('active');
        const client=clientsData[name];if(!client)return;
        
        if(pushState) history.pushState({view:'gallery', client:name}, '', '#'+encodeURIComponent(name));

        const _cd = (plmContent.clients && plmContent.clients[name]) || {};
        const _deliverables = _cd.deliverables || [];
        // Also collect category names as additional tags
        const _catNames = Object.keys(client.categories || {});
        // Build all unique tags: deliverables first, then categories
        const _allTags = [..._deliverables, ..._catNames.filter(c => !_deliverables.includes(c))];

        let html='<div class="gallery-hero entrance-mask"><h1 class="gallery-title">'+name+'</h1>';
        if(clientDescriptions[name]) html+='<p class="gallery-desc">'+clientDescriptions[name]+'</p>';
        html+='<p class="gallery-meta"><span>'+String(client.total).padStart(2,'0')+'</span> EXECUTIONS</p>';
        if(_allTags.length){
            html+='<div class="deliverable-tags" role="list" aria-label="Deliverables">';
            _allTags.forEach(tag=>{ html+=`<span class="deliverable-tag" role="listitem">${tag}</span>`; });
            html+='</div>';
        }
        html+='</div>';
        
        // Root Videos & Special Layout for Single Work
        const rootWorks = (client.root||[]).filter(w=>w.video_url);
        const cats = Object.keys(client.categories||{});
        const totalWorksInCats = cats.reduce((sum,c)=>sum+(client.categories[c].filter(w=>w.video_url).length), 0);
        const isSingleWork = rootWorks.length === 1 && totalWorksInCats === 0;

        if(isSingleWork){
            const w = rootWorks[0];
            const poster = (w.mosaic && w.mosaic[1]) ? w.mosaic[1] : (w.poster_url || '');
            html += `<div class="single-work-container entrance-mask">
                <div class="interactive medium-player" style="aspect-ratio:${w.aspect || '16/9'}" onclick="openModal('${w.video_url}', '${w.preview_url || ''}', '${w.aspect || '16/9'}', '${w.title}', currentClientName)">
                    <img src="${poster}" class="work-card-img" loading="lazy">
                    <video class="work-card-img" style="position:absolute;top:0;left:0;opacity:0" width="100%" height="100%" preload="none" muted loop playsinline
                        onmouseenter="this.style.opacity=1;this.play()" 
                        onmouseleave="this.style.opacity=0;this.pause();this.currentTime=0;">
                        <source src="${w.preview_url || w.video_url}" type="video/mp4">
                    </video>
                    <div style="position:absolute;bottom:15px;right:15px;font-size:9px;font-weight:900;color:var(--bg);background:var(--fg);padding:4px 8px">VIEW FULLSCREEN</div>
                </div>
                <div class="work-card-foot" style="border:none;padding:0"><div class="work-title" style="font-size:18px">${w.title}</div></div>
            </div>`;
        } else if(rootWorks.length>0){
            html+='<div class="gallery-featured entrance-mask">';
            rootWorks.forEach(w=>{
                const aspectClass = w.format || 'default';
                const poster = (w.mosaic && w.mosaic[1]) ? w.mosaic[1] : (w.poster_url || '');
                html+=`<div class="interactive work-card-wrap" tabindex="0" onclick="openModal('${w.video_url}', '${w.preview_url || ''}', '${w.aspect || '16/9'}', '${w.title}', currentClientName)">
                    <div class="client-card-img-wrap ${aspectClass}">
                        <img src="${poster}" class="work-card-img" loading="lazy">
                        <video class="work-card-img" style="position:absolute;top:0;left:0;opacity:0" width="100%" height="100%" preload="none" muted loop playsinline
                            onmouseenter="this.style.opacity=1;this.play()" 
                            onmouseleave="this.style.opacity=0;this.pause();this.currentTime=0;">
                            <source src="${w.preview_url || w.video_url}" type="video/mp4">
                        </video>
                    </div>
                    <div class="work-card-foot"><div class="work-title">${w.title}</div></div>
                </div>`;
            });
            html+='</div>';
        }
        
        // Categories
        if(client.categories && !isSingleWork){
            cats.sort().forEach(cat=>{
                const works=client.categories[cat].filter(w=>w.video_url);
                if(works.length===0)return; 

                html+='<div class="category-section entrance-mask">';
                html+='<div class="category-header"><span class="category-name">'+cat+'</span><span class="category-count">'+String(works.length).padStart(2,'0')+' pieces</span></div>';
                if(categoryDescriptions[cat])html+='<p class="category-desc">'+categoryDescriptions[cat]+'</p>';
                html+='<div class="grid-works">';
                works.forEach(w=>{
                    const aspectClass = w.format || 'default';
                    const poster = (w.mosaic && w.mosaic[1]) ? w.mosaic[1] : (w.poster_url || '');
                    html+=`<div class="interactive work-card-wrap entrance-mask" tabindex="0" onclick="openModal('${w.video_url}', '${w.preview_url || ''}', '${w.aspect || '16/9'}', '${w.title}', currentClientName)">
                        <div class="client-card-img-wrap ${aspectClass}">
                            <img src="${poster}" class="work-card-img" loading="lazy">
                            <video class="work-card-img" style="position:absolute;top:0;left:0;opacity:0" width="100%" height="100%" preload="none" muted loop playsinline
                                onmouseenter="this.style.opacity=1;this.play()" 
                                onmouseleave="this.style.opacity=0;this.pause();this.currentTime=0;">
                                <source src="${w.preview_url || w.video_url}" type="video/mp4">
                            </video>
                        </div>
                        <div class="work-card-foot"><div class="work-title">${w.title}</div></div>
                    </div>`;
                });
                html+='</div></div>';
            });
        }
        
        html+='<div style="margin-top:80px;text-align:center" class="entrance-mask"><button class="back-btn interactive" onclick="goHome()" style="margin:0 auto">← BACK</button></div>';
        galleryContent.innerHTML=html;
        
        setTimeout(()=>{
            if(isMobile){viewHome.style.display='none';viewGallery.style.display='block';window.scrollTo(0,0)}
            viewGallery.classList.add('active');viewGallery.scrollTop=0;
            viewGallery.querySelectorAll('.entrance-mask').forEach(m=>maskObs.observe(m));
        },460);
    }

    function goHome(pushState=true){
        viewGallery.classList.remove('active');
        if(pushState) history.pushState({view:'home'}, '', window.location.pathname);
        setTimeout(()=>{
            if(isMobile){viewGallery.style.display='none';viewHome.style.display='block';window.scrollTo(0,0)}
            viewHome.classList.add('active');
        },460);
    }

    // Browser Back Button Support
    document.addEventListener('keydown', function(e){
        if(e.key === 'Backspace' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){
            if(modal && modal.classList.contains('active')){ e.preventDefault(); closeModal(); }
            else if(document.getElementById('view-gallery') && document.getElementById('view-gallery').classList.contains('active')){ e.preventDefault(); goHome(); }
        }
        if(e.key === 'Escape'){ if(typeof closeModal === 'function') closeModal(); }
    });

    window.onpopstate = function(e){
        if(e.state && e.state.view === 'gallery'){
            openClient(e.state.client, false);
        } else {
            goHome(false);
        }
    };

    let currentVideoData = { hd: '', preview: '' };
    let _playerHD = true; // start in HD mode

    function openModal(hdUrl, previewUrl, aspect, title, client){
        currentVideoData = { hd: hdUrl, preview: previewUrl || hdUrl };
        _playerHD = true;
        const ar = aspect || '16/9';
        const [aw, ah] = ar.split('/').map(Number);
        const arNum = (aw||16)/(ah||9);

        modal.style.display='flex';
        modal.setAttribute('aria-label', title || 'Video player');
        modalContent.innerHTML = `
        <button class="close-modal" onclick="closeModal()" aria-label="Close">CLOSE ×</button>
        <div class="plm-player-wrap" id="plm-wrap" style="--ar:${arNum}">
            <div class="plm-loader" id="plm-loader">
                <div class="plm-spinner"></div>
                <div style="font-size:8px;letter-spacing:.2em;font-weight:900;color:rgba(255,255,255,.4)">BUFFERING</div>
            </div>
            <div class="plm-play-icon" id="plm-play-icon">▶</div>
            <div class="plm-click-zone" id="plm-click-zone"></div>
            <video id="modal-video" autoplay playsinline preload="auto"
                style="width:100%;height:auto;display:block;background:#000">
                <source src="${hdUrl}" type="video/mp4">
            </video>
            <div class="plm-controls" id="plm-controls">
                <button class="plm-ctrl-btn" id="player-play-pause" aria-label="Play/Pause">❙❙</button>
                <div class="plm-seek" id="player-seek-bar" role="slider" aria-label="Seek">
                    <div class="plm-seek-fill" id="player-seek-fill"></div>
                    <div class="plm-seek-thumb" id="player-seek-thumb"></div>
                </div>
                <span class="plm-time" id="player-time">0:00 / 0:00</span>
                <div class="plm-vol">
                    <button class="plm-vol-btn" id="plm-mute-btn" aria-label="Mute" style="display:flex;align-items:center">
                        <svg id="vol-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M1 6h3.5L8 3.5v9L4.5 10H1z"/>
                            <path d="M10 5.5Q12 8 10 10.5" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round"/>
                            <path d="M12 3.5Q16 8 12 12.5" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round"/>
                        </svg>
                    </button>
                    <input class="plm-vol-slider" id="plm-vol" type="range" min="0" max="1" step="0.02" value="1" aria-label="Volume">
                </div>
                <button class="plm-hd-btn on" id="hd-toggle" onclick="toggleHD()" aria-label="Toggle HD">HD</button>
                <button class="plm-fs-btn" id="plm-fs-btn" aria-label="Fullscreen">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                        <path d="M1 5V1h4M9 1h4v4M13 9v4h-4M5 13H1V9"/>
                    </svg>
                </button>
            </div>
        </div>`;

        document.body.classList.add('modal-open');

        setTimeout(()=>modal.classList.add('active'),10);

        const v   = document.getElementById('modal-video');
        const lo  = document.getElementById('plm-loader');
        const fill= document.getElementById('player-seek-fill');
        const thumb = document.getElementById('player-seek-thumb');
        const seek= document.getElementById('player-seek-bar');
        const pb  = document.getElementById('player-play-pause');
        const tb  = document.getElementById('player-time');
        const mute= document.getElementById('plm-mute-btn');
        const vol = document.getElementById('plm-vol');
        const fs  = document.getElementById('plm-fs-btn');
        const ci  = document.getElementById('plm-play-icon');
        const cz  = document.getElementById('plm-click-zone');
        const wrap= document.getElementById('plm-wrap');

        // Loader
        v.oncanplay  = ()=>lo.classList.add('hidden');
        v.onwaiting  = ()=>lo.classList.remove('hidden');
        v.onplaying  = ()=>{ lo.classList.add('hidden'); pb.textContent='❙❙'; };
        v.onpause    = ()=>pb.textContent='▶';
        v.onended    = ()=>pb.textContent='▶';

        // Progress
        v.ontimeupdate = ()=>{
            if(!v.duration) return;
            const pct = v.currentTime/v.duration*100;
            fill.style.width = pct+'%';
            thumb.style.left = pct+'%';
            tb.textContent = formatTime(v.currentTime)+' / '+formatTime(v.duration);
        };

        // Seek — support click & drag
        function seekTo(e){
            const rect=seek.getBoundingClientRect();
            const pos=Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width));
            v.currentTime=pos*(v.duration||0);
        }
        let seeking=false;
        seek.addEventListener('mousedown',e=>{seeking=true;seekTo(e);},{ passive:true});
        window.addEventListener('mousemove',e=>{if(seeking)seekTo(e);},{ passive:true});
        window.addEventListener('mouseup',()=>seeking=false);
        // Touch seek
        seek.addEventListener('touchstart',e=>{seeking=true;seekTo(e.touches[0]);},{passive:true});
        window.addEventListener('touchmove',e=>{if(seeking)seekTo(e.touches[0]);},{passive:true});
        window.addEventListener('touchend',()=>seeking=false);

        // Play/Pause button
        pb.onclick=()=>v.paused?v.play():v.pause();

        // Click-to-play/pause with icon flash
        cz.onclick=()=>{
            v.paused?v.play():v.pause();
            ci.textContent=v.paused?'▶':'❙❙';
            ci.classList.add('flash');
            clearTimeout(ci._t);
            ci._t=setTimeout(()=>ci.classList.remove('flash'),500);
        };

        // Volume — SVG icon toggle
        function setVolIcon(muted){
            const icon = document.getElementById('vol-icon');
            if(!icon) return;
            if(muted){
                icon.innerHTML = '<path d="M1 6h3.5L8 3.5v9L4.5 10H1z"/><line x1="11" y1="6" x2="13.5" y2="9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="13.5" y1="6" x2="11" y2="9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>';
            } else {
                icon.innerHTML = '<path d="M1 6h3.5L8 3.5v9L4.5 10H1z"/><path d="M10 5.5Q12 8 10 10.5" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round"/><path d="M12 3.5Q16 8 12 12.5" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round"/>';
            }
        }
        vol.oninput=()=>{ v.volume=parseFloat(vol.value); setVolIcon(vol.value==0); };
        mute.onclick=()=>{
            v.muted=!v.muted;
            setVolIcon(v.muted);
            vol.value=v.muted?0:v.volume;
        };

        // Fullscreen
        fs.onclick=()=>{
            const el=wrap;
            if(!document.fullscreenElement){el.requestFullscreen&&el.requestFullscreen();}
            else{document.exitFullscreen&&document.exitFullscreen();}
        };
        document.addEventListener('fullscreenchange',_onFSChange);
        function _onFSChange(){ /* icon stays the same */ }

        // No auto-hide — controls always visible (user preference)
        v.onerror=()=>{ modalContent.innerHTML='<div style="padding:60px;color:#fff;text-align:center;font-weight:900;letter-spacing:.2em">VIDEO FAILED TO LOAD</div>'; };
        document.querySelector('.close-modal')&&document.querySelector('.close-modal').focus();
    }

    function formatTime(s){
        if(!s||isNaN(s)) return '0:00';
        const m=Math.floor(s/60),ss=Math.floor(s%60);
        return m+':'+(ss<10?'0':'')+ss;
    }
    function toggleHD(){
        const v=document.getElementById('modal-video');
        const btn=document.getElementById('hd-toggle');
        if(!v)return;
        const t=v.currentTime;
        _playerHD=!_playerHD;
        btn.classList.toggle('on',_playerHD);
        btn.classList.toggle('active',!_playerHD);
        v.src=_playerHD?currentVideoData.hd:currentVideoData.preview;
        v.load();
        v.currentTime=t;
        v.play();
    }
    function closeModal(){
        const v=document.getElementById('modal-video');
        if(v)v.pause();
        if(document.fullscreenElement)document.exitFullscreen&&document.exitFullscreen();
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
        setTimeout(()=>{modal.style.display='none';modalContent.innerHTML='';},300);
    }

    /* ─── THEME & CONTACT ─── */
    function toggleTheme(){
        const current = document.documentElement.getAttribute('data-theme');
        document.documentElement.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
    }
    function toggleContact(){
        contactPopover.classList.toggle('open');
    }
    window.addEventListener('click', e=>{
        if(!contactPopover.contains(e.target) && e.target !== contactBtn) contactPopover.classList.remove('open');
    });

    /* ─── FOOTER ─── */
    function renderFooter(){
        const container = document.getElementById('clients-container');
        if(!container || document.getElementById('portfolio-footer-el')) return;
        const P = portfolioData || {};
        const q1 = P.footerQuote1 || "&ldquo;Visual systems built for those who set the pace,&nbsp;not just follow&nbsp;it.&rdquo;";
        const q2 = P.footerQuote2 || "&ldquo;Systemize the motion, elevate the branding.&rdquo;";
        const wa = P.contactWhatsApp ? `href="https://wa.me/\${P.contactWhatsApp.replace(/\\D/g,'')}"` : `href="https://wa.me/5547999664274"`;
        const em = P.contactEmail ? `href="mailto:\${P.contactEmail}"` : `href="mailto:conceicao.felipe@gmail.com"`;
        const ig = P.socialInstagram ? `href="https://instagram.com/\${P.socialInstagram}"` : `href="https://instagram.com/pelimotion"`;
        const li = P.socialLinkedIn ? `href="https://linkedin.com/in/\${P.socialLinkedIn}"` : `href="https://linkedin.com/in/pelife"`;
        const be = P.socialBehance ? `href="https://behance.net/\${P.socialBehance}"` : `href="https://behance.net/pelimotion"`;
        const loc = P.footerStudioLocation || "Florianópolis, Brasil<br>Available worldwide";

        const footer = document.createElement('section');
        footer.id = 'portfolio-footer-el';
        footer.className = 'portfolio-footer entrance-mask';
        footer.setAttribute('aria-label','Footer');
        footer.innerHTML = `
            <div style="width:100%;padding-bottom:40px;border-bottom:1px solid var(--border);margin-bottom:40px">
                <p style="font-size:clamp(16px,2.5vw,26px);font-weight:900;letter-spacing:-.01em;line-height:1.3;color:var(--fg);max-width:600px;margin-bottom:20px">
                    \${q1}
                </p>
                <p style="font-size:clamp(12px,1.6vw,17px);font-weight:400;letter-spacing:.02em;line-height:1.5;color:var(--fg2);max-width:480px;font-style:italic">
                    \${q2}
                </p>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:40px;width:100%;margin-bottom:48px">
                <div>
                    <p class="portfolio-footer-sub" style="margin-bottom:16px">Contact</p>
                    <a \${wa} target="_blank" rel="noopener"
                       style="display:block;font-size:11px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--fg);text-decoration:none;margin-bottom:10px;transition:opacity .2s" onmouseover="this.style.opacity=.5" onmouseout="this.style.opacity=1">
                        WhatsApp ↗
                    </a>
                    <a \${em}
                       style="display:block;font-size:11px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--fg);text-decoration:none;transition:opacity .2s" onmouseover="this.style.opacity=.5" onmouseout="this.style.opacity=1">
                        Email ↗
                    </a>
                </div>
                <div>
                    <p class="portfolio-footer-sub" style="margin-bottom:16px">Follow</p>
                    <a \${ig} target="_blank" rel="noopener"
                       style="display:block;font-size:11px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--fg);text-decoration:none;margin-bottom:10px;transition:opacity .2s" onmouseover="this.style.opacity=.5" onmouseout="this.style.opacity=1">
                        Instagram \${P.socialInstagram?'@'+P.socialInstagram:'@pelimotion'} ↗
                    </a>
                    <a \${li} target="_blank" rel="noopener"
                       style="display:block;font-size:11px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--fg);text-decoration:none;margin-bottom:10px;transition:opacity .2s" onmouseover="this.style.opacity=.5" onmouseout="this.style.opacity=1">
                        LinkedIn \${P.socialLinkedIn?P.socialLinkedIn:'pelife'} ↗
                    </a>
                    <a \${be} target="_blank" rel="noopener"
                       style="display:block;font-size:11px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--fg);text-decoration:none;transition:opacity .2s" onmouseover="this.style.opacity=.5" onmouseout="this.style.opacity=1">
                        Behance \${P.socialBehance?P.socialBehance:'pelimotion'} ↗
                    </a>
                </div>
                <div>
                    <p class="portfolio-footer-sub" style="margin-bottom:16px">Studio</p>
                    <p style="font-size:10px;letter-spacing:.1em;color:var(--fg3);line-height:1.7">
                        \${loc}
                    </p>
                </div>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:20px;width:100%;padding-top:24px;border-top:1px solid var(--border)">
                <p class="portfolio-footer-copy" style="margin:0;border:none;padding:0">&copy; 2026 \${P.heroName||'Pelimotion'}. All rights reserved.</p>
                <img src="../../logo.png" alt="PLM" style="height:32px;width:auto;opacity:.35;filter:var(--img-filter)" loading="lazy">
            </div>
        `;
        container.parentElement.appendChild(footer);
        maskObs.observe(footer);
    }

    