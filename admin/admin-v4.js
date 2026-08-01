/* admin-v4.js - UI enhancements for v4 */

window.isUnlocked = function() { return true; };

// Wait for data load
const _originalLoadData = typeof loadData !== 'undefined' ? loadData : async function(){};
loadData = async function() {
    await _originalLoadData();
    if(typeof isUnlocked === 'function' ? isUnlocked() : true) initV4();
};

function initV4() {
    // Add event listeners for Command Palette
    document.addEventListener('keydown', e => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            openPalette();
        }
    });
    
    // Auto-save patch
    const _originalMarkUnsaved = window.markUnsaved || function(){};
    window.markUnsaved = function() {
        _originalMarkUnsaved();
        hasUnsaved = true;
        document.getElementById('unsaved-label')?.classList.add('visible');
    };
    
    showDashboard();
}

// ─── NOTIFICATIONS & STATUS ───
const _originalToast = window.toast || function(){};
window.toast = function(msg, isErr=false) {
    const el = document.getElementById('toast');
    if(!el) return _originalToast(msg, isErr);
    el.textContent = msg;
    el.className = 'toast show' + (isErr ? ' error' : '');
    setTimeout(() => el.classList.remove('show'), 3000);
};

const _originalSetStatus = window.setStatus || function(){};
window.setStatus = function(text, isErr=false) {
    const txt = document.getElementById('status-text');
    const dot = document.getElementById('status-dot');
    if(txt) txt.textContent = text;
    if(dot) dot.className = 'status-dot' + (isErr ? ' warn' : '');
};

// ─── COMMAND PALETTE ───
let paletteIndex = -1;
let paletteItems = [];

function openPalette() {
    const bg = document.getElementById('palette-bg');
    const inp = document.getElementById('palette-input');
    if(!bg || !inp) return;
    
    bg.classList.add('open');
    inp.value = '';
    renderPalette('');
    setTimeout(() => inp.focus(), 50);
}

function closePalette() {
    document.getElementById('palette-bg')?.classList.remove('open');
}

function renderPalette(query) {
    const res = document.getElementById('palette-results');
    if(!res) return;
    
    const q = query.toLowerCase();
    let html = '';
    paletteItems = [];
    let idx = 0;
    
    // Helper to add group
    const addGroup = (title, items) => {
        const filtered = items.filter(i => 
            i.title.toLowerCase().includes(q) || 
            (i.sub && i.sub.toLowerCase().includes(q)) ||
            (i.tag && i.tag.toLowerCase().includes(q))
        );
        
        if (filtered.length === 0) return;
        
        html += `<div class="palette-group">
            <div class="palette-group-label">${title}</div>`;
            
        filtered.forEach(item => {
            paletteItems.push(item);
            html += `<div class="palette-item" id="pi-${idx}" onclick="execPalette(${idx})">
                <div class="pi-icon">${item.icon}</div>
                <div class="pi-text">${esc(item.title)} <span class="pi-sub">${esc(item.sub||'')}</span></div>
                ${item.tag ? `<div class="pi-tag">${esc(item.tag)}</div>` : ''}
            </div>`;
            idx++;
        });
        html += `</div>`;
    };
    
    // Clients
    if (D && D.clients) {
        const clients = Object.keys(D.clients).map(k => ({
            title: D.clients[k].displayName || k,
            sub: `Client Hub`,
            icon: '📁',
            tag: D.clients[k].status,
            action: () => showClientHub(k)
        }));
        addGroup('Clients & Projects', clients);
    }
    
    // Pages
    addGroup('Site Pages', [
        {title: 'Landing Page', sub: 'Main index copy', icon: '🏠', action: showLanding},
        {title: 'Portfolio Settings', sub: 'Social links, footer', icon: '🎬', action: showPortfolio},
        {title: 'Curriculum', sub: 'CV Content', icon: '📄', action: showCurriculum}
    ]);

    addGroup('Tools', [
        {title: 'Conversor de GIF', sub: 'Otimizar GIFs • max 10MB • 1080p', icon: '🎞️', action: showGifConverter}
    ]);
    
    // Actions
    addGroup('Actions', [
        {title: 'Deploy Hub', sub: 'Status + deploy por projeto', icon: '🚀', action: showDeployHub},
        {title: 'Publicar Site', sub: 'Commit site-content.json', icon: '⚡', action: softDeploy},
        {title: 'Escanear Mídias', sub: 'Bunny.net CDN scanner', icon: '🔍', action: openMediaScanner},
        {title: 'Full Sync + Deploy', sub: 'Bunny scan + rebuild', icon: '🔄', action: fullSync},
        {title: 'Export JSON', sub: 'Download backup', icon: '💾', action: exportJSON}
    ]);
    
    if(paletteItems.length === 0) {
        html = `<div class="palette-empty">No results found for "${esc(query)}"</div>`;
    }
    
    res.innerHTML = html;
    paletteIndex = -1;
    selectPaletteItem(0);
}

function selectPaletteItem(index) {
    if(paletteItems.length === 0) return;
    if(index < 0) index = paletteItems.length - 1;
    if(index >= paletteItems.length) index = 0;
    
    document.querySelectorAll('.palette-item').forEach(el => el.classList.remove('selected'));
    const el = document.getElementById(`pi-${index}`);
    if(el) {
        el.classList.add('selected');
        el.scrollIntoView({block: 'nearest'});
    }
    paletteIndex = index;
}

function palettNav(e) {
    if(e.key === 'Escape') closePalette();
    else if(e.key === 'ArrowDown') { e.preventDefault(); selectPaletteItem(paletteIndex + 1); }
    else if(e.key === 'ArrowUp') { e.preventDefault(); selectPaletteItem(paletteIndex - 1); }
    else if(e.key === 'Enter') {
        e.preventDefault();
        execPalette(paletteIndex);
    }
}

function execPalette(index) {
    if(index >= 0 && index < paletteItems.length) {
        closePalette();
        paletteItems[index].action();
    }
}

// ─── BREADCRUMBS ───
function updateBreadcrumbs(crumbs) {
    const b = document.getElementById('breadcrumb');
    if(!b) return;
    
    let html = `<span class="crumb" onclick="showDashboard()">Admin</span>`;
    
    crumbs.forEach((c, i) => {
        html += `<span class="sep">/</span>`;
        if (i === crumbs.length - 1) {
            html += `<span class="crumb active">${esc(c.label)}</span>`;
        } else {
            html += `<span class="crumb" onclick="${c.action}">${esc(c.label)}</span>`;
        }
    });
    
    b.innerHTML = html;
}

// ─── SIDEBAR BUILDER ───
const _originalBuildSidebar = window.buildSidebar;
window.buildSidebar = function() {
    if(document.getElementById('sb-scroll')) {
        buildSidebarV4();
    } else if(_originalBuildSidebar) {
        _originalBuildSidebar();
    }
};

function buildSidebarV4(context = 'main') {
    const sb = document.getElementById('sb-scroll');
    if(!sb) return;
    
    let html = '';
    
    if (context === 'main') {
        html += `<div class="sb-section">Dashboard</div>`;
        html += `<div class="sb-item ${currentSection==='dashboard'?'active':''}" onclick="showDashboard()">
            <div class="dot green"></div>Overview</div>`;
            
        html += `<div class="sb-section" style="margin-top:10px">Site Pages</div>`;
        html += `<div class="sb-item ${currentSection==='landing'?'active':''}" onclick="showLanding()">
            <div class="dot yellow"></div>Landing Page</div>`;
        html += `<div class="sb-item ${currentSection==='portfolio'?'active':''}" onclick="showPortfolio()">
            <div class="dot yellow"></div>Portfolio Settings</div>`;
        html += `<div class="sb-item ${currentSection==='curriculum'?'active':''}" onclick="showCurriculum()">
            <div class="dot yellow"></div>Curriculum</div>`;
            
        html += `<div class="sb-section" style="margin-top:10px">Tools</div>`;
        html += `<div class="sb-item ${currentSection==='briefings'?'active':''}" onclick="showBriefings()">
            <div class="dot" style="background:#ff4b2b"></div>Briefings</div>`;
        html += `<div class="sb-item ${currentSection==='deployHub'?'active':''}" onclick="showDeployHub()">
            <div class="dot green"></div>Deploy Hub</div>`;
        html += `<div class="sb-item ${currentSection==='gifConverter'?'active':''}" onclick="showGifConverter()">
            <div class="dot" style="background:var(--blue)"></div>Conversor de GIF</div>`;
            
        html += `<div class="sb-section" style="margin-top:10px">Clients &amp; Projects</div>`;
        
        const order = D.clientOrder || Object.keys(D.clients || {}).sort();
        order.forEach(k => {
            const c = D.clients[k];
            if(!c) return;
            const name = c.displayName || k;
            const status = c.status || 'public';
            const isActive = currentSection === 'clientHub' && currentKey === k;
            
            html += `<div class="sb-item ${isActive?'active':''}" onclick="showClientHub('${k}')">
                <div class="dot ${status==='public'?'green':'yellow'}"></div>
                ${esc(name)}
                ${status!=='public' ? `<span class="status-pill ${status}">${status}</span>` : ''}
            </div>`;
        });
        
    } else if (context.startsWith('client:')) {
        const key = context.split(':')[1];
        const c = D.clients[key];
        const name = c ? (c.displayName || key) : key;
        
        html += `<div class="sb-item sb-back" onclick="showDashboard()">Back to Overview</div>`;
        html += `<div class="sb-divider"></div>`;
        
        html += `<div class="sb-section">${name}</div>`;
        html += `<div class="sb-item ${currentSection==='clientHub'?'active':''}" onclick="showClientHub('${key}')">
            <div class="dot green"></div>Hub & Metadata</div>`;
            
        if (c && c.media && c.media.root) {
            html += `<div class="sb-section" style="margin-top:10px">Projects</div>`;
            c.media.root.forEach((m, idx) => {
                const isActive = currentSection === 'mediaItem' && currentKey === `${key}:${idx}`;
                html += `<div class="sb-item indent ${isActive?'active':''}" onclick="showMediaEditor('${key}', ${idx})">
                    <div class="dot"></div>${esc(m.title || `Item ${idx}`)}
                </div>`;
            });
        }
    }
    
    sb.innerHTML = html;
}

// ─── DASHBOARD (Client List) ───
function showDashboard() {
    document.removeEventListener('keydown', playerKeyHandler);
    autoSave(); currentSection = 'dashboard'; currentKey = null;
    buildSidebarV4('main');
    updateBreadcrumbs([]);
    
    let html = `
    <div class="page-header">
        <div class="page-label">DASHBOARD</div>
        <h1 class="page-title">Portfolio Overview</h1>
    </div>
    
    <div class="card" style="background:transparent; border:none; padding:0">
        <div class="actions-bar" style="margin-bottom:16px">
            <button class="btn sm" onclick="alert('Client ordering UI coming soon')">⇅ Reorder</button>
            <span style="font-size:10px;color:var(--fg3);margin-left:auto">Total: ${Object.keys(D.clients||{}).length} clients</span>
        </div>
        
        <div class="client-list">
    `;
    
    const order = D.clientOrder || Object.keys(D.clients || {}).sort();
    
    order.forEach(k => {
        const c = D.clients[k];
        if(!c) return;
        const name = c.displayName || k;
        const status = c.status || 'public';
        const img = c.coverImage || '';
        const count = c.media ? (c.media.total || 0) : 0;
        
        html += `
        <div class="client-row" onclick="showClientHub('${k}')">
            <img src="${img}" class="thumb" onerror="this.style.display='none'">
            <div class="info">
                <div class="name">${esc(name)}</div>
                <div class="meta">${count} project${count!==1?'s':''} · /portfolio/#${esc(c.slug||k)}</div>
            </div>
            <div class="row-actions">
                <span class="status-pill ${status}">${status}</span>
                <span style="color:var(--fg3);font-size:14px">→</span>
            </div>
        </div>`;
    });
    
    html += `</div></div>`;
    document.getElementById('main-content').innerHTML = html;
}

// ─── CLIENT HUB ───
function showClientHub(key) {
    document.removeEventListener('keydown', playerKeyHandler);
    autoSave(); currentSection = 'clientHub'; currentKey = key;
    buildSidebarV4(`client:${key}`);
    const c = D.clients[key];
    if(!c) return showDashboard();
    
    const name = c.displayName || key;
    updateBreadcrumbs([{label: name, action: `showClientHub('${key}')`}]);
    
    let html = `
    <div class="page-header">
        <div class="page-label">CLIENT HUB</div>
        <div style="display:flex;justify-content:space-between;align-items:center">
            <h1 class="page-title">${esc(name)}</h1>
            <div class="vis-toggle" onclick="toggleClientStatus('${key}')" id="tog-${key}">
                <div class="vis-label">${c.status==='public'?'Public':'Hidden'}</div>
                <div class="vis-switch ${c.status==='public'?'on':''}"></div>
            </div>
        </div>
    </div>
    
    <div class="card"><div class="card-title">Identity</div>
        <div class="field-row">
            <div class="field"><label>Display Name</label><input id="f-cname" value="${esc(c.displayName||key)}" oninput="markUnsaved()"></div>
            <div class="field"><label>URL Slug</label><input id="f-cslug" value="${esc(c.slug||'')}" oninput="markUnsaved()"></div>
        </div>
        <div class="field-row">
            <div class="field"><label>External URL</label><input id="f-curl" value="${esc(c.externalUrl||'')}" oninput="markUnsaved()"></div>
            <div class="field"><label>Since (Year)</label><input id="f-cyear" value="${esc(c.since||'')}" oninput="markUnsaved()"></div>
        </div>
    </div>
    
    <div class="card"><div class="card-title">Descriptions</div>
        <div class="field-pair">
            <div class="field"><label>EN Description</label><textarea id="f-cdesc" rows="3" oninput="markUnsaved()">${esc(c.description||'')}</textarea></div>
            <div class="field"><label>PT Description</label><textarea id="f-cdesc_pt" rows="3" oninput="markUnsaved()">${esc(c.description_pt||'')}</textarea></div>
        </div>
    </div>
    
    <div class="card"><div class="card-title">Media / Projects</div>`;
    
    if (c.media && c.media.root && c.media.root.length > 0) {
        c.media.root.forEach((m, idx) => {
            html += `
            <div class="media-item-row" style="cursor:pointer" onclick="showMediaEditor('${key}', ${idx})">
                <img src="${m.poster_url||m.mosaic?.[1]||''}" class="thumb-s">
                <div class="mi-info">
                    <div class="mi-title">${esc(m.title||`Item ${idx}`)}</div>
                    <div class="mi-url">${m.project_folder ? `<span style="color:var(--yellow)">📁 ${esc(m.project_folder)}</span> · ` : ''}${esc(m.video_url||'')}</div>
                </div>
                <div class="status-pill ${m.status||'public'}">${m.status||'public'}</div>
                <div style="color:var(--fg3);font-size:12px">✎</div>
            </div>`;
        });
    } else {
        html += `<div style="font-size:10px;color:var(--fg3)">No media found. Run Sync to fetch from Bunny.net.</div>`;
    }
    html += `</div>`;
    
    // Advanced settings
    html += `
    <div class="advanced-toggle" onclick="this.classList.toggle('open'); document.getElementById('adv-${key}').classList.toggle('open')">
        <span class="chevron">▶</span> Advanced Settings (SEO & Tags)
    </div>
    <div class="advanced-body" id="adv-${key}">
        <div class="card" style="margin-top:10px">
            <div class="field"><label>SEO Title</label><input id="f-ctitle" value="${esc(c.seo?.title||'')}" oninput="markUnsaved()"></div>
            <div class="field"><label>SEO Description</label><textarea id="f-cseodesc" rows="2" oninput="markUnsaved()">${esc(c.seo?.description||'')}</textarea></div>
        </div>
    </div>
    
    <div class="actions-bar" style="margin-top:24px">
        <button class="btn primary" onclick="saveClientHub('${key}')">Save Changes</button>
    </div>`;
    
    document.getElementById('main-content').innerHTML = html;
}

function saveClientHub(key) {
    const c = D.clients[key];
    if(!c) return;
    
    const v = id => document.getElementById(id)?.value.trim() || '';
    
    c.displayName = v('f-cname');
    c.slug = v('f-cslug');
    c.externalUrl = v('f-curl');
    c.since = v('f-cyear');
    c.description = v('f-cdesc');
    c.description_pt = v('f-cdesc_pt');
    
    if(!c.seo) c.seo = {};
    c.seo.title = v('f-ctitle');
    c.seo.description = v('f-cseodesc');
    
    c.updatedAt = new Date().toISOString();
    
    saveAll();
    buildSidebarV4(`client:${key}`);
    toast('Client updated');
}

function toggleClientStatus(key) {
    const c = D.clients[key];
    if(!c) return;
    
    c.status = c.status === 'public' ? 'private' : 'public';
    c.updatedAt = new Date().toISOString();
    
    // Optimistic UI update
    const tog = document.getElementById(`tog-${key}`);
    if(tog) {
        tog.querySelector('.vis-label').textContent = c.status === 'public' ? 'Public' : 'Hidden';
        if(c.status === 'public') tog.querySelector('.vis-switch').classList.add('on');
        else tog.querySelector('.vis-switch').classList.remove('on');
    }
    
    markUnsaved();
    buildSidebarV4(`client:${key}`);
}

// ─── MEDIA EDITOR ───
function showMediaEditor(clientKey, idx) {
    autoSave(); currentSection = 'mediaItem'; currentKey = `${clientKey}:${idx}`;
    const c = D.clients[clientKey];
    if(!c || !c.media || !c.media.root || !c.media.root[idx]) return showClientHub(clientKey);
    
    buildSidebarV4(`client:${clientKey}`);
    
    const m = c.media.root[idx];
    const cname = c.displayName || clientKey;
    const mname = m.title || `Item ${idx}`;
    
    updateBreadcrumbs([
        {label: cname, action: `showClientHub('${clientKey}')`},
        {label: 'Edit Media', action: ''}
    ]);
    
    let html = `
    <div class="page-header">
        <div class="page-label">MEDIA ASSET</div>
        <div style="display:flex;justify-content:space-between;align-items:center">
            <h1 class="page-title">${esc(mname)}</h1>
            <div class="vis-toggle" onclick="toggleMediaStatus('${clientKey}', ${idx})" id="mtog-${idx}">
                <div class="vis-label">${m.status==='public'?'Public':'Hidden'}</div>
                <div class="vis-switch ${m.status==='public'||!m.status?'on':''}"></div>
            </div>
        </div>
    </div>
    
    <div class="card" style="padding:0;overflow:hidden;position:relative">
        <video id="precision-video" src="${m.preview_url || m.video_url || ''}" style="width:100%;max-height:400px;object-fit:contain;background:#000" playsinline crossorigin="anonymous"></video>
        <video id="hd-video" src="${m.video_url}" style="display:none" crossorigin="anonymous" preload="auto"></video>
        
        <div class="player-controls" style="padding:10px;background:var(--card);display:flex;flex-direction:column;gap:8px">
            <div style="display:flex;align-items:center;gap:10px">
                <button class="btn sm" onclick="togglePlay()">▶</button>
                <input type="range" id="timeline" min="0" max="100" value="0" step="0.01" style="flex:1" oninput="scrubVideo()">
                <div id="timecode" style="font-family:monospace;font-size:12px;color:var(--yellow)">00:00.000</div>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px">
                <div style="display:flex;gap:5px">
                    <button class="btn sm" onclick="stepFrame(-1)">-1f</button>
                    <button class="btn sm" onclick="stepFrame(1)">+1f</button>
                </div>
                <div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap">
                    <button class="btn sm primary" onclick="captureFrame('${clientKey}', ${idx})">📸 Capture Frame</button>
                    <div style="width:1px;height:20px;background:var(--border);margin:0 5px"></div>
                    <button class="btn sm" onclick="markIn()">IN</button>
                    <div id="mark-in-display" style="font-size:10px;font-family:monospace;width:60px">--</div>
                    <button class="btn sm" onclick="markOut()">OUT</button>
                    <div id="mark-out-display" style="font-size:10px;font-family:monospace;width:60px">--</div>
                    <button class="btn sm primary" onclick="generateGIF('${clientKey}', ${idx})">🎬 Generate GIF</button>
                </div>
            </div>
            <div id="capture-output" style="display:none;margin-top:10px;padding-top:10px;border-top:1px solid var(--border)"></div>
        </div>
    </div>
    
    <div class="card"><div class="card-title">Details</div>
        <div class="field-pair">
            <div class="field"><label>EN Title</label><input id="f-mtitle" value="${esc(m.title||'')}" oninput="markUnsaved()"></div>
            <div class="field"><label>PT Title</label><input id="f-mtitle_pt" value="${esc(m.title_pt||'')}" oninput="markUnsaved()"></div>
        </div>
        <div class="field-pair">
            <div class="field"><label>EN Description</label><textarea id="f-mdesc" rows="2" oninput="markUnsaved()">${esc(m.description||'')}</textarea></div>
            <div class="field"><label>PT Description</label><textarea id="f-mdesc_pt" rows="2" oninput="markUnsaved()">${esc(m.description_pt||'')}</textarea></div>
        </div>
    </div>
    
    <div class="card"><div class="card-title">Technical (Auto-synced)</div>
        <div style="font-size:9px;color:var(--fg3);line-height:1.6;font-family:monospace;word-break:break-all">
            URL: ${m.video_url}<br>
            Format: ${m.format} (${m.aspect})
        </div>
    </div>
    
    <div class="card"><div class="card-title">Frames de Capa</div>
        <div class="hint" style="margin-bottom:12px">Upload manual frames to override auto-generated mosaics. Prioridade sobre imagens geradas do CDN.</div>
        <div class="field-row" style="grid-template-columns: 1fr 1fr 1fr">
            ${[0,1,2].map(slot => {
                const manual = (m.manualFrames || []).find(f => f.slot === slot);
                const currentUrl = manual ? manual.url : (m.mosaic?.[slot] || m.poster_url || '');
                const isManual = !!manual;
                return `
                <div class="field" style="border:1px solid var(--border);padding:10px;background:var(--bg)">
                    <label style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                        Capa ${slot + 1}
                        ${isManual ? '<span class="status-pill public">MANUAL</span>' : '<span class="status-pill draft">AUTO</span>'}
                    </label>
                    <div style="width:100%;aspect-ratio:16/9;background:#000;margin-bottom:10px;position:relative">
                        <img src="${esc(currentUrl)}" style="width:100%;height:100%;object-fit:cover;opacity:0.8">
                    </div>
                    <div style="display:flex;gap:6px">
                        <label class="btn sm" style="flex:1;justify-content:center;text-align:center">
                            Substituir
                            <input type="file" accept="image/jpeg,image/png,image/webp" style="display:none" onchange="handleFrameUpload(this, '${clientKey}', ${idx}, ${slot})">
                        </label>
                        ${isManual ? `<button class="btn danger sm" onclick="removeManualFrame('${clientKey}', ${idx}, ${slot})">✕</button>` : ''}
                    </div>
                </div>
                `;
            }).join('')}
        </div>
    </div>
    
    <div class="actions-bar">
        <button class="btn primary" onclick="saveMediaEditor('${clientKey}', ${idx})">Save Changes</button>
    </div>`;
    
    document.getElementById('main-content').innerHTML = html;
    setTimeout(initPrecisionPlayer, 50);
}

function saveMediaEditor(clientKey, idx) {
    const c = D.clients[clientKey];
    if(!c || !c.media || !c.media.root || !c.media.root[idx]) return;
    
    const m = c.media.root[idx];
    const v = id => document.getElementById(id)?.value.trim() || '';
    
    m.title = v('f-mtitle');
    m.title_pt = v('f-mtitle_pt');
    m.description = v('f-mdesc');
    m.description_pt = v('f-mdesc_pt');
    m.updatedAt = new Date().toISOString();
    
    saveAll();
    buildSidebarV4(`client:${clientKey}`);
    toast('Media updated');
}

function toggleMediaStatus(clientKey, idx) {
    const c = D.clients[clientKey];
    if(!c || !c.media || !c.media.root || !c.media.root[idx]) return;
    
    const m = c.media.root[idx];
    m.status = (!m.status || m.status === 'public') ? 'private' : 'public';
    m.updatedAt = new Date().toISOString();
    
    const tog = document.getElementById(`mtog-${idx}`);
    if(tog) {
        tog.querySelector('.vis-label').textContent = m.status === 'public' ? 'Public' : 'Hidden';
        if(m.status === 'public') tog.querySelector('.vis-switch').classList.add('on');
        else tog.querySelector('.vis-switch').classList.remove('on');
    }
    
    markUnsaved();
    buildSidebarV4(`client:${clientKey}`);
}

async function handleFrameUpload(input, clientKey, idx, slot) {
    const file = input.files[0];
    if (!file) return;
    
    input.value = ''; // reset
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        return toast('Invalid format. Use JPG, PNG or WebP.', true);
    }
    
    // Read file as base64
    const reader = new FileReader();
    reader.onload = async (e) => {
        const base64Data = e.target.result.split(',')[1];
        toast(`Uploading Capa ${slot + 1}...`);
        
        try {
            const res = await fetch('/api/upload-frame', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filename: file.name,
                    contentType: file.type,
                    base64Data: base64Data
                })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Upload failed');
            
            // Success, update model
            const c = D.clients[clientKey];
            const m = c.media.root[idx];
            m.manualFrames = m.manualFrames || [];
            
            // Remove existing slot
            m.manualFrames = m.manualFrames.filter(f => f.slot !== slot);
            
            m.manualFrames.push({
                slot: slot,
                url: data.url,
                source: 'manual',
                uploaded_at: new Date().toISOString()
            });
            m.updatedAt = new Date().toISOString();
            
            saveAll();
            showMediaEditor(clientKey, idx);
            toast('Frame uploaded successfully!');
        } catch (err) {
            console.error(err);
            toast(err.message, true);
        }
    };
    reader.readAsDataURL(file);
}

function removeManualFrame(clientKey, idx, slot) {
    const c = D.clients[clientKey];
    if(!c) return;
    const m = c.media.root[idx];
    if(m && m.manualFrames) {
        m.manualFrames = m.manualFrames.filter(f => f.slot !== slot);
        m.updatedAt = new Date().toISOString();
        saveAll();
        showMediaEditor(clientKey, idx);
        toast('Manual frame removed');
    }
}

// ─── PLAYER & EXPORT LOGIC ───
let playerState = { vid: null, hdVid: null, inPoint: null, outPoint: null, fps: 30 };

function initPrecisionPlayer() {
    playerState.vid = document.getElementById('precision-video');
    playerState.hdVid = document.getElementById('hd-video');
    playerState.inPoint = null;
    playerState.outPoint = null;
    
    if(!playerState.vid) return;
    
    playerState.vid.addEventListener('timeupdate', () => {
        if(!playerState.vid.duration) return;
        document.getElementById('timeline').value = (playerState.vid.currentTime / playerState.vid.duration) * 100;
        document.getElementById('timecode').textContent = formatTimecode(playerState.vid.currentTime);
    });
    
    document.addEventListener('keydown', playerKeyHandler);
}

function playerKeyHandler(e) {
    if(currentSection !== 'mediaItem' || !playerState.vid) return;
    if(e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    if(e.key === ' ') {
        e.preventDefault();
        togglePlay();
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        stepFrame(-1);
    } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        stepFrame(1);
    }
}

function togglePlay() {
    if(!playerState.vid) return;
    if(playerState.vid.paused) playerState.vid.play();
    else playerState.vid.pause();
}

function scrubVideo() {
    if(!playerState.vid || !playerState.vid.duration) return;
    const val = document.getElementById('timeline').value;
    playerState.vid.currentTime = (val / 100) * playerState.vid.duration;
}

function stepFrame(dir) {
    if(!playerState.vid) return;
    playerState.vid.pause();
    playerState.vid.currentTime += dir * (1/playerState.fps);
}

function formatTimecode(sec) {
    const d = new Date(sec * 1000);
    return d.toISOString().substr(14, 9); // 00:00.000
}

function markIn() {
    if(!playerState.vid) return;
    playerState.inPoint = playerState.vid.currentTime;
    document.getElementById('mark-in-display').textContent = formatTimecode(playerState.inPoint);
    checkDuration();
}

function markOut() {
    if(!playerState.vid) return;
    playerState.outPoint = playerState.vid.currentTime;
    document.getElementById('mark-out-display').textContent = formatTimecode(playerState.outPoint);
    checkDuration();
}

function checkDuration() {
    if(playerState.inPoint !== null && playerState.outPoint !== null) {
        const dur = playerState.outPoint - playerState.inPoint;
        if (dur > 4) {
            toast(`Aviso: Duração do GIF é de ${dur.toFixed(1)}s (Ideal < 4s)`, true);
        }
    }
}

async function captureFrame(clientKey, idx) {
    if(!playerState.vid || !playerState.hdVid) return;
    playerState.vid.pause();
    
    const time = playerState.vid.currentTime;
    const hd = playerState.hdVid;
    
    toast('Carregando Frame HD...');
    
    hd.currentTime = time;
    
    await new Promise(resolve => {
        const onSeeked = () => {
            hd.removeEventListener('seeked', onSeeked);
            resolve();
        };
        hd.addEventListener('seeked', onSeeked);
        // Fallback in case seeked doesn't fire
        setTimeout(resolve, 1000);
    });
    
    const canvas = document.createElement('canvas');
    canvas.width = hd.videoWidth || playerState.vid.videoWidth || 1920;
    canvas.height = hd.videoHeight || playerState.vid.videoHeight || 1080;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(hd, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const out = document.getElementById('capture-output');
        out.style.display = 'block';
        out.innerHTML = `
            <div style="font-size:10px;color:var(--yellow);margin-bottom:5px">Captured HD Frame (${canvas.width}x${canvas.height})</div>
            <img src="${url}" style="width:100%;max-width:300px;border:1px solid var(--border)">
            <div style="margin-top:5px;display:flex;gap:5px">
                <a href="${url}" download="${D.clients[clientKey].media.root[idx].title.replace(/ /g,'_')}_${time.toFixed(2)}.jpg" class="btn sm primary">Download JPG</a>
                <button class="btn sm" onclick="alert('Após baixar, use os botões \\'Substituir\\' acima para fazer o upload da capa.')">Como usar?</button>
            </div>
        `;
        toast('Frame capturado com sucesso!');
    }, 'image/jpeg', 0.95);
}

let ffmpeg = null;

async function generateGIF(clientKey, idx) {
    if (!window.FFmpegWASM || !window.FFmpegUtil) {
        return toast('FFmpeg scripts not loaded.', true);
    }
    
    if(playerState.inPoint === null || playerState.outPoint === null) {
        return toast('Marque IN e OUT primeiro', true);
    }
    
    const dur = playerState.outPoint - playerState.inPoint;
    if(dur <= 0) return toast('Ponto OUT deve ser após o IN', true);
    
    toast('Carregando FFmpeg (Single-Threaded)...');
    const out = document.getElementById('capture-output');
    out.style.display = 'block';
    out.innerHTML = `<div style="font-size:10px;color:var(--blue)">Carregando FFmpeg WASM...</div>`;
    
    try {
        if (!ffmpeg) {
            out.innerHTML = `<div style="font-size:10px;color:var(--blue)">Downloading FFmpeg Engine...</div>`;
            ffmpeg = new FFmpegWASM.FFmpeg();
            ffmpeg.on('progress', ({ progress, time }) => {
                out.innerHTML = `<div style="font-size:10px;color:var(--yellow)">Renderizando GIF: ${(progress * 100).toFixed(1)}%</div>
                <div style="width:100%;height:4px;background:var(--border);margin-top:4px"><div style="width:${progress*100}%;height:100%;background:var(--yellow)"></div></div>`;
            });
            const baseURL = new URL('/assets/ffmpeg/', window.location.origin).href;
            await ffmpeg.load({
                coreURL: baseURL + 'ffmpeg-core.js',
                wasmURL: baseURL + 'ffmpeg-core.wasm'
            });
        }
        
        const m = D.clients[clientKey].media.root[idx];
        const videoUrl = m.video_url;
        
        out.innerHTML = `<div style="font-size:10px;color:var(--blue)">Baixando Vídeo HD do Bunny.net...</div>`;
        
        const { fetchFile } = FFmpegUtil;
        const videoData = await fetchFile(videoUrl);
        await ffmpeg.writeFile('input.mp4', videoData);
        
        out.innerHTML = `<div style="font-size:10px;color:var(--blue)">Processando GIF (Isso pode demorar alguns minutos)...</div>`;
        
        const safeTitle = (m.title || 'video').replace(/[^a-z0-9]/gi, '_');
        const outName = `${safeTitle}.gif`;
        
        // Command: extract duration, scale to 720 width, generate palette, use palette
        await ffmpeg.exec([
            '-ss', playerState.inPoint.toString(),
            '-t', dur.toString(),
            '-i', 'input.mp4',
            '-vf', 'fps=15,scale=720:-1:flags=lanczos,split[s0][s1];[s0]palettegen=stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5',
            '-loop', '0',
            outName
        ]);
        
        const data = await ffmpeg.readFile(outName);
        const blob = new Blob([data.buffer], { type: 'image/gif' });
        const url = URL.createObjectURL(blob);
        
        out.innerHTML = `
            <div style="font-size:10px;color:var(--green);margin-bottom:5px">GIF Gerado com Sucesso!</div>
            <img src="${url}" style="width:100%;max-width:300px;border:1px solid var(--border)">
            <div style="margin-top:5px">
                <a href="${url}" download="${outName}" class="btn sm primary">Download GIF</a>
            </div>
        `;
        toast('GIF gerado com sucesso!');
        
    } catch (err) {
        console.error(err);
        out.innerHTML = `<div style="font-size:10px;color:var(--red)">Erro: ${err.message}. Verifique o console.</div>`;
        toast('Erro ao gerar GIF', true);
    }
}

// ─── DEPLOY OPERATIONS (see Deploy Hub section below) ───

// Helper to escape HTML to prevent XSS in inputs
function esc(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── GIF CONVERTER ───
let gifConverterFFmpeg = null;

function showGifConverter() {
    document.removeEventListener('keydown', playerKeyHandler);
    currentSection = 'gifConverter'; currentKey = null;
    buildSidebarV4('main');
    updateBreadcrumbs([{label: 'Conversor de GIF', action: 'showGifConverter()'}]);

    const html = `
    <div class="page-header">
        <div class="page-label">TOOLS</div>
        <h1 class="page-title">Conversor de GIF</h1>
        <div style="font-size:12px;color:var(--fg3);margin-top:6px;line-height:1.6">
            Otimiza qualquer GIF para ≤ 10 MB e máx 1080p usando FFmpeg.wasm (2-pass local, sem upload).
        </div>
    </div>

    <div class="card" id="gc-dropzone" style="border:2px dashed var(--border);text-align:center;padding:40px 20px;cursor:pointer;transition:border-color .2s"
        onclick="document.getElementById('gc-file-input').click()"
        ondragover="event.preventDefault(); this.style.borderColor='var(--blue)'"
        ondragleave="this.style.borderColor='var(--border)'"
        ondrop="event.preventDefault(); this.style.borderColor='var(--border)'; handleGifDrop(event.dataTransfer.files[0])">
        <div style="font-size:32px;margin-bottom:12px">🎞️</div>
        <div style="font-size:14px;font-weight:700;margin-bottom:6px">Arraste um GIF aqui</div>
        <div style="font-size:11px;color:var(--fg3)">ou clique para selecionar</div>
        <input type="file" id="gc-file-input" accept="image/gif" style="display:none" onchange="handleGifDrop(this.files[0])">
    </div>

    <div id="gc-info" style="display:none" class="card">
        <div class="card-title">Arquivo Original</div>
        <div id="gc-info-body" style="font-size:12px;line-height:2;color:var(--fg2)"></div>
        <div style="margin-top:16px">
            <button class="btn primary" onclick="runGifConvert()">🚀 Converter e Otimizar</button>
        </div>
    </div>

    <div id="gc-progress" style="display:none" class="card">
        <div class="card-title" id="gc-progress-title">Processando…</div>
        <div style="width:100%;height:6px;background:var(--border);margin:8px 0;border-radius:3px">
            <div id="gc-progress-bar" style="height:100%;width:0%;background:var(--blue);border-radius:3px;transition:width .3s"></div>
        </div>
        <div id="gc-progress-label" style="font-size:10px;color:var(--fg3);font-family:monospace"></div>
    </div>

    <div id="gc-result" style="display:none" class="card">
        <div class="card-title" style="color:var(--green)">✅ GIF Otimizado!</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start">
            <div>
                <div style="font-size:9px;font-weight:700;letter-spacing:.3em;text-transform:uppercase;color:var(--fg3);margin-bottom:8px">Preview</div>
                <img id="gc-result-img" style="width:100%;border:1px solid var(--border);background:#000">
            </div>
            <div>
                <div style="font-size:9px;font-weight:700;letter-spacing:.3em;text-transform:uppercase;color:var(--fg3);margin-bottom:12px">Resultado</div>
                <div id="gc-result-body" style="font-size:12px;line-height:2.2;color:var(--fg2)"></div>
                <div style="margin-top:20px">
                    <a id="gc-download-btn" class="btn primary" download>⬇ Download GIF</a>
                </div>
            </div>
        </div>
    </div>`;

    document.getElementById('main-content').innerHTML = html;
}

let _gcSourceFile = null;
let _gcSourceMeta = null;

function handleGifDrop(file) {
    if (!file || file.type !== 'image/gif') return toast('Selecione um arquivo .gif', true);
    _gcSourceFile = file;

    const sizeKB = (file.size / 1024).toFixed(1);
    const sizeMB = (file.size / 1024 / 1024).toFixed(2);

    // Read to detect dimensions and frame count
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
        _gcSourceMeta = { w: img.naturalWidth, h: img.naturalHeight, sizeMB: parseFloat(sizeMB), url };

        const infoEl = document.getElementById('gc-info');
        const infoBody = document.getElementById('gc-info-body');
        if (!infoEl || !infoBody) return;

        infoBody.innerHTML = `
            <span style="color:var(--fg3)">Nome:</span> <strong>${esc(file.name)}</strong><br>
            <span style="color:var(--fg3)">Tamanho:</span> <strong style="color:${parseFloat(sizeMB)>10?'var(--red)':'var(--fg)'}">${sizeMB} MB (${sizeKB} KB)</strong><br>
            <span style="color:var(--fg3)">Dimensões:</span> <strong>${img.naturalWidth} × ${img.naturalHeight} px</strong>
        `;
        infoEl.style.display = 'block';
        document.getElementById('gc-result').style.display = 'none';
        document.getElementById('gc-progress').style.display = 'none';
    };
    img.src = url;
}

function gcSetProgress(label, pct) {
    const bar = document.getElementById('gc-progress-bar');
    const lbl = document.getElementById('gc-progress-label');
    const title = document.getElementById('gc-progress-title');
    if (bar) bar.style.width = pct + '%';
    if (lbl) lbl.textContent = label;
    if (title) title.textContent = label;
}

async function runGifConvert() {
    if (!_gcSourceFile || !_gcSourceMeta) return toast('Nenhum GIF carregado', true);
    if (!window.FFmpegWASM || !window.FFmpegUtil) return toast('FFmpeg scripts não carregados.', true);

    const progressEl = document.getElementById('gc-progress');
    const resultEl = document.getElementById('gc-result');
    if (!progressEl) return;
    progressEl.style.display = 'block';
    resultEl.style.display = 'none';
    gcSetProgress('Inicializando FFmpeg…', 5);

    try {
        // Init FFmpeg if needed
        if (!gifConverterFFmpeg) {
            gcSetProgress('Carregando motor FFmpeg.wasm…', 10);
            gifConverterFFmpeg = new FFmpegWASM.FFmpeg();
            const baseURL = new URL('/assets/ffmpeg/', window.location.origin).href;
            await gifConverterFFmpeg.load({
                coreURL: baseURL + 'ffmpeg-core.js',
                wasmURL: baseURL + 'ffmpeg-core.wasm'
            });
        }

        const ff = gifConverterFFmpeg;
        const { fetchFile } = FFmpegUtil;
        const { w, h, sizeMB } = _gcSourceMeta;

        gcSetProgress('Carregando arquivo GIF…', 20);
        const inputData = await fetchFile(_gcSourceFile);
        await ff.writeFile('input.gif', inputData);

        // Determine scale
        const MAX_DIM = 1080;
        let scaleFilter = 'scale=trunc(iw/2)*2:trunc(ih/2)*2'; // ensure divisible by 2, no resize
        if (w > MAX_DIM || h > MAX_DIM) {
            if (w >= h) {
                scaleFilter = `scale=${MAX_DIM}:trunc(ow/a/2)*2`;
            } else {
                scaleFilter = `scale=trunc(oh*a/2)*2:${MAX_DIM}`;
            }
        }

        // Try FPS values in priority order: original (via -r passthrough = high), 15, 10
        const fpsTrials = [null, 15, 10]; // null = keep original
        let outputData = null;
        let usedFps = 'original';
        let finalSizeMB = 0;

        for (const fps of fpsTrials) {
            const fpsLabel = fps === null ? 'original' : `${fps}fps`;
            gcSetProgress(`Pass 1/2: Gerando paleta (${fpsLabel})…`, 35);

            const vfPass1 = fps === null
                ? `${scaleFilter},palettegen=max_colors=256:stats_mode=diff`
                : `fps=${fps},${scaleFilter},palettegen=max_colors=256:stats_mode=diff`;

            await ff.exec(['-i', 'input.gif', '-vf', vfPass1, '-y', 'palette.png']);

            gcSetProgress(`Pass 2/2: Convertendo GIF (${fpsLabel})…`, 60);

            const vfPass2 = fps === null
                ? `${scaleFilter}[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle`
                : `fps=${fps},${scaleFilter}[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle`;

            await ff.exec(['-i', 'input.gif', '-i', 'palette.png', '-lavfi', vfPass2, '-y', 'output.gif']);

            outputData = await ff.readFile('output.gif');
            finalSizeMB = outputData.byteLength / 1024 / 1024;
            usedFps = fpsLabel;

            gcSetProgress(`Verificando tamanho (${finalSizeMB.toFixed(2)} MB)…`, 80);

            if (finalSizeMB <= 10) break; // within limit, done
            // else loop and try lower fps
        }

        if (!outputData) throw new Error('Falha ao converter o GIF');

        if (finalSizeMB > 10) {
            toast(`Aviso: GIF final é ${finalSizeMB.toFixed(2)} MB — acima de 10 MB mesmo no mínimo FPS.`, true);
        }

        gcSetProgress('Finalizando…', 95);

        const blob = new Blob([outputData.buffer], { type: 'image/gif' });
        const resultUrl = URL.createObjectURL(blob);

        const origSizeMB = _gcSourceMeta.sizeMB;
        const reduction = origSizeMB > 0 ? ((1 - finalSizeMB / origSizeMB) * 100).toFixed(1) : '—';

        // Get output dimensions via image element
        const outImg = new Image();
        outImg.onload = () => {
            const resultBody = document.getElementById('gc-result-body');
            if (resultBody) {
                resultBody.innerHTML = `
                    <span style="color:var(--fg3)">Tamanho:</span> <strong style="color:${finalSizeMB<=10?'var(--green)':'var(--red)'}">${finalSizeMB.toFixed(2)} MB</strong><br>
                    <span style="color:var(--fg3)">Redução:</span> <strong style="color:var(--green)">${reduction}%</strong><br>
                    <span style="color:var(--fg3)">Dimensões:</span> <strong>${outImg.naturalWidth} × ${outImg.naturalHeight} px</strong><br>
                    <span style="color:var(--fg3)">FPS usado:</span> <strong>${usedFps}</strong>
                `;
            }
        };
        outImg.src = resultUrl;

        const resultImgEl = document.getElementById('gc-result-img');
        const dlBtn = document.getElementById('gc-download-btn');
        if (resultImgEl) resultImgEl.src = resultUrl;
        if (dlBtn) {
            dlBtn.href = resultUrl;
            const outName = _gcSourceFile.name.replace(/\.gif$/i, '_otimizado.gif');
            dlBtn.setAttribute('download', outName);
        }

        progressEl.style.display = 'none';
        resultEl.style.display = 'block';
        gcSetProgress('Concluído!', 100);
        toast('GIF convertido com sucesso!');

    } catch (err) {
        console.error('[GIF Converter]', err);
        gcSetProgress(`Erro: ${err.message}`, 0);
        toast('Erro na conversão. Veja o console.', true);
    }
}

// ═══════════════════════════════════════════════════════════════
// DEPLOY HUB
// ═══════════════════════════════════════════════════════════════

const DEPLOY_PROJECTS = [
    { id: 'landing',   name: 'Landing Page',     icon: '🏠', statusFile: 'STATUS.md', url: 'pelimotion.art',               color: 'var(--green)',  note: '' },
    { id: 'admin',     name: 'Admin Panel',       icon: '⚙️', statusFile: 'STATUS.md', url: 'pelimotion.art/admin',         color: 'var(--yellow)', note: '' },
    { id: 'generator', name: 'Blog Generator',    icon: '✍️', statusFile: 'STATUS.md', url: 'pelimotion.art/blog-generator', color: 'var(--blue)',   note: '' },
    { id: 'blog',      name: 'Blog',              icon: '📰', statusFile: 'STATUS.md', url: 'pelimotion.art/blog',          color: 'var(--blue)',   note: 'Rebuild via build engine no deploy' },
    { id: 'projetos',  name: 'Projetos App',      icon: '📋', statusFile: 'STATUS.md', url: 'pelimotion.art/projetos',      color: 'var(--fg2)',    note: 'React — npm run build localmente' },
    { id: 'shared',    name: 'Shared Modules',    icon: '🔒', statusFile: 'STATUS.md', url: null,                           color: 'var(--red)',    note: 'Afeta TODOS os sistemas' },
];

function showDeployHub() {
    autoSave(); currentSection = 'deployHub'; currentKey = null;
    buildSidebarV4('main');
    updateBreadcrumbs([{label: 'Deploy Hub'}]);

    const token = localStorage.getItem('plm_gh_token');

    document.getElementById('main-content').innerHTML = `
        <div class="page-header">
            <div class="page-label">SISTEMA</div>
            <h1 class="page-title">Deploy Hub</h1>
        </div>

        ${!token ? `<div style="padding:10px 14px;background:rgba(245,166,35,.1);border:1px solid var(--yellow);margin-bottom:20px;font-size:11px;color:var(--yellow)">
            ⚠️ GitHub token não configurado. Use Deploy → Publish para definir o token e habilitar deploys completos.
        </div>` : ''}

        <div class="card" style="margin-bottom:16px">
            <div class="card-title">
                <span>🚀 Projetos</span>
                <span style="font-size:9px;color:var(--fg3);font-weight:400">Cada deploy atualiza o STATUS.md e aciona o Vercel</span>
            </div>
            <div id="deploy-projects-grid" style="display:flex;flex-direction:column;gap:8px">
                <div style="padding:30px;text-align:center;color:var(--fg3);font-size:11px">
                    ${token ? 'Carregando status dos projetos...' : '⚠ Token necessário para carregar status'}
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-title">
                <span>📦 Bunny.net CDN</span>
                <span style="font-size:9px;color:var(--fg3);font-weight:400">pelimotion-portfolio.b-cdn.net</span>
            </div>
            <div class="preview-ref" style="margin-bottom:14px">
                Storage zone para vídeos do portfólio e imagens do blog.
                O scanner lista mídias disponíveis vs. referenciadas em site-content.json.
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
                <button class="btn green" onclick="softDeploy()">⚡ Publicar site-content.json</button>
                <button class="btn" style="border-color:var(--blue);color:var(--blue)" onclick="openMediaScanner()">🔍 Escanear Mídias</button>
                <button class="btn" onclick="fullSync()">🔄 Full Sync + Deploy</button>
            </div>
        </div>
    `;

    if (token) loadDeployStatus(token);
}

async function loadDeployStatus(token) {
    const grid = document.getElementById('deploy-projects-grid');
    if (!grid) return;

    const projects = await Promise.all(DEPLOY_PROJECTS.map(async (p) => {
        let lastUpdate = '—', lastDeploy = '—', statusLabel = 'stable';
        try {
            const res = await fetch(
                `https://api.github.com/repos/Pelimotion/portfolio/contents/${encodeURIComponent(p.statusFile)}?ref=main&t=${Date.now()}`,
                { headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' } }
            );
            if (res.ok) {
                const data = await res.json();
                const decoded = atob(data.content.replace(/\n/g, ''));
                const content = new TextDecoder().decode(Uint8Array.from(decoded, c => c.charCodeAt(0)));
                const dateMatch = content.match(/\*\*Data:\*\*\s*(.+)/);
                if (dateMatch) lastUpdate = dateMatch[1].trim().slice(0, 10);
                const deployMatch = content.match(/\|\s*(20\d{2}-\d{2}-\d{2}[^|]+)\|/);
                if (deployMatch) lastDeploy = deployMatch[1].trim().slice(0, 16);
                if (content.includes('EM DESENVOLVIMENTO') || content.includes('ATIVO')) statusLabel = 'dev';
                else if (content.includes('BETA')) statusLabel = 'beta';
            }
        } catch (e) { /* network error */ }
        return { ...p, lastUpdate, lastDeploy, statusLabel };
    }));

    if (!document.getElementById('deploy-projects-grid')) return;

    grid.innerHTML = projects.map(p => `
        <div style="display:flex;align-items:center;gap:14px;padding:12px 14px;background:var(--bg);border:1px solid var(--border)">
            <span style="font-size:16px;flex-shrink:0">${p.icon}</span>
            <div style="flex:1;min-width:0">
                <div style="font-size:12px;font-weight:700">${esc(p.name)}</div>
                <div style="font-size:9px;color:var(--fg3);margin-top:2px">
                    ${p.url ? `<a href="https://${p.url}" target="_blank" rel="noopener" style="color:inherit">${p.url}</a> · ` : ''}
                    Atualizado: ${esc(p.lastUpdate)} · Último deploy: ${esc(p.lastDeploy)}
                </div>
                ${p.note ? `<div style="font-size:9px;color:var(--fg3);font-style:italic;margin-top:1px">${esc(p.note)}</div>` : ''}
            </div>
            <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
                <span class="status-pill ${p.statusLabel === 'stable' ? 'public' : p.statusLabel === 'beta' ? 'draft' : 'private'}">${p.statusLabel}</span>
                <button class="btn sm" onclick="deployProject('${p.id}')">Deploy</button>
            </div>
        </div>
    `).join('');
}

async function deployProject(projectId) {
    const token = localStorage.getItem('plm_gh_token');
    if (!token) { openPublishModal(); return; }

    const project = DEPLOY_PROJECTS.find(p => p.id === projectId);
    if (!project) return toast('Projeto não encontrado', true);

    const operator = document.getElementById('admin-user-email')?.textContent?.trim() || 'admin';

    toast(`⏳ Deploy: ${project.name}...`);
    deployLog(`⏳ Deploy iniciado: ${project.name}`);

    try {
        // For landing: also commit site-content.json
        if (projectId === 'landing' && D) {
            autoSave();
            const jsonContent = JSON.stringify(D, null, 2);
            const scSha = await getFileSha('site-content.json', token);
            await commitFile('site-content.json', jsonContent, scSha, `deploy(landing): update site-content.json`, token);
        }

        // Fetch and update STATUS.md
        const statusRes = await fetch(
            `https://api.github.com/repos/Pelimotion/portfolio/contents/${encodeURIComponent(project.statusFile)}?ref=main`,
            { headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' } }
        );

        let currentContent = '', sha = null;
        if (statusRes.ok) {
            const statusData = await statusRes.json();
            sha = statusData.sha;
            const decoded = atob(statusData.content.replace(/\n/g, ''));
            currentContent = new TextDecoder().decode(Uint8Array.from(decoded, c => c.charCodeAt(0)));
        }

        const updatedContent = appendDeployLogEntry(currentContent, operator, project.name);
        await commitFile(project.statusFile, updatedContent, sha, `deploy(${project.id}): register deploy via admin panel`, token);

        toast(`✓ ${project.name} deployed. Vercel building...`);
        deployLog(`✅ Deploy registrado: ${project.name}`);
        hasUnsaved = false;
        document.getElementById('unsaved-label')?.classList.remove('visible');

        setTimeout(() => {
            const t = localStorage.getItem('plm_gh_token');
            if (t && document.getElementById('deploy-projects-grid')) loadDeployStatus(t);
        }, 2000);

    } catch (e) {
        console.error('Deploy error:', e);
        toast(`⚠ Deploy falhou: ${e.message}`, true);
        deployLog(`❌ Deploy falhou: ${e.message}`);
    }
}

function appendDeployLogEntry(content, operator, projectName) {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const row = `| ${now} UTC | ${operator} | ${projectName} | ✅ Vercel |`;
    const MARKER = '## 🚀 DEPLOY LOG';
    const TABLE_HEAD = '| Data/Hora UTC | Operador | Projeto | Status |\n|---|---|---|---|';

    const idx = content.indexOf(MARKER);
    if (idx === -1) {
        return content.trimEnd() + `\n\n${MARKER}\n${TABLE_HEAD}\n${row}\n`;
    }

    // Extract existing rows and prepend new one (keep last 10)
    const before = content.slice(0, idx).trimEnd();
    const section = content.slice(idx);
    const rows = section.split('\n')
        .filter(l => l.startsWith('|') && l.includes('✅') && !l.includes('---') && !l.includes('Projeto'));
    const allRows = [row, ...rows].slice(0, 10);
    return before + `\n\n${MARKER}\n${TABLE_HEAD}\n${allRows.join('\n')}\n`;
}

function softDeploy() {
    deployLog('⚡ Publicando site-content.json...');
    saveAll();
}

async function fullSync() {
    deployLog('🔄 Full sync: escaneando Bunny.net + deploy...');
    await openMediaScanner();
    deployLog('🔍 Scanner aberto. Verifique mídias e publique via Deploy Hub.');
}

function deployLog(msg) {
    const log = document.getElementById('deploy-log');
    if (!log) return;
    log.classList.add('visible');
    const line = document.createElement('div');
    line.textContent = `[${new Date().toLocaleTimeString('pt-BR')}] ${msg}`;
    log.insertBefore(line, log.firstChild);
    // Keep last 20 lines
    while (log.children.length > 20) log.removeChild(log.lastChild);
}

// ═══════════════════════════════════════════════════════════════
// MEDIA SCANNER (Bunny.net)
// ═══════════════════════════════════════════════════════════════

let _mediaScanData = null;
let _mediaScanTab = 'videos';

async function openMediaScanner() {
    let modal = document.getElementById('media-scanner-modal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'media-scanner-modal';
        modal.className = 'modal-bg';
        modal.innerHTML = `
            <div class="modal-card" style="max-width:860px;width:100%;max-height:90vh;display:flex;flex-direction:column">
                <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px;flex-shrink:0">
                    <div>
                        <div class="auth-badge">BUNNY.NET STORAGE</div>
                        <div class="modal-title" style="margin-bottom:4px">Media Scanner</div>
                        <div style="font-size:11px;color:var(--fg2)">Mídias disponíveis no CDN. Amarelo = não referenciado em site-content.json.</div>
                    </div>
                    <button onclick="closeMediaScanner()" style="font-size:20px;background:none;border:none;color:var(--fg3);cursor:pointer;line-height:1;padding:4px">✕</button>
                </div>
                <div style="display:flex;gap:0;margin-bottom:14px;border-bottom:1px solid var(--border);flex-shrink:0" id="media-scanner-tabs">
                    <button class="ms-tab active" onclick="switchMediaTab('videos',this)">Videos</button>
                    <button class="ms-tab" onclick="switchMediaTab('images',this)">Images</button>
                </div>
                <div id="media-scanner-body" style="flex:1;overflow-y:auto;min-height:200px">
                    <div style="padding:40px;text-align:center;color:var(--fg3)">⏳ Escaneando Bunny.net...</div>
                </div>
                <div style="padding-top:12px;border-top:1px solid var(--border);margin-top:12px;flex-shrink:0;display:flex;justify-content:flex-end;gap:8px">
                    <button class="btn" onclick="closeMediaScanner()">Fechar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Inject styles once
        if (!document.getElementById('ms-styles')) {
            const s = document.createElement('style');
            s.id = 'ms-styles';
            s.textContent = `
                .ms-tab{padding:7px 16px;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;background:none;border:none;border-bottom:2px solid transparent;color:var(--fg3);cursor:pointer;font-family:inherit;margin-bottom:-1px;transition:color .15s}
                .ms-tab.active,.ms-tab:hover{color:var(--fg);border-bottom-color:var(--fg)}
                .ms-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px}
                .ms-item{padding:10px;border:1px solid var(--border);background:var(--bg);cursor:default;transition:border-color .15s;position:relative}
                .ms-item.unreferenced{border-color:rgba(245,166,35,.4);cursor:pointer}
                .ms-item.unreferenced:hover{border-color:var(--yellow)}
                .ms-thumb{width:100%;height:90px;object-fit:cover;background:var(--bg2);display:block}
                .ms-name{font-size:9px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:6px}
                .ms-meta{font-size:8px;color:var(--fg3);margin-top:2px}
            `;
            document.head.appendChild(s);
        }
    }

    modal.classList.add('open');
    _mediaScanData = null;
    _mediaScanTab = 'videos';
    document.querySelectorAll('.ms-tab').forEach((t, i) => t.classList.toggle('active', i === 0));

    try {
        const res = await fetch('/api/blog/gallery?mode=scan');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        _mediaScanData = await res.json();
        renderMediaGrid(_mediaScanTab);
    } catch (e) {
        const body = document.getElementById('media-scanner-body');
        if (body) body.innerHTML = `
            <div style="padding:40px;text-align:center">
                <div style="color:var(--red);margin-bottom:8px">⚠ Erro ao escanear Bunny.net</div>
                <div style="font-size:10px;color:var(--fg3)">${esc(e.message)}<br>Verifique se BUNNY_API_KEY está configurado no Vercel.</div>
            </div>`;
    }
}

function closeMediaScanner() {
    document.getElementById('media-scanner-modal')?.classList.remove('open');
}

function switchMediaTab(type, btn) {
    document.querySelectorAll('.ms-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    _mediaScanTab = type;
    renderMediaGrid(type);
}

function renderMediaGrid(type) {
    const body = document.getElementById('media-scanner-body');
    if (!body || !_mediaScanData) return;

    const items = _mediaScanData[type] || [];
    if (items.length === 0) {
        body.innerHTML = `<div style="padding:40px;text-align:center;color:var(--fg3)">Nenhuma mídia do tipo "${type}" encontrada.</div>`;
        return;
    }

    // Mark items already referenced in site-content.json
    const siteStr = D ? JSON.stringify(D) : '';
    const referenced = new Set(items.filter(i => siteStr.includes(i.url)).map(i => i.url));

    const unreferenced = items.filter(i => !referenced.has(i.url));
    const alreadyIn = items.filter(i => referenced.has(i.url));

    let html = `<div style="font-size:10px;color:var(--fg3);margin-bottom:14px">
        ${items.length} ${type} · <span style="color:var(--green)">${alreadyIn.length} referenciados</span> · <span style="color:var(--yellow)">${unreferenced.length} não referenciados</span>
    </div>`;

    if (unreferenced.length > 0) {
        html += `<div style="font-size:9px;font-weight:700;letter-spacing:.3em;text-transform:uppercase;color:var(--yellow);margin-bottom:10px">NÃO REFERENCIADOS — clique para copiar URL</div>`;
        html += `<div class="ms-grid" style="margin-bottom:20px">`;
        unreferenced.forEach(item => { html += buildMediaCard(item, type, false); });
        html += `</div>`;
    }

    if (alreadyIn.length > 0) {
        html += `<div style="font-size:9px;font-weight:700;letter-spacing:.3em;text-transform:uppercase;color:var(--fg3);margin-bottom:10px">JÁ REFERENCIADOS</div>`;
        html += `<div class="ms-grid">`;
        alreadyIn.forEach(item => { html += buildMediaCard(item, type, true); });
        html += `</div>`;
    }

    body.innerHTML = html;
}

function buildMediaCard(item, type, isReferenced) {
    const sizeLabel = item.size > 0 ? (item.size > 1048576 ? (item.size / 1048576).toFixed(1) + ' MB' : Math.round(item.size / 1024) + ' KB') : '';
    const thumb = type === 'videos'
        ? `<video src="${esc(item.url)}#t=1" class="ms-thumb" muted preload="metadata"></video>`
        : `<img src="${esc(item.url)}" class="ms-thumb" loading="lazy" onerror="this.style.background='var(--bg2)'">`;

    const clickAttr = !isReferenced ? `onclick="copyMediaUrl('${esc(item.url)}')"` : '';

    return `
        <div class="ms-item ${isReferenced ? '' : 'unreferenced'}" ${clickAttr} title="${esc(item.url)}">
            ${thumb}
            <div class="ms-name">${esc(item.name)}</div>
            <div class="ms-meta">${item.folder ? esc(item.folder) + ' · ' : ''}${sizeLabel}</div>
            ${!isReferenced ? `<div style="margin-top:6px;font-size:8px;color:var(--yellow);text-align:center">📋 Clique para copiar URL</div>` : ''}
        </div>
    `;
}

function copyMediaUrl(url) {
    const fallback = () => {
        const el = document.createElement('textarea');
        el.value = url; el.style.position = 'fixed'; el.style.opacity = '0';
        document.body.appendChild(el); el.select(); document.execCommand('copy');
        document.body.removeChild(el);
        toast('✓ URL copiada para clipboard');
    };
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => toast('✓ URL copiada para clipboard')).catch(fallback);
    } else { fallback(); }
}

// ─── BRIEFINGS PANEL ───
async function showBriefings() {
    autoSave(); currentSection = 'briefings'; currentKey = null;
    buildSidebarV4('main');
    updateBreadcrumbs([{label: 'Briefings'}]);
    
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div class="page-header">
            <div class="page-label">System — Briefings</div>
            <h1 class="page-title">Briefings Recebidos</h1>
        </div>
        <div class="card" id="briefings-card">
            <div style="padding:40px 0;text-align:center;color:var(--fg3)">Carregando briefings do banco de dados...</div>
        </div>
    `;

    if (!window.supabaseClient) {
        document.getElementById('briefings-card').innerHTML = `
            <div style="padding:40px 0;text-align:center;color:var(--red)">
                Erro: Cliente Supabase não inicializado. Verifique as credenciais do admin.
            </div>
        `;
        return;
    }

    try {
        const { data, error } = await window.supabaseClient
            .from('briefings')
            .select('id, slug, cliente_nome, criado_em')
            .order('criado_em', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            document.getElementById('briefings-card').innerHTML = `
                <div style="padding:40px 0;text-align:center;color:var(--fg2)">
                    Nenhum briefing cadastrado no banco de dados.
                </div>
            `;
            return;
        }

        let html = `
            <div class="card-title">Formulários Respondidos (${data.length})</div>
            <div class="client-list">
        `;

        data.forEach(b => {
            const dateStr = new Date(b.criado_em).toLocaleString('pt-BR');
            html += `
                <div class="client-row" onclick="showBriefingDetail('${b.id}')">
                    <div class="info" style="display:flex; flex-direction:column; gap:2px;">
                        <span class="name" style="font-size:13px; font-weight:700; color:var(--fg);">${esc(b.cliente_nome)}</span>
                        <span class="meta" style="font-size:10px; color:var(--fg2)">Slug: <strong>${esc(b.slug)}</strong> &bull; Enviado em: ${dateStr}</span>
                    </div>
                    <div class="row-actions">
                        <button class="btn sm primary">Ver Respostas →</button>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        document.getElementById('briefings-card').innerHTML = html;

    } catch (err) {
        console.error('Erro ao carregar briefings:', err);
        document.getElementById('briefings-card').innerHTML = `
            <div style="padding:40px 0;text-align:center;color:var(--red)">
                Erro ao carregar do Supabase: ${esc(err.message)}
            </div>
        `;
    }
}

async function showBriefingDetail(id) {
    updateBreadcrumbs([{label: 'Briefings', action: 'showBriefings()'}, {label: 'Detalhes'}]);
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div class="page-header">
            <div class="page-label">System — Briefing Detail</div>
            <h1 class="page-title" id="bd-client-name">Carregando detalhes...</h1>
        </div>
        <div class="card" id="bd-card">
            <div style="padding:40px 0;text-align:center;color:var(--fg3)">Buscando respostas detalhadas...</div>
        </div>
    `;

    try {
        const { data, error } = await window.supabaseClient
            .from('briefings')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!data) throw new Error('Briefing não encontrado.');

        document.getElementById('bd-client-name').textContent = data.cliente_nome;

        const dateStr = new Date(data.criado_em).toLocaleString('pt-BR');
        let html = `
            <div class="card-title" style="display:flex; align-items:center; justify-content:space-between;">
                <span>Enviado em: ${dateStr}</span>
                <span style="font-size:10px; color:var(--fg2); text-transform:none;">ID: ${data.id}</span>
            </div>
            
            <div style="display:grid; gap:20px; margin-top:20px;">
        `;

        for (const [pergunta, resposta] of Object.entries(data.respostas)) {
            if (resposta !== null && resposta !== undefined && (!Array.isArray(resposta) || resposta.length > 0)) {
                let displayResp = '';
                if (Array.isArray(resposta)) {
                    displayResp = resposta.join(', ');
                } else {
                    displayResp = esc(String(resposta)).replace(/\n/g, '<br/>');
                }

                html += `
                    <div style="padding-bottom:16px; border-bottom:1px solid var(--border)">
                        <h4 style="font-size:9px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:var(--yellow); margin-bottom:8px;">
                            ${esc(pergunta)}
                        </h4>
                        <div style="font-size:13px; color:var(--fg); line-height:1.6; background:rgba(255,255,255,0.01); padding:14px 18px; border:1px solid rgba(255,255,255,0.03); border-radius:4px; white-space: pre-wrap;">
                            ${displayResp}
                        </div>
                    </div>
                `;
            }
        }

        html += `
            </div>
            <div class="actions-bar" style="margin-top:32px; border-top:1px solid var(--border); padding-top:20px;">
                <button class="btn" onclick="showBriefings()">← Voltar para Lista</button>
                <button class="btn danger" onclick="deleteBriefing('${data.id}', '${esc(data.cliente_nome)}')">🗑 Excluir Briefing</button>
            </div>
        `;

        document.getElementById('bd-card').innerHTML = html;

    } catch (err) {
        console.error('Erro ao obter briefing:', err);
        document.getElementById('bd-card').innerHTML = `
            <div style="padding:40px 0;text-align:center;color:var(--red)">
                Erro ao obter detalhes: ${esc(err.message)}
            </div>
        `;
    }
}

async function deleteBriefing(id, clientName) {
    if (!confirm(`Deseja realmente excluir o briefing de "${clientName}"? Esta ação não pode ser desfeita.`)) return;
    
    try {
        const { error } = await window.supabaseClient
            .from('briefings')
            .delete()
            .eq('id', id);

        if (error) throw error;
        toast(`✓ Briefing de ${clientName} excluído.`);
        showBriefings();
    } catch (err) {
        console.error('Erro ao excluir briefing:', err);
        toast(`⚠ Falha ao excluir: ${err.message}`, true);
    }
}

