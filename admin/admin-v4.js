/* admin-v4.js - UI enhancements for v4 */

// Wait for data load
const _originalLoadData = loadData;
loadData = async function() {
    await _originalLoadData();
    if(isUnlocked()) initV4();
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
    
    // Actions
    addGroup('Actions', [
        {title: 'Publish Site', sub: 'Quick deploy', icon: '⚡', action: softDeploy},
        {title: 'Full Sync + Deploy', sub: 'Scan Bunny.net', icon: '🔄', action: fullSync},
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
            
        html += `<div class="sb-section" style="margin-top:10px">Clients & Projects</div>`;
        
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
                    <div class="mi-url">${esc(m.video_url||'')}</div>
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
    
    <div class="card" style="padding:0;overflow:hidden">
        <video src="${m.preview_url || m.video_url || ''}" style="width:100%;max-height:300px;object-fit:contain;background:#000" controls poster="${m.poster_url||m.mosaic?.[1]||''}"></video>
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
    
    <div class="actions-bar">
        <button class="btn primary" onclick="saveMediaEditor('${clientKey}', ${idx})">Save Changes</button>
    </div>`;
    
    document.getElementById('main-content').innerHTML = html;
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

// ─── DEPLOY OPERATIONS ───
async function softDeploy() {
    autoSave();
    const log = document.getElementById('deploy-log');
    if(log) {
        log.classList.add('visible');
        log.innerHTML = 'Starting Soft Deploy...<br>Saving JSON...';
    }
    
    if (localStorage.getItem('plm_gh_token')) {
        await doPublish();
        if(log) log.innerHTML += '<br><span style="color:#fff">Triggered Vercel build successfully.</span>';
    } else {
        openPublishModal();
    }
}

function fullSync() {
    alert("Full Sync requer acesso ao Python local.\nPara executar via painel precisamos de um webhook ou servidor local ativo.\n\nPor enquanto, execute: 'python3 sync_bunny.py' no terminal.");
}

// Helper to escape HTML to prevent XSS in inputs
function esc(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
