import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import './briefing.css';

// ─── Config & Constantes ──────────────────────────────────────────────────────
const DRAFT_KEY_PREFIX = 'pelimotion_briefing_v3_';
const COLORMIND_API = 'https://colormind.io/api/';
const CHAR_LIMIT_LONG = 800;

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
    { name: 'Wong Kar-Wai (Amor à Flor da Pele)', colors: ['#1a0a00', '#ff6b35', '#f7c59f'] },
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


const PHASES = [
  { id: 1, name: 'Intro' },
  { id: 2, name: 'Sobre Você' },
  { id: 3, name: 'Seus Trabalhos' },
  { id: 4, name: 'Estética Visual' },
  { id: 5, name: 'O Site' },
];

// O fluxo linear: 8 passos
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

const INITIAL_FORM = {
  q1_apresentacao: '', q2_marca: '', q3_redes: '',
  q4_marcos: '', q5_material: [], q6_destaque: '', q7_creditos: '',
  q8_visual: [], q9_sites_referencia: '',
  q10_paleta: '', q10_palette_colors: [], q10_seed_hex: '#3b82f6',
  q11_publico: [], q12_funcoes: [], q13_dominio: '', q14_recado: '',
};

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useSlug() {
  const parts = window.location.pathname.split('/');
  return parts[parts.length - 1] || 'default';
}

function useDebounce(fn, delay) {
  const timer = useRef(null);
  return useCallback((...args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
}

function useLocalStorageDraft(slug) {
  const key = DRAFT_KEY_PREFIX + slug;
  const [draft, setDraft] = useState(null);
  const [draftSavedToast, setDraftSavedToast] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) setDraft(JSON.parse(stored));
    } catch { /* noop */ }
  }, [key]);

  const saveDraft = useCallback((form, step) => {
    try {
      localStorage.setItem(key, JSON.stringify({ form, step }));
      setDraftSavedToast(true);
      setTimeout(() => setDraftSavedToast(false), 2000);
    } catch { /* noop */ }
  }, [key]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setDraft(null);
    } catch { /* noop */ }
  }, [key]);

  return { draft, draftSavedToast, saveDraft, clearDraft };
}

function useAutoResize(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const resize = () => {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    };
    el.addEventListener('input', resize);
    resize();
    return () => el.removeEventListener('input', resize);
  }, [ref]);
}

// ─── Helpers Cores ────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  return [parseInt(clean.substring(0, 2), 16), parseInt(clean.substring(2, 4), 16), parseInt(clean.substring(4, 6), 16)];
}
function rgbToHex([r, g, b]) {
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

function getConfig(slug) {
  return BRIEFING_CONFIG[slug] || DEFAULT_CONFIG;
}

// ─── Componentes de UI Básicos ────────────────────────────────────────────────
function AutoTextarea({ value, onChange, placeholder, rows = 3, maxChars, id, required }) {
  const ref = useRef(null);
  useAutoResize(ref);
  const near = maxChars && value.length > maxChars * 0.85;

  return (
    <div>
      <textarea
        ref={ref} id={id} className="briefing-textarea"
        rows={rows} placeholder={placeholder} value={value} onChange={onChange} required={required}
      />
      {maxChars && (
        <div className={`briefing-char-counter ${near ? 'near-limit' : ''}`}>
          {value.length}/{maxChars}
        </div>
      )}
    </div>
  );
}

function Field({ label, required, hint, children }) {
  return (
    <div className="briefing-field">
      <label className="briefing-label">
        {label} {required && <span className="briefing-required">*</span>}
      </label>
      {hint && <p className="briefing-hint">{hint}</p>}
      {children}
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function BriefingPage() {
  const slug = useSlug();
  const config = getConfig(slug);

  const [form, setForm] = useState(INITIAL_FORM);
  const [currentStep, setCurrentStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success
  const [activePaletteGroup, setActivePaletteGroup] = useState('Cinema');
  const [suggestedPalettes, setSuggestedPalettes] = useState([
    { name: 'Tokyo Neon', colors: ['#0f0f1b', '#00ff66', '#ff0055'] },
    { name: 'Oatmeal & Slate', colors: ['#272d33', '#dcd6cd', '#f5f2eb'] },
    { name: 'Brutalist Concrete', colors: ['#1e1e1e', '#a0a0a0', '#ffffff'] },
    { name: 'Gold & Charcoal', colors: ['#111111', '#d4af37', '#f9f9f9'] }
  ]);

  const generateMoreSuggestions = () => {
    const shuffled = [...EXTRA_PALETTES].sort(() => 0.5 - Math.random());
    setSuggestedPalettes(shuffled.slice(0, 4));
    setActivePaletteGroup('Sugeridas');
  };

  const { draft, draftSavedToast, saveDraft, clearDraft } = useLocalStorageDraft(slug);
  const debouncedSave = useDebounce(saveDraft, 800);

  // Restore draft se existir
  useEffect(() => {
    if (draft && draft.form && currentStep === 0 && status === 'idle') {
      // Pergunta silenciosa? Não, vamos colocar no botão inicial
    }
  }, [draft, currentStep, status]);

  // Auto-save no change
  useEffect(() => {
    if (status === 'idle') debouncedSave(form, currentStep);
  }, [form, currentStep, status, debouncedSave]);

  const set = (field) => (val) => setForm((prev) => ({ ...prev, [field]: val }));
  const setInput = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  // Navegação
  const handleNext = () => {
    // Validar etapa atual
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
    setCurrentStep((c) => Math.min(c + 1, WIZARD_STEPS.length - 1));
  };

  const handlePrev = () => {
    setErrorMsg('');
    setCurrentStep((c) => Math.max(c - 1, 0));
  };

  // Atalho de teclado (Enter para avançar em inputs)
  useEffect(() => {
    const onKeyDown = (e) => {
      // Se estiver no textarea não avança (deixa pular linha)
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        if (currentStep < WIZARD_STEPS.length - 1) handleNext();
        else handleSubmit();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentStep, form]);

  const submitFinal = async () => {
    setStatus('loading');
    setErrorMsg('');
    try {
      // Clean checkboxes
      const cleanCb = (arr) => {
        const clean = arr.filter((v) => !v.startsWith('__'));
        const outroText = arr.find(v => v.startsWith('__outro_text__'));
        if (arr.includes('__outro__')) clean.push(outroText ? `Outro: ${outroText.replace('__outro_text__', '')}` : 'Outro');
        return clean;
      };

      const pStr = form.q10_palette_colors.length ? `${form.q10_paleta}\n\nPaleta gerada: ${form.q10_palette_colors.join(', ')}` : form.q10_paleta;

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
        'Paleta': pStr || null,
        'Público': cleanCb(form.q11_publico),
        'Funções': cleanCb(form.q12_funcoes),
        'Domínio': form.q13_dominio,
        'Recado': form.q14_recado || null,
      };

      const { error } = await supabase.from('briefings').insert({
        slug,
        cliente_nome: config.clienteNome,
        respostas,
      });
      if (error) throw error;

      // Enviar notificação por e-mail de forma assíncrona (não bloqueante)
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
        console.error('Falha ao enviar e-mail de notificação:', emailErr);
      }

      clearDraft();
      setStatus('success');
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao enviar. Tente novamente.');
      setStatus('idle');
    }
  };

  const handleSubmit = () => submitFinal();

  if (status === 'success') {
    return (
      <div className="briefing-root">
        <div className="briefing-grain" />
        <div className="briefing-success-screen">
          <div className="briefing-success-icon">🙌</div>
          <h1 className="briefing-hero-title">Recebido!</h1>
          <p className="briefing-hero-text">Obrigado por dedicar seu tempo. Vou analisar todas as informações e entro em contato via WhatsApp para marcarmos nosso alinhamento. — Felipe</p>
        </div>
      </div>
    );
  }

  const stepDef = WIZARD_STEPS[currentStep];
  const activePhase = stepDef.phase;
  const progressPct = Math.round((currentStep / (WIZARD_STEPS.length - 1)) * 100);

  return (
    <div className="briefing-root">
      <div className="briefing-grain" />

      {/* Draft Toast */}
      <div className={`briefing-draft-toast ${draftSavedToast ? 'is-visible' : ''}`}>
        <span className="briefing-draft-dot" /> Rascunho salvo
      </div>

      {/* Mobile Top Header Progress */}
      <header className="briefing-mobile-header">
        <span style={{ fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{PHASES.find(p => p.id === activePhase)?.name}</span>
        <span style={{ fontSize: 11, color: 'var(--b-text-muted)' }}>{currentStep} / {WIZARD_STEPS.length - 1}</span>
        <div className="briefing-mobile-progress-bar" style={{ width: `${progressPct}%` }} />
      </header>

      {/* Desktop Sidebar Timeline */}
      <aside className="briefing-sidebar">
        <div className="briefing-brand">Pelimotion Studio</div>
        <div className="briefing-timeline">
          {PHASES.map((ph) => {
            let stateClass = 'is-future';
            if (activePhase === ph.id) stateClass = 'is-current';
            else if (activePhase > ph.id) stateClass = 'is-past';
            return (
              <div key={ph.id} className={`briefing-phase ${stateClass}`}>
                <div className="briefing-phase-dot" />
                <span className="briefing-phase-label">{ph.name}</span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 'auto', fontSize: 10, color: 'var(--b-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {progressPct}% concluído
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="briefing-main-area">
        <div className="briefing-step-container">
          
          <div className="briefing-step-wrapper">
            {/* Renderizar Passo Atual Dinamicamente */}
            
            {currentStep === 0 && (
              <div className="step-transition-enter-active">
                <h1 className="briefing-hero-title">{config.titulo}</h1>
                <h2 className="briefing-hero-client">{config.subtitulo}</h2>
                <p className="briefing-hero-text">
                  Preencha com calma, uma etapa por vez. Seu progresso é salvo automaticamente.<br/>
                  Cada detalhe me ajuda a desenhar a melhor experiência para o seu novo site.
                </p>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <button className="briefing-nav-btn briefing-nav-btn--primary" onClick={handleNext}>
                    Iniciar Briefing →
                  </button>
                  {draft && (
                    <button className="briefing-draft-restore-btn" onClick={() => { setForm(draft.form); setCurrentStep(draft.step); }}>
                      Retomar de onde parei
                    </button>
                  )}
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="step-transition-enter-active">
                <Field label="1. Como você se apresenta profissionalmente?" required hint="Ex: Figurinista, Artista Visual, Diretora de Arte...">
                  <AutoTextarea value={form.q1_apresentacao} onChange={setInput('q1_apresentacao')} required />
                </Field>
                <Field label="Você tem um nome profissional, marca pessoal ou logo que já usa?">
                  <input type="text" className="briefing-input" value={form.q2_marca} onChange={setInput('q2_marca')} />
                </Field>
                <Field label="Redes sociais e portfólios online (links ativos)">
                  <AutoTextarea value={form.q3_redes} onChange={setInput('q3_redes')} rows={2} />
                </Field>
              </div>
            )}

            {currentStep === 2 && (
              <div className="step-transition-enter-active">
                <Field label="2. Quais são os marcos da sua carreira que você quer destacar?" required hint="Cite títulos, projetos, filmes, exposições ou clientes. Só o que realmente importa.">
                  <AutoTextarea value={form.q4_marcos} onChange={setInput('q4_marcos')} rows={5} maxChars={1000} required />
                </Field>
              </div>
            )}

            {currentStep === 3 && (
              <div className="step-transition-enter-active">
                <Field label="Desses marcos, o que você tem de material visual disponível?" required>
                  <CheckboxGroup
                    values={form.q5_material} onChange={set('q5_material')} hasOther
                    options={['Fotos de set / bastidores', 'Stills dos filmes', 'Making of em vídeo', 'Cartazes / Artes gráficas', 'Somente imagens do Google']}
                  />
                </Field>
                <Field label="Tem algum trabalho recente que você quer colocar em absoluto destaque?">
                  <AutoTextarea value={form.q6_destaque} onChange={setInput('q6_destaque')} rows={2} />
                </Field>
                <Field label="Créditos, prêmios ou publicações na imprensa?">
                  <AutoTextarea value={form.q7_creditos} onChange={setInput('q7_creditos')} rows={2} />
                </Field>
              </div>
            )}

            {currentStep === 4 && (
              <div className="step-transition-enter-active">
                <Field label="3. O que te representa esteticamente?" required>
                  <CheckboxGroup
                    values={form.q8_visual} onChange={set('q8_visual')} hasOther
                    options={['Cores vibrantes e saturadas', 'Muita textura / sujeira / analógico', 'Tipografia gigante e expressiva', 'Minimalismo brutalista', 'Movimento e animação suave', 'Fotografia como rei']}
                  />
                </Field>
                <Field label="Links de sites que você admira (qualquer área)">
                  <AutoTextarea value={form.q9_sites_referencia} onChange={setInput('q9_sites_referencia')} rows={2} />
                </Field>
              </div>
            )}

            {currentStep === 5 && (
              <div className="step-transition-enter-active">
                <Field label="Tem uma paleta de cores ou filme que te representa visualmente?" hint="Descreva em palavras ou crie uma paleta com nossa IA abaixo.">
                  <AutoTextarea value={form.q10_paleta} onChange={setInput('q10_paleta')} rows={2} />
                  
                  {/* Novo Color Picker Interativo e Prático */}
                  <div className="briefing-color-picker-v2">
                    <div className="briefing-cp-header">
                      <input 
                        type="color" 
                        className="briefing-cp-native-input" 
                        title="Escolher cor base"
                        value={form.q10_seed_hex}
                        onChange={(e) => {
                          setForm(p => ({...p, q10_seed_hex: e.target.value}));
                        }}
                      />
                      <div className="briefing-cp-instructions">
                        <strong>Cor Base da IA</strong>
                        <span>Escolha sua cor preferida e deixe a IA harmonizar.</span>
                      </div>
                      <button 
                        className="briefing-cp-generate-btn"
                        onClick={async () => {
                          try {
                            const rgb = hexToRgb(form.q10_seed_hex);
                            const resp = await fetch(COLORMIND_API, { method: 'POST', body: JSON.stringify({ model: 'default', input: [rgb, 'N', 'N', 'N', 'N'] }) });
                            const data = await resp.json();
                            // Colormind retorna 5 cores. Pegamos 3 com bom contraste (0: escura/principal, 2: neutra/média, 4: clara/fundo)
                            const selectedRgb = [data.result[0], data.result[2], data.result[4]];
                            setForm(p => ({...p, q10_palette_colors: selectedRgb.map(rgbToHex)}));
                          } catch { /* erro na IA */ }
                        }}
                      >
                        ✦ Gerar Harmonia
                      </button>
                    </div>

                    {form.q10_palette_colors.length > 0 && (
                      <div className="briefing-palette-swatches">
                        {form.q10_palette_colors.map((hex, i) => (
                          <div key={i} className="briefing-swatch" style={{background: hex}} title={hex}>
                            <span className="briefing-swatch-hex">{hex}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="briefing-palette-group-selector">
                      {['Cinema', 'Editorial', 'Vanguard', 'Sugeridas'].map(group => (
                        <button
                          key={group}
                          className={`briefing-group-tab ${activePaletteGroup === group ? 'is-active' : ''}`}
                          onClick={(e) => { e.preventDefault(); setActivePaletteGroup(group); }}
                        >
                          {group}
                        </button>
                      ))}
                      <button
                        className="briefing-group-more-btn"
                        onClick={(e) => { e.preventDefault(); generateMoreSuggestions(); }}
                      >
                        ✦ Gerar Outros Exemplos
                      </button>
                    </div>

                    <div className="briefing-curated-palettes">
                      {(activePaletteGroup === 'Sugeridas' ? suggestedPalettes : CURATED_PALETTE_GROUPS[activePaletteGroup]).map(p => (
                        <button key={p.name} className="briefing-curated-chip" onClick={(e) => { e.preventDefault(); setForm(prev => ({...prev, q10_palette_colors: p.colors})); }}>
                          <div className="briefing-curated-dots">
                            {p.colors.map(c => <span key={c} className="briefing-curated-dot" style={{background: c}} />)}
                          </div>
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </Field>
              </div>
            )}

            {currentStep === 6 && (
              <div className="step-transition-enter-active">
                <Field label="4. Quem é o público principal do seu site?" required>
                  <CheckboxGroup
                    values={form.q11_publico} onChange={set('q11_publico')} hasOther
                    options={['Diretores(as) de cinema e TV', 'Produtoras / Agências', 'Imprensa / Jornalistas', 'Marcas / Clientes diretos']}
                  />
                </Field>
                <Field label="Funções desejadas além de mostrar portfólio?">
                  <CheckboxGroup
                    values={form.q12_funcoes} onChange={set('q12_funcoes')} hasOther
                    options={['Formulário de contato', 'Bio / Texto sobre trajetória', 'Arquivo de imprensa (Press Kit)', 'Somente galeria visual']}
                  />
                </Field>
              </div>
            )}

            {currentStep === 7 && (
              <div className="step-transition-enter-active">
                <Field label="Você já possui um domínio registrado?" required>
                  <div className="briefing-radio-group">
                    {['Sim, já tenho', 'Não tenho ainda', 'Preciso de ajuda com isso'].map(opt => (
                      <label key={opt} className="briefing-radio-item">
                        <input type="radio" className="briefing-radio-input" checked={form.q13_dominio === opt} onChange={() => setForm(p => ({...p, q13_dominio: opt}))} />
                        <span className="briefing-radio-dot"/> <span className="briefing-radio-label">{opt}</span>
                      </label>
                    ))}
                  </div>
                </Field>
                <Field label="Algum último recado livre?">
                  <AutoTextarea value={form.q14_recado} onChange={setInput('q14_recado')} rows={4} />
                </Field>
              </div>
            )}

            {/* Erro de Validação da Etapa */}
            {errorMsg && <div className="briefing-error-msg">{errorMsg}</div>}

            {/* Footer de Navegação */}
            {currentStep > 0 && (
              <footer className="briefing-step-footer">
                <button className="briefing-nav-btn" onClick={handlePrev}>← Voltar</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span className="briefing-shortcut-hint">Cmd+Enter para avançar</span>
                  {currentStep < WIZARD_STEPS.length - 1 ? (
                    <button className="briefing-nav-btn briefing-nav-btn--primary" onClick={handleNext}>Continuar →</button>
                  ) : (
                    <button className="briefing-nav-btn briefing-nav-btn--primary" onClick={handleSubmit} disabled={status === 'loading'}>
                      {status === 'loading' ? 'Enviando...' : 'Concluir Briefing ✓'}
                    </button>
                  )}
                </div>
              </footer>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Componente Interno p/ Checkboxes ─────────────────────────────────────────
function CheckboxGroup({ options, values, onChange, hasOther }) {
  const [otherText, setOtherText] = useState('');
  const otherChecked = values.includes('__outro__');
  
  const toggle = (opt) => values.includes(opt) ? onChange(values.filter(v => v !== opt)) : onChange([...values, opt]);
  const handleOtherToggle = () => otherChecked ? onChange(values.filter(v => !v.startsWith('__'))) : onChange([...values, '__outro__']);
  
  return (
    <div className="briefing-checkbox-group">
      {options.map(opt => (
        <label key={opt} className="briefing-checkbox-item">
          <input type="checkbox" className="briefing-checkbox-input" checked={values.includes(opt)} onChange={() => toggle(opt)} />
          <span className="briefing-checkbox-box" />
          <span className="briefing-checkbox-label">{opt}</span>
        </label>
      ))}
      {hasOther && (
        <label className="briefing-checkbox-item">
          <input type="checkbox" className="briefing-checkbox-input" checked={otherChecked} onChange={handleOtherToggle} />
          <span className="briefing-checkbox-box" />
          <span className="briefing-checkbox-label">Outro:</span>
        </label>
      )}
      {otherChecked && (
        <input type="text" className="briefing-input briefing-input--other" value={otherText} onChange={(e) => {
          setOtherText(e.target.value);
          const filtered = values.filter(v => !v.startsWith('__outro_text__'));
          onChange(e.target.value ? [...filtered, `__outro_text__${e.target.value}`] : filtered);
        }} placeholder="Detalhe sua resposta..." autoFocus />
      )}
    </div>
  );
}
