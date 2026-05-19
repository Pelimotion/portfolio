// Wide Image Studio — app principal
// Depende de: config.js, supabase-client.js

let _session = null;
let _currentJob = null;
let _uploadedRefs = []; // { file, hfUrl }
let _stitchWorker = null;

// ─── Boot ────────────────────────────────────────────────────────────────────

async function init() {
  _session = await requireWideStudioSession();
  if (!_session) return;

  document.getElementById('user-email').textContent = _session.user.email;
  buildPresetOptions();
  buildStyleOptions();
  updateCostEstimate();
  document.getElementById('app').classList.remove('hidden');
}

function buildPresetOptions() {
  const sel = document.getElementById('f-preset');
  Object.entries(CONFIG.DISPLAY_PRESETS).forEach(([key, p]) => {
    const opt = new Option(`${p.label} — ~$${p.estimated_cost_usd.toFixed(2)}`, key);
    sel.appendChild(opt);
  });
}

function buildStyleOptions() {
  const sel = document.getElementById('f-style');
  Object.entries(CONFIG.STYLE_PRESETS).forEach(([key, s]) => {
    const opt = new Option(s.label, key);
    sel.appendChild(opt);
  });
}

function updateCostEstimate() {
  const presetKey = document.getElementById('f-preset').value;
  const preset = CONFIG.DISPLAY_PRESETS[presetKey];
  if (!preset) return;
  document.getElementById('cost-estimate').textContent =
    `~$${preset.estimated_cost_usd.toFixed(2)} · ${preset.tile_count} tiles · ~${Math.ceil(preset.estimated_duration_seconds / 60)} min`;
}

// ─── Ref upload ──────────────────────────────────────────────────────────────

async function onAddRef() {
  if (_uploadedRefs.length >= 5) return toast('Máximo de 5 refs atingido.', 'warn');
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;
    const slot = addRefSlot(file.name);
    try {
      const hfUrl = await uploadRef(file);
      _uploadedRefs.push({ file, hfUrl });
      slot.dataset.hfUrl = hfUrl;
      slot.querySelector('.ref-status').textContent = '✓';
      slot.querySelector('.ref-status').className = 'ref-status ok';
    } catch (e) {
      slot.querySelector('.ref-status').textContent = '✗';
      slot.querySelector('.ref-status').className = 'ref-status err';
      toast('Upload falhou: ' + e.message, 'error');
    }
  };
  input.click();
}

function addRefSlot(name) {
  const list = document.getElementById('ref-list');
  const slot = document.createElement('div');
  slot.className = 'ref-slot';
  slot.innerHTML = `<span class="ref-name">${name}</span><span class="ref-status loading">…</span>
    <button onclick="removeRef(this.parentElement)" title="Remover">✕</button>`;
  list.appendChild(slot);
  return slot;
}

function removeRef(slot) {
  const hfUrl = slot.dataset.hfUrl;
  _uploadedRefs = _uploadedRefs.filter(r => r.hfUrl !== hfUrl);
  slot.remove();
}

async function uploadRef(file) {
  const res = await fetch(`${CONFIG.EDGE_URL}/upload-ref`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(_session),
      'Content-Type': file.type,
    },
    body: file,
    duplex: 'half',
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.url ?? data.id;
}

// ─── Generate ────────────────────────────────────────────────────────────────

async function onGenerate() {
  const presetKey = document.getElementById('f-preset').value;
  const styleKey = document.getElementById('f-style').value;
  const masterPromptRaw = document.getElementById('f-prompt').value.trim();
  const seedInput = document.getElementById('f-seed').value.trim();
  const soulId = document.getElementById('f-soul-id').value.trim() || undefined;

  if (!masterPromptRaw) return toast('Master prompt é obrigatório.', 'warn');

  const style = CONFIG.STYLE_PRESETS[styleKey];
  const masterPrompt = style
    ? `${masterPromptRaw}, ${style.prompt_suffix}`
    : masterPromptRaw;
  const negative = style?.negative_suffix ?? '';

  const regions = buildRegions(presetKey);
  const seed = seedInput ? parseInt(seedInput) : Math.floor(Math.random() * 2_000_000);

  const brief = {
    display: { preset: presetKey },
    scene: { master_prompt: masterPrompt, negative },
    consistency: { seed, ...(soulId ? { soul_id: soulId } : {}) },
    regions,
    quality: {},
  };

  setPhase('generating');
  try {
    const res = await fetch(`${CONFIG.EDGE_URL}/start`, {
      method: 'POST',
      headers: { Authorization: getAuthHeader(_session), 'Content-Type': 'application/json' },
      body: JSON.stringify({ brief, ref_urls: _uploadedRefs.map(r => r.hfUrl) }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Falha no /start');

    _currentJob = { id: data.job_id, status: data.status, brief };
    document.getElementById('job-id-display').textContent = data.job_id.slice(0, 8) + '…';
    subscribeToJob(data.job_id, handleJobUpdate);
    setStatus('Gerando master plate…');
  } catch (e) {
    setPhase('form');
    toast(e.message, 'error');
  }
}

function buildRegions(presetKey) {
  const preset = CONFIG.DISPLAY_PRESETS[presetKey];
  return Array.from({ length: preset.tile_count }, (_, i) => {
    const input = document.getElementById(`region-${i}`);
    return { tile_index: i, focus: input?.value?.trim() || '' };
  });
}

// ─── Job state machine ───────────────────────────────────────────────────────

function handleJobUpdate(job) {
  _currentJob = job;
  switch (job.status) {
    case 'master_pending':
      setStatus('Gerando master plate…');
      break;
    case 'master_ready':
      setPhase('master-review');
      renderMasterPreview(job.master_url);
      setStatus('Master pronto — revise e aprove.');
      break;
    case 'master_rejected':
      setPhase('form');
      toast('Master rejeitado. Ajuste o prompt e tente novamente.', 'info');
      break;
    case 'tiles_pending':
      setPhase('tiles');
      setStatus(`Gerando ${_currentJob.brief?.display?.preset ? CONFIG.DISPLAY_PRESETS[_currentJob.brief.display.preset]?.tile_count ?? '?' : '?'} tiles…`);
      break;
    case 'tiles_partial':
      renderTileGrid(job.tile_urls);
      const done = (job.tile_urls ?? []).filter(Boolean).length;
      setStatus(`Tiles: ${done} prontos…`);
      break;
    case 'tiles_ready':
      setPhase('tiles');
      renderTileGrid(job.tile_urls);
      document.getElementById('btn-stitch').classList.remove('hidden');
      setStatus('Todos os tiles prontos. Clique em Stitch para montar a imagem final.');
      break;
    case 'failed':
      setPhase('form');
      const lastErr = (job.error_log ?? []).slice(-1)[0];
      toast('Job falhou: ' + (lastErr?.error ?? 'erro desconhecido'), 'error');
      break;
  }
}

function renderMasterPreview(url) {
  const img = document.getElementById('master-img');
  img.src = url;
  img.classList.remove('hidden');
}

function renderTileGrid(tileUrls) {
  const grid = document.getElementById('tile-grid');
  grid.innerHTML = '';
  (tileUrls ?? []).forEach((url, i) => {
    const cell = document.createElement('div');
    cell.className = 'tile-cell';
    if (url) {
      const img = document.createElement('img');
      img.src = url;
      img.alt = `Tile ${i + 1}`;
      cell.appendChild(img);
    } else {
      cell.innerHTML = `<div class="tile-placeholder">Tile ${i + 1}<br>…</div>`;
    }
    grid.appendChild(cell);
  });
}

// ─── Approve / Reject ────────────────────────────────────────────────────────

async function onApprove() {
  if (!_currentJob) return;
  document.getElementById('btn-approve').disabled = true;
  document.getElementById('btn-reject').disabled = true;
  try {
    const res = await fetch(`${CONFIG.EDGE_URL}/approve-master`, {
      method: 'POST',
      headers: { Authorization: getAuthHeader(_session), 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: _currentJob.id }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Falha no /approve-master');
    setPhase('tiles');
    setStatus(`Despachando ${data.tile_count} tiles…`);
  } catch (e) {
    document.getElementById('btn-approve').disabled = false;
    document.getElementById('btn-reject').disabled = false;
    toast(e.message, 'error');
  }
}

function onReject() {
  unsubscribeFromJob();
  _currentJob = null;
  setPhase('form');
  toast('Master rejeitado. Ajuste o prompt ou o seed e tente novamente.', 'info');
}

// ─── Stitch & Download ───────────────────────────────────────────────────────

async function onStitch() {
  if (!_currentJob) return;
  const presetKey = _currentJob.brief?.display?.preset;
  const preset = CONFIG.DISPLAY_PRESETS[presetKey];
  if (!preset) return toast('Preset não encontrado.', 'error');

  const tileUrls = _currentJob.tile_urls;
  if (!tileUrls || tileUrls.some(u => !u)) return toast('Nem todos os tiles estão prontos.', 'warn');

  document.getElementById('btn-stitch').disabled = true;
  setStatus('Montando imagem… (pode levar ~1 min no browser)');
  document.getElementById('stitch-progress').classList.remove('hidden');

  _stitchWorker = new Worker('/js/stitcher.worker.js');
  _stitchWorker.onmessage = (e) => {
    const { type, value, blob, message } = e.data;
    if (type === 'progress') {
      document.getElementById('stitch-progress-bar').style.width = value + '%';
    } else if (type === 'done') {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wide-${_currentJob.id.slice(0, 8)}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      setStatus('Download iniciado!');
      document.getElementById('btn-stitch').disabled = false;
    } else if (type === 'error') {
      toast('Stitch falhou: ' + message, 'error');
      document.getElementById('btn-stitch').disabled = false;
    }
  };

  _stitchWorker.postMessage({ type: 'stitch', tileUrls, preset });
}

// ─── UI helpers ──────────────────────────────────────────────────────────────

function setPhase(phase) {
  ['form', 'generating', 'master-review', 'tiles'].forEach(p => {
    document.getElementById(`phase-${p}`)?.classList.toggle('hidden', p !== phase);
  });
}

function setStatus(msg) {
  document.getElementById('status-msg').textContent = msg;
}

function toast(msg, type = 'info') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast ${type} show`;
  setTimeout(() => el.classList.remove('show'), 4000);
}

function buildRegionInputs() {
  const presetKey = document.getElementById('f-preset').value;
  const preset = CONFIG.DISPLAY_PRESETS[presetKey];
  const container = document.getElementById('region-inputs');
  container.innerHTML = '';
  for (let i = 0; i < preset.tile_count; i++) {
    const div = document.createElement('div');
    div.className = 'region-field';
    div.innerHTML = `<label>Tile ${i + 1}</label>
      <input id="region-${i}" type="text" placeholder="ex: morning light hitting the left side" />`;
    container.appendChild(div);
  }
}

// ─── Init ────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  init();
  document.getElementById('f-preset')?.addEventListener('change', () => {
    updateCostEstimate();
    buildRegionInputs();
  });
  // Build region inputs on first load after options are populated
  setTimeout(buildRegionInputs, 0);
});
