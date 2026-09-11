# PELIMOTION STUDIO — AUDITORIA TÉCNICA & ROADMAP
**Versão do Documento:** 1.0  
**Data:** Maio 2026  
**Status:** Blueprint Executivo — Não Destrutivo, Faseado

---

## PARTE 1 — DIAGNÓSTICO: O QUE ESTÁ QUEBRADO E POR QUÊ

### 1.1 BUGS CRÍTICOS (P0 — Quebra de Funcionalidade)

---

#### BUG-01 | `savePost()` envia estrutura errada para o banco
**Arquivo:** `cms_source.html`, linha ~551  
**Problema:** O payload enviado ao `POST /api/blog/posts` está aninhado como `{ data: { title, slug, images, ... }, content }`. Porém o schema do Supabase espera campos flat como `title`, `slug`, `meta_description`, `content` diretamente na raiz da tabela `blog_posts`. Resultado: os dados chegam na coluna JSONB `data` mas nunca nos campos indexados. As queries de build (`select=*&status=eq.published`) nunca encontram os posts certos.

**Correção:**
```js
// ERRADO (atual)
const payload = { data: { title, slug, ... }, content };

// CORRETO
const payload = {
  title: v('f-title'),
  slug: v('f-slug'),
  status: v('f-status'),
  category: v('f-category'),
  meta_description: v('f-metaDescription'),
  content: v('f-content'),
  data: {
    images: currentPost.data.images,
    keywords: v('f-keyword').split(',').map(k => k.trim()),
    date: v('f-date')
  }
};
```

---

#### BUG-02 | Build Engine: `metaTitle` nunca existe no objeto
**Arquivo:** `build_engine_source.js`, linha 157  
**Problema:** O template HTML usa `post.data.metaTitle` na tag `<title>`, mas esse campo não existe nem no schema do Supabase (`TECHNICAL_SPECS.md`) nem no `savePost()` do CMS. Resultado: todas as páginas geradas têm `<title>undefined</title>`.

**Correção no Build Engine:**
```js
const metaTitle = post.data.metaTitle || `${post.data.title} | Pelimotion`;
```
**Correção no CMS:** adicionar campo `metaTitle` (separado do `title`) na seção Strategy.

---

#### BUG-03 | Imagens não são inseridas no artigo — Regex frágil
**Arquivo:** `build_engine_source.js`, linhas 135–139  
**Problema:** O sistema tenta substituir `[hero]` ou `hero.jpg` no Markdown pelo URL da CDN. Mas a IA que gera o conteúdo (Stage 3) nunca instrui a incluir esses placeholders no texto. O conteúdo chega do `aiStep3()` limpo, sem nenhum `[slot-id]`. Logo, nenhuma imagem é injetada. Confirmado pelo relato do "Manual de Marca Morto" sem imagens.

**Causa raiz dupla:**
1. O `aiStep3()` não recebe instruções sobre onde inserir imagens
2. O `aiStep2()` não gera H2s com marcadores de imagem

**Solução:** O prompt de escrita deve incluir instrução explícita do tipo: *"Após o segundo H2, insira a linha exata `[img-1]`. Após o quarto H2, insira `[img-2]`."* — e o número/posição vem das configurações do artigo.

---

#### BUG-04 | Presets completamente desconectados da geração de IA
**Arquivo:** `cms_source.html`, funções `aiStep1/2/3`  
**Problema:** O Stage 5 (Presets) tem uma UI e uma API (`/api/blog/guidelines`), mas as funções de geração nunca chamam `loadPresets()` e nunca injetam as guidelines nos prompts. A sessão de configuração foi construída mas é ornamental — os prompts enviados à Gemini são hardcoded e genéricos ("Gere estratégia JSON para X").

**Impacto:** Todo o texto gerado ignora tom de voz, persona, estilo editorial e restrições de marca.

---

#### BUG-05 | Build Engine sem tratamento de erro — Falha silenciosa
**Arquivo:** `build_engine_source.js`, função `build()`  
**Problema:** O fetch ao Supabase usa `https.get()` nativo sem timeout, sem `catch`, e com `JSON.parse(body || '[]')` que silencia erros de rede ou de auth. Se o Supabase retornar 401 ou 500, o build continua e publica zero posts sem nenhum aviso.

**Correção:**
```js
// Usar o Supabase JS client no build, ou ao menos:
res.on('end', () => {
  try {
    const parsed = JSON.parse(body);
    if (!Array.isArray(parsed)) throw new Error(JSON.stringify(parsed));
    resolve(parsed);
  } catch(e) {
    console.error('Supabase fetch error:', e.message);
    resolve([]); // falhar graciosamente, mas logando
  }
});
```

---

#### BUG-06 | `deployToVercel()` tem URL de webhook hardcoded/placeholder
**Arquivo:** `cms_source.html`, linha 574  
**Problema:** A função de deploy tem uma URL `prj_CgWz.../3Zz3z3z3z3` que é claramente um placeholder. Além disso, o botão "PUBLICAR NO SITE" não salva o artigo antes de disparar o deploy — uma race condition onde você pode publicar um build sem o último save.

**Solução:** O deploy deve (1) chamar `savePost()` e aguardar a Promise, (2) só então disparar o webhook via POST (não fetch sem await), (3) o URL do webhook deve vir de uma variável de ambiente injetada pelo servidor.

---

### 1.2 PROBLEMAS ESTRUTURAIS (P1 — Degradação de Qualidade)

| ID | Local | Problema | Impacto |
|----|-------|----------|---------|
| S-01 | Build Engine | Nenhuma meta tag OG/Twitter gerada | Compartilhamentos sem preview |
| S-02 | Build Engine | Nenhum `<schema.org>` JSON-LD | Sem rich results no Google |
| S-03 | Build Engine | Nenhum sitemap.xml gerado | Indexação lenta |
| S-04 | Build Engine | Google Fonts carregada por página sem `font-display:swap` | CLS / LCP degradado |
| S-05 | CMS | Auth por PIN sem session — perde ao recarregar | UX ruim, segurança zero |
| S-06 | CMS | `aiStep3()` escreve seção por seção em loop serial | Lento demais, sem feedback progressivo |
| S-07 | CMS | Galeria de imagens sem filtro por artigo | Confusão entre assets de posts diferentes |
| S-08 | Schema | Campo `data.date` no JSONB em vez de coluna `published_at` | Dificulta queries de ordenação e filtro |
| S-09 | CMS | Nenhum auto-save ou draft recovery | Perda de trabalho ao fechar aba |
| S-10 | Build | Artigos sem paginação no index | Performance e UX ruins com muitos posts |

---

## PARTE 2 — ARQUITETURA REVISADA

### 2.1 Modelo de Dados Expandido

O problema central é que o banco atual mistura campos estruturados com um blob JSONB não organizado. A reestruturação deve acontecer sem destruir os dados existentes (via migrations aditivas).

```sql
-- TABELA PRINCIPAL (mantém existente, adiciona colunas)
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS lang TEXT DEFAULT 'pt';
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS reading_time_min INT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS word_count INT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS generation_preset_id UUID;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;

-- NOVA TABELA: Imagens (relação many-to-many com posts)
CREATE TABLE IF NOT EXISTS blog_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,                    -- nome/id da imagem
  url TEXT NOT NULL,                     -- URL CDN absoluta
  prompt TEXT,                           -- prompt Imagen usado
  alt_text TEXT,                         -- acessibilidade + SEO
  width INT, height INT,
  file_size_kb INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pivot: imagens pertencem a posts com posição e papel
CREATE TABLE IF NOT EXISTS post_images (
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  image_id UUID REFERENCES blog_images(id) ON DELETE SET NULL,
  role TEXT DEFAULT 'body',              -- 'hero' | 'thumb' | 'body'
  position INT DEFAULT 0,               -- ordem no artigo (0=hero)
  placeholder_id TEXT,                  -- o [img-1] que aparece no MD
  PRIMARY KEY (post_id, image_id)
);

-- NOVA TABELA: Presets / Brand Library
CREATE TABLE IF NOT EXISTS content_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  scope TEXT NOT NULL,                   -- 'global' | 'category' | 'post'
  scope_value TEXT,                      -- categoria ou slug do post
  section TEXT NOT NULL,                 -- 'strategy' | 'outline' | 'writing' | 'image' | 'seo'
  prompt_template TEXT NOT NULL,         -- template com {{variáveis}}
  tone_voice TEXT,                       -- 'editorial' | 'técnico' | 'conversacional'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOVA TABELA: Topics / Trend Intelligence
CREATE TABLE IF NOT EXISTS topic_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  subtopics TEXT[],                      -- array de subtemas
  hype_score INT DEFAULT 0,              -- 0-100, atualizado pelo cron
  platforms TEXT[],                      -- ['youtube','instagram','google']
  trend_data JSONB,                      -- snapshot dos dados de trend
  last_fetched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOVA TABELA: Fila de geração automática
CREATE TABLE IF NOT EXISTS generation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES topic_library(id),
  preset_id UUID REFERENCES content_presets(id),
  status TEXT DEFAULT 'pending',         -- 'pending' | 'running' | 'done' | 'failed' | 'review'
  output_post_id UUID REFERENCES blog_posts(id),
  scheduled_for TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_log TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 2.2 Sistema de Imagens — Fluxo Correto

```
┌─────────────────────────────────────────────────────────────────┐
│  STAGE 4: VISUAL ASSETS (CMS)                                   │
│                                                                 │
│  Slot Manager                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ [+] Adicionar Slot    Slots: [hero] [img-1] [img-2]      │   │
│  │                                                          │   │
│  │ ┌────────────────────────────────────────────────────┐   │   │
│  │ │ SLOT: hero          Posição: 0 (antes do texto)    │   │   │
│  │ │ Papel: ● Hero  ○ Thumb  ○ Corpo                    │   │   │
│  │ │                                                    │   │   │
│  │ │ [GERAR PROMPT IA]  [GERAR IMAGEM IA]               │   │   │
│  │ │ [USAR DA GALERIA]  [UPLOAD MANUAL]                 │   │   │
│  │ │                                                    │   │   │
│  │ │ Prompt: ___________________________________        │   │   │
│  │ │ [preview 16:9]                                     │   │   │
│  │ └────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [↑↓ Reordenar Slots]   Placeholder inserido no MD: [img-1]    │
└─────────────────────────────────────────────────────────────────┘
```

**Fluxo de dados de uma imagem:**

```
Imagem gerada no CMS
        │
        ▼
/api/blog/generate-image
(Imagen 3.0 → buffer base64)
        │
        ▼
/api/blog/upload-image
(base64 → Bunny.net)
Retorna: { url: "https://cdn.../blog/assets/slug/img-1.webp" }
        │
        ▼
INSERT INTO blog_images (slug, url, prompt, alt_text)
        │
        ▼
INSERT INTO post_images (post_id, image_id, role, position, placeholder_id)
        │
        ▼
No Markdown: texto contém [img-1], [img-2] nos lugares certos
        │
        ▼
Build Engine: lookup post_images por post_id + placeholder_id → substitui URL
```

**Separação galeria global vs. galeria do artigo:**
- `blog_images` = biblioteca global (todas as imagens, reutilizáveis)
- `post_images` = link de quais imagens pertencem a qual artigo, com papel e posição
- Na UI: aba "Do Artigo" + aba "Biblioteca Geral" na galeria modal

---

## PARTE 3 — SESSÃO DE CONFIGURAÇÕES: REDESIGN COMPLETO

### 3.1 Filosofia — O Que Grandes Plataformas Fazem

Plataformas como **HubSpot**, **Contentful** e **Webflow** tratam as configurações editoriais como uma **biblioteca de templates de comportamento**, não como um formulário de texto livre. O conceito que precisamos implementar é chamado de **Content Operating System (COS)**: cada peça de conteúdo é moldada por um conjunto de regras salvas, versionadas e reutilizáveis.

A sessão de configurações da Pelimotion deve funcionar como um **Prompt Compiler** — você define as regras uma vez, e o sistema compila o prompt final para cada etapa de geração automaticamente.

### 3.2 Estrutura da Biblioteca de Presets

```
CONTENT_PRESETS
│
├── GLOBAL (aplicado a todos os artigos)
│   ├── [writing] Tom de Voz Pelimotion
│   │   • Prompt: "Escreva como um especialista sênior em motion design e branding..."
│   │   • Tone: editorial
│   │   • Variáveis: {{title}}, {{audience}}, {{word_count_target}}
│   │
│   ├── [seo] Meta Template Global
│   │   • Prompt: "A meta description deve ter 140-160 chars, começar com verbo de ação..."
│   │
│   └── [image] Identidade Visual Global
│       • Prompt: "Estilo fotográfico: dark studio, cores #ff4b2b e #f0ede8..."
│
├── POR CATEGORIA
│   ├── Branding
│   │   ├── [strategy] Foco em cases + tendências de mercado
│   │   └── [image] Mockups de identidade, paletas de cor, tipografia
│   │
│   └── Motion Design
│       ├── [writing] Linguagem técnica mas acessível, incluir tutoriais
│       └── [image] Stills de animação, frames de timeline, renders 3D
│
└── POR ARTIGO (override por slug)
    └── [qualquer seção] Override específico para um artigo
```

### 3.3 Template de Prompt — Variáveis Dinâmicas

Cada preset usa sintaxe `{{variável}}` para injetar contexto no momento da geração:

```
Variáveis Disponíveis:
  {{title}}            — Título do artigo atual
  {{slug}}             — Slug do artigo
  {{category}}         — Categoria
  {{keyword}}          — Keyword principal
  {{keywords}}         — Lista de keywords
  {{outline}}          — Títulos H2/H3 do outline
  {{section_title}}    — Título da seção sendo escrita
  {{word_count}}       — Meta de palavras (do preset)
  {{audience}}         — Audiência-alvo (do preset global)
  {{brand_voice}}      — Tom definido no preset global
  {{previous_section}} — Último parágrafo escrito (contexto)
  {{image_slots}}      — Quantidade e nomes dos slots de imagem
  {{date}}             — Data de publicação
```

**Exemplo de preset compilado (Writing — Seção de Artigo):**

```
Você é o editor sênior da Pelimotion, uma plataforma editorial sobre motion design, 
branding e cultura visual. {{brand_voice}}

Escreva a seção "{{section_title}}" do artigo "{{title}}" (categoria: {{category}}).
Audiência: {{audience}}

REGRAS:
- Tom: especializado mas conversacional, nunca corporativo
- Tamanho: 300-400 palavras
- Estrutura: 1 parágrafo de abertura forte, 2-3 parágrafos de desenvolvimento, 
  1 parágrafo de conclusão com transição para a próxima seção
- Keywords a incluir naturalmente: {{keywords}}
- Se esta seção for "{{section_title}}", insira a linha exata [img-{{slot_index}}] 
  após o segundo parágrafo
- NÃO use bullet points em excesso. Prefira prosa densa.
- Termine sem "conclusão" — a voz deve continuar fluindo

Contexto anterior (última frase da seção anterior):
{{previous_section}}

Escreva apenas o conteúdo da seção, sem título.
```

### 3.4 Interface da Sessão de Configurações

```
┌─────────────────────────────────────────────────────────────────────┐
│  05 CONFIGURAÇÕES                                                    │
│                                                                     │
│  ┌─────────────────┐  ┌──────────────────────────────────────────┐  │
│  │ BIBLIOTECA       │  │ EDITOR DE PRESET                         │  │
│  │                 │  │                                          │  │
│  │ ▼ GLOBAL        │  │  Nome: ________________________          │  │
│  │   ● Tom de Voz  │  │  Escopo: [Global ▼]  Seção: [Writing ▼] │  │
│  │   ● SEO Base    │  │  Categoria: __________                   │  │
│  │   ● Visual ID   │  │                                          │  │
│  │                 │  │  Template de Prompt:                     │  │
│  │ ▶ BRANDING      │  │  ┌────────────────────────────────────┐  │  │
│  │ ▶ MOTION DESIGN │  │  │ Você é o editor da Pelimotion...   │  │  │
│  │ ▶ VAGAS         │  │  │ {{brand_voice}}                    │  │  │
│  │                 │  │  │                                    │  │  │
│  │ ▶ POR ARTIGO    │  │  └────────────────────────────────────┘  │  │
│  │                 │  │  [Inserir Variável ▼]                    │  │
│  │ [+ NOVO PRESET] │  │                                          │  │
│  │                 │  │  Configurações Extras:                   │  │
│  │                 │  │  Word Count Target: [___] palavras       │  │
│  │                 │  │  Audiência: ___________                  │  │
│  │                 │  │  Nº de Imagens: [___]                    │  │
│  │                 │  │                                          │  │
│  │                 │  │  [TESTAR PROMPT]  [SALVAR PRESET]        │  │
│  └─────────────────┘  └──────────────────────────────────────────┘  │
│                                                                     │
│  PRESET ATIVO NESTE ARTIGO:                                         │
│  Strategy: Global + Branding  Writing: Global + Motion Design       │
│  Image: Global                Override: [Nenhum]                    │
│  [ALTERAR PRESETS DESTE ARTIGO]                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.5 Configurações Salvas por Artigo

Cada artigo deve salvar qual conjunto de presets foi usado para gerá-lo:

```json
// Campo `data` no Supabase (JSONB)
{
  "generation_config": {
    "preset_ids": {
      "strategy": "uuid-global-strategy",
      "outline": "uuid-branding-outline",
      "writing": "uuid-global-writing",
      "image": "uuid-global-image",
      "seo": "uuid-global-seo"
    },
    "overrides": {
      "word_count": 1200,
      "image_slots": 3,
      "audience": "designers sênior e diretores de arte"
    },
    "generated_at": "2026-05-16T10:00:00Z",
    "model_used": "gemini-2.5-pro"
  }
}
```

---

## PARTE 4 — SISTEMA DE SUGESTÕES E TREND INTELLIGENCE

### 4.1 Arquitetura do Motor de Tendências

Grandes plataformas editoriais (Buzzfeed, The Verge, HubSpot Blog) usam feeds de tendências multifonte. Para a Pelimotion, o sistema deve funcionar assim:

```
FONTES DE DADOS
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Google Trends│  │ YouTube Data │  │ Reddit RSS   │  │ Product Hunt │
│ (pytrends ou │  │ API v3       │  │ (r/motion,   │  │ (design,     │
│  SerpAPI)    │  │ (trending)   │  │  r/branding) │  │  visual)     │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       └──────────────────┴──────────────────┴──────────────────┘
                                    │
                          Cron Job (Vercel Cron)
                          Roda: 06h e 18h UTC
                                    │
                          /api/blog/fetch-trends
                                    │
                    INSERT INTO topic_library (topic, subtopics, 
                    hype_score, platforms, trend_data, last_fetched_at)
                                    │
                          Disponível no CMS
```

### 4.2 UX do Sistema de Sugestões no CMS

**Quando o usuário digita ou cola um tema na Stage 1:**

```
Keyword: [ branding para startups 2026         ] [GENERATE STRATEGY]

┌─ TENDÊNCIAS RELACIONADAS ──────────────────────────────────────────┐
│ Buscando trends... ████████░░ 80%                                  │
│                                                                    │
│  🔥 +340% esta semana   "brand kit AI generated"   [USAR]         │
│  📈 +180%               "micro-branding freelance" [USAR]         │
│  💡 Tendência estável   "rebranding 2026 cases"    [USAR]         │
│                                                                    │
│  SUB-TÓPICOS POPULARES:                                            │
│  [identidade visual para SaaS]  [logo minimalista]  [brand voice] │
│  [brand guidelines template]    [naming strategy]                  │
│                                                                    │
│  ÂNGULOS DE ABORDAGEM:                                             │
│  ● Tutorial/How-to    ● Case Study    ● Opinião Editorial          │
│  ● Lista/Roundup      ● Tendência     ● Comparativo                │
└────────────────────────────────────────────────────────────────────┘
```

**Implementação do endpoint:**
```js
// /api/blog/fetch-trends
// 1. Recebe { topic, category }
// 2. Chama SerpAPI Google Trends (ou pytrends via Python serverless)
// 3. Chama YouTube Data API: search.list com relevanceLanguage=pt
// 4. Agrega, normaliza hype_score (0-100)
// 5. Pede à Gemini Flash: "Dado esses dados de trend, sugira 5 ângulos 
//    editoriais únicos para o tema X no contexto de motion design/branding"
// 6. Retorna JSON para o CMS
```

---

## PARTE 5 — PIPELINE DE GERAÇÃO AUTOMÁTICA

### 5.1 Fluxo de Automação (Sem Intervenção Humana)

```
CRON: Todo dia às 03h UTC
           │
           ▼
/api/blog/auto-generate
           │
           ├─► Busca topics com hype_score > 60 e sem post nos últimos 30 dias
           │
           ├─► Seleciona preset 'global' para cada seção
           │
           ├─► Stage 1: Gemini Flash → Strategy JSON (título, slug, meta, keywords)
           │
           ├─► Stage 2: Gemini Flash → Outline (H2/H3 com marcadores de imagem)
           │
           ├─► Stage 3: Loop → Gemini Pro → Escreve cada seção com contexto acumulado
           │       (Cada seção inclui a última frase da anterior como contexto)
           │
           ├─► Stage 4: Para cada [img-N] no conteúdo:
           │       • Gemini Flash → gera prompt visual coerente com o texto ao redor
           │       • Imagen 3.0 → gera imagem
           │       • Upload → Bunny.net
           │       • INSERT blog_images + post_images
           │
           ├─► Stage SEO: Valida meta_description, gera schema.org JSON
           │
           ├─► INSERT blog_posts com status='review' (NÃO published)
           │
           └─► Notificação: Webhook Slack / Email → "1 artigo aguardando revisão"
```

**Controle de custos de IA:**

| Etapa | Modelo | Tokens Estimados | Custo Estimado |
|-------|--------|-----------------|----------------|
| Strategy | Gemini Flash | ~500 | ~$0.001 |
| Outline | Gemini Flash | ~800 | ~$0.002 |
| Writing (8 seções) | Gemini Pro | ~12.000 | ~$0.18 |
| Image Prompts | Gemini Flash | ~2.000 | ~$0.005 |
| Imagens (3x) | Imagen 3.0 | — | ~$0.12 |
| **Total por artigo** | | | **~$0.31** |

### 5.2 Modo Manual com Sessões Interligadas

O CMS deve tratar cada artigo como um **estado persistente** que acumula contexto entre as stages:

```js
// Estado central do artigo no CMS (substitui currentPost fragmentado)
const ArticleSession = {
  id: null,              // UUID do post no Supabase
  meta: {
    title, slug, category, status, lang,
    keyword, keywords, metaTitle, metaDescription,
    date, scheduledAt
  },
  outline: [],           // Array de { title, level, placeholder_id, done }
  content: "",           // Markdown acumulado
  images: [],            // Array de ImageSlot
  presets: {},           // { strategy: uuid, writing: uuid, ... }
  generationLog: [],     // Histórico de cada call à IA
  lastSavedAt: null
};

// ImageSlot
const ImageSlot = {
  placeholder_id: "img-1",  // string usada no Markdown
  role: "hero",              // hero | thumb | body
  position: 0,              // ordem no artigo
  prompt: "",               // prompt gerado
  url: "",                  // URL CDN final
  image_id: null,           // FK para blog_images
  status: "empty"           // empty | prompt_ready | generated | uploaded
};
```

### 5.3 Controle Manual no CMS por Seção

```
STAGE 3: CONTENT
┌──────────────────────────────────────────────────────────────────┐
│  [▶ GERAR TODAS]   [GERAR PRÓXIMA]   [◼ PARAR]                   │
│                                                                  │
│  ✅ Introdução              340 palavras    [REGENERAR] [EDITAR]  │
│  ✅ O Problema do Design    380 palavras    [REGENERAR] [EDITAR]  │
│  ⏳ Ferramentas de 2026     gerando...                            │
│  ○  Cases Práticos          —              [GERAR]               │
│  ○  Como Aplicar            —              [GERAR]               │
│  ○  Conclusão               —              [GERAR]               │
│                                                                  │
│  Palavras totais: 720 / 1200 meta           ██████░░░░ 60%       │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ PREVIEW DO CONTEÚDO (Markdown)                           │   │
│  │ # Título do Artigo                                       │   │
│  │ ## O Problema do Design                                  │   │
│  │ Texto gerado aqui...                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

---

## PARTE 6 — MELHORIAS NO BUILD ENGINE

### 6.1 SEO Completo

Cada página gerada deve ter:

```html
<!-- Open Graph -->
<meta property="og:title" content="{{metaTitle}}">
<meta property="og:description" content="{{metaDescription}}">
<meta property="og:image" content="{{heroImageUrl}}">
<meta property="og:url" content="{{canonical}}">
<meta property="og:type" content="article">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{metaTitle}}">
<meta name="twitter:image" content="{{heroImageUrl}}">

<!-- Canonical -->
<link rel="canonical" href="{{canonical}}">

<!-- Schema.org Article -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{{title}}",
  "description": "{{metaDescription}}",
  "image": "{{heroImageUrl}}",
  "author": {"@type": "Organization", "name": "Pelimotion"},
  "publisher": {"@type": "Organization", "name": "Pelimotion"},
  "datePublished": "{{publishedAt}}",
  "dateModified": "{{updatedAt}}",
  "mainEntityOfPage": {"@type": "WebPage", "@id": "{{canonical}}"}
}
</script>
```

### 6.2 Geração de Sitemap

```js
// Ao final do build()
function generateSitemap(posts) {
  const urls = posts.map(p => `
  <url>
    <loc>${DOMAIN}/blog/${p.data.slug}</loc>
    <lastmod>${new Date(p.data.updatedAt || p.data.date).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${DOMAIN}/blog</loc><priority>1.0</priority></url>
  ${urls}
</urlset>`;
  
  fs.writeFileSync(path.join(BLOG_OUT_DIR, 'sitemap.xml'), sitemap);
}
```

### 6.3 Performance de Imagens

```js
// No build, gerar srcset com múltiplas resoluções via Bunny.net Transform
function getImageSrcset(baseUrl) {
  // Bunny.net suporta ?width=X para resize on-the-fly
  return `${baseUrl}?width=400 400w, ${baseUrl}?width=800 800w, ${baseUrl}?width=1200 1200w`;
}

// Renderizar imagem no artigo:
`<figure>
  <img 
    src="${imgUrl}?width=800" 
    srcset="${getImageSrcset(imgUrl)}"
    sizes="(max-width: 768px) 100vw, 800px"
    alt="${img.alt_text || post.data.title}"
    loading="lazy"
    decoding="async"
    width="800" height="450">
  ${img.caption ? `<figcaption>${img.caption}</figcaption>` : ''}
</figure>`
```

---

## PARTE 7 — ROADMAP DE IMPLEMENTAÇÃO

### FASE 0 — HOTFIXES IMEDIATOS (1-2 dias, zero risco de quebra)
> Não alteram arquitetura. Apenas corrigem o que está quebrado.

- [ ] **Fix BUG-01:** Corrigir payload do `savePost()` para schema flat do Supabase
- [ ] **Fix BUG-02:** Adicionar fallback `metaTitle || title + " | Pelimotion"` no build
- [ ] **Fix BUG-05:** Adicionar try/catch + logging no fetch Supabase do build
- [ ] **Fix BUG-06:** `deployToVercel()` deve aguardar `savePost()` + URL via env var
- [ ] **Fix S-06:** Adicionar feedback visual no `aiStep3()` (progress por seção)
- [ ] **Fix S-09:** Auto-save a cada 60 segundos com `localStorage` como fallback

---

### FASE 1 — FUNDAÇÃO DE DADOS (3-5 dias)
> Migrations aditivas. Não destrói dados existentes.

- [ ] Criar tabela `blog_images`
- [ ] Criar tabela `post_images`
- [ ] Criar tabela `content_presets`
- [ ] Criar tabela `topic_library`
- [ ] Criar tabela `generation_queue`
- [ ] Adicionar colunas na `blog_posts`: `published_at`, `meta_title`, `lang`, `reading_time_min`, `word_count`
- [ ] Migrar imagens existentes do campo `data.images` JSONB para `blog_images` + `post_images`
- [ ] Testar todas as queries do build engine contra o novo schema

---

### FASE 2 — CMS REFATORADO (1-2 semanas)
> Reescrever o estado central e as funções de IA com context injection.

- [ ] Implementar `ArticleSession` como estado central (substituir variáveis globais soltas)
- [ ] Conectar presets às funções `aiStep1/2/3/image()` via `Prompt Compiler`
- [ ] Reescrever Stage 4 (Visual Assets) com Slot Manager completo (adicionar/remover/reordenar)
- [ ] Implementar modos de imagem: Gerar Prompt / Gerar Imagem / Usar da Galeria / Upload
- [ ] Reescrever Stage 5 (Configurações) com a biblioteca de presets
- [ ] Implementar salvamento do `generation_config` por artigo
- [ ] Separar galeria em "Do Artigo" e "Biblioteca Geral"

---

### FASE 3 — BUILD ENGINE COMPLETO (3-4 dias)
> Zero risco: o build é idempotente e só gera arquivos estáticos.

- [ ] Buscar imagens via JOIN `post_images → blog_images` em vez de `data.images`
- [ ] Substituir `https.get()` nativo por `@supabase/supabase-js` com service role key
- [ ] Gerar meta OG + Twitter + Schema.org em todas as páginas
- [ ] Gerar `sitemap.xml` ao final do build
- [ ] Implementar `srcset` com Bunny.net transform para todas as imagens
- [ ] Adicionar paginação no index (20 posts por página)
- [ ] Implementar artigos relacionados por categoria no final de cada post
- [ ] Testar build com os 3 artigos existentes

---

### FASE 4 — TREND INTELLIGENCE (1 semana)
> Novo endpoint + UI no CMS. Isolado, não afeta nada existente.

- [ ] Criar `/api/blog/fetch-trends` com integração SerpAPI ou pytrends
- [ ] Popular `topic_library` com seeds manuais (20 temas de motion/branding)
- [ ] UI de sugestões no Stage 1 (painel de trends)
- [ ] Configurar Vercel Cron para atualizar trends diariamente

---

### FASE 5 — AUTOMAÇÃO (1-2 semanas)
> Apenas depois que Fases 0-3 estiverem estáveis em produção.

- [ ] Criar `/api/blog/auto-generate` com pipeline completo
- [ ] Configurar Vercel Cron `03h UTC` para rodar automação
- [ ] Implementar fila `generation_queue` com status tracking
- [ ] Dashboard de revisão no CMS (lista posts com status='review')
- [ ] Notificação Slack/Email ao gerar novos artigos

---

### FASE 6 — EXPANSÃO MULTI-CANAL (futuro)
> Estrutura de dados já preparada nas fases anteriores.

- [ ] **Social Posts:** Adicionar `output_type` na generation_queue ('blog' | 'instagram' | 'linkedin')
- [ ] **Newsletter:** Template de digest semanal com os artigos da semana
- [ ] **Editorial Calendar:** Visualização tipo Calendário no CMS
- [ ] **Métricas:** Integrar Plausible Analytics para tracking de reads por artigo

---

## PARTE 8 — PRÁTICAS NÃO DESTRUTIVAS

### 8.1 Regras do Roadmap

1. **Nunca deletar colunas** — apenas adicionar (`ALTER TABLE ADD COLUMN`)
2. **Sempre fazer backup do `data` JSONB** antes de qualquer migration
3. **Feature flags** — novas UIs do CMS ficam atrás de um `?preview=true` até estabilizarem
4. **O build engine é sempre a última coisa a mudar** — testar localmente com `node index.js` antes de qualquer PR
5. **Rollback em 1 clique** — cada fase deve ter um commit isolado e reversível

### 8.2 Testes por Fase

| Fase | Teste de Aceitação |
|------|-------------------|
| 0 | Criar artigo, salvar, verificar no Supabase que os campos estão na raiz da tabela |
| 1 | Migration roda sem erros, artigos existentes ainda aparecem no blog |
| 2 | Gerar artigo completo com presets e verificar que o texto segue o tom configurado |
| 3 | Build gera HTML com OG tags válidas (testar no opengraph.xyz) e sitemap acessível |
| 4 | Trends aparecem para 3 temas diferentes, sugestões são relevantes |
| 5 | Cron roda, cria artigo com status='review', não publica diretamente |

---

## APÊNDICE — CHECKLIST DE QUALIDADE POR ARTIGO PUBLICADO

Antes de mover um artigo de `review` para `published`:

```
CONTENT
□ Título < 60 chars para SERPs
□ Meta description 140-160 chars
□ Keyword principal aparece no primeiro parágrafo
□ Keyword no H1 ou nos primeiros 100 chars do título
□ Nenhuma seção com menos de 200 palavras
□ Imagens têm alt_text preenchido

TÉCNICO  
□ Slug sem caracteres especiais
□ Todas as imagens carregam (teste manual no preview)
□ Hero image tem ratio 16:9 ou 2:1
□ Thumbnail tem ratio 4:3

SEO
□ Schema.org válido (testar em schema.org/validator)
□ OG tags preenchidas (testar em opengraph.xyz)
□ Canonical URL correta
□ Sitemap atualizado após publicação
```

---

*Documento gerado para uso interno da equipe Pelimotion.*  
*Versão 1.0 — Revisão recomendada a cada 90 dias ou após mudança de stack.*
