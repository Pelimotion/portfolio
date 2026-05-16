# PELIMOTION BLOG — PLANO DE IMPLEMENTAÇÃO DE DESIGN
## Para o Antigravity | Alta Credibilidade B2B + Motion Studio

---

## DIAGNÓSTICO DO ESTADO ATUAL

O print mostra o blog funcionando, mas operando num nível de acabamento
equivalente a um boilerplate. O que falta:

- Layout tem zero personalidade de marca
- Tipografia genérica, sem hierarquia editorial
- Data exibida em formato Unix bruto (timestamp não formatado)
- Nenhum sinal de confiança/credibilidade B2B visível
- Ausência de categoria visual, tempo de leitura, tags
- Hero sem imagem — o conteúdo não respira
- Não transmite que o autor é especialista; parece blog de template

O plano abaixo corrige isso de forma sistêmica, com base no que os
melhores blogs de branding/design do mundo fazem hoje.

---

## REFERÊNCIAS DE MERCADO ADOTADAS

| Referência | O que aprender |
|-----------|---------------|
| The Brand Identity | Editorial denso, tipografia com caráter, grids assimétricos |
| It's Nice That | Hierarquia de conteúdo clara, thumbnails com personalidade |
| Sköna Agency Blog | Confiança B2B, estrutura de processo, brand clarity |
| Blind.com Blog | Mistura editorial + case study, dark theme funcional |
| Refokus / Clay | Design-forward com performance, Webflow-quality sem Webflow |
| Creative Review | Profundidade crítica, tom de voz sofisticado |

---

## DECISÃO ESTÉTICA CENTRAL

**Direção:** Editorial escura de alto contraste com sotaque tipográfico

**Conceito:** Publicação especializada de um estúdio que *sabe o que faz*
e não precisa gritar para provar. O blog deve sentir como uma revista de
nicho de design — não como um blog corporativo genérico.

**Paleta:**
```
--bg-primary:    #0a0a0a  (quase preto, não preto puro — evita cansaço visual)
--bg-secondary:  #111111  (cards, blocos de destaque)
--bg-tertiary:   #1a1a1a  (hover states, code blocks)
--text-primary:  #f0ede8  (branco-quente, mais confortável que #ffffff puro)
--text-secondary:#9a9690  (metadados, datas, categorias)
--accent:        #e8d5a3  (dourado-areia — único acento quente, links, tags ativas)
--accent-2:      #4a9eff  (azul elétrico — só para links externos, CTAs secundários)
--border:        #222222  (separadores sutis)
```

**Tipografia (duas fontes, máximo):**
```
Display/Headline: "Playfair Display" (Google Fonts, grátis)
  — Serifa editorial com alto contraste, caráter, sophistication
  — Usar em H1, H2, pull quotes, nome do blog no header

Body/UI: "DM Mono" ou "IBM Plex Sans"
  — Clean, ligeiramente técnica, diferente de Inter/Roboto
  — Usar em corpo de texto, metadados, navegação, tags

Alternativa premium (se quiser comprar): "Editorial New" + "Suisse Int'l"
```

---

## ARQUITETURA DE PÁGINAS (completa)

```
/blog
  ├── index (listagem de posts PT)
  ├── [slug] (post individual)
  ├── categoria/[categoria]
  ├── tag/[tag]
  └── sobre (sobre o autor/estúdio — crucial para E-E-A-T)

/en/blog
  ├── index (listagem EN)
  ├── [slug]
  └── about
```

---

## FASE 1 — ESTRUTURA BASE DO BLOG

### Prompt para o Antigravity:

```
Implemente a estrutura base do blog em /blog com as seguintes specs.
NÃO altere nenhum arquivo fora de /blog e /en/blog.

LAYOUT GERAL:
- Max-width do conteúdo: 1200px centrado
- Grid: 12 colunas, gap 24px
- Sem sidebar — foco total no conteúdo (referência: The Brand Identity)
- Header do blog completamente separado do header do site principal

HEADER DO BLOG:
- Logo/nome "Pelimotion" em Playfair Display 18px, peso 700
- Tag "Journal" ou "Studio Notes" em DM Mono 11px, tracking 0.15em,
  cor --text-secondary, ao lado do logo
- Navegação mínima: Blog | EN | Contato
- Linha separadora fina (1px, --border) abaixo do header
- Sticky no scroll com background --bg-primary + blur(12px) no scroll

FOOTER DO BLOG:
- Texto simples: "© Pelimotion Studio" + links de idioma PT/EN
- Nenhum elemento compartilhado com o footer do site principal
```

---

## FASE 2 — PÁGINA DE LISTAGEM (index do blog)

### Prompt para o Antigravity:

```
Implemente a página de índice do blog em /blog com este layout exato.

HERO DA LISTAGEM:
- Post mais recente em destaque (featured post)
- Ocupa 100% da largura com imagem de fundo (heroImage do frontmatter)
- Overlay gradient: linear de transparent 40% para --bg-primary 100%
- Sobre o overlay: categoria em tag, H1 com tipografia Playfair Display
  clamp(32px, 5vw, 56px), metadados em linha (data formatada + tempo leitura)
- CTA "Ler artigo →" em DM Mono

GRID DE POSTS ABAIXO DO HERO:
- Grid de 3 colunas em desktop, 2 em tablet, 1 em mobile
- Cada card:
  ├── Thumbnail (16:9, object-fit: cover, border-radius: 2px)
  ├── Tag de categoria (ex: TÉCNICA) em DM Mono 10px, --accent, tracking 0.2em
  ├── Título em Playfair Display 20px, 2 linhas max com -webkit-line-clamp
  ├── Excerpt 2 linhas, --text-secondary, DM Mono 13px
  └── Metadados: data formatada (ex: "16 mai. 2026") + "5 min de leitura"
- Card sem border-radius exagerado — máx 2px (editorial, não app)
- Hover: imagem com scale(1.03) transition 400ms ease, título muda para --accent

FILTRO DE CATEGORIAS:
- Linha de pills horizontais acima do grid:
  Todos | Técnica | Processo | Negócio | IA & Processo | Psicologia | Branding
- Pill ativo: background --accent, texto --bg-primary
- Pill inativo: border 1px --border, texto --text-secondary
- Filtro funciona com JavaScript puro (sem reload de página)

FORMATAÇÃO DE DATA:
- NUNCA exibir timestamp raw ou formato americano no blog PT
- Usar Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })
- Exemplo correto: "16 mai. 2026"
- Para versão EN: Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
```

---

## FASE 3 — PÁGINA DE POST INDIVIDUAL

### Prompt para o Antigravity:

```
Implemente o template de post individual com estas specs precisas.
Este é o componente mais importante para credibilidade B2B.

HERO DO POST:
- Imagem hero full-width, height 60vh, object-fit: cover
- Overlay gradient forte para legibilidade do texto
- Breadcrumb: Blog → [Categoria] em DM Mono 11px, --text-secondary
- Tag de categoria com pill estilizado
- H1 em Playfair Display, clamp(36px, 5vw, 64px), --text-primary
- Linha de metadados:
  [data formatada] · [tempo de leitura calculado] · [idioma: PT/EN]

CORPO DO ARTIGO:
- Max-width do texto: 680px centrado (leitura confortável)
- Corpo em IBM Plex Sans 17px, line-height 1.75, --text-primary
- H2 em Playfair Display 28px, margin-top 2.5rem
- H3 em DM Mono 14px uppercase tracking 0.1em, --accent
- Parágrafos: margin-bottom 1.5rem
- Links internos: --accent, underline offset 3px, sem underline por padrão,
  underline aparece no hover
- Links externos: --accent-2, adicionar ícone ↗ após o link

ELEMENTOS ESPECIAIS DENTRO DO POST:
├── Pull quote: texto centralizado em Playfair Display italic 24px,
│   border-left 3px --accent, padding-left 1.5rem, --text-secondary
├── Image caption: DM Mono 12px, --text-secondary, text-align center, italic
├── Code block: background --bg-tertiary, DM Mono 13px, padding 1rem,
│   border-radius 2px, overflow-x auto
└── FAQ block: acordeão com animação suave, título em DM Mono, corpo em corpo normal

SIDEBAR FLUTUANTE (desktop only, sticky):
Aparece ao lado direito do texto a partir de 1200px de largura de tela.
Contém:
- "Sobre o autor" com foto (se disponível) e 2 linhas de bio
- "Neste artigo" — índice de H2s com scroll spy (link ativo muda para --accent)
- Linha separadora
- 3 posts relacionados (thumb pequena + título, sem excerpt)
Esta sidebar é um dos maiores sinais de credibilidade editorial B2B.

TEMPO DE LEITURA:
Calcular automaticamente: Math.ceil(wordCount / 200) + " min de leitura"
Exibir no hero do post E na listagem de cards.

BARRA DE PROGRESSO DE LEITURA:
Linha de 2px na parte superior da página (position: fixed, top: 0)
que avança de 0 a 100% conforme o usuário scrolla o artigo.
Cor: --accent
```

---

## FASE 4 — SINAIS DE CONFIANÇA B2B (Trust Signals)

Esta fase é estrategicamente a mais importante para o mercado B2B.
Pesquisa indica que 94% das primeiras impressões B2B vêm do design,
e compradores B2B são 2x mais propensos a escolher marcas com
conexão pessoal clara e sinais de expertise visíveis.

### Prompt para o Antigravity:

```
Implemente os seguintes trust signals no blog.
NÃO altere nada fora de /blog.

1. PÁGINA "SOBRE O ESTÚDIO" (/blog/sobre e /en/blog/about)
   - Foto ou visual de estúdio (se não tiver, imagem gerada com Nano Banana)
   - Parágrafo de posicionamento: quem somos, o que fazemos, para quem
   - "Por que este blog existe" — manifesto em 3-4 linhas
   - Especialidades listadas (não como lista bullet, mas como parágrafo fluído)
   - Link para o portfólio principal
   Esta página é exigida pelo Google para E-E-A-T (Experience, Expertise,
   Authoritativeness, Trustworthiness).

2. AUTHOR BIO NO RODAPÉ DE CADA POST
   Layout:
   ├── Divider line
   ├── "Escrito por" em DM Mono 11px uppercase
   ├── Nome + bio 2 linhas (não inventar — usar texto fornecido)
   ├── Links: LinkedIn, Instagram, Portfólio
   └── "Ver todos os artigos →"

3. BARRA DE "NESTE ARTIGO" (Table of Contents)
   - Gerada automaticamente a partir dos H2s do post
   - Sidebar sticky no desktop (ver Fase 3)
   - No mobile: bloco colapsável abaixo do hero do post

4. SCHEMA MARKUP JSON-LD (em cada post):
   Implementar automaticamente:
   - BlogPosting com: headline, datePublished, dateModified,
     author (name, url), publisher (name, logo), image, url
   - FAQPage (se o post tiver bloco FAQ)
   - BreadcrumbList

5. OPEN GRAPH + TWITTER CARD DINÂMICOS:
   - og:title = post title
   - og:description = metaDescription do frontmatter
   - og:image = heroImage do post (1200×630)
   - og:type = article
   - article:published_time, article:author, article:section

6. "VOCÊ PODE GOSTAR" — POSTS RELACIONADOS
   Bloco de 3 posts ao final de cada artigo:
   - Baseado em categoria + tags do frontmatter
   - Grid horizontal de 3 cards compactos
   - Título: "Continue lendo" (PT) / "Keep reading" (EN)
   - Não usar algoritmo — lógica simples de mesma categoria

7. CTA CONTEXTUAL NO FINAL DO POST:
   Box com background --bg-secondary, border-left 3px --accent:
   - Título: "Trabalhamos com marcas que levam o movimento a sério."
   - Subtexto: "Portfólio completo e formas de contato."
   - Botão: "Ver portfólio →" linkando para a raiz do site (não /blog)
```

---

## FASE 5 — MICRO-INTERAÇÕES E MOTION DO PRÓPRIO BLOG

O blog de um estúdio de motion que não tem nenhuma animação é
uma contradição de marca. As animações devem ser sutis e funcionais,
nunca decorativas demais.

### Prompt para o Antigravity:

```
Implemente as micro-interações do blog.
Usar CSS puro onde possível. Nada de bibliotecas de animação externas.
Respeitar prefers-reduced-motion — todas as animações desativam se o
usuário configurou redução de movimento no SO.

1. PAGE LOAD — ENTRADA STAGGERED
   Elementos do hero do post/listagem entram com:
   - opacity: 0 → 1 e translateY(16px) → translateY(0)
   - Duration: 600ms, ease: cubic-bezier(0.16, 1, 0.3, 1)
   - Stagger: categoria → H1 → metadados → imagem (50ms entre cada)

2. HOVER EM CARDS DE LISTAGEM
   - Thumbnail: transform scale(1.03), overflow hidden no container
   - Título: color transition para --accent
   - Flecha "→" que aparece após o título com translateX(-4px) → translateX(0)
   - Tudo em 250ms ease

3. LINKS NO CORPO DO TEXTO
   - Underline que "cresce" da esquerda: width 0 → 100% no hover
   - Usar CSS custom underline com background-size trick
   - Duration: 200ms ease

4. BARRA DE PROGRESSO DE LEITURA
   - Atualiza no scroll com requestAnimationFrame (não no evento scroll direto)
   - Transition: width 100ms linear para suavizar micro-saltos

5. SMOOTH SCROLL
   - Ao clicar nos links do Table of Contents: scroll-behavior: smooth
   - Offset de 80px para compensar o header sticky

6. IMAGENS — LAZY LOAD COM BLUR-UP
   - Thumbnail em base64 de baixa qualidade mostrada primeiro (blur)
   - Imagem real carrega com opacity 0 → 1 quando entra no viewport
   - Usar IntersectionObserver nativo

@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
  .progress-bar { display: none; }
}
```

---

## FASE 6 — VERSÃO MOBILE

### Prompt para o Antigravity:

```
Implemente a versão mobile do blog.
Mobile-first: escrever o CSS base para mobile, depois adicionar
breakpoints para desktop.

BREAKPOINTS:
- Mobile: < 768px
- Tablet: 768px – 1024px
- Desktop: > 1024px

MOBILE ESPECÍFICO:
- Header: logo + hamburger menu (menu abre overlay full-screen)
- Listagem: 1 coluna, cards empilhados
- Featured post: hero com texto menor, sem gradiente excessivo
- Post individual: sem sidebar, Table of Contents como bloco colapsável
  abaixo do hero (acordeão com título "Neste artigo ▾")
- Tamanho de fonte H1 no mobile: clamp(28px, 8vw, 40px)
- Corpo: 16px, line-height 1.7
- Imagens: 100% largura, sem margens laterais
- CTA final: botão full-width
- Progress bar: manter (linha de 2px no topo)
- Filtro de categorias: scroll horizontal com -webkit-overflow-scrolling: touch
```

---

## FASE 7 — PÁGINA DE ERRO E LOADING

```
Implemente:

1. Página 404 em /blog
   - Mensagem: "Este artigo se perdeu no pipeline."
   - Subtexto sugestivo sobre o fluxo de produção
   - Links para: Início do blog, 3 posts recentes, Portfólio
   - Nenhuma imagem de erro genérica — só tipografia e espaço

2. Skeleton Loading para os cards
   - Placeholders com background --bg-secondary e animação pulse
   - Aparece enquanto os posts carregam
   - Remove-se com fade out quando o conteúdo chega

3. Offline page (se usar Service Worker):
   - Mensagem: "Sem conexão. Mas você pode reler os últimos artigos."
```

---

## CHECKLIST DE CREDIBILIDADE B2B — VERIFICAR ANTES DO LAUNCH

Antes de publicar qualquer post, o blog precisa ter:

### Design & UX
- [ ] Tipografia com hierarquia clara e consistente em todas as páginas
- [ ] Data formatada corretamente (nunca raw timestamp)
- [ ] Tempo de leitura visível em cards E dentro do post
- [ ] Imagens com alt text SEO em todas as imagens
- [ ] Progress bar de leitura funcionando
- [ ] Mobile responsivo verificado em 375px, 390px e 768px
- [ ] Hover states funcionando em todos os elementos interativos
- [ ] Contrast ratio AA em todo o texto (mín. 4.5:1)
- [ ] prefers-reduced-motion respeitado

### Conteúdo & Estrutura
- [ ] Página /blog/sobre criada e publicada
- [ ] Author bio no rodapé de cada post
- [ ] Table of Contents funcionando
- [ ] Posts relacionados no final de cada artigo
- [ ] CTA para portfólio no final de cada post
- [ ] FAQ block com Schema FAQPage em posts que têm FAQ

### SEO Técnico
- [ ] Schema BlogPosting em todos os posts
- [ ] Open Graph tags dinâmicas funcionando (testar no Facebook Debugger)
- [ ] Twitter Card funcionando (testar no Twitter Card Validator)
- [ ] sitemap.xml atualizado com URLs do /blog
- [ ] hreflang nos posts com versão EN
- [ ] Canonical tags em todos os posts
- [ ] Lighthouse SEO: 100 | Performance: 90+ | Acessibilidade: 95+

---

## INSIGHTS ESTRATÉGICOS

**Por que editorial e não blog corporativo?**
A pesquisa indica que compradores B2B avaliam a marca antes da primeira ligação de vendas — uma identidade fraca ou genérica não só parece ruim, ela encolhe o pipeline. Para um estúdio de motion, o blog *é* o portfólio de pensamento. Se o design do blog não comunica o nível do estúdio, a mensagem implícita é que o estúdio também não entrega no nível que cobra.

**Por que dark theme funcional e não só estético?**
Dark mode em 2025 vai além de uma tendência de design — é uma escolha funcional capaz de melhorar a experiência em diferentes dispositivos. Para um público de profissionais criativos que passa longas horas na tela, o dark theme bem executado (não preto puro — tons de cinza escuro como #0a0a0a e #111111) é uma decisão de cuidado com o leitor.

**Por que motion nas micro-interações do blog é obrigatório?**
Motion evoca sentimentos: uma animação bem cronometrada pode encantar usuários, criar antecipação ou instaurar confiança. Um estúdio de motion com um blog estático é uma contradição de posicionamento. As micro-interações não precisam ser espetaculares — precisam ser *corretas*.

**Por que sinais de confiança são mais urgentes que mais conteúdo?**
Prova social é fundamental para reforçar a confiança. Exibir depoimentos de clientes, cases e avaliações oferece evidência tangível de competência e sucesso. Nos primeiros 10 posts, é mais estratégico ter 5 posts excelentes com autor identificado, bio, Table of Contents e CTA bem posicionado do que 15 posts num blog que parece abandonado.

**Por que serifa editorial em blog de motion e não sans-serif tech?**
A tipografia certa não apenas transporta palavras — ela define o registro emocional, estabelece a hierarquia e faz metade do trabalho criativo antes do leitor processar uma única frase. Sans-serif técnica (Inter, Roboto, DM Sans) posiciona como software. Serifa editorial (Playfair Display, Editorial New) posiciona como *autor*. Para um hub que quer ser referência de pensamento sobre motion, ser *autor* é o posicionamento certo.

---

*Plano gerado para pelimotion.art/blog*
*Referências: The Brand Identity, It's Nice That, Blend B2B, Everything Design, Powered by Search*
