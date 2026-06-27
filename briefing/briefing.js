// ─── Configurações e Pools de Paletas ──────────────────────────────────────────
const BRIEFING_CONFIG = {
  'joanna-ribas': {
    clienteNome: 'Joanna Ribas',
    titulo: 'Briefing de Portfólio',
    subtitulo: 'Joanna Ribas',
  },
};
const DEFAULT_CONFIG = {
  clienteNome: 'Cliente',
  titulo: 'Briefing de Portfólio',
  subtitulo: '',
};

const CURATED_PALETTE_GROUPS = {
  'Cinema': [
    { name: 'Kubrick (O Iluminado)', colors: ['#0d0d0d', '#c41e3a', '#f0e6d3'] },
    { name: 'Wong Kar-Wai (Amor à Flor)', colors: ['#1a0a00', '#ff6b35', '#f7c59f'] },
    { name: 'Lynch (Twin Peaks)', colors: ['#0a0015', '#8b00ff', '#e8d5b7'] },
    { name: 'Wes Anderson (Grand Budapest)', colors: ['#e8d5b7', '#8b6914', '#2c1810'] },
  ],
  'Editorial': [
    { name: 'Swiss High-Contrast', colors: ['#ffffff', '#ff0000', '#000000'] },
    { name: 'Warm Editorial', colors: ['#fbfaf7', '#c5a880', '#2b2927'] },
    { name: 'Neo-Gothic', colors: ['#08090a', '#a3937b', '#d1caa1'] },
    { name: 'Brutalist Acid', colors: ['#000000', '#dfff00', '#ffffff'] },
  ],
  'Vanguard': [
    { name: 'Cyberpunk Neon', colors: ['#05050a', '#00f0ff', '#ff007f'] },
    { name: 'Midnight Deep Blue', colors: ['#020813', '#3b82f6', '#93c5fd'] },
    { name: 'Sand & Obsidian', colors: ['#1c1c1e', '#d2b48c', '#eae6df'] },
    { name: 'Muted Forest', colors: ['#141b15', '#4b5f43', '#c2cfb2'] },
  ]
};

const EXTRA_PALETTES = [
  { name: 'Tokyo Neon', colors: ['#0f0f1b', '#00ff66', '#ff0055'] },
  { name: 'Brutalist Concrete', colors: ['#1e1e1e', '#a0a0a0', '#ffffff'] },
  { name: 'Desert Sunset', colors: ['#3d0c02', '#d95d39', '#f0a202'] },
  { name: 'Warm Terracotta', colors: ['#2b1b17', '#c57d56', '#eae1db'] },
  { name: 'Bauhaus Modern', colors: ['#202020', '#db3236', '#f4c20d'] },
  { name: 'Neo-Mint', colors: ['#1a221e', '#7fffd4', '#ffffff'] },
  { name: 'Vampire Dark', colors: ['#0a0505', '#990000', '#eaeaea'] },
  { name: 'Gold & Charcoal', colors: ['#111111', '#d4af37', '#f9f9f9'] },
  { name: 'Muted Lavender', colors: ['#1d1a24', '#b39ddb', '#ede7f6'] },
  { name: 'Emerald Luxe', colors: ['#06231c', '#00a86b', '#f5f5f7'] },
  { name: 'Oatmeal & Slate', colors: ['#272d33', '#dcd6cd', '#f5f2eb'] }
];

const WIZARD_STEPS = [
  { id: 'step-0-intro', phase: 1 },
  { id: 'step-1-apresentacao', phase: 2, required: ['q1_apresentacao'] },
  { id: 'step-2-marcos', phase: 3, required: ['q4_marcos'] },
  { id: 'step-3-material', phase: 3, required: ['q5_material'] },
  { id: 'step-4-identidade', phase: 4, required: ['q8_visual'] },
  { id: 'step-5-cores', phase: 4, required: [] },
  { id: 'step-6-publico', phase: 5, required: ['q11_publico'] },
  { id: 'step-7-dominio', phase: 5, required: ['q13_dominio'] },
];

// ─── Estado do Formulário ──────────────────────────────────────────────────────
let form = {
  q1_apresentacao: '', q2_marca: '', q3_redes: '',
  q4_marcos: '', q5_material: [], q6_destaque: '', q7_creditos: '',
  q8_visual: [], q9_sites_referencia: '',
  q10_paleta: '', q10_palette_colors: [], q10_seed_hex: '#3b82f6',
  q11_publico: [], q12_funcoes: [], q13_dominio: '', q14_recado: '',
};

let currentStep = 0;
let db = null;
let slug = 'default';
let config = DEFAULT_CONFIG;
let activePaletteGroup = 'Cinema';
let suggestedPalettes = [
  { name: 'Tokyo Neon', colors: ['#0f0f1b', '#00ff66', '#ff0055'] },
  { name: 'Oatmeal & Slate', colors: ['#272d33', '#dcd6cd', '#f5f2eb'] },
  { name: 'Brutalist Concrete', colors: ['#1e1e1e', '#a0a0a0', '#ffffff'] },
  { name: 'Gold & Charcoal', colors: ['#111111', '#d4af37', '#f9f9f9'] }
];

// ─── Helpers Cores ────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  return [parseInt(clean.substring(0, 2), 16), parseInt(clean.substring(2, 4), 16), parseInt(clean.substring(4, 6), 16)];
}
function rgbToHex([r, g, b]) {
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

// ─── Inicialização ─────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
  const pathParts = window.location.pathname.split('/');
  let pathSlug = pathParts[pathParts.length - 1];
  if (pathSlug === 'index.html' || pathSlug === 'briefing' || !pathSlug) {
    pathSlug = null;
  }
  
  const params = new URLSearchParams(window.location.search);
  const querySlug = params.get('cliente') || params.get('id') || params.get('slug');
  
  slug = querySlug || pathSlug || 'default';
  
  config = BRIEFING_CONFIG[slug] || DEFAULT_CONFIG;
  document.title = `${config.titulo} — Pelimotion`;
  
  const elTitle = document.getElementById('hero-title');
  const elSubtitle = document.getElementById('hero-subtitle');
  if (elTitle) elTitle.textContent = config.titulo;
  if (elSubtitle) elSubtitle.textContent = config.subtitulo || 'Pelimotion Studio';

  try {
    const cfg = await fetch('/api/config').then(r => r.json());
    if (cfg.supabaseUrl && cfg.supabaseAnonKey) {
      db = supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
    }
  } catch (err) {
    console.error('Falha ao inicializar o Supabase:', err);
  }

  setupEventListeners();
  setupCanvasAndSequence();
  renderCuratedPalettes();
  updateNavigationUI();
});

// ─── Eventos de Escuta e Data Binding ──────────────────────────────────────────
function setupEventListeners() {
  document.querySelectorAll('input[type="text"], textarea').forEach(el => {
    el.addEventListener('input', (e) => {
      const field = e.target.id;
      if (field && form.hasOwnProperty(field)) {
        form[field] = e.target.value;
      }
      if (field === 'q4_marcos') {
        const counter = document.getElementById('q4_marcos_counter');
        if (counter) counter.textContent = `${e.target.value.length}/800`;
      }
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (currentStep < WIZARD_STEPS.length - 1) handleNext();
      else handleSubmit();
    }
  });

  const cpInput = document.getElementById('q10_seed_hex');
  if (cpInput) {
    cpInput.addEventListener('input', (e) => {
      form.q10_seed_hex = e.target.value;
    });
  }
}

// ─── Layout de Scroll e Controle do Background Canvas ──────────────────────────
let lenis = null;
const totalFrames = 96;
const images = [];

function setupCanvasAndSequence() {
  const mainArea = document.querySelector('.briefing-main-area');
  const scrollContainer = document.querySelector('.briefing-scroll-container');
  const canvas = document.getElementById('briefing-bg-canvas');
  if (!mainArea || !scrollContainer || !canvas) return;

  const ctx = canvas.getContext('2d');
  let currentFrame = 0;

  // Inicializar o Lenis Scroll com inércia horizontal e mapeamento do mouse vertical
  lenis = new Lenis({
    wrapper: mainArea,
    content: scrollContainer,
    orientation: 'horizontal',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1.1,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Pré-carregamento das imagens JPG
  for (let i = 1; i <= totalFrames; i++) {
    const img = new Image();
    const frameNum = String(i).padStart(4, '0');
    img.src = `/briefing/sequence/frame_${frameNum}.jpg`;
    images.push(img);
  }

  // Redimensionar Canvas mantendo proporção 16:9
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.3; // 30vh na base
    render(Math.round(currentFrame));
  }

  function render(frameIdx) {
    const img = images[frameIdx];
    if (!img || !img.complete) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const imgRatio = 16 / 9;
    const canvasRatio = canvas.width / canvas.height;
    let drawWidth, drawHeight, drawX, drawY;

    if (canvasRatio > imgRatio) {
      drawWidth = canvas.width;
      drawHeight = canvas.width / imgRatio;
      drawX = 0;
      drawY = (canvas.height - drawHeight) / 2;
    } else {
      drawWidth = canvas.height * imgRatio;
      drawHeight = canvas.height;
      drawX = (canvas.width - drawWidth) / 2;
      drawY = 0;
    }

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  }

  // Renderizar primeiro frame após o carregamento inicial
  if (images[0]) {
    images[0].onload = () => render(0);
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Integrar Lenis com o GSAP ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);
  lenis.on('scroll', () => {
    ScrollTrigger.update();
    
    // Atualizar timeline ativa por aproximação
    const scrollLeft = mainArea.scrollLeft;
    const clientWidth = mainArea.clientWidth;
    const stepIdx = Math.round(scrollLeft / clientWidth);
    if (stepIdx !== currentStep && stepIdx < WIZARD_STEPS.length) {
      currentStep = stepIdx;
      updateNavigationUI();
    }
  });

  // GSAP ScrollTrigger na horizontal atrelado ao contêiner de rolagem do Lenis
  gsap.to({ frame: 0 }, {
    frame: totalFrames - 1,
    ease: 'none',
    scrollTrigger: {
      trigger: '.briefing-scroll-container',
      scroller: '.briefing-main-area',
      start: 'left left',
      end: 'right right',
      scrub: 0.15, // controle ultra fluido e suave do frame
      horizontal: true,
      onUpdate: (self) => {
        const frameIdx = Math.min(totalFrames - 1, Math.max(0, Math.round(self.progress * (totalFrames - 1))));
        currentFrame = frameIdx;
        render(frameIdx);
      }
    }
  });
}

function updateNavigationUI() {
  const activePhase = WIZARD_STEPS[currentStep].phase;
  const progressPct = Math.round((currentStep / (WIZARD_STEPS.length - 1)) * 100);

  // Timeline Desktop
  document.querySelectorAll('.briefing-phase').forEach((phaseEl, idx) => {
    const phaseId = idx + 1;
    phaseEl.className = 'briefing-phase';
    if (activePhase === phaseId) phaseEl.classList.add('is-current');
    else if (activePhase > phaseId) phaseEl.classList.add('is-past');
    else phaseEl.classList.add('is-future');
  });

  // Timeline Mobile
  const elMobLabel = document.getElementById('mobile-phase-label');
  const elMobBar = document.getElementById('mobile-progress-bar');
  const elMobStep = document.getElementById('mobile-step-num');
  
  const phasesNames = ['Intro', 'Sobre Você', 'Seus Trabalhos', 'Estética Visual', 'O Site'];
  if (elMobLabel) elMobLabel.textContent = phasesNames[activePhase - 1] || 'Briefing';
  if (elMobBar) elMobBar.style.width = `${progressPct}%`;
  if (elMobStep) elMobStep.textContent = `${currentStep} / ${WIZARD_STEPS.length - 1}`;

  // Controle de visibilidade das setas laterais de navegação
  const arrowPrev = document.getElementById('arrow-prev');
  const arrowNext = document.getElementById('arrow-next');
  
  if (arrowPrev) {
    arrowPrev.style.visibility = currentStep > 0 ? 'visible' : 'hidden';
  }
  if (arrowNext) {
    arrowNext.style.visibility = currentStep < WIZARD_STEPS.length - 1 ? 'visible' : 'hidden';
  }

  setErrorMsg('');
}

function scrollToStep(idx) {
  const stepDef = WIZARD_STEPS[idx];
  const el = document.getElementById(stepDef.id);
  if (el && lenis) {
    lenis.scrollTo(el, {
      immediate: false,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Easing suave
    });
  }
}

function handleNext() {
  const stepDef = WIZARD_STEPS[currentStep];
  if (stepDef.required) {
    for (const reqField of stepDef.required) {
      const val = form[reqField];
      if (Array.isArray(val) && val.length === 0) {
        setErrorMsg('Por favor, selecione ao menos uma opção para continuar.');
        return;
      } else if (typeof val === 'string' && !val.trim()) {
        setErrorMsg('Por favor, preencha os campos obrigatórios para continuar.');
        return;
      }
    }
  }

  setErrorMsg('');
  
  if (currentStep === WIZARD_STEPS.length - 1) {
    handleSubmit();
  } else {
    scrollToStep(currentStep + 1);
  }
}

function handlePrev() {
  setErrorMsg('');
  scrollToStep(Math.max(currentStep - 1, 0));
}

let toastTimeout = null;

function setErrorMsg(msg) {
  const toastEl = document.getElementById('brutalist-toast');
  const toastMsg = document.getElementById('toast-msg');
  if (!toastEl || !toastMsg) return;

  if (toastTimeout) clearTimeout(toastTimeout);

  if (msg) {
    toastMsg.textContent = msg;
    toastEl.style.display = 'block';
    
    // Auto-hide após 4 segundos
    toastTimeout = setTimeout(() => {
      toastEl.style.display = 'none';
    }, 4000);
  } else {
    toastEl.style.display = 'none';
  }
}

function validateAll() {
  for (let i = 0; i < WIZARD_STEPS.length; i++) {
    const stepDef = WIZARD_STEPS[i];
    if (stepDef.required) {
      for (const reqField of stepDef.required) {
        const val = form[reqField];
        if (Array.isArray(val) && val.length === 0) return i;
        if (typeof val === 'string' && !val.trim()) return i;
      }
    }
  }
  return -1;
}

// ─── Binding de Checkboxes e Radios ───────────────────────────────────────────
window.toggleCheckbox = function(field, opt) {
  const arr = form[field];
  if (arr.includes(opt)) {
    form[field] = arr.filter(v => v !== opt);
  } else {
    form[field] = [...arr, opt];
  }
};

window.toggleCheckboxOther = function(field) {
  const otherKey = '__outro__';
  const otherValField = document.getElementById(`${field}_outro_val`);
  const arr = form[field];
  
  if (arr.includes(otherKey)) {
    form[field] = arr.filter(v => v !== otherKey && !v.startsWith('__outro_text__'));
    if (otherValField) otherValField.style.display = 'none';
  } else {
    form[field] = [...arr, otherKey];
    if (otherValField) {
      otherValField.style.display = 'block';
      otherValField.focus();
    }
  }
};

window.handleOtherTextInput = function(field, inputEl) {
  const val = inputEl.value;
  const filtered = form[field].filter(v => !v.startsWith('__outro_text__'));
  form[field] = val ? [...filtered, `__outro_text__${val}`] : filtered;
};

window.setRadioOption = function(field, opt) {
  form[field] = opt;
};

// ─── Lógica de Paleta de Cores ─────────────────────────────────────────────────
function renderCuratedPalettes() {
  const container = document.getElementById('curated-palettes-container');
  if (!container) return;

  const currentList = activePaletteGroup === 'Sugeridas' ? suggestedPalettes : CURATED_PALETTE_GROUPS[activePaletteGroup];
  container.innerHTML = '';

  currentList.forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'briefing-curated-chip';
    btn.type = 'button';
    btn.onclick = (e) => {
      e.preventDefault();
      setFormPalette(p.colors);
    };

    let dotsHtml = '<div class="briefing-curated-dots">';
    p.colors.forEach(c => {
      dotsHtml += `<span class="briefing-curated-dot" style="background:${c}"></span>`;
    });
    dotsHtml += '</div>';

    btn.innerHTML = `${dotsHtml} ${p.name}`;
    container.appendChild(btn);
  });

  document.querySelectorAll('.briefing-group-tab').forEach(tab => {
    if (tab.textContent.trim() === activePaletteGroup) tab.classList.add('is-active');
    else tab.classList.remove('is-active');
  });
}

window.changePaletteTab = function(group) {
  activePaletteGroup = group;
  renderCuratedPalettes();
};

window.generateMoreSuggestions = function() {
  const shuffled = [...EXTRA_PALETTES].sort(() => 0.5 - Math.random());
  suggestedPalettes = shuffled.slice(0, 4);
  activePaletteGroup = 'Sugeridas';
  renderCuratedPalettes();
};

window.generateAiHarmony = async function() {
  const btn = document.querySelector('.briefing-cp-generate-btn');
  const oldText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Gerando...';

  try {
    const rgb = hexToRgb(form.q10_seed_hex);
    const resp = await fetch('https://colormind.io/api/', {
      method: 'POST',
      body: JSON.stringify({ model: 'default', input: [rgb, 'N', 'N', 'N', 'N'] })
    });
    const data = await resp.json();
    const selectedRgb = [data.result[0], data.result[2], data.result[4]];
    setFormPalette(selectedRgb.map(rgbToHex));
  } catch (err) {
    console.error('Erro na chamada da API Colormind:', err);
    setErrorMsg('Não foi possível gerar a harmonia de cores. Tente escolher uma paleta pronta.');
  } finally {
    btn.disabled = false;
    btn.textContent = oldText;
  }
};

function setFormPalette(colors) {
  form.q10_palette_colors = colors;
  const swatchesEl = document.getElementById('palette-swatches');
  if (!swatchesEl) return;

  swatchesEl.innerHTML = '';
  colors.forEach(hex => {
    const swatch = document.createElement('div');
    swatch.className = 'briefing-swatch';
    swatch.style.background = hex;
    swatch.title = hex;
    swatch.innerHTML = `<span class="briefing-swatch-hex">${hex}</span>`;
    swatchesEl.appendChild(swatch);
  });
  
  swatchesEl.style.display = 'grid';
}

// ─── Envio do Formulário ───────────────────────────────────────────────────────
async function handleSubmit() {
  // Validar todas as seções antes de submeter
  const invalidIdx = validateAll();
  if (invalidIdx !== -1) {
    setErrorMsg('Por favor, preencha todas as perguntas obrigatórias marcadas com asterisco (*).');
    scrollToStep(invalidIdx);
    return;
  }

  const btnNext = document.getElementById('btn-next');
  btnNext.disabled = true;
  btnNext.innerHTML = 'Enviando...';

  try {
    const cleanCb = (arr) => {
      const clean = arr.filter((v) => !v.startsWith('__'));
      const outroText = arr.find(v => v.startsWith('__outro_text__'));
      if (arr.includes('__outro__')) {
        clean.push(outroText ? `Outro: ${outroText.replace('__outro_text__', '')}` : 'Outro');
      }
      return clean;
    };

    const paletteStr = form.q10_palette_colors.length 
      ? `${form.q10_paleta}\n\nPaleta de Inspiração: ${form.q10_palette_colors.join(', ')}` 
      : form.q10_paleta;

    const respostas = {
      'Apresentação': form.q1_apresentacao,
      'Marca/Logo': form.q2_marca || null,
      'Redes': form.q3_redes || null,
      'Marcos': form.q4_marcos,
      'Material': cleanCb(form.q5_material),
      'Destaque': form.q6_destaque || null,
      'Créditos': form.q7_creditos || null,
      'Visual': cleanCb(form.q8_visual),
      'Ref Sites': form.q9_sites_referencia || null,
      'Paleta': paletteStr || null,
      'Público': cleanCb(form.q11_publico),
      'Funções': cleanCb(form.q12_funcoes),
      'Domínio': form.q13_dominio,
      'Recado': form.q14_recado || null,
    };

    if (!db) {
      throw new Error('Supabase client não carregou. Tente novamente mais tarde.');
    }

    const { error } = await db.from('briefings').insert({
      slug,
      cliente_nome: config.clienteNome,
      respostas,
    });

    if (error) throw error;

    try {
      await fetch('/api/send-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          cliente_nome: config.clienteNome,
          respostas,
        }),
      });
    } catch (emailErr) {
      console.warn('E-mail notificação falhou:', emailErr);
    }

    showSuccessScreen();

  } catch (err) {
    console.error('Erro ao enviar o briefing:', err);
    setErrorMsg(err.message || 'Erro ao enviar. Tente novamente.');
    btnNext.disabled = false;
    btnNext.innerHTML = 'Concluir Briefing ✓';
  }
}

function showSuccessScreen() {
  const container = document.querySelector('.briefing-scroll-container');
  if (container) {
    container.innerHTML = `
      <section class="briefing-step" style="height: 100vh; display: flex; align-items: center; justify-content: center;">
        <div class="briefing-success-screen">
          <div class="briefing-success-icon">🙌</div>
          <h1 class="briefing-hero-title">Recebido!</h1>
          <p class="briefing-hero-text">Obrigado por dedicar seu tempo. Vou analisar todas as informações e entrarei em contato para marcarmos nosso alinhamento. — Felipe</p>
        </div>
      </section>
    `;
  }
  const sidebar = document.querySelector('.briefing-sidebar');
  if (sidebar) sidebar.style.display = 'none';
  const mobHeader = document.querySelector('.briefing-mobile-header');
  if (mobHeader) mobHeader.style.display = 'none';
  const footer = document.querySelector('.briefing-step-footer');
  if (footer) footer.style.display = 'none';
}

window.handleNext = handleNext;
window.handlePrev = handlePrev;
window.handleSubmit = handleSubmit;
window.scrollToStep = scrollToStep;
