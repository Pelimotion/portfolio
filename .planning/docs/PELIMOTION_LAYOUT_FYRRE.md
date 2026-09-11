# PELIMOTION BLOG — PLANO DE LAYOUT FYRRE-INSPIRED
## Para o Antigravity | Adaptação completa do conteúdo atual

---

## ANÁLISE DA REFERÊNCIA (FYRRE MAGAZINE)

O que o layout FYRRE faz de certo e que vamos adaptar:

| Elemento | O que o FYRRE faz | Como adaptar para Pelimotion |
|----------|-------------------|------------------------------|
| Wordmark gigante | "MAGAZINE" em tipo bold extracondensado ocupa 1/4 da tela | "PELIMOTION" ou "JOURNAL" em peso black, sem subpixel |
| Grid estrito de 3 colunas | Cards iguais, sem featured destacado | Manter, mas coluna 1 pode ter card 2x de altura a cada 6 posts |
| Categoria como pill no canto do card | Pequena, top-right, capsule border | Adaptar: TÉCNICA · PROCESSO · IA · NEGÓCIO · PSICOLOGIA |
| Data pequena top-left do card | Tipografia mono, cinza, minúscula | Manter exato — data pt-BR formatada |
| Metadados na base: Text + Duration | "Text: Jakob" e "Duration: 1 min" | "Texto: Pelimotion" + "Leitura: 5 min" |
| Linha separadora entre cards | Border fina entre células do grid | Usar --border 1px, não box-shadow |
| Filtro de categorias no topo | Pills alinhados à direita, ALL ativo | Manter posicionamento direita |
| Header minimalista | Logo esquerda, nav direita, tudo na mesma linha | Adaptar: PELIMOTION à esq, nav + idioma à dir |
| Background branco, texto preto | Contraste máximo, zero decoração | Inverter: fundo #0a0a0a, texto #f0ede8 (dark editorial) |

---

## DECISÃO CRÍTICA: LIGHT vs DARK

O FYRRE usa fundo branco. Para Pelimotion, mantemos dark theme pelos motivos do plano anterior.
A estrutura e proporções do FYRRE são iguais — só a paleta inverte.

```
Fundo:          #0a0a0a  (FYRRE usa #ffffff)
Cards:          #0f0f0f  (FYRRE usa #ffffff com border)
Texto primário: #f0ede8  (FYRRE usa #0a0a0a)
Texto meta:     #666666  (FYRRE usa #aaaaaa)
Accent/pill:    #f0ede8 border, fundo transparente (inativo)
                #f0ede8 fundo, #0a0a0a texto (ativo)
Border cards:   #1e1e1e  (FYRRE usa #e5e5e5)
```

---

## TIPOGRAFIA — ESPELHO DO FYRRE

O FYRRE usa uma grotesca black extracondensada para o wordmark.
Para Pelimotion, usar:

```css
/* Wordmark — equivalente ao "MAGAZINE" gigante do FYRRE */
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@900&family=DM+Mono:wght@400;500&family=Playfair+Display:ital,wght@0,700;1,400&display=swap');

--font-display:  'Barlow Condensed', sans-serif;   /* Wordmark gigante */
--font-editorial:'Playfair Display', serif;          /* Títulos dos posts */
--font-mono:     'DM Mono', monospace;               /* Meta, datas, categorias, nav */

/* Tamanhos */
--wordmark-size: clamp(72px, 18vw, 180px);   /* O "MAGAZINE" gigante */
--card-title:    clamp(16px, 2vw, 22px);     /* Título do card */
--meta-size:     11px;                        /* Datas, categorias, duração */
--body-size:     14px;                        /* Excerpt do card */
```

---

## ESTRUTURA EXATA DE CADA COMPONENTE

### 1. HEADER DO BLOG

```
┌─────────────────────────────────────────────────────────────┐
│ PELIMOTION JOURNAL          Magazine  Authors  EN  ○ ◻ ▷ ⁑ │
│ ─────────────────────────────────────────────────────────── │
└─────────────────────────────────────────────────────────────┘
```

```css
.blog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  background: rgba(10,10,10,0.92);
  backdrop-filter: blur(12px);
  z-index: 100;
}

.blog-logo {
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--text-primary);
}

.blog-nav {
  display: flex;
  gap: 32px;
  align-items: center;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.08em;
}
```

---

### 2. WORDMARK HERO (equivalente ao "MAGAZINE" gigante)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  JOURNAL                                                    │
│  ───────────────── CATEGORIES ──── (ALL)(TÉCNICA)(PROCESSO)│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

```css
.blog-wordmark {
  font-family: var(--font-display);
  font-size: var(--wordmark-size);
  font-weight: 900;
  line-height: 0.85;
  letter-spacing: -0.03em;
  color: var(--text-primary);
  padding: 40px 40px 0;
  text-transform: uppercase;
}

.blog-filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 40px 20px;
  border-bottom: 1px solid var(--border);
}

.filter-label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.filter-pills {
  display: flex;
  gap: 8px;
}

.pill {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  padding: 4px 10px;
  border: 1px solid var(--border);
  border-radius: 100px;
  cursor: pointer;
  transition: all 200ms ease;
}

.pill.active,
.pill:hover {
  background: var(--text-primary);
  color: var(--bg-primary);
  border-color: var(--text-primary);
}
```

---

### 3. GRID DE CARDS (estrutura FYRRE exata)

```
┌───────────────┬───────────────┬───────────────┐
│ 16 mai. 2026  │ 16 mai. 2026  │ 16 mai. 2026  │  ← linha 1
│          [TÉC]│          [TÉC]│         [PROC]│
│               │               │               │
│  [IMAGEM]     │  [IMAGEM]     │  [IMAGEM]     │
│               │               │               │
│ Título do     │ Título do     │ Título do     │
│ artigo aqui   │ artigo aqui   │ artigo aqui   │
│               │               │               │
│ Excerpt de    │ Excerpt de    │ Excerpt de    │
│ duas linhas   │ duas linhas   │ duas linhas   │
│ máximo aqui.  │ máximo aqui.  │ máximo aqui.  │
│               │               │               │
│ Texto·Pelim.  │ Texto·Pelim.  │ Texto·Pelim.  │
│ Leitura·5min  │ Leitura·5min  │ Leitura·5min  │
├───────────────┼───────────────┼───────────────┤
│ (próxima linha de 3 cards)                    │  ← linha 2
└───────────────┴───────────────┴───────────────┘
```

```css
.posts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-left: 1px solid var(--border);
  border-top: 1px solid var(--border);
}

.post-card {
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: background 200ms ease;
}

.post-card:hover {
  background: var(--bg-secondary);
}

/* Meta line topo do card */
.card-meta-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-date {
  font-family: var(--font-mono);
  font-size: var(--meta-size);
  color: var(--text-secondary);
}

.card-category-pill {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 3px 8px;
  border: 1px solid var(--border);
  border-radius: 100px;
  color: var(--text-secondary);
  white-space: nowrap;
}

/* Imagem */
.card-image-wrapper {
  aspect-ratio: 4/3;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 400ms cubic-bezier(0.16, 1, 0.3, 1);
}

.post-card:hover .card-image {
  transform: scale(1.04);
}

/* Título */
.card-title {
  font-family: var(--font-editorial);
  font-size: var(--card-title);
  font-weight: 700;
  line-height: 1.25;
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Excerpt */
.card-excerpt {
  font-family: var(--font-mono);
  font-size: var(--body-size);
  line-height: 1.6;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

/* Meta base do card — igual FYRRE: "Text · Autor   Duration · Xmin" */
.card-meta-bottom {
  display: flex;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  font-family: var(--font-mono);
  font-size: var(--meta-size);
  color: var(--text-secondary);
}

.card-meta-bottom span {
  display: flex;
  gap: 6px;
  align-items: center;
}

.card-meta-bottom strong {
  color: var(--text-primary);
  font-weight: 500;
}
```

---

### 4. HTML COMPLETO DO CARD (template para cada post)

```html
<article class="post-card" data-category="tecnica">
  <div class="card-meta-top">
    <time class="card-date" datetime="2026-05-16">16 mai. 2026</time>
    <span class="card-category-pill">Técnica</span>
  </div>

  <div class="card-image-wrapper">
    <img
      class="card-image"
      src="/blog/assets/[slug]/thumb.webp"
      alt="[alt text SEO do post]"
      loading="lazy"
      width="400"
      height="300"
    />
  </div>

  <h2 class="card-title">
    <a href="/blog/[slug]">Diferença prática entre motion design, motion branding e só um videozinho</a>
  </h2>

  <p class="card-excerpt">
    Entenda por que motion branding vai muito além de uma simples animação
    e como ele constrói a identidade visual da sua marca em movimento.
  </p>

  <div class="card-meta-bottom">
    <span><strong>Texto</strong> · Pelimotion</span>
    <span><strong>Leitura</strong> · 5 min</span>
  </div>
</article>
```

---

## PROMPT COMPLETO PARA O ANTIGRAVITY

```
Adapte o blog existente em /blog para o novo layout inspirado no FYRRE Magazine.
NÃO mexa em nenhuma parte do site fora de /blog e /en/blog.
NÃO altere lógica de posts existente — apenas substitua o componente visual.

STACK: [usar a mesma stack atual detectada na leitura do projeto]

=== 1. INSTALAR FONTES (Google Fonts) ===

No <head> de todas as páginas de /blog:

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@900&family=DM+Mono:ital,wght@0,400;0,500;1,400&family=Playfair+Display:ital,wght@0,700;1,400&display=swap" rel="stylesheet">

=== 2. VARIÁVEIS CSS GLOBAIS DE /blog ===

Criar arquivo /blog/styles/tokens.css:

:root {
  --bg-primary:    #0a0a0a;
  --bg-secondary:  #111111;
  --bg-tertiary:   #1a1a1a;
  --text-primary:  #f0ede8;
  --text-secondary:#666666;
  --accent:        #f0ede8;
  --accent-warm:   #e8d5a3;
  --border:        #1e1e1e;

  --font-display:   'Barlow Condensed', sans-serif;
  --font-editorial: 'Playfair Display', serif;
  --font-mono:      'DM Mono', monospace;

  --wordmark-size:  clamp(72px, 18vw, 180px);
  --card-title:     clamp(16px, 2vw, 22px);
  --meta-size:      11px;
  --body-size:      14px;

  --max-width: 1400px;
  --gutter:    40px;
}

=== 3. COMPONENTE HEADER DO BLOG ===

Layout: logo esquerda + nav direita, tudo em DM Mono.
Sticky com blur no scroll.
Separado completamente do header do site principal.

HTML:
<header class="blog-header">
  <div class="blog-logo">
    PELIMOTION <span class="blog-logo-sub">JOURNAL</span>
  </div>
  <nav class="blog-nav">
    <a href="/blog">Blog</a>
    <a href="/en/blog">EN</a>
    <a href="/">Portfólio</a>
    <a href="/blog/sobre">Sobre</a>
  </nav>
</header>

CSS do .blog-logo-sub:
  font-size: 9px;
  letter-spacing: 0.2em;
  color: var(--text-secondary);
  vertical-align: middle;
  margin-left: 8px;

=== 4. WORDMARK GIGANTE ===

Entre o header e o filtro de categorias:

<div class="blog-wordmark">JOURNAL</div>

CSS:
  font-family: var(--font-display);
  font-size: var(--wordmark-size);
  font-weight: 900;
  line-height: 0.85;
  letter-spacing: -0.03em;
  color: var(--text-primary);
  text-transform: uppercase;
  padding: 40px var(--gutter) 0;

=== 5. BARRA DE FILTRO DE CATEGORIAS ===

<div class="blog-filter-bar">
  <span class="filter-label">CATEGORIAS</span>
  <div class="filter-pills">
    <button class="pill active" data-filter="all">Todos</button>
    <button class="pill" data-filter="tecnica">Técnica</button>
    <button class="pill" data-filter="processo">Processo</button>
    <button class="pill" data-filter="negocio">Negócio</button>
    <button class="pill" data-filter="ia">IA & Processo</button>
    <button class="pill" data-filter="psicologia">Psicologia</button>
    <button class="pill" data-filter="branding">Branding</button>
  </div>
</div>

JavaScript de filtro (sem reload):
document.querySelectorAll('.pill').forEach(pill => {
  pill.addEventListener('click', () => {
    const filter = pill.dataset.filter;
    document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    document.querySelectorAll('.post-card').forEach(card => {
      if (filter === 'all' || card.dataset.category === filter) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

=== 6. GRID DE POSTS ===

Estrutura exata:
- Grid 3 colunas, sem gap (as bordas dos cards criam a separação visual)
- border-left e border-top no container, border-right e border-bottom em cada card
- Padding interno de cada card: 16px
- Hover: background: var(--bg-secondary)

HTML do grid:
<main class="posts-grid">
  <!-- cards gerados dinamicamente para cada post -->
</main>

Para cada post, o card HTML é:
<article class="post-card" data-category="[category-slug]">
  <div class="card-meta-top">
    <time class="card-date" datetime="[ISO-date]">[data pt-BR formatada]</time>
    <span class="card-category-pill">[Categoria]</span>
  </div>
  <div class="card-image-wrapper">
    <img class="card-image" src="[thumbImage]" alt="[alt]" loading="lazy">
  </div>
  <h2 class="card-title"><a href="/blog/[slug]">[title]</a></h2>
  <p class="card-excerpt">[excerpt ou primeiros 120 chars do conteúdo]</p>
  <div class="card-meta-bottom">
    <span><strong>Texto</strong> · Pelimotion</span>
    <span><strong>Leitura</strong> · [X] min</span>
  </div>
</article>

=== 7. FORMATAÇÃO DE DATA — CORRIGIR O BUG ATUAL ===

O post atual exibe timestamp raw. Corrigir em TODOS os lugares:

// Função utilitária — criar em /blog/utils/formatDate.js
export function formatDate(dateStr, lang = 'pt') {
  const date = new Date(dateStr);
  if (lang === 'en') {
    return date.toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    }); // "May 16, 2026"
  }
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric', month: 'short', year: 'numeric'
  }); // "16 mai. 2026"
}

// Usar em todos os cards e posts individuais — nunca .toString() diretamente

=== 8. CÁLCULO DE TEMPO DE LEITURA ===

// /blog/utils/readingTime.js
export function readingTime(content) {
  const words = content.trim().split(/\s+/).length;
  const mins = Math.ceil(words / 200);
  return mins;
}

=== 9. RESPONSIVIDADE ===

/* Mobile (< 768px): 1 coluna */
@media (max-width: 767px) {
  .blog-wordmark { padding: 24px 20px 0; }
  .blog-filter-bar { padding: 16px 20px; flex-direction: column; gap: 12px; }
  .filter-pills { flex-wrap: wrap; gap: 6px; }
  .posts-grid { grid-template-columns: 1fr; }
  .post-card { padding: 20px; }
  :root { --gutter: 20px; }
}

/* Tablet (768px – 1023px): 2 colunas */
@media (min-width: 768px) and (max-width: 1023px) {
  .posts-grid { grid-template-columns: repeat(2, 1fr); }
}

/* Desktop (≥ 1024px): 3 colunas */
@media (min-width: 1024px) {
  .posts-grid { grid-template-columns: repeat(3, 1fr); }
}

=== 10. APLICAR NO POST ATUAL EXISTENTE ===

O primeiro post "Diferença prática entre motion design..." já existe.
Garantir que seu frontmatter tenha:
  - thumbImage: /blog/assets/diferenca-motion-design/thumb.webp
  - category: tecnica
  - date: 2026-05-16  (formato ISO, não Date object)

Se não tiver imagem ainda, gerar com Nano Banana usando o prompt:
"Cinematic dark studio scene, motion design workstation with multiple
screens showing abstract animation frames, professional lighting,
shallow depth of field, photorealistic, no text overlay"

=== 11. MICRO-INTERAÇÕES (CSS only) ===

/* Hover na imagem do card */
.card-image-wrapper { overflow: hidden; }
.card-image { transition: transform 400ms cubic-bezier(0.16, 1, 0.3, 1); }
.post-card:hover .card-image { transform: scale(1.04); }

/* Hover no título */
.card-title a { color: var(--text-primary); text-decoration: none; transition: color 200ms ease; }
.post-card:hover .card-title a { color: var(--accent-warm); }

/* Pill ativo */
.pill { transition: all 150ms ease; cursor: pointer; }

/* prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .card-image, .pill, .card-title a { transition: none; }
}

=== 12. VERIFICAÇÃO FINAL ANTES DO COMMIT ===

Após implementar, verificar:
□ Wordmark "JOURNAL" ocupa quase 1/4 da altura da viewport
□ Grid tem bordas visíveis entre cards (não gap/espaço — linha fina)
□ Data do primeiro post exibe "16 mai. 2026" e não o timestamp raw
□ Filtro "Todos" está ativo por padrão (pill com fundo branco)
□ Card hover: imagem cresce levemente + título muda de cor
□ Em mobile (375px): 1 coluna, wordmark menor, pills em wrap
□ Fontes carregadas corretamente (verificar Network tab)
□ Lighthouse Performance: manter ≥ 90 (as fontes têm display=swap)
□ NÃO há nenhum arquivo alterado fora de /blog
```

---

## DIFERENÇAS ESTRATÉGICAS: FYRRE vs PELIMOTION

| Decisão | FYRRE | Pelimotion (adaptação) | Motivo |
|---------|-------|------------------------|--------|
| Tema | Branco/preto | Preto/branco (dark) | Identidade de motion studio, público criativo |
| Wordmark | "MAGAZINE" | "JOURNAL" | Posiciona como publicação séria, não blog |
| Fonte display | Grotesca black | Barlow Condensed 900 | Impacto visual igual, licença grátis |
| Fonte títulos | Grotesca também | Playfair Display | Diferenciação editorial vs. tech |
| Meta autoria | "Text: Jakob" | "Texto: Pelimotion" | Sem nome pessoal exposto por ora |
| Categorias | Art · Street Art | Técnica · Processo · IA | Vocabulário do nicho B2B correto |
| EN | Não tem | /en/blog separado | Estratégia global do plano anterior |

---

*Plano gerado para pelimotion.art/blog*
*Referência visual: FYRRE Magazine (gola.io/FYRRE)*
