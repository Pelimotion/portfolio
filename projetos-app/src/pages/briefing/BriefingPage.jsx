import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import './briefing.css';

// ─── Constants ───────────────────────────────────────────────────────────────
const DRAFT_KEY_PREFIX = 'pelimotion_briefing_draft_';
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

/** Paletas cinematográficas curadas */
const CURATED_PALETTES = [
  {
    name: 'Kubrick',
    colors: ['#0d0d0d', '#1a0a0a', '#c41e3a', '#f0e6d3', '#8b7355'],
  },
  {
    name: 'Wong Kar-Wai',
    colors: ['#1a0a00', '#8b1a00', '#ff6b35', '#f7c59f', '#2d1b00'],
  },
  {
    name: 'Lynch',
    colors: ['#0a0015', '#1a0030', '#8b00ff', '#e8d5b7', '#4a0080'],
  },
  {
    name: 'Wes Anderson',
    colors: ['#e8d5b7', '#d4a574', '#8b6914', '#c4956a', '#2c1810'],
  },
  {
    name: 'Gaspar Noé',
    colors: ['#0a0000', '#500000', '#cc0000', '#ff6644', '#ffffff'],
  },
  {
    name: 'Tarkovsky',
    colors: ['#1a1a0a', '#4a4a2a', '#8b8b5a', '#d4c89a', '#2d2d1a'],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getConfig(slug) {
  return BRIEFING_CONFIG[slug] || DEFAULT_CONFIG;
}

function useSlug() {
  const parts = window.location.pathname.split('/');
  return parts[parts.length - 1] || 'default';
}

/** rgb array [r,g,b] → hex string */
function rgbToHex([r, g, b]) {
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

/** hex string → rgb array */
function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  return [
    parseInt(clean.substring(0, 2), 16),
    parseInt(clean.substring(2, 4), 16),
    parseInt(clean.substring(4, 6), 16),
  ];
}

/** debounce */
function useDebounce(fn, delay) {
  const timer = useRef(null);
  return useCallback(
    (...args) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay]
  );
}

// ─── Hook: localStorage draft ─────────────────────────────────────────────────
function useLocalStorageDraft(slug, initialForm) {
  const key = DRAFT_KEY_PREFIX + slug;

  const [draft, setDraft] = useState(null); // Rascunho encontrado no localStorage
  const [draftBannerVisible, setDraftBannerVisible] = useState(false);
  const [savedIndicator, setSavedIndicator] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        setDraft(parsed);
      }
    } catch {
      /* noop */
    }
  }, [key]);

  const saveDraft = useCallback(
    (form) => {
      try {
        localStorage.setItem(key, JSON.stringify(form));
        setSavedIndicator(true);
        setDraftBannerVisible(true);
        setTimeout(() => setSavedIndicator(false), 2000);
      } catch {
        /* noop */
      }
    },
    [key]
  );

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setDraft(null);
      setDraftBannerVisible(false);
    } catch {
      /* noop */
    }
  }, [key]);

  return { draft, draftBannerVisible, savedIndicator, saveDraft, clearDraft };
}

// ─── Hook: progress tracker ───────────────────────────────────────────────────
const REQUIRED_FIELDS = ['q1_apresentacao', 'q4_marcos', 'q5_material', 'q8_visual', 'q11_publico', 'q13_dominio'];

function useProgress(form) {
  const filled = REQUIRED_FIELDS.filter((f) => {
    const val = form[f];
    if (Array.isArray(val)) return val.length > 0;
    return val && val.trim().length > 0;
  });
  return Math.round((filled.length / REQUIRED_FIELDS.length) * 100);
}

// ─── Hook: scroll direction (mostra/esconde progress bar) ─────────────────────
function useScrollDirection() {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const handler = () => {
      const y = window.scrollY;
      setHidden(y > lastY.current && y > 80);
      lastY.current = y;
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return hidden;
}

// ─── Hook: IntersectionObserver fallback for scroll reveals ───────────────────
function useScrollReveal(containerRef) {
  useEffect(() => {
    if (CSS.supports('animation-timeline', 'view()')) return; // Native handles it

    const els = containerRef.current?.querySelectorAll('.briefing-field') ?? [];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.05 }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [containerRef]);
}

// ─── Hook: section active (número em destaque) ────────────────────────────────
function useSectionHighlight() {
  useEffect(() => {
    const sections = document.querySelectorAll('.briefing-section');
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.classList.toggle('is-active', entry.isIntersecting);
        }
      },
      { threshold: 0.2 }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);
}

// ─── Hook: textarea auto-resize ───────────────────────────────────────────────
function useAutoResize(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const resize = () => {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    };

    el.addEventListener('input', resize);
    resize(); // initial
    return () => el.removeEventListener('input', resize);
  }, [ref]);
}

// ─── Component: AutoTextarea ──────────────────────────────────────────────────
function AutoTextarea({ value, onChange, placeholder, rows = 4, maxChars, id, required, ...props }) {
  const ref = useRef(null);
  useAutoResize(ref);
  const near = maxChars && value.length > maxChars * 0.85;

  return (
    <div>
      <textarea
        ref={ref}
        id={id}
        className="briefing-textarea"
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        aria-required={required}
        {...props}
      />
      {maxChars && (
        <div
          className={`briefing-char-counter ${near ? 'near-limit' : ''}`}
          aria-live="polite"
        >
          {value.length}/{maxChars}
        </div>
      )}
    </div>
  );
}

// ─── Component: CheckboxGroup ─────────────────────────────────────────────────
function CheckboxGroup({ name, options, values, onChange, hasOther }) {
  const [otherText, setOtherText] = useState('');
  const otherChecked = values.includes('__outro__');

  function toggle(option) {
    if (values.includes(option)) {
      onChange(values.filter((v) => v !== option));
    } else {
      onChange([...values, option]);
    }
  }

  function handleOtherToggle() {
    if (otherChecked) {
      onChange(values.filter((v) => !v.startsWith('__')));
      setOtherText('');
    } else {
      onChange([...values, '__outro__']);
    }
  }

  function handleOtherText(e) {
    const text = e.target.value;
    setOtherText(text);
    const filtered = values.filter((v) => !v.startsWith('__outro_text__'));
    if (otherChecked) {
      onChange(text ? [...filtered, `__outro_text__${text}`] : filtered);
    }
  }

  return (
    <div className="briefing-checkbox-group" role="group" aria-label={name}>
      {options.map((opt) => (
        <label key={opt} className="briefing-checkbox-item">
          <input
            type="checkbox"
            className="briefing-checkbox-input"
            checked={values.includes(opt)}
            onChange={() => toggle(opt)}
            aria-checked={values.includes(opt)}
          />
          <span className="briefing-checkbox-box" aria-hidden="true" />
          <span className="briefing-checkbox-label">{opt}</span>
        </label>
      ))}
      {hasOther && (
        <>
          <label className="briefing-checkbox-item">
            <input
              type="checkbox"
              className="briefing-checkbox-input"
              checked={otherChecked}
              onChange={handleOtherToggle}
            />
            <span className="briefing-checkbox-box" aria-hidden="true" />
            <span className="briefing-checkbox-label">Outro</span>
          </label>
          {otherChecked && (
            <input
              type="text"
              className="briefing-input briefing-input--other"
              placeholder="Descreva aqui…"
              value={otherText}
              onChange={handleOtherText}
              autoFocus
              aria-label="Especifique: outro"
            />
          )}
        </>
      )}
    </div>
  );
}

// ─── Component: RadioGroup ────────────────────────────────────────────────────
function RadioGroup({ name, options, value, onChange }) {
  return (
    <div className="briefing-radio-group" role="radiogroup" aria-label={name}>
      {options.map((opt) => (
        <label key={opt} className="briefing-radio-item">
          <input
            type="radio"
            name={name}
            className="briefing-radio-input"
            checked={value === opt}
            onChange={() => onChange(opt)}
            aria-checked={value === opt}
          />
          <span className="briefing-radio-dot" aria-hidden="true" />
          <span className="briefing-radio-label">{opt}</span>
        </label>
      ))}
    </div>
  );
}

// ─── Component: ColorPalettePicker ────────────────────────────────────────────
function ColorPalettePicker({ onPaletteSelect }) {
  const [palette, setPalette] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null); // index do swatch copiado
  const [seedHex, setSeedHex] = useState('');

  async function generatePalette(seed = null) {
    setLoading(true);
    try {
      const body = { model: 'default' };
      if (seed) {
        const rgb = hexToRgb(seed);
        body.input = [rgb, 'N', 'N', 'N', 'N'];
      }
      const resp = await fetch(COLORMIND_API, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      const data = await resp.json();
      const hexes = data.result.map(rgbToHex);
      setPalette(hexes);
      onPaletteSelect?.(hexes);
    } catch {
      // Fallback: gerar aleatório se API falhar
      const hexes = Array.from({ length: 5 }, () =>
        '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')
      );
      setPalette(hexes);
    } finally {
      setLoading(false);
    }
  }

  function applyCurated(p) {
    setPalette(p.colors);
    onPaletteSelect?.(p.colors);
  }

  async function copySwatch(hex, idx) {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(idx);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* noop */
    }
  }

  return (
    <div className="briefing-color-picker">
      <div className="briefing-color-picker-header">
        <span className="briefing-color-picker-label">Gerador de paleta</span>
        <div className="briefing-color-picker-actions">
          <input
            type="text"
            className="briefing-input"
            placeholder="#hex base…"
            value={seedHex}
            onChange={(e) => setSeedHex(e.target.value)}
            style={{ width: 100, padding: '4px 10px', fontSize: 12 }}
            aria-label="Cor base (hex)"
            maxLength={7}
          />
          <button
            type="button"
            className="briefing-color-btn briefing-color-btn--primary"
            onClick={() => generatePalette(seedHex.match(/^#[0-9a-f]{6}$/i) ? seedHex : null)}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Gerando…' : '✦ Gerar'}
          </button>
        </div>
      </div>

      {palette ? (
        <div className={`briefing-palette-swatches ${loading ? 'loading' : ''}`} role="list" aria-label="Paleta gerada">
          {palette.map((hex, i) => (
            <button
              key={i}
              type="button"
              className={`briefing-swatch ${copied === i ? 'copied' : ''}`}
              style={{ background: hex }}
              onClick={() => copySwatch(hex, i)}
              aria-label={`Cor ${hex} — clique para copiar`}
              role="listitem"
            >
              <span className="briefing-swatch-hex">{hex}</span>
              <span className="briefing-swatch-copied" aria-hidden="true">
                Copiado!
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div
          style={{
            height: 72,
            display: 'grid',
            placeItems: 'center',
            color: 'var(--b-text-muted)',
            fontSize: 12,
          }}
        >
          Clique em "Gerar" para criar uma paleta com IA
        </div>
      )}

      <div className="briefing-curated-palettes" role="list" aria-label="Paletas cinematográficas">
        {CURATED_PALETTES.map((p) => (
          <button
            key={p.name}
            type="button"
            className="briefing-curated-chip"
            onClick={() => applyCurated(p)}
            aria-label={`Paleta ${p.name}`}
            role="listitem"
          >
            <div className="briefing-curated-dots" aria-hidden="true">
              {p.colors.map((c, i) => (
                <span key={i} className="briefing-curated-dot" style={{ background: c }} />
              ))}
            </div>
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Component: Field ─────────────────────────────────────────────────────────
function Field({ label, required, hint, hintId, children }) {
  return (
    <div className="briefing-field" aria-describedby={hint ? hintId : undefined}>
      <label className="briefing-label">
        {label}
        {required && (
          <span className="briefing-required" aria-label="obrigatório">
            *
          </span>
        )}
      </label>
      {hint && (
        <p id={hintId} className="briefing-hint">
          {hint}
        </p>
      )}
      {children}
    </div>
  );
}

// ─── Component: Section ───────────────────────────────────────────────────────
function Section({ num, title, children }) {
  return (
    <div className="briefing-section">
      <div className="briefing-section-num" aria-hidden="true">
        {num}
      </div>
      <div className="briefing-section-body">
        <div className="briefing-section-header">
          <h2 className="briefing-section-title">{title}</h2>
          <div className="briefing-section-rule" aria-hidden="true" />
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Component: ProgressBar ───────────────────────────────────────────────────
function ProgressBar({ progress, hidden }) {
  return (
    <>
      <div
        className={`briefing-progress-bar ${hidden ? 'hidden' : ''}`}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progresso do briefing"
      >
        <div
          className="briefing-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div
        className="briefing-progress-label"
        aria-live="polite"
        aria-atomic="true"
      >
        {progress}%
      </div>
    </>
  );
}

// ─── Component: DraftBanner ───────────────────────────────────────────────────
function DraftBanner({ visible, onRestore, hasDraft }) {
  if (hasDraft) {
    return (
      <div className={`briefing-draft-banner ${visible ? 'visible' : ''}`} role="status">
        <span className="briefing-draft-banner-dot" />
        <span>Rascunho encontrado</span>
        <button type="button" className="briefing-draft-restore" onClick={onRestore}>
          Restaurar
        </button>
      </div>
    );
  }

  return (
    <div className={`briefing-draft-banner ${visible ? 'visible' : ''}`} role="status" aria-live="polite">
      <span className="briefing-draft-banner-dot" />
      <span>Rascunho salvo</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const INITIAL_FORM = {
  q1_apresentacao: '',
  q2_marca: '',
  q3_redes: '',
  q4_marcos: '',
  q5_material: [],
  q6_destaque: '',
  q7_creditos: '',
  q8_visual: [],
  q9_sites_referencia: '',
  q10_paleta: '',
  q10_palette_colors: [],
  q11_publico: [],
  q12_funcoes: [],
  q13_dominio: '',
  q14_recado: '',
};

export default function BriefingPage() {
  const slug = useSlug();
  const config = getConfig(slug);
  const containerRef = useRef(null);

  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const { draft, draftBannerVisible, savedIndicator, saveDraft, clearDraft } =
    useLocalStorageDraft(slug, INITIAL_FORM);

  const progress = useProgress(form);
  const scrollHidden = useScrollDirection();

  // Hooks de efeito visual
  useScrollReveal(containerRef);
  useSectionHighlight();

  // Debounced auto-save
  const debouncedSave = useDebounce(saveDraft, 800);

  // Aciona auto-save a cada mudança no form
  useEffect(() => {
    if (status === 'idle') {
      debouncedSave(form);
    }
  }, [form, debouncedSave, status]);

  // Estado derivado — mostrar banner de rascunho ao carregar
  const [showDraftRestore, setShowDraftRestore] = useState(false);
  useEffect(() => {
    if (draft) setShowDraftRestore(true);
  }, [draft]);

  function restoreDraft() {
    if (draft) {
      setForm(draft);
      setShowDraftRestore(false);
    }
  }

  function set(field) {
    return (val) => setForm((prev) => ({ ...prev, [field]: val }));
  }

  function setInput(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  // ── Validação ───────────────────────────────────────────────────────────────
  function validate() {
    if (!form.q1_apresentacao.trim())
      return 'Por favor, preencha como você se apresenta profissionalmente.';
    if (!form.q4_marcos.trim())
      return 'Por favor, preencha os marcos que quer destacar.';
    if (!form.q5_material.length)
      return 'Por favor, selecione pelo menos um tipo de material disponível.';
    if (!form.q8_visual.length)
      return 'Por favor, selecione pelo menos uma opção de identidade visual.';
    if (!form.q11_publico.length)
      return 'Por favor, selecione o público-alvo do site.';
    if (!form.q13_dominio)
      return 'Por favor, selecione uma opção sobre o domínio.';
    return null;
  }

  // ── Limpeza de valores internos dos checkboxes ──────────────────────────────
  function cleanCheckboxValues(arr) {
    const hasOther = arr.includes('__outro__');
    const otherText = arr
      .find((v) => v.startsWith('__outro_text__'))
      ?.replace('__outro_text__', '');
    const clean = arr.filter((v) => !v.startsWith('__'));
    if (hasOther && otherText) clean.push(`Outro: ${otherText}`);
    else if (hasOther) clean.push('Outro');
    return clean;
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    const err = validate();
    if (err) {
      setErrorMsg(err);
      document.querySelector('.briefing-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    const paletteStr =
      form.q10_palette_colors.length
        ? `${form.q10_paleta}\n\nPaleta gerada: ${form.q10_palette_colors.join(', ')}`
        : form.q10_paleta;

    const respostas = {
      'Como você se apresenta profissionalmente?': form.q1_apresentacao,
      'Nome profissional / marca pessoal / logo': form.q2_marca || null,
      'Redes sociais e portfólios online': form.q3_redes || null,
      'Marcos a destacar no site': form.q4_marcos,
      'Material disponível': cleanCheckboxValues(form.q5_material),
      'Trabalho recente em destaque': form.q6_destaque || null,
      'Créditos, prêmios e menções': form.q7_creditos || null,
      'Identidade visual': cleanCheckboxValues(form.q8_visual),
      'Sites de portfólio que admira': form.q9_sites_referencia || null,
      'Paleta de cores / estética': paletteStr || null,
      'Público-alvo do site': cleanCheckboxValues(form.q11_publico),
      'Funções além de portfólio': cleanCheckboxValues(form.q12_funcoes),
      'Domínio registrado?': form.q13_dominio,
      'Recado livre': form.q14_recado || null,
    };

    try {
      const { error } = await supabase.from('briefings').insert({
        slug,
        cliente_nome: config.clienteNome,
        respostas,
      });

      if (error) throw error;

      clearDraft();
      setStatus('success');
    } catch (err) {
      console.error('[Briefing] Submit error:', err);
      setErrorMsg(err.message || 'Algo deu errado. Tenta de novo ou me chama no WhatsApp.');
      setStatus('error');
    }
  }

  // ── Estado de Sucesso ────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div className="briefing-root">
        <div className="briefing-grain" aria-hidden="true" />
        <main className="briefing-container" id="main-content">
          <div className="briefing-success">
            <span className="briefing-success-icon" role="img" aria-label="Mãos aplaudindo">
              🙌
            </span>
            <h1 className="briefing-success-title">Recebido!</h1>
            <p className="briefing-success-text">
              Obrigado, {config.clienteNome.split(' ')[0]}. Vou ler tudo com atenção e te chamo no WhatsApp para marcarmos a reunião.
            </p>
            <p className="briefing-success-sig">— Felipe · Pelimotion</p>
          </div>
        </main>
      </div>
    );
  }

  // ── Formulário ───────────────────────────────────────────────────────────────
  return (
    <div className="briefing-root">
      {/* Skip link */}
      <a href="#main-content" className="briefing-skip-link">
        Pular para o formulário
      </a>

      {/* Grain */}
      <div className="briefing-grain" aria-hidden="true" />

      {/* Progress */}
      <ProgressBar progress={progress} hidden={scrollHidden} />
      <div
        className="briefing-progress-label"
        aria-live="polite"
        aria-atomic="true"
        aria-label={`Progresso: ${progress} por cento`}
      >
        {progress}%
      </div>

      {/* Draft banner */}
      <DraftBanner
        visible={showDraftRestore || savedIndicator}
        hasDraft={showDraftRestore}
        onRestore={restoreDraft}
      />

      <main className="briefing-container" id="main-content" ref={containerRef}>
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <header className="briefing-hero">
          <span className="briefing-eyebrow">Pelimotion Studio</span>
          <h1 className="briefing-main-title">{config.titulo}</h1>
          <p className="briefing-client-name">{config.subtitulo}</p>
          <div className="briefing-intro-block">
            <p className="briefing-intro">
              Preencha com calma — pode voltar quando quiser. Cada detalhe aqui me ajuda a montar as melhores opções para o seu site. Qualquer dúvida, me chama no WhatsApp.
            </p>
            <p className="briefing-sig">— Felipe · Pelimotion</p>
          </div>
          <div className="briefing-hero-rule" aria-hidden="true" />
        </header>

        {/* ── Form ─────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} noValidate className="briefing-form" aria-label="Formulário de briefing">

          {/* ══ SEÇÃO 1 ═══════════════════════════════════════════ */}
          <Section num="01" title="Sobre você e sua carreira">
            <Field label="Como você se apresenta profissionalmente?" required hintId="q1-hint">
              <AutoTextarea
                id="q1"
                placeholder="Figurinista de cinema, estilista, diretora de arte…"
                value={form.q1_apresentacao}
                onChange={setInput('q1_apresentacao')}
                rows={4}
                maxChars={CHAR_LIMIT_LONG}
                required
                aria-required="true"
              />
            </Field>

            <Field label="Você tem um nome profissional, marca pessoal ou logo que já usa?">
              <input
                type="text"
                id="q2"
                className="briefing-input"
                placeholder="Se tiver logo, pode me mandar por WhatsApp também"
                value={form.q2_marca}
                onChange={setInput('q2_marca')}
                autoComplete="off"
              />
            </Field>

            <Field label="Tem redes sociais ou portfólios online ativos? Cole os links aqui.">
              <AutoTextarea
                id="q3"
                placeholder="Instagram, LinkedIn, Vimeo, Behance…"
                value={form.q3_redes}
                onChange={setInput('q3_redes')}
                rows={3}
              />
            </Field>
          </Section>

          {/* ══ SEÇÃO 2 ═══════════════════════════════════════════ */}
          <Section num="02" title="Sobre os trabalhos">
            <Field label="Quais são os marcos que você quer destacar no site?" required>
              <AutoTextarea
                id="q4"
                placeholder="Cite títulos, projetos, filmes, séries, artistas. Só os que realmente importam para você."
                value={form.q4_marcos}
                onChange={setInput('q4_marcos')}
                rows={5}
                maxChars={CHAR_LIMIT_LONG}
                required
              />
            </Field>

            <Field label="Desses marcos, o que você tem de material disponível?" required>
              <CheckboxGroup
                name="material disponível"
                options={[
                  'Fotos de set / bastidores',
                  'Stills dos filmes ou séries',
                  'Making of em vídeo',
                  'Cartazes e artes gráficas',
                  'Fotos dos figurinos isolados',
                  'Clipes ou trechos em vídeo',
                  'Apenas o que conseguir resgatar pela internet',
                ]}
                values={form.q5_material}
                onChange={set('q5_material')}
                hasOther
              />
            </Field>

            <Field label="Tem algum trabalho recente que você quer em destaque?">
              <AutoTextarea
                id="q6"
                placeholder="Algo dos últimos anos que você sente orgulho especial em mostrar."
                value={form.q6_destaque}
                onChange={setInput('q6_destaque')}
                rows={3}
              />
            </Field>

            <Field label="Tem créditos, prêmios ou menções que gostaria de incluir?">
              <AutoTextarea
                id="q7"
                placeholder="Festivais, publicações, premiações, matérias…"
                value={form.q7_creditos}
                onChange={setInput('q7_creditos')}
                rows={3}
              />
            </Field>
          </Section>

          {/* ══ SEÇÃO 3 ═══════════════════════════════════════════ */}
          <Section num="03" title="Visual e personalidade">
            <Field label="O que te representa visualmente? Pode marcar vários." required>
              <CheckboxGroup
                name="identidade visual"
                options={[
                  'Cores vibrantes e saturadas',
                  'Muita textura e camadas',
                  'Tipografia marcante e expressiva',
                  'Colagem e composição densa',
                  'Movimento e animação na tela',
                  'Referência vintage / retrô',
                  'Fotografia como elemento principal',
                  'Algo dramático e cinematográfico',
                ]}
                values={form.q8_visual}
                onChange={set('q8_visual')}
                hasOther
              />
            </Field>

            <Field label="Links de sites de portfólio que você admira">
              <AutoTextarea
                id="q9"
                placeholder="Não precisa ser da sua área. Fotógrafo, artista visual, designer — cola quantos quiser."
                value={form.q9_sites_referencia}
                onChange={setInput('q9_sites_referencia')}
                rows={3}
              />
            </Field>

            <Field
              label="Tem uma paleta de cores, estética ou período que te represente visualmente hoje?"
              hint="Cole qualquer referência ou use o gerador de paletas abaixo — ele usa IA para criar combinações cinematográficas."
              hintId="q10-hint"
            >
              <AutoTextarea
                id="q10"
                placeholder="Pode citar filmes, décadas, artistas — qualquer referência que venha à cabeça."
                value={form.q10_paleta}
                onChange={setInput('q10_paleta')}
                rows={3}
                aria-describedby="q10-hint"
              />
              <ColorPalettePicker
                onPaletteSelect={(colors) =>
                  setForm((prev) => ({ ...prev, q10_palette_colors: colors }))
                }
              />
            </Field>
          </Section>

          {/* ══ SEÇÃO 4 ═══════════════════════════════════════════ */}
          <Section num="04" title="Objetivo do site">
            <Field label="Para quem é esse site? Quem você quer que acesse?" required>
              <CheckboxGroup
                name="público-alvo"
                options={[
                  'Diretores de cinema e TV',
                  'Produtoras de audiovisual',
                  'Agências de publicidade',
                  'Imprensa e jornalistas',
                  'Marcas de moda e luxo',
                ]}
                values={form.q11_publico}
                onChange={set('q11_publico')}
                hasOther
              />
            </Field>

            <Field label="O site precisa ter alguma função além de portfólio?">
              <CheckboxGroup
                name="funcionalidades extras"
                options={[
                  'Formulário de contato',
                  'Bio / texto longo sobre a trajetória',
                  'Seção de depoimentos',
                  'Arquivo histórico navegável',
                  'Área de imprensa e press kit',
                  'Não — só o portfólio mesmo',
                ]}
                values={form.q12_funcoes}
                onChange={set('q12_funcoes')}
                hasOther
              />
            </Field>

            <Field label="Você já tem um domínio registrado com seu nome?" required>
              <RadioGroup
                name="domínio"
                options={[
                  'Sim, já tenho',
                  'Não tenho ainda',
                  'Não sei o que é isso — me explica!',
                ]}
                value={form.q13_dominio}
                onChange={set('q13_dominio')}
              />
            </Field>

            <Field label="Quer deixar algum recado ou ideia que não coube nas perguntas?">
              <AutoTextarea
                id="q14"
                placeholder="Pode falar à vontade."
                value={form.q14_recado}
                onChange={setInput('q14_recado')}
                rows={4}
                maxChars={CHAR_LIMIT_LONG}
              />
            </Field>
          </Section>

          {/* ══ Submit ════════════════════════════════════════════ */}
          <div className="briefing-submit-area">
            {errorMsg && (
              <p className="briefing-error" role="alert" aria-live="assertive">
                {errorMsg}
              </p>
            )}
            <button
              type="submit"
              id="briefing-submit-btn"
              disabled={status === 'loading'}
              className="briefing-submit-btn"
              aria-busy={status === 'loading'}
            >
              {status === 'loading' ? 'Enviando…' : 'Enviar briefing →'}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}
