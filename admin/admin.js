// ─── PLM Admin v3 — JS ──────────────────────────────────────────────────────
let D = null;
let currentSection = null;
let currentKey = null;
let hasUnsaved = false;

// ─── Text Formatting Helper ───────────────────────────────────────────────
function insertFormat(id, tag) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const val = el.value;
  const selectedText = val.substring(start, end);
  
  let insertion = '';
  if(tag === 'br') {
    insertion = '<br>\n';
  } else if(tag === 'b') {
    insertion = `<b>${selectedText}</b>`;
  } else if(tag === 'i') {
    insertion = `<i>${selectedText}</i>`;
  }
  
  el.value = val.substring(0, start) + insertion + val.substring(end);
  el.selectionStart = el.selectionEnd = start + insertion.length;
  el.focus();
  markUnsaved();
}

// ─── PIN Auth (SHA-256, runs 100% locally — no external calls) ────────────
// To change PIN: run this in browser console: sha256('yourpin').then(h=>console.log(h))
// Then paste the hash below as ADMIN_PIN_HASH.
const ADMIN_PIN_HASH = '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'; // default: 1234
const REPO = 'Pelimotion/portfolio';
const SESSION_KEY = 'plm_admin_unlocked';

async function sha256(str) {
  if (!window.isSecureContext || !crypto.subtle) {
    throw new Error('This browser/connection is not secure. Admin PIN requires HTTPS or Localhost.');
  }
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

function isUnlocked() {
  return sessionStorage.getItem(SESSION_KEY) === '1';
}

function showAuthOverlay() {
  const el = document.getElementById('auth-overlay');
  if(el) el.style.display = 'flex';
}

function hideAuthOverlay() {
  const el = document.getElementById('auth-overlay');
  if(el) el.style.display = 'none';
}

function onPinInput(input) {
  // Clear error when typing
  const err = document.getElementById('auth-error');
  if(err) err.textContent = '';
  // Auto-submit when 4 digits entered
  if(input.value.length >= 4) checkPin();
}

async function checkPin() {
  const input = document.getElementById('auth-pin');
  const btn = document.getElementById('auth-btn');
  const errEl = document.getElementById('auth-error');
  if(!input) return;
  const pin = input.value.trim();
  if(!pin) { if(errEl) errEl.textContent = 'Enter your PIN'; return; }
  if(btn) btn.disabled = true;
  
  try {
    const hash = await sha256(pin);
    if(hash === ADMIN_PIN_HASH) {
      sessionStorage.setItem(SESSION_KEY, '1');
      hideAuthOverlay();
      await loadData();
    } else {
      if(errEl) errEl.textContent = 'Incorrect PIN. Try again.';
      input.value = '';
      input.focus();
      if(btn) btn.disabled = false;
    }
  } catch(e) {
    console.error('Auth error:', e);
    if(errEl) errEl.textContent = 'Auth system error: ' + e.message;
    if(btn) btn.disabled = false;
  }
}

function lockAdmin() {
  sessionStorage.removeItem(SESSION_KEY);
  location.reload();
}


function setActive(el) {
  document.querySelectorAll('.sidebar-nav-item').forEach(e => e.classList.remove('active'));
  el.classList.add('active');
}

// ─── Publish Modal ────────────────────────────────────────────────────────
function openPublishModal() {
  autoSave();
  document.getElementById('publish-modal').classList.add('open');
  const inp = document.getElementById('gh-token-modal');
  if(inp) { inp.value = ''; setTimeout(()=>inp.focus(), 100); }
  const err = document.getElementById('publish-error');
  if(err) err.textContent = '';
}

function closePublishModal() {
  document.getElementById('publish-modal').classList.remove('open');
}

async function doPublish() {
  const inp = document.getElementById('gh-token-modal');
  const btn = document.getElementById('publish-btn');
  const errEl = document.getElementById('publish-error');
  
  // Try modal input first, then localStorage
  let token = (inp ? inp.value.trim() : '');
  if (!token) token = localStorage.getItem('plm_gh_token') || '';
  
  if(!token) { 
    if(errEl) errEl.textContent = 'Please enter your GitHub token.'; 
    openPublishModal();
    return; 
  }
  
  // Persist token for future automatic deploys
  localStorage.setItem('plm_gh_token', token);
  
  if(errEl) errEl.textContent = '';
  if(btn) { btn.textContent = 'Pushing...'; btn.disabled = true; }
  
  const mainBtn = document.getElementById('btn-publish');
  const oldMainText = mainBtn ? mainBtn.textContent : '';
  if(mainBtn) { mainBtn.textContent = '⏳ Pushing...'; mainBtn.disabled = true; }

  const legacy = { _note: D._note||'', clients: D.clients||{}, categories: D.categories||{} };
  const jsonContent = JSON.stringify(D, null, 2);
  const legacyContent = JSON.stringify(legacy, null, 2);

  try {
    const sha1 = await getFileSha('site-content.json', token);
    await commitFile('site-content.json', jsonContent, sha1, 'Admin: Update site-content.json', token);
    const sha2 = await getFileSha('content.json', token);
    await commitFile('content.json', legacyContent, sha2, 'Admin: Update content.json', token);

    hasUnsaved = false;
    const unsavedLabel = document.getElementById('unsaved-label');
    if (unsavedLabel) unsavedLabel.classList.remove('visible');
    
    closePublishModal();
    toast('✓ Published! Vercel is deploying now.');
    buildSidebar();
  } catch(e) {
    console.error('Publish error:', e);
    if(errEl) errEl.textContent = '⚠ ' + e.message;
    toast('⚠ Publish failed: ' + e.message, true);
    // If it's an auth error, clear token
    if (e.message.includes('401') || e.message.includes('Bad credentials')) {
      localStorage.removeItem('plm_gh_token');
      openPublishModal();
    }
  } finally {
    if(btn) { btn.textContent = '🚀 Push to GitHub'; btn.disabled = false; }
    if(mainBtn) { mainBtn.textContent = oldMainText; mainBtn.disabled = false; }
  }
}

async function getFileSha(path, token) {
  const res = await fetch('https://api.github.com/repos/'+REPO+'/contents/'+path+'?ref=main&t='+Date.now(), {
    headers: { 
      'Authorization': 'token '+token, 
      'Accept': 'application/vnd.github.v3+json'
    }
  });
  if(res.status === 404) return null;
  if(!res.ok) { const b=await res.json().catch(()=>({})); throw new Error(b.message||'Cannot read '+path); }
  return (await res.json()).sha;
}

async function commitFile(path, content, sha, message, token) {
  const body = { message, content: btoa(unescape(encodeURIComponent(content))), branch: 'main' };
  if(sha) body.sha = sha;
  const res = await fetch('https://api.github.com/repos/'+REPO+'/contents/'+path, {
    method: 'PUT',
    headers: { 'Authorization': 'token '+token, 'Content-Type': 'application/json', 'Accept': 'application/vnd.github.v3+json' },
    body: JSON.stringify(body)
  });
  if(!res.ok) { const b=await res.json().catch(()=>({})); throw new Error(b.message||'Failed to commit '+path); }
}

// ─── Export / Import ──────────────────────────────────────────────────────
function saveAll() { 
  autoSave();
  if (localStorage.getItem('plm_gh_token')) {
    doPublish(); 
  } else {
    openPublishModal();
  }
}

function exportJSON() {
  autoSave();
  const legacy = { _note: D._note||'', clients: D.clients||{}, categories: D.categories||{} };
  download(JSON.stringify(D, null, 2), 'site-content.json');
  setTimeout(() => download(JSON.stringify(legacy, null, 2), 'content.json'), 500);
  hasUnsaved = false;
  document.getElementById('unsaved-label').classList.remove('visible');
  toast('✓ Downloaded site-content.json + content.json');
}




async function loadData(){
  try {
    const savedToken = localStorage.getItem('plm_gh_token');
    if(savedToken) {
      try {
        const ghRes = await fetch('https://api.github.com/repos/'+REPO+'/contents/site-content.json?ref=main&t='+Date.now(), {
          headers: { 'Authorization': 'token '+savedToken, 'Accept': 'application/vnd.github.v3+json' }
        });
        if(ghRes.ok) {
          const ghData = await ghRes.json();
          const decoded = atob(ghData.content.replace(/\n/g,''));
          const utf8 = new TextDecoder().decode(Uint8Array.from(decoded, c => c.charCodeAt(0)));
          D = JSON.parse(utf8);
          setStatus('✓ Loaded from GitHub');
          buildSidebar(); showLanding(); return;
        }
      } catch(ghErr) { console.warn('GH fetch failed', ghErr); }
    }

    try {
      const r = await fetch('../site-content.json?t='+Date.now());
      if(r.ok) {
        D = await r.json();
        setStatus(savedToken ? '⚠ Loaded local copy (GH unreachable)' : '⚠ Loaded local copy — enter GH token', !savedToken);
        buildSidebar(); showLanding(); return;
      }
    } catch(e){}

    try {
      const r2 = await fetch('../content.json?t='+Date.now());
      if(r2.ok) {
        D = await r2.json();
        D.landing=D.landing||{}; D.portfolio=D.portfolio||{}; D.curriculum=D.curriculum||{};
        setStatus('content.json loaded (legacy)', true);
        buildSidebar(); showLanding(); return;
      }
    } catch(e2){}

    D = {landing:{},portfolio:{},clients:{},categories:{},curriculum:{},applications:[]};
    setStatus('Local mode: Please Import JSON', true);
    buildSidebar();
    document.getElementById('main-content').innerHTML = `
      <div style="text-align:center;padding:100px 20px">
        <div style="font-size:40px;margin-bottom:20px">⚠️</div>
        <h2 style="font-size:24px;margin-bottom:10px;color:var(--fg)">Local File Mode</h2>
        <p style="color:var(--fg2);max-width:400px;margin:0 auto 30px;line-height:1.6">Please Import your <code>site-content.json</code> file.</p>
        <button class="btn primary" onclick="importJSON()">📂 Import JSON</button>
      </div>`;
  } catch(fatal) {
    console.error('Fatal load error', fatal);
    setStatus('Fatal Error: ' + fatal.message, true);
  }
}


// ─── Sidebar ──────────────────────────────────────────────────────────────
function buildSidebar(){
  const sc = document.getElementById('sb-clients');
  const scat = document.getElementById('sb-categories');
  sc.innerHTML = '';
  scat.innerHTML = '';

  // Count missing for status
  let missing = 0;

  Object.keys(D.clients||{}).sort().forEach(name => {
    const c = D.clients[name];
    const hasDesc = !!(c.description && c.description.trim());
    const hasAny  = !!(c.description || c.release || (c.deliverables||[]).length);
    if(!hasDesc) missing++;
    const div = document.createElement('div');
    div.className = 'sidebar-item'+(hasAny?' has-content':'');
    div.innerHTML = `<div class="dot"></div><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${name}</span>`
      + (!hasDesc ? `<span class="warn-badge" title="Missing description">!</span>` : '');
    div.onclick = () => openEditor('client', name);
    sc.appendChild(div);
  });

  Object.keys(D.categories||{}).sort().forEach(name => {
    const c = D.categories[name];
    const hasDesc = !!(c.description && c.description.trim());
    const hasAny  = !!(c.description || (c.deliverables||[]).length);
    const div = document.createElement('div');
    div.className = 'sidebar-item'+(hasAny?' has-content':'');
    div.innerHTML = `<div class="dot"></div><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px">${name}</span>`
      + (!hasDesc ? `<span class="warn-badge" title="Missing description">!</span>` : '');
    div.onclick = () => openEditor('category', name);
    scat.appendChild(div);
  });

  // Update status bar
  if(missing > 0){
    setStatus(`${missing} client${missing>1?'s':''} missing description`, true);
  } else {
    setStatus('All content complete ✓');
  }
}

// ─── Auto-translate helper (MyMemory free API) ───────────────────────────
async function autoTranslate(fromId, toId, fromLang, toLang) {
  const el = document.getElementById(fromId);
  const toEl = document.getElementById(toId);
  if(!el || !toEl || !el.value.trim()) return;
  const text = el.value.trim();
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`;
    const r = await fetch(url);
    const d = await r.json();
    const translated = d.responseData?.translatedText || '';
    if(!translated) return;
    const confirmed = confirm(`Tradução sugerida:\n\n"${translated}"\n\nDeseja usar esta tradução?`);
    if(confirmed) { toEl.value = translated; markUnsaved(); }
  } catch(e) { console.warn('Translate failed', e); }
}

// ─── Section openers ──────────────────────────────────────────────────────

function showLanding(){ autoSave(); currentSection='landing'; currentKey=null; highlightSb(null);
  const L = D.landing || {};
  document.getElementById('main-content').innerHTML = `
    <div class="page-header"><div class="page-label">LANDING PAGE</div><h1 class="page-title">Index Principal</h1></div>
    
    <div class="card"><div class="card-title"><span class="icon">🏷️</span> Brand Identity (Hero)</div>
      <div class="field"><label>Hero Title (HTML)</label><input id="f-brandName" value="${esc(L.brandName||'')}" oninput="markUnsaved()"></div>
      <div class="field-pair">
        <div class="field"><label>Hero Eyebrow — <span style="color:var(--fg3)">EN</span></label><input id="f-brandSub" value="${esc(L.brandSub||'')}" oninput="markUnsaved()"><button type="button" class="btn" style="margin-top:6px;font-size:10px;padding:4px 10px" onclick="autoTranslate('f-brandSub','f-brandSub_pt','en','pt')">↕ Auto-Traduzir</button></div>
        <div class="field"><label>Hero Eyebrow — <span style="color:#34d399">PT</span></label><input id="f-brandSub_pt" value="${esc(L.brandSub_pt||'')}" oninput="markUnsaved()"></div>
      </div>
    </div>

    <div class="card"><div class="card-title"><span class="icon">📝</span> About Section</div>
      <div class="field-pair">
        <div class="field"><label>About Title — <span style="color:var(--fg3)">EN</span></label><input id="f-aboutTitle" value="${esc(L.aboutTitle||'')}" oninput="markUnsaved()"><button type="button" class="btn" style="margin-top:6px;font-size:10px;padding:4px 10px" onclick="autoTranslate('f-aboutTitle','f-aboutTitle_pt','en','pt')">↕ Auto-Traduzir</button></div>
        <div class="field"><label>About Title — <span style="color:#34d399">PT</span></label><input id="f-aboutTitle_pt" value="${esc(L.aboutTitle_pt||'')}" oninput="markUnsaved()"></div>
      </div>
      <div class="field-pair">
        <div class="field"><label>Paragraph 1 — <span style="color:var(--fg3)">EN</span></label><textarea id="f-aboutP1" rows="3" oninput="markUnsaved()">${esc(L.aboutParagraph1||'')}</textarea><button type="button" class="btn" style="margin-top:6px;font-size:10px;padding:4px 10px" onclick="autoTranslate('f-aboutP1','f-aboutP1_pt','en','pt')">↕ Auto-Traduzir</button></div>
        <div class="field"><label>Paragraph 1 — <span style="color:#34d399">PT</span></label><textarea id="f-aboutP1_pt" rows="3" oninput="markUnsaved()">${esc(L.aboutParagraph1_pt||'')}</textarea></div>
      </div>
      <div class="field-pair">
        <div class="field"><label>Paragraph 2 — <span style="color:var(--fg3)">EN</span></label><textarea id="f-aboutP2" rows="3" oninput="markUnsaved()">${esc(L.aboutParagraph2||'')}</textarea><button type="button" class="btn" style="margin-top:6px;font-size:10px;padding:4px 10px" onclick="autoTranslate('f-aboutP2','f-aboutP2_pt','en','pt')">↕ Auto-Traduzir</button></div>
        <div class="field"><label>Paragraph 2 — <span style="color:#34d399">PT</span></label><textarea id="f-aboutP2_pt" rows="3" oninput="markUnsaved()">${esc(L.aboutParagraph2_pt||'')}</textarea></div>
      </div>
    </div>

    <div class="card"><div class="card-title"><span class="icon">💬</span> Contact Section</div>
      <div class="field-pair">
        <div class="field"><label>Contact Title — <span style="color:var(--fg3)">EN</span></label><input id="f-contactTitle" value="${esc(L.contactTitle||'')}" oninput="markUnsaved()"><button type="button" class="btn" style="margin-top:6px;font-size:10px;padding:4px 10px" onclick="autoTranslate('f-contactTitle','f-contactTitle_pt','en','pt')">↕ Auto-Traduzir</button></div>
        <div class="field"><label>Contact Title — <span style="color:#34d399">PT</span></label><input id="f-contactTitle_pt" value="${esc(L.contactTitle_pt||'')}" oninput="markUnsaved()"></div>
      </div>
      <div class="field-pair">
        <div class="field"><label>Contact Subtext — <span style="color:var(--fg3)">EN</span></label><input id="f-contactSub" value="${esc(L.contactSub||'')}" oninput="markUnsaved()"><button type="button" class="btn" style="margin-top:6px;font-size:10px;padding:4px 10px" onclick="autoTranslate('f-contactSub','f-contactSub_pt','en','pt')">↕ Auto-Traduzir</button></div>
        <div class="field"><label>Contact Subtext — <span style="color:#34d399">PT</span></label><input id="f-contactSub_pt" value="${esc(L.contactSub_pt||'')}" oninput="markUnsaved()"></div>
      </div>
    </div>
    <div class="actions-bar"><button class="btn primary" onclick="saveLanding()">Apply Changes</button></div>`;
}


function showPortfolio(){ autoSave(); currentSection='portfolio'; currentKey=null; highlightSb(null);
  const P = D.portfolio || {};
  document.getElementById('main-content').innerHTML = `
    <div class="page-header"><div class="page-label">PORTFOLIO PAGE</div><h1 class="page-title">Portfolio Settings</h1></div>
    <div class="preview-ref">📍 <strong>File:</strong> V1/portfolio/index.html — Hero, social links, footer quotes.</div>
    <div class="card"><div class="card-title"><span class="icon">📱</span> Contact & Social</div>
      <div class="field"><label>WhatsApp</label><input id="f-pWhatsApp" value="${esc(P.contactWhatsApp||'')}" oninput="markUnsaved()"><div class="hint">Número completo com código do país, sem espaços. Ex: 5547999664274</div></div>
      <div class="field"><label>Email</label><input id="f-pEmail" value="${esc(P.contactEmail||'')}" oninput="markUnsaved()"></div>
      <div class="field"><label>Instagram (apenas username)</label><input id="f-pIG" value="${esc(P.socialInstagram||'')}" oninput="markUnsaved()"><div class="hint">Ex: pelimotion</div></div>
      <div class="field"><label>LinkedIn (apenas username)</label><input id="f-pLI" value="${esc(P.socialLinkedIn||'')}" oninput="markUnsaved()"><div class="hint">Ex: pelife</div></div>
      <div class="field"><label>Behance (apenas username)</label><input id="f-pBE" value="${esc(P.socialBehance||'')}" oninput="markUnsaved()"><div class="hint">Ex: pelimotion</div></div>
    </div>
    <div class="card"><div class="card-title"><span class="icon">💬</span> Footer Quotes</div>
      <div class="field"><label>Quote 1 — <span style="color:var(--fg3)">EN</span></label><textarea id="f-fq1" rows="2" oninput="markUnsaved()">${esc(P.footerQuote1||'Visual systems built for those who set the pace, not just follow it.')}</textarea><button type="button" class="btn" style="margin-top:6px;font-size:10px;padding:4px 10px" onclick="autoTranslate('f-fq1','f-fq1_pt','en','pt')">↕ Auto-Traduzir</button></div>
      <div class="field"><label>Quote 1 — <span style="color:#34d399">PT</span></label><textarea id="f-fq1_pt" rows="2" oninput="markUnsaved()">${esc(P.footerQuote1_pt||'Sistemas visuais para quem define o ritmo, não apenas o acompanha.')}</textarea></div>
      <div class="field"><label>Quote 2 — <span style="color:var(--fg3)">EN</span></label><textarea id="f-fq2" rows="2" oninput="markUnsaved()">${esc(P.footerQuote2||'Systemize the motion, elevate the branding.')}</textarea><button type="button" class="btn" style="margin-top:6px;font-size:10px;padding:4px 10px" onclick="autoTranslate('f-fq2','f-fq2_pt','en','pt')">↕ Auto-Traduzir</button></div>
      <div class="field"><label>Quote 2 — <span style="color:#34d399">PT</span></label><textarea id="f-fq2_pt" rows="2" oninput="markUnsaved()">${esc(P.footerQuote2_pt||'Sistematize o movimento. Eleve o branding.')}</textarea></div>
      <div class="field"><label>Studio Location</label><input id="f-fLoc" value="${esc(P.footerStudioLocation||'Florianópolis, Brasil')}" oninput="markUnsaved()"></div>
    </div>
    <div class="actions-bar"><button class="btn primary" onclick="savePortfolio()">Apply Changes</button></div>`;
}

function showCurriculum(){ autoSave(); currentSection='curriculum'; currentKey=null; highlightSb(null);
  const C = D.curriculum || {};
  document.getElementById('main-content').innerHTML = `
    <div class="page-header"><div class="page-label">CURRICULUM PAGE</div><h1 class="page-title">Curriculum Vitae</h1></div>
    <div class="preview-ref">📍 <strong>Public:</strong> Curriculum/index.html — <strong>Private:</strong> Curriculum/private/index.html (CV + Cover Letter with PDF download)</div>
    <div class="card"><div class="card-title"><span class="icon">👤</span> Profile</div>
      <div class="field"><label>Accent Color (Hex)</label><input type="color" id="f-cvAccent" value="${esc(C.accentColor||'#34d399')}" oninput="markUnsaved()"></div>
      <div class="field"><label>Full Name</label><input id="f-cvName" value="${esc(C.name||'')}" oninput="markUnsaved()"></div>
      <div class="field"><label>Title Line</label><input id="f-cvTitle" value="${esc(C.title||'')}" oninput="markUnsaved()"><div class="hint">e.g. "Creative Director, motion branding and artistic direction."</div></div>
      <div class="field"><label>Subtitle / Tagline <div class="format-toolbar"><button type="button" tabindex="-1" onclick="insertFormat(\'f-cvSub\', \'b\')">B</button><button type="button" tabindex="-1" onclick="insertFormat(\'f-cvSub\', \'i\')">I</button></div></label><textarea id="f-cvSub" rows="2" oninput="markUnsaved()">${esc(C.subtitle||'')}</textarea></div>
      <div class="field"><label>Based In</label><input id="f-cvBase" value="${esc(C.basedIn||'')}" oninput="markUnsaved()"></div>
      <div class="field"><label>Disciplines</label><input id="f-cvDisc" value="${esc(C.disciplines||'')}" oninput="markUnsaved()"><div class="hint">Separated by " · " e.g. "Motion · Direction · Branding · CGI"</div></div>
      <div class="field"><label>Years Range</label><input id="f-cvYears" value="${esc(C.yearsRange||'')}" oninput="markUnsaved()"></div>
    </div>
    <div class="card"><div class="card-title"><span class="icon">📝</span> Profile Text</div>
      <div class="field"><label>Paragraph 1 (main summary — shown in bold)</label><textarea id="f-cvP1" rows="3" oninput="markUnsaved()">${esc(C.profileParagraph1||'')}</textarea><div class="hint">Your elevator pitch. Focus on what you do and your value proposition.</div></div>
      <div class="field"><label>Paragraph 2 (supporting detail)</label><textarea id="f-cvP2" rows="3" oninput="markUnsaved()">${esc(C.profileParagraph2||'')}</textarea><div class="hint">Your background, unique differentiator, current focus.</div></div>
    </div>
    <div class="card"><div class="card-title"><span class="icon">📊</span> Stats (4 metric boxes)</div>
      ${(C.stats||[{value:'',label:''},{value:'',label:''},{value:'',label:''},{value:'',label:''}]).map((s,i)=>`
        <div style="display:flex;gap:10px;margin-bottom:10px">
          <div class="field" style="flex:1;margin:0"><label>Value ${i+1}</label><input id="f-stat${i}v" value="${esc(s.value)}" oninput="markUnsaved()"></div>
          <div class="field" style="flex:2;margin:0"><label>Label ${i+1}</label><input id="f-stat${i}l" value="${esc(s.label)}" oninput="markUnsaved()"></div>
        </div>`).join('')}
    </div>
    <div class="card"><div class="card-title"><span class="icon">💼</span> Experience (${(C.experience||[]).length} entries)</div>
      <div class="hint" style="margin-bottom:14px">Each entry = one job/role. Edit inline below. To add/remove entries, use the buttons.</div>
      ${(C.experience||[]).map((e,i)=>`
        <div class="exp-block"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div class="exp-block-title">Experience ${i+1}</div>
          <button class="btn danger" style="font-size:8px;padding:4px 10px" onclick="removeExp(${i})">Remove</button>
        </div>
          <div style="display:flex;gap:10px;margin-bottom:8px">
            <div class="field" style="flex:1;margin:0"><label>Period</label><input id="f-exp${i}-period" value="${esc(e.period)}" oninput="markUnsaved()"></div>
            <div class="field" style="flex:2;margin:0"><label>Role</label><input id="f-exp${i}-role" value="${esc(e.role)}" oninput="markUnsaved()"></div>
          </div>
          <div class="field"><label>Company</label><input id="f-exp${i}-company" value="${esc(e.company)}" oninput="markUnsaved()"></div>
          <div class="field"><label>Bullet points (one per line)</label><textarea id="f-exp${i}-items" rows="3" oninput="markUnsaved()">${(e.items||[]).join('\n')}</textarea><div class="hint">Each line becomes a bullet point. Focus on achievements and impact.</div></div>
          <div class="field"><label>Tags (comma-separated)</label><input id="f-exp${i}-tags" value="${(e.tags||[]).join(', ')}" oninput="markUnsaved()"><div class="hint">e.g. DIRECTION, SYSTEMS, AI_R&D</div></div>
        </div>`).join('')}
      <button class="btn" style="margin-top:10px" onclick="addExp()">+ Add Experience</button>
    </div>
    <div class="card"><div class="card-title"><span class="icon">🎓</span> Education (${(C.education||[]).length} entries)</div>
      ${(C.education||[]).map((e,i)=>`
        <div class="exp-block"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div class="exp-block-title">Education ${i+1}</div>
          <button class="btn danger" style="font-size:8px;padding:4px 10px" onclick="removeEdu(${i})">Remove</button>
        </div>
          <div style="display:flex;gap:10px">
            <div class="field" style="flex:1;margin:0"><label>Period</label><input id="f-edu${i}-period" value="${esc(e.period)}" oninput="markUnsaved()"></div>
            <div class="field" style="flex:2;margin:0"><label>Title</label><input id="f-edu${i}-title" value="${esc(e.title)}" oninput="markUnsaved()"></div>
            <div class="field" style="flex:2;margin:0"><label>Institution</label><input id="f-edu${i}-inst" value="${esc(e.institution)}" oninput="markUnsaved()"></div>
          </div>
        </div>`).join('')}
      <button class="btn" style="margin-top:10px" onclick="addEdu()">+ Add Education</button>
    </div>
    <div class="card"><div class="card-title"><span class="icon">🌐</span> Languages (${(C.languages||[]).length} entries)</div>
      ${(C.languages||[]).map((l,i)=>`
        <div style="display:flex;gap:10px;margin-bottom:8px">
          <div class="field" style="flex:1;margin:0"><label>Language</label><input id="f-lang${i}-name" value="${esc(l.name)}" oninput="markUnsaved()"></div>
          <div class="field" style="flex:1;margin:0"><label>Level</label><input id="f-lang${i}-level" value="${esc(l.level)}" oninput="markUnsaved()"></div>
          <button class="btn danger" style="font-size:8px;padding:4px 8px;align-self:flex-end" onclick="removeLang(${i})">✕</button>
        </div>`).join('')}
      <button class="btn" style="margin-top:6px" onclick="addLang()">+ Add Language</button>
    </div>
    <div class="card"><div class="card-title"><span class="icon">🛠️</span> Skills & Toolset (${Object.keys(C.skills||{}).length} categories)</div>
      <div class="hint" style="margin-bottom:14px">Each category = one column in the Skills section. Items are comma-separated. Edit category names and tools below.</div>
      ${Object.keys(C.skills||{}).map((cat,i)=>`
        <div class="exp-block"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <div class="exp-block-title">Category ${i+1}</div>
          <button class="btn danger" style="font-size:8px;padding:4px 10px" onclick="removeSkillCat(${i})">Remove</button>
        </div>
          <div class="field"><label>Category Name</label><input id="f-scat${i}-name" value="${esc(cat)}" oninput="markUnsaved()"><div class="hint">e.g. "Motion & Post", "Design & 3D", "AI & Code"</div></div>
          <div class="field"><label>Tools (comma-separated)</label><input id="f-scat${i}-items" value="${esc((C.skills[cat]||[]).join(', '))}" oninput="markUnsaved()"></div>
        </div>`).join('')}
      <button class="btn" style="margin-top:10px" onclick="addSkillCat()">+ Add Category</button>
    </div>
    <div class="card"><div class="card-title"><span class="icon">🏢</span> Client Marquee</div>
      <div class="field"><label>Brands (comma-separated)</label><textarea id="f-cvMarquee" rows="2" oninput="markUnsaved()">${esc((C.clientMarquee||[]).join(', '))}</textarea><div class="hint">Scrolling brand names on the CV page.</div></div>
    </div>
    <div class="card"><div class="card-title"><span class="icon">📱</span> Contact & Social</div>
      <div class="field"><label>Contact Call to Action <div class="format-toolbar"><button type="button" tabindex="-1" onclick="insertFormat('f-cvContactText', 'b')">B</button><button type="button" tabindex="-1" onclick="insertFormat('f-cvContactText', 'i')">I</button><button type="button" tabindex="-1" onclick="insertFormat('f-cvContactText', 'br')">↵</button></div></label><textarea id="f-cvContactText" rows="3" oninput="markUnsaved()">${esc(C.contactText||'Open to direction,<br>\n<span class="serif text-white/70">collaborations</span> and<br>\nlong-form briefs<span class="text-white/30">.</span>')}</textarea><div class="hint">The large text in the Contact section of the curriculum.</div></div>
      <div class="field"><label>Email</label><input id="f-cvEmail" value="${esc(C.contactEmail||'')}" oninput="markUnsaved()"></div>
      <div class="field"><label>Website</label><input id="f-cvWebsite" value="${esc(C.contactWebsite||'')}" oninput="markUnsaved()"></div>
      <div class="field"><label>WhatsApp</label><input id="f-cvWA" value="${esc(C.contactWhatsApp||'')}" oninput="markUnsaved()"></div>
      <div class="field"><label>Instagram</label><input id="f-cvIG" value="${esc(C.socialInstagram||'')}" oninput="markUnsaved()"></div>
      <div class="field"><label>LinkedIn</label><input id="f-cvLI" value="${esc(C.socialLinkedIn||'')}" oninput="markUnsaved()"></div>
      <div class="field"><label>Behance</label><input id="f-cvBE" value="${esc(C.socialBehance||'')}" oninput="markUnsaved()"></div>
    </div>
    <div class="actions-bar"><button class="btn primary" onclick="saveCurriculum()">Apply Changes</button></div>`;
}

// ─── Client/Category editor ──────────────────────────────────────────────

function openEditor(type, key){ autoSave(); currentSection=type; currentKey=key;
  highlightSb(key);
  const data = (type==='client' ? D.clients : D.categories)[key] || {};
  const isClient = type==='client';
  document.getElementById('main-content').innerHTML = `
    <div class="page-header"><div class="page-label">${isClient?'CLIENT':'CATEGORY'}</div><h1 class="page-title">${key}</h1></div>
    
    <div class="card"><div class="card-title"><span class="icon">📋</span> Description</div>
      <div class="field-pair">
        <div class="field"><label>Short Description — <span style="color:var(--fg3)">EN</span></label><textarea id="f-desc" rows="2" oninput="markUnsaved()">${esc(data.description||'')}</textarea><button type="button" class="btn" style="margin-top:6px;font-size:10px;padding:4px 10px" onclick="autoTranslate('f-desc','f-desc_pt','en','pt')">↕ Auto-Traduzir</button></div>
        <div class="field"><label>Short Description — <span style="color:#34d399">PT</span></label><textarea id="f-desc_pt" rows="2" oninput="markUnsaved()">${esc(data.description_pt||'')}</textarea></div>
      </div>
    </div>

    ${isClient?`
    <div class="card"><div class="card-title"><span class="icon">📰</span> Release Text</div>
      <div class="field-pair">
        <div class="field"><label>Release Text — <span style="color:var(--fg3)">EN</span></label><textarea id="f-release" rows="4" oninput="markUnsaved()">${esc(data.release||'')}</textarea><button type="button" class="btn" style="margin-top:6px;font-size:10px;padding:4px 10px" onclick="autoTranslate('f-release','f-release_pt','en','pt')">↕ Auto-Traduzir</button></div>
        <div class="field"><label>Release Text — <span style="color:#34d399">PT</span></label><textarea id="f-release_pt" rows="4" oninput="markUnsaved()">${esc(data.release_pt||'')}</textarea></div>
      </div>
    </div>`:''}

    <div class="card"><div class="card-title"><span class="icon">🏷️</span> Deliverables</div>
      <div class="field"><label>Types of work delivered</label>
        <div class="chips" id="chips-box">${(data.deliverables||[]).map((d,i)=>`<div class="chip">${d}<span class="rm" onclick="removeChip(${i})">✕</span></div>`).join('')}</div>
        <div class="add-chip"><input type="text" id="chip-input" placeholder="e.g. Social Media Campaign" onkeydown="if(event.key==='Enter'){addChip();event.preventDefault()}"><button class="btn" onclick="addChip()">+ Add</button></div>
      </div>
    </div>
    <div class="actions-bar"><button class="btn primary" onclick="saveAll()">Save & Export</button><button class="btn danger" onclick="clearEntry()">Clear This Entry</button></div>`;
}


function highlightSb(key){
  document.querySelectorAll('.sidebar-item').forEach(el=>el.classList.remove('active'));
  if(key){
    document.querySelectorAll('.sidebar-item').forEach(el=>{
      if(el.querySelector('span')&&el.querySelector('span').textContent===key) el.classList.add('active');
    });
  }
  // also highlight sidebar nav
  document.querySelectorAll('.sidebar-nav-item').forEach(el=>el.classList.remove('active'));
}

// ─── Chip management ──────────────────────────────────────────────────────
function addChip(){
  const input=document.getElementById('chip-input'); if(!input)return;
  const val=input.value.trim(); if(!val)return;
  const store = currentSection==='client'?D.clients:D.categories;
  const data = store[currentKey] = store[currentKey]||{};
  data.deliverables = data.deliverables||[];
  data.deliverables.push(val);
  input.value='';
  openEditor(currentSection, currentKey);
  markUnsaved();
}
function removeChip(i){
  const store = currentSection==='client'?D.clients:D.categories;
  const data = store[currentKey]||{};
  (data.deliverables||[]).splice(i,1);
  openEditor(currentSection, currentKey);
  markUnsaved();
}
function clearEntry(){
  if(!currentKey||!confirm(`Clear all content for "${currentKey}"?`))return;
  const store = currentSection==='client'?D.clients:D.categories;
  store[currentKey]={description:'',release:'',deliverables:[]};
  openEditor(currentSection, currentKey);
  markUnsaved();
}

// ─── Auto-save to memory before switching sections ────────────────────────
function autoSave(){
  if(!currentSection)return;
  if(currentSection==='landing') saveLandingToMem();
  else if(currentSection==='portfolio') savePortfolioToMem();
  else if(currentSection==='curriculum') saveCurriculumToMem();
  else if(currentSection==='coverLetter') saveCoverLetterToMem();
  else if(currentSection==='appEdit') saveAppEditToMem();
  else if(currentKey) saveEntryToMem();
}
function saveEntryToMem(){
  if(!currentKey)return;
  const store = currentSection==='client'?D.clients:D.categories;
  const data = store[currentKey] = store[currentKey]||{};
  const v=id=>{ const el=document.getElementById(id); return el?el.value.trim():''; };
  data.tagline=v('f-tagline'); data.tagline_pt=v('f-tagline_pt');
  data.description=v('f-desc'); data.description_pt=v('f-desc_pt');
  if(currentSection==='client'){ 
    data.release=v('f-release'); data.release_pt=v('f-release_pt');
    if(data.media && data.media.root){
      data.media.root.forEach((item, idx) => {
        const t_en = v('f-media-'+idx);
        const t_pt = v('f-media-'+idx+'_pt');
        if(t_en) item.title = t_en;
        if(t_pt) item.title_pt = t_pt;
      });
    }
  }
};
  const desc=document.getElementById('f-desc');
  const rel=document.getElementById('f-release');
  if(desc) data.description=desc.value.trim();
  if(rel) data.release=rel.value.trim();
}
function saveLandingToMem(){
  const L = D.landing = D.landing||{};
  const v=id=>{ const el=document.getElementById(id); return el?el.value.trim():''; };
  L.brandName=v('f-brandName'); L.brandSub=v('f-brandSub'); L.brandSub_pt=v('f-brandSub_pt');
  L.aboutTitle=v('f-aboutTitle'); L.aboutTitle_pt=v('f-aboutTitle_pt');
  L.contactTitle=v('f-contactTitle'); L.contactTitle_pt=v('f-contactTitle_pt');
  L.contactSub=v('f-contactSub'); L.contactSub_pt=v('f-contactSub_pt');
}

function saveLanding(){
  const L = D.landing = D.landing||{};
  const v=id=>{ const el=document.getElementById(id); return el?el.value.trim():''; };
  L.brandName=v('f-brandName');
  L.brandSub=v('f-brandSub'); L.brandSub_pt=v('f-brandSub_pt');
  L.aboutTitle=v('f-aboutTitle'); L.aboutTitle_pt=v('f-aboutTitle_pt');
  L.aboutParagraph1=v('f-aboutP1'); L.aboutParagraph1_pt=v('f-aboutP1_pt');
  L.aboutParagraph2=v('f-aboutP2'); L.aboutParagraph2_pt=v('f-aboutP2_pt');
  L.contactTitle=v('f-contactTitle'); L.contactTitle_pt=v('f-contactTitle_pt');
  L.contactSub=v('f-contactSub'); L.contactSub_pt=v('f-contactSub_pt');
  saveAll();
}


function savePortfolioToMem(){
  const P = D.portfolio = D.portfolio||{};
  const v=id=>{ const el=document.getElementById(id); return el?el.value.trim():''; };
  P.contactWhatsApp=v('f-pWhatsApp'); P.contactEmail=v('f-pEmail');
  P.socialInstagram=v('f-pIG'); P.socialLinkedIn=v('f-pLI'); P.socialBehance=v('f-pBE');
  P.footerQuote1=v('f-fq1'); P.footerQuote1_pt=v('f-fq1_pt');
  P.footerQuote2=v('f-fq2'); P.footerQuote2_pt=v('f-fq2_pt');
  P.footerStudioLocation=v('f-fLoc');
}
function savePortfolio(){ savePortfolioToMem(); saveAll(); }



function saveCurriculumToMem(){
  const C = D.curriculum = D.curriculum||{};
  const v=id=>{ const el=document.getElementById(id); return el?el.value.trim():''; };
  C.accentColor=v('f-cvAccent');
  C.name=v('f-cvName'); 
  C.title=v('f-cvTitle'); C.title_pt=v('f-cvTitle_pt');
  C.subtitle=v('f-cvSub'); C.subtitle_pt=v('f-cvSub_pt');
  C.basedIn=v('f-cvBase'); C.basedIn_pt=v('f-cvBase_pt');
  C.disciplines=v('f-cvDisc'); C.disciplines_pt=v('f-cvDisc_pt');
  C.yearsRange=v('f-cvYears');
  C.profileParagraph1=v('f-cvP1'); C.profileParagraph1_pt=v('f-cvP1_pt');
  C.profileParagraph2=v('f-cvP2'); C.profileParagraph2_pt=v('f-cvP2_pt');
  C.contactText=v('f-cvContactText'); C.contactText_pt=v('f-cvContactText_pt');
  C.contactEmail=v('f-cvEmail'); C.contactWhatsApp=v('f-cvWA'); C.contactWebsite=v('f-cvWebsite');
  C.socialInstagram=v('f-cvIG'); C.socialLinkedIn=v('f-cvLI'); C.socialBehance=v('f-cvBE');

  // Save experience
  const expCount = (C.experience||[]).length;
  for(let i=0;i<expCount;i++){
    const e = C.experience[i];
    e.period=v(`f-exp${i}-period`); e.role=v(`f-exp${i}-role`); e.company=v(`f-exp${i}-company`);
    e.items = v(`f-exp${i}-items`).split('\n').filter(x=>x.trim());
    e.tags = v(`f-exp${i}-tags`).split(',').map(x=>x.trim()).filter(x=>x);
  }
  // Save education
  const eduCount = (C.education||[]).length;
  for(let i=0;i<eduCount;i++){
    const e = C.education[i];
    e.period=v(`f-edu${i}-period`); e.title=v(`f-edu${i}-title`); e.institution=v(`f-edu${i}-inst`);
  }
  // Save languages
  const langCount = (C.languages||[]).length;
  for(let i=0;i<langCount;i++){
    const l = C.languages[i];
    l.name=v(`f-lang${i}-name`); l.level=v(`f-lang${i}-level`);
  }
}
function saveCurriculum(){ saveCurriculumToMem(); saveAll(); }

// ─── Experience/Education/Language management ─────────────────────────────
function addExp(){ saveCurriculumToMem(); const C=D.curriculum; C.experience=C.experience||[];
  C.experience.push({period:'',role:'',company:'',items:[],tags:[]}); showCurriculum(); markUnsaved(); }
function removeExp(i){ saveCurriculumToMem(); D.curriculum.experience.splice(i,1); showCurriculum(); markUnsaved(); }
function addEdu(){ saveCurriculumToMem(); const C=D.curriculum; C.education=C.education||[];
  C.education.push({period:'',title:'',institution:''}); showCurriculum(); markUnsaved(); }
function removeEdu(i){ saveCurriculumToMem(); D.curriculum.education.splice(i,1); showCurriculum(); markUnsaved(); }
function addLang(){ saveCurriculumToMem(); const C=D.curriculum; C.languages=C.languages||[];
  C.languages.push({name:'',level:''}); showCurriculum(); markUnsaved(); }
function removeLang(i){ saveCurriculumToMem(); D.curriculum.languages.splice(i,1); showCurriculum(); markUnsaved(); }
function addSkillCat(){ saveCurriculumToMem(); const C=D.curriculum; C.skills=C.skills||{};
  C.skills[`New Category ${Object.keys(C.skills).length+1}`] = []; showCurriculum(); markUnsaved(); }
function removeSkillCat(i){ saveCurriculumToMem(); const C=D.curriculum;
  const keys = Object.keys(C.skills||{}); if(keys[i]) delete C.skills[keys[i]];
  showCurriculum(); markUnsaved(); }

// ─── Cover Letter editor ──────────────────────────────────────────────────

function showCoverLetter(){ autoSave(); currentSection='coverLetter'; currentKey=null; highlightSb(null);
  const CL = D.coverLetter || {};
  document.getElementById('main-content').innerHTML = `
    <div class="page-header"><div class="page-label">COVER LETTER</div><h1 class="page-title">Cover Letter Editor</h1></div>
    <div class="card"><div class="card-title"><span class="icon">✍️</span> Letter Content</div>
      
      <div class="field-pair">
        <div class="field"><label>Greeting — <span style="color:var(--fg3)">EN</span></label><input id="f-clGreeting" value="${esc(CL.greeting||'')}" oninput="markUnsaved()"><button type="button" class="btn" style="margin-top:6px;font-size:10px;padding:4px 10px" onclick="autoTranslate('f-clGreeting','f-clGreeting_pt','en','pt')">↕ Auto-Traduzir</button></div>
        <div class="field"><label>Greeting — <span style="color:#34d399">PT</span></label><input id="f-clGreeting_pt" value="${esc(CL.greeting_pt||'')}" oninput="markUnsaved()"></div>
      </div>

      <div class="field-pair">
        <div class="field"><label>Opening — <span style="color:var(--fg3)">EN</span></label><textarea id="f-clOpening" rows="3" oninput="markUnsaved()">${esc(CL.opening||'')}</textarea><button type="button" class="btn" style="margin-top:6px;font-size:10px;padding:4px 10px" onclick="autoTranslate('f-clOpening','f-clOpening_pt','en','pt')">↕ Auto-Traduzir</button></div>
        <div class="field"><label>Opening — <span style="color:#34d399">PT</span></label><textarea id="f-clOpening_pt" rows="3" oninput="markUnsaved()">${esc(CL.opening_pt||'')}</textarea></div>
      </div>

      <div class="field-pair">
        <div class="field"><label>Body 1 — <span style="color:var(--fg3)">EN</span></label><textarea id="f-clBody1" rows="4" oninput="markUnsaved()">${esc(CL.body1||'')}</textarea><button type="button" class="btn" style="margin-top:6px;font-size:10px;padding:4px 10px" onclick="autoTranslate('f-clBody1','f-clBody1_pt','en','pt')">↕ Auto-Traduzir</button></div>
        <div class="field"><label>Body 1 — <span style="color:#34d399">PT</span></label><textarea id="f-clBody1_pt" rows="4" oninput="markUnsaved()">${esc(CL.body1_pt||'')}</textarea></div>
      </div>

      <div class="field-pair">
        <div class="field"><label>Body 2 — <span style="color:var(--fg3)">EN</span></label><textarea id="f-clBody2" rows="4" oninput="markUnsaved()">${esc(CL.body2||'')}</textarea><button type="button" class="btn" style="margin-top:6px;font-size:10px;padding:4px 10px" onclick="autoTranslate('f-clBody2','f-clBody2_pt','en','pt')">↕ Auto-Traduzir</button></div>
        <div class="field"><label>Body 2 — <span style="color:#34d399">PT</span></label><textarea id="f-clBody2_pt" rows="4" oninput="markUnsaved()">${esc(CL.body2_pt||'')}</textarea></div>
      </div>

      <div class="field-pair">
        <div class="field"><label>Closing — <span style="color:var(--fg3)">EN</span></label><textarea id="f-clClosing" rows="2" oninput="markUnsaved()">${esc(CL.closing||'')}</textarea><button type="button" class="btn" style="margin-top:6px;font-size:10px;padding:4px 10px" onclick="autoTranslate('f-clClosing','f-clClosing_pt','en','pt')">↕ Auto-Traduzir</button></div>
        <div class="field"><label>Closing — <span style="color:#34d399">PT</span></label><textarea id="f-clClosing_pt" rows="2" oninput="markUnsaved()">${esc(CL.closing_pt||'')}</textarea></div>
      </div>

      <div class="field-pair">
        <div class="field"><label>Sign-off — <span style="color:var(--fg3)">EN</span></label><input id="f-clSignoff" value="${esc(CL.signoff||'')}" oninput="markUnsaved()"><button type="button" class="btn" style="margin-top:6px;font-size:10px;padding:4px 10px" onclick="autoTranslate('f-clSignoff','f-clSignoff_pt','en','pt')">↕ Auto-Traduzir</button></div>
        <div class="field"><label>Sign-off — <span style="color:#34d399">PT</span></label><input id="f-clSignoff_pt" value="${esc(CL.signoff_pt||'')}" oninput="markUnsaved()"></div>
      </div>
    </div>
    <div class="actions-bar"><button class="btn primary" onclick="saveCoverLetterAction()">Apply Changes</button></div>`;
}


function saveCoverLetterToMem(){
  const CL = D.coverLetter = D.coverLetter||{};
  const v=id=>{ const el=document.getElementById(id); return el?el.value.trim():''; };
  CL.greeting=v('f-clGreeting'); CL.greeting_pt=v('f-clGreeting_pt');
  CL.opening=v('f-clOpening'); CL.opening_pt=v('f-clOpening_pt');
  CL.body1=v('f-clBody1'); CL.body1_pt=v('f-clBody1_pt');
  CL.body2=v('f-clBody2'); CL.body2_pt=v('f-clBody2_pt');
  CL.closing=v('f-clClosing'); CL.closing_pt=v('f-clClosing_pt');
  CL.signoff=v('f-clSignoff'); CL.signoff_pt=v('f-clSignoff_pt');
}

function saveCoverLetterAction(){ saveCoverLetterToMem(); saveAll(); }

// ─── Applications editor (CV+CL combined pages) ──────────────────────────
function showApplications(){ autoSave(); currentSection='applications'; currentKey=null; highlightSb(null);
  const apps = D.applications || [];
  document.getElementById('main-content').innerHTML = `
    <div class="page-header"><div class="page-label">APPLICATIONS</div><h1 class="page-title">CV + Cover Letter Pages</h1></div>
    <div class="preview-ref">📍 Each application generates a unique page at <code>/Curriculum/private/app.html?app=SLUG</code>. The CV is shared; the cover letter is customized per application.</div>
    <div class="card"><div class="card-title"><span class="icon">📎</span> Your Applications (${apps.length})</div>
      ${apps.length === 0 ? '<div class="hint">No applications yet. Click "+ New Application" to create your first one.</div>' : ''}
      ${apps.map((app, i) => `
        <div class="exp-block" style="border-left:3px solid ${esc(app.accentColor||'#34d399')}">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <div class="exp-block-title" style="color:${esc(app.accentColor||'#34d399')}">${esc(app.companyName||'Untitled')} <span style="opacity:0.4;font-size:9px;margin-left:8px">${esc(app.targetRole||'')}</span></div>
            <div style="display:flex;gap:6px">
              <button class="btn" style="font-size:8px;padding:4px 10px" onclick="editApp(${i})">✏️ Edit</button>
              <button class="btn" style="font-size:8px;padding:4px 10px" onclick="duplicateApp(${i})">📋 Duplicate</button>
              <button class="btn danger" style="font-size:8px;padding:4px 10px" onclick="deleteApp(${i})">🗑️</button>
            </div>
          </div>
          <div class="hint" style="margin:0">
            <strong>URL:</strong> <a href="/Curriculum/private/app.html?app=${esc(app.id)}" target="_blank" style="color:var(--accent);text-decoration:underline">/Curriculum/private/app.html?app=${esc(app.id)}</a>
            · ${(app.coverLetter?.sections||[]).length} sections · Created ${app.createdAt||'—'}
          </div>
        </div>`).join('')}
      <button class="btn primary" style="margin-top:14px" onclick="createApp()">+ New Application</button>
    </div>`;
}

function createApp(){
  D.applications = D.applications || [];
  const id = 'app-' + Date.now().toString(36);
  D.applications.push({
    id: id,
    companyName: 'New Company',
    targetRole: 'Creative Director',
    accentColor: '#34d399',
    createdAt: new Date().toISOString().split('T')[0],
    heroLabel: '',
    coverLetter: { sections: [
      { title: 'OPENING', body: '' },
      { title: 'WHAT I BRING', body: '' },
      { title: 'WHY DIFFERENT', body: '' },
      { title: 'WHY THIS COMPANY', body: '' }
    ]},
    cvOverrides: {}
  });
  editApp(D.applications.length - 1);
  markUnsaved();
}

function duplicateApp(idx){
  // Save any unsaved form edits first
  if(currentSection === 'appEdit') saveAppEditToMem();
  else autoSave();
  const apps = D.applications || [];
  if(!apps[idx]) return;
  const clone = JSON.parse(JSON.stringify(apps[idx]));
  clone.id = clone.id + '-copy-' + Date.now().toString(36);
  clone.companyName = clone.companyName + ' (Copy)';
  clone.createdAt = new Date().toISOString().split('T')[0];
  apps.push(clone);
  markUnsaved();
  editApp(apps.length - 1);
  toast('✓ Duplicated — all sections copied');
}

function deleteApp(idx){
  const apps = D.applications || [];
  if(!apps[idx] || !confirm(`Delete application for "${apps[idx].companyName}"?`)) return;
  apps.splice(idx, 1);
  markUnsaved();
  showApplications();
  toast('Application deleted');
}

function editApp(idx){
  autoSave();
  currentSection = 'appEdit';
  currentKey = idx;
  highlightSb(null);
  const apps = D.applications || [];
  const app = apps[idx];
  if(!app) { showApplications(); return; }
  const sections = app.coverLetter?.sections || [];

  document.getElementById('main-content').innerHTML = `
    <div class="page-header">
      <div class="page-label">APPLICATION #${idx+1}</div>
      <h1 class="page-title" style="color:${esc(app.accentColor||'#34d399')}">${esc(app.companyName||'Untitled')}</h1>
    </div>
    <div class="preview-ref">📍 <strong>Live URL:</strong> <a href="/Curriculum/private/app.html?app=${esc(app.id)}" target="_blank" style="color:var(--accent);text-decoration:underline">/Curriculum/private/app.html?app=${esc(app.id)}</a></div>

    <div class="card"><div class="card-title"><span class="icon">🏢</span> Application Info</div>
      <div style="display:flex;gap:10px;margin-bottom:8px">
        <div class="field" style="flex:2;margin:0"><label>Company Name</label><input id="f-appCompany" value="${esc(app.companyName||'')}" oninput="markUnsaved()"></div>
        <div class="field" style="flex:2;margin:0"><label>Target Role</label><input id="f-appRole" value="${esc(app.targetRole||'')}" oninput="markUnsaved()"></div>
      </div>
      <div style="display:flex;gap:10px">
        <div class="field" style="flex:1;margin:0"><label>Slug (URL ID)</label><input id="f-appId" value="${esc(app.id||'')}" oninput="markUnsaved()"><div class="hint">Lowercase, no spaces. Used in ?app=SLUG</div></div>
        <div class="field" style="flex:1;margin:0"><label>Accent Color</label><div style="display:flex;gap:6px;align-items:center"><input type="color" id="f-appColor" value="${esc(app.accentColor||'#34d399')}" style="width:40px;height:32px;border:none;background:none;cursor:pointer" oninput="markUnsaved()"><input id="f-appColorText" value="${esc(app.accentColor||'#34d399')}" style="flex:1" oninput="document.getElementById('f-appColor').value=this.value;markUnsaved()"></div></div>
        <div class="field" style="flex:1;margin:0"><label>Hero Label (optional)</label><input id="f-appHeroLabel" value="${esc(app.heroLabel||'')}" oninput="markUnsaved()"><div class="hint">Leave blank for auto-generated</div></div>
      </div>
    </div>

    <div class="card"><div class="card-title"><span class="icon">✍️</span> Cover Letter Sections (${sections.length})</div>
      <div class="hint" style="margin-bottom:14px">Each section = one block in the 2-column cover letter grid. You can add, remove, or reorder them.</div>
      ${sections.map((s, i) => `
        <div class="exp-block">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
            <div class="exp-block-title">Section ${i+1}</div>
            <div style="display:flex;gap:6px">
              ${i > 0 ? `<button class="btn" style="font-size:8px;padding:4px 8px" onclick="moveAppSection(${idx},${i},-1)">↑</button>` : ''}
              ${i < sections.length-1 ? `<button class="btn" style="font-size:8px;padding:4px 8px" onclick="moveAppSection(${idx},${i},1)">↓</button>` : ''}
              <button class="btn danger" style="font-size:8px;padding:4px 10px" onclick="removeAppSection(${idx},${i})">Remove</button>
            </div>
          </div>
          <div class="field"><label>Section Title</label><input id="f-appSec${i}-title" value="${esc(s.title||'')}" oninput="markUnsaved()"><div class="hint">e.g. "OPENING", "WHAT I BRING", "WHY THIS COMPANY"</div></div>
          <div class="field"><label>Section Body</label><textarea id="f-appSec${i}-body" rows="4" oninput="markUnsaved()">${esc(s.body||'')}</textarea></div>
        </div>`).join('')}
      <button class="btn" style="margin-top:10px" onclick="addAppSection(${idx})">+ Add Section</button>
    </div>

    <div class="actions-bar">
      <button class="btn" onclick="showApplications()">← Back to List</button>
      <button class="btn primary" onclick="saveAppEdit(${idx})">Apply Changes</button>
    </div>`;
}

function saveAppEditToMem(){
  if(currentSection !== 'appEdit' || currentKey === null) return;
  const idx = currentKey;
  const apps = D.applications || [];
  const app = apps[idx];
  if(!app) return;
  const v = id => { const el=document.getElementById(id); return el?el.value.trim():''; };
  app.companyName = v('f-appCompany');
  app.targetRole = v('f-appRole');
  app.id = v('f-appId').toLowerCase().replace(/[^a-z0-9-]/g, '-');
  app.accentColor = v('f-appColor') || v('f-appColorText') || '#34d399';
  app.heroLabel = v('f-appHeroLabel');
  // Save sections
  const sections = app.coverLetter?.sections || [];
  for(let i = 0; i < sections.length; i++){
    sections[i].title = v(`f-appSec${i}-title`);
    sections[i].body = v(`f-appSec${i}-body`);
  }
}

function saveAppEdit(idx){ saveAppEditToMem(); saveAll(); }

function addAppSection(idx){
  saveAppEditToMem();
  const app = (D.applications||[])[idx];
  if(!app) return;
  app.coverLetter = app.coverLetter || { sections: [] };
  app.coverLetter.sections.push({ title: 'NEW SECTION', body: '' });
  editApp(idx);
  markUnsaved();
}

function removeAppSection(appIdx, secIdx){
  saveAppEditToMem();
  const app = (D.applications||[])[appIdx];
  if(!app) return;
  app.coverLetter.sections.splice(secIdx, 1);
  editApp(appIdx);
  markUnsaved();
}

function moveAppSection(appIdx, secIdx, dir){
  saveAppEditToMem();
  const app = (D.applications||[])[appIdx];
  if(!app) return;
  const secs = app.coverLetter.sections;
  const newIdx = secIdx + dir;
  if(newIdx < 0 || newIdx >= secs.length) return;
  [secs[secIdx], secs[newIdx]] = [secs[newIdx], secs[secIdx]];
  editApp(appIdx);
  markUnsaved();
}

// Expose to window
window.showApplications = showApplications;
window.createApp = createApp;
window.duplicateApp = duplicateApp;
window.deleteApp = deleteApp;
window.editApp = editApp;
window.saveAppEdit = saveAppEdit;
window.addAppSection = addAppSection;
window.removeAppSection = removeAppSection;
window.moveAppSection = moveAppSection;

// ─── Save / Export aliases handled above ───────────────────────────────────
function copyJSON(){
  autoSave();
  navigator.clipboard.writeText(JSON.stringify(D,null,2)).then(()=>toast('JSON copied to clipboard'));
}

function importJSON(){
  document.getElementById('file-input').click();
}
function handleImport(input){
  const file=input.files[0]; if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    try {
      const imp=JSON.parse(e.target.result);
      // Smart merge
      if(imp.clients) D.clients={...D.clients,...imp.clients};
      if(imp.categories) D.categories={...D.categories,...imp.categories};
      if(imp.landing) D.landing={...D.landing,...imp.landing};
      if(imp.portfolio) D.portfolio={...D.portfolio,...imp.portfolio};
      if(imp.curriculum) D.curriculum={...D.curriculum,...imp.curriculum};
      buildSidebar();
      toast('JSON imported and merged');
      
      // Refresh current view
      if(currentSection === 'landing') showLanding();
      else if(currentSection === 'portfolio') showPortfolio();
      else if(currentSection === 'curriculum') showCurriculum();
      else if(currentSection === 'client' || currentSection === 'category') openEditor(currentSection, currentKey);
      else showLanding(); // default

      setStatus('Loaded from imported file', false);
    } catch(err){ toast('Invalid JSON file',true); }
  };
  reader.readAsText(file);
}

// ─── Helpers ──────────────────────────────────────────────────────────────
function esc(s){ return String(s||'').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
function markUnsaved(){ 
  hasUnsaved=true; 
  const el = document.getElementById('unsaved-label');
  if(el) el.classList.add('visible'); 
}
function toast(msg, isErr=false){
  const el=document.getElementById('toast');
  el.textContent=msg; el.className='toast show'+(isErr?' error':'');
  setTimeout(()=>el.className='toast',4000);
}
function setStatus(msg, warn=false){
  document.getElementById('status-text').textContent=msg;
  document.getElementById('status-dot').className='status-dot'+(warn?' warn':'');
}

// ─── Keyboard shortcuts ──────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if((e.metaKey||e.ctrlKey) && e.key==='s'){ e.preventDefault(); exportJSON(); }
  if(e.key === 'Escape') closePublishModal();
});


// ─── Init ───
try {
  if(isUnlocked()) {
    hideAuthOverlay();
    loadData();
  } else {
    showAuthOverlay();
    setTimeout(() => { 
      const p = document.getElementById('auth-pin'); 
      if(p) p.focus(); 
    }, 500);
  }
} catch(e) {
  console.error('Init error:', e);
  alert('Critical Admin Error: ' + e.message);
}

// ─── Global Exports ───
window.onPinInput = onPinInput;
window.checkPin = checkPin;
window.lockAdmin = lockAdmin;
window.insertFormat = insertFormat;
window.exportJSON = exportJSON;
window.saveAll = saveAll;
window.openPublishModal = openPublishModal;
window.closePublishModal = closePublishModal;
window.doPublish = doPublish;
window.importJSON = () => document.getElementById('file-input').click();
