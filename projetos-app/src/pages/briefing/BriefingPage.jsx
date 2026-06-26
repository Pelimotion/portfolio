import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import './briefing.css';

// ─── Config por slug ──────────────────────────────────────────────────────────
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getConfig(slug) {
  return BRIEFING_CONFIG[slug] || DEFAULT_CONFIG;
}

function useSlug() {
  // Extrai slug do pathname: /projetos/briefing/joanna-ribas → joanna-ribas
  const parts = window.location.pathname.split('/');
  return parts[parts.length - 1] || '';
}

// ─── Sub-componentes de UI ────────────────────────────────────────────────────
function SectionTitle({ children }) {
  return (
    <div className="briefing-section-header">
      <span className="briefing-section-line" />
      <h2 className="briefing-section-title">{children}</h2>
      <span className="briefing-section-line briefing-section-line--right" />
    </div>
  );
}

function Field({ label, required, hint, children }) {
  return (
    <div className="briefing-field">
      <label className="briefing-label">
        {label}
        {required && <span className="briefing-required" aria-label="Obrigatório">*</span>}
      </label>
      {hint && <p className="briefing-hint">{hint}</p>}
      {children}
    </div>
  );
}

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
      onChange(values.filter((v) => v !== '__outro__' && !v.startsWith('__outro_text__')));
      setOtherText('');
    } else {
      onChange([...values, '__outro__']);
    }
  }

  function handleOtherText(e) {
    const text = e.target.value;
    setOtherText(text);
    // Remove old outro_text entries and add new one
    const filtered = values.filter((v) => !v.startsWith('__outro_text__'));
    onChange(text ? [...filtered, `__outro_text__${text}`] : filtered);
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
            />
          )}
        </>
      )}
    </div>
  );
}

function RadioGroup({ name, options, value, onChange }) {
  return (
    <div className="briefing-radio-group" role="group" aria-label={name}>
      {options.map((opt) => (
        <label key={opt} className="briefing-radio-item">
          <input
            type="radio"
            name={name}
            className="briefing-radio-input"
            checked={value === opt}
            onChange={() => onChange(opt)}
          />
          <span className="briefing-radio-dot" aria-hidden="true" />
          <span className="briefing-radio-label">{opt}</span>
        </label>
      ))}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function BriefingPage() {
  const slug = useSlug();
  const config = getConfig(slug);

  // Estado do form
  const [form, setForm] = useState({
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
    q11_publico: [],
    q12_funcoes: [],
    q13_dominio: '',
    q14_recado: '',
  });

  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  function set(field) {
    return (val) => setForm((prev) => ({ ...prev, [field]: val }));
  }

  function setInput(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  // Validação básica dos campos obrigatórios
  function validate() {
    if (!form.q1_apresentacao.trim()) return 'Por favor, preencha como você se apresenta profissionalmente.';
    if (!form.q4_marcos.trim()) return 'Por favor, preencha os marcos da sua carreira.';
    if (form.q5_material.length === 0) return 'Por favor, selecione pelo menos um tipo de material disponível.';
    if (form.q8_visual.length === 0) return 'Por favor, selecione pelo menos uma opção de identidade visual.';
    if (form.q11_publico.length === 0) return 'Por favor, selecione o público-alvo do site.';
    if (!form.q13_dominio) return 'Por favor, selecione uma opção sobre o domínio.';
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    // Limpa os valores internos de controle antes de salvar
    function cleanCheckboxValues(arr) {
      const hasOther = arr.includes('__outro__');
      const otherText = arr.find((v) => v.startsWith('__outro_text__'))?.replace('__outro_text__', '');
      const clean = arr.filter((v) => !v.startsWith('__'));
      if (hasOther && otherText) clean.push(`Outro: ${otherText}`);
      else if (hasOther) clean.push('Outro');
      return clean;
    }

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
      'Paleta de cores / estética': form.q10_paleta || null,
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
      setStatus('success');
    } catch (err) {
      console.error('Briefing submit error:', err);
      setErrorMsg(err.message || 'Algo deu errado. Tenta de novo ou me chama no WhatsApp.');
      setStatus('error');
    }
  }

  // ─── Estado de sucesso ──────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <BriefingShell config={config}>
        <div className="briefing-success">
          <div className="briefing-success-icon" aria-hidden="true">🙌</div>
          <h2 className="briefing-success-title">Recebido!</h2>
          <p className="briefing-success-text">
            Obrigado, {config.clienteNome.split(' ')[0]}. Vou ler tudo com atenção e te chamo no WhatsApp para marcarmos a reunião.
          </p>
          <p className="briefing-success-sig">— Felipe · Pelimotion</p>
        </div>
      </BriefingShell>
    );
  }

  // ─── Formulário ─────────────────────────────────────────────────────────────
  return (
    <BriefingShell config={config}>
      <form onSubmit={handleSubmit} noValidate className="briefing-form">

        {/* ══ SEÇÃO 1 ══════════════════════════════════════════════════════════ */}
        <SectionTitle>Sobre você e sua carreira</SectionTitle>

        <Field label="Como você se apresenta profissionalmente?" required>
          <textarea
            className="briefing-textarea"
            rows={4}
            placeholder="Figurinista de cinema, estilista, diretora de arte…"
            value={form.q1_apresentacao}
            onChange={setInput('q1_apresentacao')}
            required
          />
        </Field>

        <Field label="Você tem um nome profissional, marca pessoal ou logo que já usa?">
          <input
            type="text"
            className="briefing-input"
            placeholder="Se tiver logo, pode me mandar por WhatsApp também"
            value={form.q2_marca}
            onChange={setInput('q2_marca')}
          />
        </Field>

        <Field label="Tem redes sociais ou portfólios online ativos? Cole os links aqui.">
          <textarea
            className="briefing-textarea"
            rows={3}
            placeholder="Instagram, LinkedIn, Vimeo, Behance…"
            value={form.q3_redes}
            onChange={setInput('q3_redes')}
          />
        </Field>

        {/* ══ SEÇÃO 2 ══════════════════════════════════════════════════════════ */}
        <SectionTitle>Sobre os trabalhos</SectionTitle>

        <Field label="Quais são os marcos que você quer destacar no site?" required>
          <textarea
            className="briefing-textarea"
            rows={5}
            placeholder="Cite títulos, projetos, filmes, séries, artistas. Só os que realmente importam para você."
            value={form.q4_marcos}
            onChange={setInput('q4_marcos')}
            required
          />
        </Field>

        <Field label="Desses marcos, o que você tem de material disponível?" required>
          <CheckboxGroup
            name="material"
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
          <textarea
            className="briefing-textarea"
            rows={3}
            placeholder="Algo dos últimos anos que você sente orgulho especial em mostrar."
            value={form.q6_destaque}
            onChange={setInput('q6_destaque')}
          />
        </Field>

        <Field label="Tem créditos, prêmios ou menções que gostaria de incluir?">
          <textarea
            className="briefing-textarea"
            rows={3}
            placeholder="Festivais, publicações, premiações, matérias…"
            value={form.q7_creditos}
            onChange={setInput('q7_creditos')}
          />
        </Field>

        {/* ══ SEÇÃO 3 ══════════════════════════════════════════════════════════ */}
        <SectionTitle>Visual e personalidade</SectionTitle>

        <Field label="O que te representa visualmente? Pode marcar vários." required>
          <CheckboxGroup
            name="visual"
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
          <textarea
            className="briefing-textarea"
            rows={3}
            placeholder="Não precisa ser da sua área. Fotógrafo, artista visual, designer — cola quantos quiser."
            value={form.q9_sites_referencia}
            onChange={setInput('q9_sites_referencia')}
          />
        </Field>

        <Field label="Tem uma paleta de cores, estética ou período que te represente visualmente hoje?">
          <textarea
            className="briefing-textarea"
            rows={3}
            placeholder="Pode citar filmes, décadas, artistas — qualquer referência que venha à cabeça."
            value={form.q10_paleta}
            onChange={setInput('q10_paleta')}
          />
        </Field>

        {/* ══ SEÇÃO 4 ══════════════════════════════════════════════════════════ */}
        <SectionTitle>Objetivo do site</SectionTitle>

        <Field label="Para quem é esse site? Quem você quer que acesse?" required>
          <CheckboxGroup
            name="publico"
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
            name="funcoes"
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
            name="dominio"
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
          <textarea
            className="briefing-textarea"
            rows={4}
            placeholder="Pode falar à vontade."
            value={form.q14_recado}
            onChange={setInput('q14_recado')}
          />
        </Field>

        {/* ══ SUBMIT ═══════════════════════════════════════════════════════════ */}
        <div className="briefing-submit-area">
          {errorMsg && (
            <p className="briefing-error" role="alert">{errorMsg}</p>
          )}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="briefing-submit-btn"
            id="briefing-submit-btn"
          >
            {status === 'loading' ? 'Enviando…' : 'Enviar briefing →'}
          </button>
        </div>

      </form>
    </BriefingShell>
  );
}

// ─── Shell da página (header + container) ─────────────────────────────────────
function BriefingShell({ config, children }) {
  return (
    <div className="briefing-root">
      {/* Grain overlay */}
      <div className="briefing-grain" aria-hidden="true" />

      <main className="briefing-container">
        {/* Header */}
        <header className="briefing-header">
          <p className="briefing-eyebrow">Pelimotion Studio</p>
          <h1 className="briefing-main-title">{config.titulo}</h1>
          <p className="briefing-client-name">{config.subtitulo}</p>
          <p className="briefing-intro">
            Preencha com calma — pode voltar quando quiser. Cada detalhe aqui me ajuda a montar as melhores opções para o seu site. Qualquer dúvida, me chama no WhatsApp.
          </p>
          <p className="briefing-sig">— Felipe · Pelimotion</p>
          <div className="briefing-header-rule" />
        </header>

        {/* Content */}
        {children}
      </main>
    </div>
  );
}
