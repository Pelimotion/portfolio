// ─── PLM Admin v2 — JS ──────────────────────────────────────────────────────
let D = null; // site-content.json data
let currentSection = null;
let currentKey = null;
let hasUnsaved = false;

async function loadData(){
  try {
    const r = await fetch('../site-content.json?t='+Date.now());
    if(!r.ok) throw new Error();
    D = await r.json();
    setStatus('site-content.json loaded');
  } catch(e){
    // fallback: try old content.json
    try {
      const r2 = await fetch('../content.json?t='+Date.now());
      D = await r2.json();
      D.landing = D.landing || {};
      D.portfolio = D.portfolio || {};
      D.curriculum = D.curriculum || {};
      setStatus('content.json loaded (legacy)', true);
    } catch(e2){
      D = {landing:{},portfolio:{},clients:{},categories:{},curriculum:{}};
      setStatus('No data file found — starting empty', true);
    }
  }
  buildSidebar();
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

// ─── Section openers ──────────────────────────────────────────────────────
function showLanding(){ autoSave(); currentSection='landing'; currentKey=null; highlightSb(null);
  const L = D.landing || {};
  document.getElementById('main-content').innerHTML = `
    <div class="page-header"><div class="page-label">LANDING PAGE</div><h1 class="page-title">Index Principal</h1></div>
    <div class="preview-ref">📍 <strong>File:</strong> index.html — The main hub page with particle animation and navigation buttons.</div>
    <div class="card"><div class="card-title"><span class="icon">🏷️</span> Brand Identity</div>
      <div class="field"><label>Brand Name (shown centered on landing)</label><input id="f-brandName" value="${esc(L.brandName||'Pelimotion')}" oninput="markUnsaved()"><div class="hint">The large text displayed below the logo.</div></div>
      <div class="field"><label>Brand Subtitle</label><input id="f-brandSub" value="${esc(L.brandSub||'')}" oninput="markUnsaved()"><div class="hint">Small text below the brand name, e.g. "Motion Branding & Creative Direction"</div></div>
      <div class="field"><label>Footer Text</label><input id="f-footerText" value="${esc(L.footerText||'')}" oninput="markUnsaved()"><div class="hint">Copyright line at the bottom of the landing page.</div></div>
    </div>
    <div class="card"><div class="card-title"><span class="icon">🔗</span> Navigation Buttons</div>
      <div class="hint" style="margin-bottom:14px">The two main buttons on the landing page. Change labels and links here.</div>
      ${(L.navButtons||[{label:'Portfolio',sub:'Motion Works',href:'V1/portfolio/index.html'},{label:'Curriculum',sub:'Creative Direction',href:'Curriculum/index.html'}]).map((b,i)=>`
        <div class="exp-block"><div class="exp-block-title">Button ${i+1}</div>
          <div class="field"><label>Label</label><input id="f-nav${i}-label" value="${esc(b.label)}" oninput="markUnsaved()"></div>
          <div class="field"><label>Subtitle</label><input id="f-nav${i}-sub" value="${esc(b.sub)}" oninput="markUnsaved()"></div>
          <div class="field"><label>Link (href)</label><input id="f-nav${i}-href" value="${esc(b.href)}" oninput="markUnsaved()"><div class="hint">Relative path, e.g. V1/portfolio/index.html</div></div>
        </div>
      `).join('')}
    </div>
    <div class="actions-bar"><button class="btn primary" onclick="saveLanding()">Apply Changes</button></div>`;
}

function showPortfolio(){ autoSave(); currentSection='portfolio'; currentKey=null; highlightSb(null);
  const P = D.portfolio || {};
  document.getElementById('main-content').innerHTML = `
    <div class="page-header"><div class="page-label">PORTFOLIO PAGE</div><h1 class="page-title">Portfolio Settings</h1></div>
    <div class="preview-ref">📍 <strong>File:</strong> V1/portfolio/index.html — Hero section, contact info, footer quotes and social links.</div>
    <div class="card"><div class="card-title"><span class="icon">🎬</span> Hero Section</div>
      <div class="field"><label>Hero Name (large title)</label><input id="f-heroName" value="${esc(P.heroName||'')}" oninput="markUnsaved()"><div class="hint">The massive title in the portfolio hero (e.g. PELIMOTION).</div></div>
      <div class="field"><label>Hero Subtitle</label><input id="f-heroTitle" value="${esc(P.heroTitle||'')}" oninput="markUnsaved()"></div>
      <div class="field"><label>Hero Release Text</label><textarea id="f-heroRelease" rows="2" oninput="markUnsaved()">${esc(P.heroRelease||'')}</textarea></div>
    </div>
    <div class="card"><div class="card-title"><span class="icon">📱</span> Contact & Social</div>
      <div class="field"><label>WhatsApp Number</label><input id="f-pWhatsApp" value="${esc(P.contactWhatsApp||'')}" oninput="markUnsaved()"><div class="hint">Full number with country code, no spaces. e.g. 5547999664274</div></div>
      <div class="field"><label>Email</label><input id="f-pEmail" value="${esc(P.contactEmail||'')}" oninput="markUnsaved()"></div>
      <div class="field"><label>Instagram Username</label><input id="f-pIG" value="${esc(P.socialInstagram||'')}" oninput="markUnsaved()"></div>
      <div class="field"><label>LinkedIn Username</label><input id="f-pLI" value="${esc(P.socialLinkedIn||'')}" oninput="markUnsaved()"></div>
      <div class="field"><label>Behance Username</label><input id="f-pBE" value="${esc(P.socialBehance||'')}" oninput="markUnsaved()"></div>
    </div>
    <div class="card"><div class="card-title"><span class="icon">💬</span> Footer Quotes</div>
      <div class="field"><label>Quote 1 (bold, large)</label><textarea id="f-fq1" rows="2" oninput="markUnsaved()">${esc(P.footerQuote1||'')}</textarea></div>
      <div class="field"><label>Quote 2 (italic, smaller)</label><textarea id="f-fq2" rows="2" oninput="markUnsaved()">${esc(P.footerQuote2||'')}</textarea></div>
      <div class="field"><label>Studio Location</label><input id="f-fLoc" value="${esc(P.footerStudioLocation||'')}" oninput="markUnsaved()"></div>
    </div>
    <div class="actions-bar"><button class="btn primary" onclick="savePortfolio()">Apply Changes</button></div>`;
}

function showCurriculum(){ autoSave(); currentSection='curriculum'; currentKey=null; highlightSb(null);
  const C = D.curriculum || {};
  document.getElementById('main-content').innerHTML = `
    <div class="page-header"><div class="page-label">CURRICULUM PAGE</div><h1 class="page-title">Curriculum Vitae</h1></div>
    <div class="preview-ref">📍 <strong>File:</strong> Curriculum/index.html — Your CV page with profile, experience, education, skills and contact.</div>
    <div class="card"><div class="card-title"><span class="icon">👤</span> Profile</div>
      <div class="field"><label>Full Name</label><input id="f-cvName" value="${esc(C.name||'')}" oninput="markUnsaved()"></div>
      <div class="field"><label>Title Line</label><input id="f-cvTitle" value="${esc(C.title||'')}" oninput="markUnsaved()"><div class="hint">e.g. "Creative Director, motion branding and artistic direction."</div></div>
      <div class="field"><label>Subtitle / Tagline</label><textarea id="f-cvSub" rows="2" oninput="markUnsaved()">${esc(C.subtitle||'')}</textarea></div>
      <div class="field"><label>Based In</label><input id="f-cvBase" value="${esc(C.basedIn||'')}" oninput="markUnsaved()"></div>
      <div class="field"><label>Disciplines</label><input id="f-cvDisc" value="${esc(C.disciplines||'')}" oninput="markUnsaved()"><div class="hint">Separated by " · " e.g. "Motion · Direction · Branding · CGI"</div></div>
      <div class="field"><label>Years Range</label><input id="f-cvYears" value="${esc(C.yearsRange||'')}" oninput="markUnsaved()"></div>
    </div>
    <div class="card"><div class="card-title"><span class="icon">📝</span> Profile Text</div>
      <div class="field"><label>Paragraph 1</label><textarea id="f-cvP1" rows="3" oninput="markUnsaved()">${esc(C.profileParagraph1||'')}</textarea></div>
      <div class="field"><label>Paragraph 2</label><textarea id="f-cvP2" rows="3" oninput="markUnsaved()">${esc(C.profileParagraph2||'')}</textarea></div>
    </div>
    <div class="card"><div class="card-title"><span class="icon">📊</span> Stats (4 boxes in hero)</div>
      ${(C.stats||[{value:'',label:''},{value:'',label:''},{value:'',label:''},{value:'',label:''}]).map((s,i)=>`
        <div style="display:flex;gap:10px;margin-bottom:10px">
          <div class="field" style="flex:1;margin:0"><label>Value ${i+1}</label><input id="f-stat${i}v" value="${esc(s.value)}" oninput="markUnsaved()"></div>
          <div class="field" style="flex:2;margin:0"><label>Label ${i+1}</label><input id="f-stat${i}l" value="${esc(s.label)}" oninput="markUnsaved()"></div>
        </div>`).join('')}
    </div>
    <div class="card"><div class="card-title"><span class="icon">🏢</span> Client Marquee</div>
      <div class="field"><label>Brands (comma-separated)</label><textarea id="f-cvMarquee" rows="2" oninput="markUnsaved()">${esc((C.clientMarquee||[]).join(', '))}</textarea><div class="hint">These scroll horizontally on the CV page. Separate with commas.</div></div>
    </div>
    <div class="card"><div class="card-title"><span class="icon">📱</span> Contact & Social</div>
      <div class="field"><label>Email</label><input id="f-cvEmail" value="${esc(C.contactEmail||'')}" oninput="markUnsaved()"></div>
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
    <div class="preview-ref">📍 Shown in the <strong>portfolio gallery</strong> when viewing ${isClient?'this client':'videos in this category'}. Description appears as subtitle, deliverables as tags.</div>
    <div class="card"><div class="card-title"><span class="icon">📋</span> Description</div>
      <div class="field"><label>Short description (gallery header + card hover)</label><textarea id="f-desc" rows="3" oninput="markUnsaved()">${esc(data.description||'')}</textarea><div class="hint">1-2 sentences. Shown below the client name in the gallery.</div></div>
    </div>
    ${isClient?`<div class="card"><div class="card-title"><span class="icon">📰</span> Release Text</div>
      <div class="field"><label>Release / editorial text</label><textarea id="f-release" rows="4" oninput="markUnsaved()">${esc(data.release||'')}</textarea><div class="hint">Longer text shown in the video player view. Think of it as a press release.</div></div>
    </div>`:''}
    <div class="card"><div class="card-title"><span class="icon">🏷️</span> Deliverables</div>
      <div class="field"><label>Types of work delivered</label>
        <div class="chips" id="chips-box">${(data.deliverables||[]).map((d,i)=>`<div class="chip">${d}<span class="rm" onclick="removeChip(${i})">✕</span></div>`).join('')}</div>
        <div class="add-chip"><input type="text" id="chip-input" placeholder="e.g. Social Media Campaign" onkeydown="if(event.key==='Enter'){addChip();event.preventDefault()}"><button class="btn" onclick="addChip()">+ Add</button></div>
        <div class="hint">These appear as tags in the project gallery. Press Enter or click Add.</div>
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
  else if(currentKey) saveEntryToMem();
}
function saveEntryToMem(){
  if(!currentKey)return;
  const store = currentSection==='client'?D.clients:D.categories;
  const data = store[currentKey] = store[currentKey]||{};
  const desc=document.getElementById('f-desc');
  const rel=document.getElementById('f-release');
  if(desc) data.description=desc.value.trim();
  if(rel) data.release=rel.value.trim();
}
function saveLandingToMem(){
  const L = D.landing = D.landing||{};
  const v=id=>{ const el=document.getElementById(id); return el?el.value.trim():''; };
  L.brandName=v('f-brandName'); L.brandSub=v('f-brandSub'); L.footerText=v('f-footerText');
  L.navButtons = [0,1].map(i=>({label:v(`f-nav${i}-label`),sub:v(`f-nav${i}-sub`),href:v(`f-nav${i}-href`)}));
}
function saveLanding(){ saveLandingToMem(); saveAll(); }

function savePortfolioToMem(){
  const P = D.portfolio = D.portfolio||{};
  const v=id=>{ const el=document.getElementById(id); return el?el.value.trim():''; };
  P.heroName=v('f-heroName'); P.heroTitle=v('f-heroTitle'); P.heroRelease=v('f-heroRelease');
  P.contactWhatsApp=v('f-pWhatsApp'); P.contactEmail=v('f-pEmail');
  P.socialInstagram=v('f-pIG'); P.socialLinkedIn=v('f-pLI'); P.socialBehance=v('f-pBE');
  P.footerQuote1=v('f-fq1'); P.footerQuote2=v('f-fq2'); P.footerStudioLocation=v('f-fLoc');
}
function savePortfolio(){ savePortfolioToMem(); saveAll(); }

function saveCurriculumToMem(){
  const C = D.curriculum = D.curriculum||{};
  const v=id=>{ const el=document.getElementById(id); return el?el.value.trim():''; };
  C.name=v('f-cvName'); C.title=v('f-cvTitle'); C.subtitle=v('f-cvSub');
  C.basedIn=v('f-cvBase'); C.disciplines=v('f-cvDisc'); C.yearsRange=v('f-cvYears');
  C.profileParagraph1=v('f-cvP1'); C.profileParagraph2=v('f-cvP2');
  C.stats=[0,1,2,3].map(i=>({value:v(`f-stat${i}v`),label:v(`f-stat${i}l`)}));
  const mq=v('f-cvMarquee'); C.clientMarquee=mq?mq.split(',').map(s=>s.trim()).filter(Boolean):[];
  C.contactEmail=v('f-cvEmail'); C.contactWhatsApp=v('f-cvWA');
  C.socialInstagram=v('f-cvIG'); C.socialLinkedIn=v('f-cvLI'); C.socialBehance=v('f-cvBE');
}
function saveCurriculum(){ saveCurriculumToMem(); saveAll(); }

// ─── Save / Export ────────────────────────────────────────────────────────
function saveAll(){
  autoSave();
  // Also export legacy content.json for backward compat
  const legacy = { _note: D._note||'', clients: D.clients||{}, categories: D.categories||{} };

  // Download site-content.json
  const json = JSON.stringify(D, null, 2);
  download(json, 'site-content.json');

  // Also download content.json
  setTimeout(()=>download(JSON.stringify(legacy,null,2), 'content.json'), 500);

  hasUnsaved=false;
  document.getElementById('unsaved-label').classList.remove('visible');
  buildSidebar();
  toast('✓ Exported site-content.json + content.json — replace both files in your portfolio folder, then git push');
}

function download(content, filename){
  const blob = new Blob([content], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

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
    } catch(err){ toast('Invalid JSON file',true); }
  };
  reader.readAsText(file);
}

// ─── Helpers ──────────────────────────────────────────────────────────────
function esc(s){ return (s||'').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
function markUnsaved(){ hasUnsaved=true; document.getElementById('unsaved-label').classList.add('visible'); }
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
document.addEventListener('keydown', e=>{
  if((e.metaKey||e.ctrlKey)&&e.key==='s'){ e.preventDefault(); saveAll(); }
});

// ─── Init ─────────────────────────────────────────────────────────────────
loadData();
