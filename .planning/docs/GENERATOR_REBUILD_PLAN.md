# PELIMOTION GENERATOR — PLANO DE RECONSTRUÇÃO COMPLETO
**Versão:** 2.0 | **Status:** Blueprint Executivo

---

## DIAGNÓSTICO IMEDIATO (leitura do código)

Antes de qualquer plano, aqui está o que o código real revela:

### Auth — gravidade máxima
```js
// O que existe hoje (cms_source.html linha 253-262)
function checkAuth() {
    const pin = document.getElementById('studio-pin').value 
              || localStorage.getItem('studio_pin');
    if (pin === '0101') {          // ← PIN hardcoded no código-fonte
        localStorage.setItem('studio_pin', '0101'); // ← visível a qualquer um
        init();
    } else {
        alert('ACCESS DENIED');    // ← bug: na carga da página, não há input
    }                              //   então pin = null, cai no else, gera DENIED
}
// A função é chamada no final do script sem nenhum input preenchido.
// Resultado: toda vez que a página carrega, dispara DENIED antes de pedir PIN.
```

**Por que o DENIED aparece sem pedir PIN:** `checkAuth()` é chamado no `DOMContentLoaded` sem aguardar input do usuário. `localStorage.getItem('studio_pin')` retorna `null` em sessão nova, cai no `else` e dispara o alert. É um bug de fluxo, não de segurança — mas ambos precisam ser resolvidos juntos.

### Database — por que os artigos não aparecem
```js
// loadPosts() faz fetch('/api/blog/posts') e espera receber:
posts.forEach(p => {
    div.innerHTML = `${p.data.title || 'Untitled'}`; // ← espera p.data.title
});

// openPost() também usa p.data.title, p.data.slug, p.data.images etc.

// Mas o Supabase retorna a tabela blog_posts com esta estrutura:
// { id, slug, title, content, status, category, meta_description, data: {...} }
// ou seja: p.title (não p.data.title), p.slug (não p.data.slug)

// O bug: o código do CMS foi escrito esperando uma estrutura aninhada
// que nunca foi implementada corretamente no Supabase nem na API.
// Resultado: p.data é o campo JSONB (imagens, keywords, date),
// não o wrapper de metadados. Os títulos chegam como p.title, não p.data.title.
```

---

## PARTE 1 — AUTH UNIFICADO (resolver primeiro)

### 1.1 Por que não usar mais PIN

| O que é hoje | O que deve ser |
|---|---|
| PIN "0101" hardcoded no JS | Email + senha via Supabase Auth |
| Armazenado em localStorage (texto puro) | JWT seguro, gerenciado pelo Supabase |
| Expira nunca / nunca persiste | Sessão de 7 dias com refresh automático |
| Cada sistema tem seu próprio login | Um login serve todos os sistemas |
| Qualquer um com o código sabe o PIN | Credencial não está no código-fonte |

### 1.2 Arquitetura do Auth Unificado

```
/login                    ← única página de login (HTML/JS simples)
    │
    ├─ usuário digita email + senha
    ├─ Supabase Auth valida
    ├─ JWT armazenado automaticamente (supabase-js cuida disso)
    └─ redirect para o sistema de origem

QUALQUER página admin verifica na carga:
    ├─ supabase.auth.getSession()
    ├─ se null → redirect para /login?next=[url-atual]
    └─ se válida → renderiza normalmente

TODOS os sistemas (blog-generator, admin, projetos-app) usam o mesmo
supabase client com o mesmo projeto → mesma sessão funciona em tudo.
```

### 1.3 Implementação — auth.js (arquivo compartilhado)

```js
// /shared/auth.js — importar em todos os painéis admin
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'SUA_URL';
const SUPABASE_ANON_KEY = 'SUA_ANON_KEY'; // anon key é segura no frontend

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Verificar e proteger qualquer página
export async function requireAuth(redirectTo = '/login') {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = `${redirectTo}?next=${encodeURIComponent(window.location.href)}`;
        return null;
    }
    return session;
}

// Logout
export async function signOut() {
    await supabase.auth.signOut();
    window.location.href = '/login';
}
```

### 1.4 Página de Login Única

```html
<!-- /login/index.html -->
<!-- Estilo Pelimotion: dark, editorial, sem cara de painel genérico -->

<form id="login-form">
    <input type="email" id="email" placeholder="email">
    <input type="password" id="password" placeholder="senha">
    <button type="submit">ENTRAR</button>
    <div id="login-error"></div>
</form>

<script type="module">
    import { supabase } from '/shared/auth.js';
    
    // Se já está logado, redirecionar
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        const next = new URLSearchParams(window.location.search).get('next');
        window.location.href = next || '/blog-generator';
    }
    
    document.getElementById('login-form').onsubmit = async (e) => {
        e.preventDefault();
        const { error } = await supabase.auth.signInWithPassword({
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
        });
        if (error) {
            document.getElementById('login-error').textContent = error.message;
        } else {
            const next = new URLSearchParams(window.location.search).get('next');
            window.location.href = next || '/blog-generator';
        }
    };
</script>
```

### 1.5 Cada painel — primeiras 5 linhas do script

```js
// Cole isso no topo de CADA painel admin (blog-generator, admin, projetos-app)
import { requireAuth, supabase, signOut } from '/shared/auth.js';
const session = await requireAuth();
// Se não logado, o requireAuth já redirecionou para /login.
// A partir daqui, session.user está disponível.
const userId = session.user.id;
```

### 1.6 Configuração no Supabase Dashboard

```
Authentication → Settings:
  JWT expiry: 604800 (7 dias em segundos)
  Enable "Refresh Token Rotation": ON
  
Authentication → Policies:
  Criar usuário admin: Authentication → Users → Add User
  Email: seu-email@pelimotion.art
  Senha: senha-forte (não "0101")
  
Row Level Security (RLS):
  blog_posts: somente usuários autenticados podem INSERT/UPDATE/DELETE
  SELECT pode ser público (o site precisa ler os posts)
```

---

## PARTE 2 — DATABASE SYNC (resolver junto com auth)

### 2.1 O mapeamento correto

O Supabase retorna linhas flat. O CMS espera dados aninhados. A correção é normalizar na API:

```js
// /api/blog/posts.js — GET handler
// Em vez de retornar a linha crua do Supabase, normalizar:

export default async function handler(req, res) {
    const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('updated_at', { ascending: false });
    
    if (error) return res.status(500).json({ error: error.message });
    
    // Normalizar para o formato que o CMS espera
    const normalized = data.map(p => ({
        id: p.id,
        content: p.content,
        data: {
            title: p.title,
            slug: p.slug,
            status: p.status,
            category: p.category,
            metaDescription: p.meta_description,
            date: p.data?.date || p.created_at,
            keywords: p.data?.keywords || [],
            images: p.data?.images || [],
            lang: p.lang || 'pt',
        }
    }));
    
    return res.status(200).json(normalized);
}
```

### 2.2 O POST (upsert) correto

```js
// /api/blog/posts.js — POST handler
export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    
    const { data: payload } = req.body; // CMS envia { data: {...}, content }
    
    // Mapear para as colunas reais do Supabase
    const row = {
        title: payload.data.title,
        slug: payload.data.slug,
        status: payload.data.status,
        category: payload.data.category,
        meta_description: payload.data.metaDescription,
        content: payload.content,
        lang: payload.data.lang || 'pt',
        // Tudo que é extra vai no JSONB data
        data: {
            keywords: payload.data.keywords,
            images: payload.data.images,
            date: payload.data.date,
        },
        updated_at: new Date().toISOString(),
    };
    
    // Upsert por slug (cria ou atualiza)
    const { data, error } = await supabase
        .from('blog_posts')
        .upsert(row, { onConflict: 'slug' })
        .select()
        .single();
    
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true, id: data.id });
}
```

---

## PARTE 3 — O FRAMEWORK DE GERAÇÃO (núcleo do projeto)

### 3.1 Como as grandes plataformas fazem

**Contently, HubSpot, The Atlantic, Buzzfeed** têm em comum:

1. **Pesquisa antes de escrever** — o artigo é ancorado em dados reais, não em imaginação da IA
2. **Brand Voice como DNA** — cada palavra gerada passa por um filtro de tom/voz configurado uma vez
3. **Estrutura narrativa, não lista de H2** — o outline tem arco dramático, não só tópicos soltos
4. **Imagens derivadas do texto** — os prompts visuais são extraídos do contexto específico de cada parágrafo, não genéricos
5. **Content Score** — qualidade medida antes de publicar (leiturabilidade, originalidade, keyword density)
6. **Um artigo → múltiplos formatos** — o mesmo conteúdo vira post, tweet, newsletter, caption

### 3.2 O Framework Modular — 6 Camadas

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     PELIMOTION CONTENT ENGINE v2                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  CAMADA 1: RESEARCH         ← o que não existe hoje e faz toda diferença│
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ • Trend Pulse: busca o que está em alta no tema digitado        │    │
│  │ • News Anchor: encontra notícias reais para citar no artigo     │    │
│  │ • Competitor Map: analisa o que já existe sobre o tema          │    │
│  │ • Source Collector: URLs, dados, estatísticas reais             │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  CAMADA 2: STRATEGY         ← quem vai ler e o que vai sentir           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ • Brand Voice Compiler: injeta tom/voz de cada preset           │    │
│  │ • Audience Profiler: define o nível e contexto do leitor        │    │
│  │ • Content Angle: abordagem (tutorial, opinião, case, tendência) │    │
│  │ • SEO Target: keyword principal + LSI terms + intenção de busca │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  CAMADA 3: STRUCTURE        ← o esqueleto com alma                      │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ • Narrative Arc: abertura hook → tensão → resolução → CTA       │    │
│  │ • Section Planner: cada H2 tem propósito declarado              │    │
│  │ • Image Placement: onde cada imagem vai, com papel definido     │    │
│  │ • Word Count Budget: palavras alocadas por seção                │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  CAMADA 4: PRODUCTION       ← o texto que não parece IA                 │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ • Section Writer: escreve com contexto acumulado                │    │
│  │ • Anti-AI Pass: remove clichês, flufos, abertura genérica       │    │
│  │ • Fact Injector: insere dados reais da Camada 1                 │    │
│  │ • Voice Checker: valida aderência ao brand voice                │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  CAMADA 5: VISUAL           ← imagens que contam a mesma história       │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ • Context Extractor: lê o parágrafo ao redor do [img-N]         │    │
│  │ • Prompt Architect: constrói prompt visual coerente             │    │
│  │ • Style Enforcer: aplica identidade visual Pelimotion           │    │
│  │ • Generator: Imagen 3.0 → Bunny.net                             │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  CAMADA 6: DISTRIBUTION     ← um artigo, múltiplos destinos             │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ • Blog Post: markdown → HTML estático (atual)                   │    │
│  │ • Social Pack: caption Instagram + LinkedIn + Twitter/X         │    │
│  │ • Newsletter Digest: versão resumida formatada                  │    │
│  │ • SEO Validator: score final antes de publicar                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.3 O Estado Central do Artigo (substituir variáveis soltas)

O código atual tem `let currentPost = null` e variáveis globais espalhadas. Substituir por um estado estruturado e persistido:

```js
// O "cérebro" de cada sessão de criação
class ArticleSession {
    constructor() {
        this.id = null;              // UUID do Supabase (null = artigo novo)
        this.isDirty = false;        // mudou desde o último save?
        this.lastSaved = null;
        
        // CAMADA 1: Research
        this.research = {
            trends: [],              // dados do Google Trends / YouTube
            news: [],                // { url, title, snippet } - artigos reais
            competitors: [],         // o que já existe sobre o tema
        };
        
        // CAMADA 2: Strategy  
        this.strategy = {
            keyword: '',
            keywords: [],
            angle: '',               // 'tutorial' | 'opinion' | 'case' | 'trend'
            audience: '',
            wordCountTarget: 1200,
            presetIds: {
                voice: null,
                seo: null,
                visual: null,
            }
        };
        
        // CAMADA 3: Structure
        this.outline = [];           // [{ id, title, level, wordBudget, imagePlaceholder, done }]
        
        // CAMADA 4: Production
        this.meta = {
            title: '',
            slug: '',
            metaTitle: '',
            metaDescription: '',
            category: '',
            status: 'draft',
            lang: 'pt',
            date: new Date().toISOString().split('T')[0],
        };
        this.content = '';           // markdown acumulado
        this.contentScore = null;    // { readability, keywords, originality }
        
        // CAMADA 5: Visual
        this.images = [];            // [ImageSlot]
        
        // CAMADA 6: Distribution
        this.outputs = {
            blog: null,
            social: null,
            newsletter: null,
        };
        
        // LOG
        this.generationLog = [];     // [{ step, timestamp, tokensUsed, model }]
    }
    
    // Serializar para salvar no Supabase
    toSupabase() {
        return {
            title: this.meta.title,
            slug: this.meta.slug,
            status: this.meta.status,
            category: this.meta.category,
            meta_description: this.meta.metaDescription,
            content: this.content,
            lang: this.meta.lang,
            data: {
                keywords: this.strategy.keywords,
                images: this.images,
                date: this.meta.date,
                research: this.research,
                strategy: this.strategy,
                outline: this.outline,
                generation_config: {
                    preset_ids: this.strategy.presetIds,
                    word_count_target: this.strategy.wordCountTarget,
                    generated_at: new Date().toISOString(),
                }
            }
        };
    }
    
    // Auto-save a cada mudança significativa
    markDirty() {
        this.isDirty = true;
        if (this._saveTimeout) clearTimeout(this._saveTimeout);
        this._saveTimeout = setTimeout(() => this.autoSave(), 30000); // 30s
    }
    
    async autoSave() {
        if (!this.isDirty) return;
        await saveToSupabase(this.toSupabase());
        this.isDirty = false;
        this.lastSaved = new Date();
        updateSaveIndicator('auto-saved');
    }
}

const session = new ArticleSession();
```

### 3.4 O Prompt System — como funciona o Brand Voice

O segredo para não ter cara de IA é um sistema de prompts em camadas:

```js
// Prompt Compiler — monta o prompt final para cada chamada à IA
async function compilePrompt(step, variables = {}) {
    // 1. Carregar presets ativos
    const globalVoice = await getPreset('global', 'voice');
    const globalSeo = await getPreset('global', 'seo');
    const categoryPreset = await getPreset(session.meta.category, step);
    
    // 2. Template base para cada step
    const templates = {
        
        strategy: `
Você é o editor-chefe da Pelimotion, maior referência editorial em 
motion design e branding no Brasil.

${globalVoice?.content || ''}

TAREFA: Gere a estratégia editorial para um artigo sobre "{{keyword}}".

CONTEXTO DE PESQUISA (use estes dados reais):
Tendências identificadas: {{trends}}
Notícias recentes: {{news}}

RETORNE APENAS JSON (sem markdown, sem preamble):
{
  "title": "título magnético, max 60 chars",
  "slug": "url-amigavel-sem-acentos", 
  "metaTitle": "título SEO, max 60 chars",
  "metaDescription": "descrição com verb de ação, 140-160 chars",
  "category": "categoria do artigo",
  "angle": "tutorial|opinion|case|trend|guide|roundup",
  "audienceSummary": "para quem é, em 1 linha",
  "contentHook": "primeira frase do artigo, magnética, sem 'Você já'",
  "suggestedKeywords": ["kw1", "kw2", "kw3", "kw4", "kw5"]
}`,

        outline: `
Você é o editor-chefe da Pelimotion.
${globalVoice?.content || ''}

TAREFA: Crie o outline narrativo do artigo "{{title}}" ({{angle}}).
Audiência: {{audience}}
Meta de palavras: {{wordCount}}
Imagens planejadas: {{imageCount}} (distribua os placeholders [img-1], [img-2]...)

REGRAS DO OUTLINE:
- Cada H2 tem um PROPÓSITO declarado (não só um tema)
- O arco é: Hook → Problema/Contexto → Desenvolvimento → Insight → Ação
- Nenhum H2 pode ser genérico como "Introdução" ou "Conclusão"
- O primeiro H2 começa in medias res (no meio da ação)
- Distribua os [img-N] como linhas dentro do outline, logo após o H2 onde devem aparecer

RETORNE APENAS JSON:
{
  "sections": [
    {
      "id": "s1",
      "title": "título do H2",
      "level": 2,
      "purpose": "o que o leitor ganha nessa seção",
      "wordBudget": 200,
      "imagePlaceholder": "img-1" // ou null se não tem imagem aqui
    }
  ]
}`,

        section: `
Você é o escritor sênior da Pelimotion.
${globalVoice?.content || ''}
${categoryPreset?.content || ''}

TAREFA: Escreva a seção "{{sectionTitle}}" do artigo "{{title}}".

CONTEXTO ACUMULADO (última frase da seção anterior):
"{{previousContext}}"

DADOS REAIS PARA USAR NESTA SEÇÃO (se relevantes):
{{researchData}}

REGRAS ABSOLUTAS:
- Budget: {{wordBudget}} palavras (±10%)
- NÃO comece com "Nesta seção", "Agora vamos", "É importante notar"
- NÃO use: "No mundo atual", "É fundamental", "Vale ressaltar", "Com isso em mente"
- Termine com uma frase que cria tensão ou curiosidade para a próxima seção
- Se esta seção tem [{{imagePlaceholder}}], insira essa linha exata após o 2º parágrafo
- Tom: especializado, direto, opiniões declaradas, não neutro
- Keywords a incluir naturalmente: {{keywords}}

Escreva apenas o conteúdo da seção, sem o título H2.`,

        imagePrompt: `
Você é o diretor de arte da Pelimotion.
Identidade visual: dark studio, cores accent #ff4b2b e #f0ede8, fotografia editorial.
${getPreset('global', 'visual')?.content || ''}

CONTEXTO DO ARTIGO: "{{title}}" sobre {{keyword}}
TRECHO AO REDOR DA IMAGEM:
"{{surroundingText}}"

SLOT: {{imageRole}} (hero|corpo|thumb)

Crie um prompt Imagen 3.0 para esta imagem. Deve ser:
- Coerente com o trecho de texto acima
- Na identidade visual Pelimotion (dark, editorial, profissional)
- Específico o suficiente para gerar algo único (não genérico)
- Para {{imageRole}}: ${imageRoleInstructions}

RETORNE APENAS o prompt em inglês, sem explicações. Max 200 palavras.`,

    };
    
    // 3. Substituir variáveis
    let prompt = templates[step] || '';
    Object.entries(variables).forEach(([key, val]) => {
        prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), val || '');
    });
    
    return prompt;
}
```

### 3.5 O Research Engine (Camada 1 — o que faz diferença)

```js
// Busca tendências e notícias reais ANTES de escrever
async function runResearchEngine(keyword, category) {
    showProgress('Pesquisando tendências...', 10);
    
    // 1. Trends via Gemini + web search tool
    const trendsPrompt = `
    Pesquise tendências atuais sobre "${keyword}" no contexto de ${category}.
    Foco em: Brasil, Portugal e mercado global de design/motion.
    Retorne JSON: { trends: [{term, growth, platform}], hotTopics: [string] }`;
    
    const trends = await askAI(trendsPrompt, 'flash', { webSearch: true });
    
    showProgress('Buscando referências reais...', 30);
    
    // 2. News/articles reais
    const newsPrompt = `
    Encontre 3-5 artigos, pesquisas ou notícias REAIS e recentes sobre "${keyword}".
    Retorne JSON: { sources: [{title, url, keyInsight, publishedApprox}] }
    Apenas fontes verificáveis. Se não encontrar, retorne array vazio.`;
    
    const news = await askAI(newsPrompt, 'flash', { webSearch: true });
    
    showProgress('Mapeando concorrência...', 50);
    
    session.research = { trends, news };
    return session.research;
}
```

### 3.6 O Anti-IA Pass (o que diferencia o texto)

Após cada seção gerada, passar por um filtro de qualidade:

```js
async function antiAIPass(text) {
    const prompt = `
Você é um editor humano revisando um texto.
Remova ou reescreva:
1. Aberturas genéricas: "No mundo atual", "Você já se perguntou", "É fundamental"
2. Flufos de transição: "Com isso em mente", "Vale ressaltar", "Sendo assim"
3. Conclusões óbvias: "Como podemos ver", "Em resumo", "Por fim"
4. Adjetivos vazios: "incrível", "revolucionário", "poderoso", "transformador"
5. Voz passiva desnecessária
6. Qualquer frase que soa como um chatbot sendo educado

Mantenha o tamanho aproximado. Mantenha o conteúdo factual.
Só o texto revisado, sem comentários.

TEXTO:
${text}`;
    
    return await askAI(prompt, 'flash');
}
```

### 3.7 Visual Prompt Architecture

O segredo das imagens coesas é extrair contexto do texto ao redor:

```js
async function generateCoherentImagePrompt(imageSlot, articleContent) {
    // Encontrar o parágrafo ao redor do [img-N] no conteúdo
    const placeholder = `[${imageSlot.id}]`;
    const idx = articleContent.indexOf(placeholder);
    
    // 500 chars antes e depois do placeholder
    const surrounding = articleContent.substring(
        Math.max(0, idx - 500),
        Math.min(articleContent.length, idx + 500)
    ).replace(placeholder, '[IMAGEM AQUI]');
    
    const roleInstructions = {
        hero: `hero editorial de revista, horizontal 2:1, atmosférica, 
               sem texto, espaço negativo para sobreposição de título`,
        body: `imagem de suporte ao conteúdo, horizontal 16:9, 
               ilustra conceito específico do parágrafo`,
        thumb: `thumbnail de card, quadrada 1:1 ou 4:3, 
                impacto visual imediato, reconhecível em 100px`,
    };
    
    const prompt = await compilePrompt('imagePrompt', {
        title: session.meta.title,
        keyword: session.strategy.keyword,
        surroundingText: surrounding,
        imageRole: imageSlot.role,
        imageRoleInstructions: roleInstructions[imageSlot.role],
    });
    
    return await askAI(prompt, 'flash');
}
```

---

## PARTE 4 — UI/UX REDESIGN

### 4.1 Problemas visuais identificados no código

- CSS inline misturado com `style` tags (difícil de manter)
- Sem hierarquia visual clara — tudo tem a mesma ênfase
- Loader bloqueia toda a tela mesmo para operações rápidas
- Nenhum feedback de progresso nas operações longas
- Layout colapsado em tela menor
- Sidebar sem área de scroll independente bem definida
- Botões sem estados de loading individual

### 4.2 Nova arquitetura de UI

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PELIMOTION STUDIO              [AUTO-SAVED 14:32] [●] [PREVIEW] [PUB]  │
├──────────────┬──────────────────────────────────────────────────────────┤
│              │                                                           │
│  ARTICLES    │  [01 RESEARCH] [02 STRATEGY] [03 OUTLINE] [04 WRITE]    │
│  ──────────  │  [05 VISUALS]  [06 PUBLISH]  [07 PRESETS]               │
│  + New       │  ─────────────────────────────────────────────────────   │
│  ──────────  │                                                           │
│  ● Post A    │  STAGE ATIVO (conteúdo muda por tab)                     │
│    draft     │                                                           │
│  ○ Post B    │  [MODO: MANUAL ◀──────────── AUTO ▶]                    │
│    live      │                                                           │
│  ○ Post C    │  Progress: ████████░░░░ 65% | 780/1200 palavras          │
│    live      │                                                           │
│  ──────────  │                                                           │
│  SCORE:      │                                                           │
│  ████ 82/100 │                                                           │
│              │                                                           │
│  PRESETS:    │                                                           │
│  ● Editorial │                                                           │
│  ○ Técnico   │                                                           │
│              │                                                           │
│  [CONFIG]    │                                                           │
│  [LOGOUT]    │                                                           │
└──────────────┴──────────────────────────────────────────────────────────┘
```

### 4.3 Stage 01: Research (novo — não existe hoje)

```
┌─ RESEARCH ENGINE ──────────────────────────────────────────────────────┐
│                                                                        │
│  Tema / Keyword: [branding para startups 2026          ] [PESQUISAR]  │
│                                                                        │
│  ─── TENDÊNCIAS ─────────────────────────────────────────────────────  │
│  🔥 +340%  "brand kit gerado por IA"     YouTube, Instagram  [USAR]   │
│  📈 +180%  "rebranding pós-funding"      LinkedIn, Twitter   [USAR]   │
│  📌 Estável "guia de identidade visual"  Google Search       [USAR]   │
│                                                                        │
│  ─── FONTES REAIS (para citar no artigo) ────────────────────────── │
│  [✓] "Brand Identity 2026 Report" – Design Week, Mar 2026             │
│  [✓] "Startups que rebrandearam em 2025" – Meio&Mensagem               │
│  [ ] "The State of Brand Design" – Pentagram Annual                   │
│                                                                        │
│  ─── ÂNGULOS SUGERIDOS ─────────────────────────────────────────────  │
│  ○ Tutorial: Como criar brand kit em 2026                              │
│  ● Case Study: 5 startups que rebrandearam e cresceram                 │
│  ○ Opinião: O fim do brand genérico                                    │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.4 Stage 04: Write — com progresso real

```
┌─ CONTENT ENGINE ───────────────────────────────────────────────────────┐
│  [▶ GERAR TUDO]  [▶ PRÓXIMA]  [◼ PAUSAR]  Modelo: Gemini Pro          │
│  ──────────────────────────────────────────────────────────────────    │
│                                                                        │
│  ✅ O Problema do Brand Genérico    412 palavras   [✏] [↺]             │
│     └─ [img-1] injetado após §2                                        │
│                                                                        │
│  ✅ Quando o Design Comunica Valor  387 palavras   [✏] [↺]             │
│                                                                        │
│  ⏳ As 5 Startups que Acertaram     gerando... ████░░ 65%              │
│                                                                        │
│  ○  Como Replicar em Qualquer Nicho  —             [GERAR]             │
│  ○  Ferramentas e Próximos Passos    —             [GERAR]             │
│                                                                        │
│  Total: 799 / 1200 palavras  ██████████░░░░░ 66%                      │
│  Content Score: calculando após conclusão...                           │
│                                                                        │
│  ─── PREVIEW ────────────────────────────────────────────────────── │
│  [Markdown side-by-side com preview renderizado]                       │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.5 Content Score (antes de publicar)

```
┌─ CONTENT SCORE: 84/100 ────────────────────────────────────────────────┐
│                                                                        │
│  SEO         ████████████░░░  90    keyword no H1, meta OK, 5 LSI    │
│  Leitura     ████████░░░░░░░  72    Flesch OK, 3 parágrafos longos   │
│  Originalidade ██████████░░░  85    baixo overlap com concorrentes   │
│  Estrutura   ███████████░░░░  88    arco narrativo presente           │
│  Imagens     ████████████░░░  90    3/3 slots preenchidos             │
│                                                                        │
│  ⚠️  Atenção: parágrafos nas seções 3 e 4 têm >150 palavras cada.     │
│  ✅  Keyword "branding startup" aparece 6x (ideal: 4-8)               │
│  ✅  Meta description tem 152 chars (ideal: 140-160)                  │
│                                                                        │
│  [IGNORAR]                    [CORRIGIR COM IA]      [PUBLICAR ASSIM] │
└────────────────────────────────────────────────────────────────────────┘
```

---

## PARTE 5 — ROADMAP DE IMPLEMENTAÇÃO

### FASE 0 — AUTH + DATABASE (Semana 1, 2-3 dias)
> Resolver os dois bloqueadores que impedem qualquer progresso.

**Dia 1:** Auth
- [ ] Criar `/login/index.html` com Supabase Auth
- [ ] Criar `/shared/auth.js` com `requireAuth()` e `signOut()`
- [ ] Adicionar verificação de auth nas primeiras 5 linhas de cada painel
- [ ] Configurar JWT expiry de 7 dias no Supabase Dashboard
- [ ] Criar usuário admin no Supabase (email + senha forte)
- [ ] Remover toda menção ao PIN do código

**Dia 2:** Database
- [ ] Corrigir o GET `/api/blog/posts` para normalizar dados (flat → aninhado)
- [ ] Corrigir o POST `/api/blog/posts` para mapear aninhado → flat
- [ ] Testar: criar artigo, salvar, verificar que aparece na lista
- [ ] Testar: reabrir artigo, verificar que todos os campos voltam corretos

**Dia 3:** Smoke test
- [ ] Fluxo completo: login → criar artigo → salvar → publicar → ver no blog
- [ ] Verificar que logout funciona e redireciona para /login
- [ ] Verificar que acesso direto a /blog-generator sem login redireciona

---

### FASE 1 — ESTADO CENTRAL + AUTO-SAVE (Semana 1-2)
> Parar de perder trabalho. Base para tudo o que vem depois.

- [ ] Implementar classe `ArticleSession` substituindo variáveis globais
- [ ] Auto-save a cada 30 segundos se `isDirty = true`
- [ ] Indicador visual de save status (canto superior: "● Salvo 14:32")
- [ ] Recovery: se página recarregar, restaurar sessão do Supabase (último artigo aberto)
- [ ] Toast notifications em vez de `alert()` (não bloqueia a UI)

---

### FASE 2 — RESEARCH ENGINE (Semana 2)
> O que diferencia o gerador de um "prompt aleatório".

- [ ] Stage 01 Research na UI (novo tab antes do Strategy)
- [ ] Endpoint `/api/blog/research` que chama Gemini Flash com web search
- [ ] Trends fetcher (Gemini + web search + structured output)
- [ ] News aggregator (fontes reais, retorna JSON com {title, url, insight})
- [ ] Salvar research no `session.research` e persistir no JSONB do Supabase

---

### FASE 3 — PROMPT COMPILER + BRAND VOICE (Semana 2-3)
> Fazer os presets funcionarem de verdade.

- [ ] Função `compilePrompt(step, variables)` centralizada
- [ ] Função `getPreset(scope, section)` que busca do Supabase em cascata
- [ ] Conectar `aiStep1/2/3` ao Prompt Compiler
- [ ] UI de presets reformulada (biblioteca com escopo global/categoria/artigo)
- [ ] Anti-IA Pass como pós-processamento de cada seção

---

### FASE 4 — VISUAL ENGINE (Semana 3)
> Imagens coesas que pertencem ao artigo.

- [ ] Context Extractor: encontra parágrafo ao redor do [img-N]
- [ ] `generateCoherentImagePrompt()` usando contexto local
- [ ] Slot Manager revisado: role (hero/thumb/body), posição, placeholder_id
- [ ] Tabelas `blog_images` e `post_images` no Supabase (fase de dados)
- [ ] Galeria separada: "Deste artigo" vs "Biblioteca geral"

---

### FASE 5 — CONTENT SCORE + WRITE UI (Semana 3-4)
> Controle e qualidade antes de publicar.

- [ ] Content Score (calculado localmente, sem IA)
- [ ] Stage 04 com progresso por seção, geração individual e coletiva
- [ ] Preview side-by-side (Markdown + HTML renderizado)
- [ ] Botão "Regenerar seção" sem perder o resto

---

### FASE 6 — DISTRIBUTION ENGINE (Mês 2)
> Um artigo → múltiplos formatos.

- [ ] Social Pack: caption Instagram (legenda + hashtags) + LinkedIn (tom profissional)
- [ ] Newsletter: digest da semana em formato HTML
- [ ] Stage 06 Distribution na UI
- [ ] Export: copiar para clipboard em cada formato

---

### FASE 7 — AUTO MODE (Mês 2-3)
> Rodar sozinho, você só revisa.

- [ ] Cron job Vercel: roda pipeline completo à noite
- [ ] Artigos gerados com `status = 'review'` (nunca publica direto)
- [ ] Dashboard de revisão: lista de artigos aguardando aprovação
- [ ] Notificação (Slack webhook ou email) ao gerar

---

## PARTE 6 — O PROMPT PARA O CLAUDE CODE

Cole isso no terminal estando dentro da pasta `blog-generator`:

```
Contexto: Estou reconstruindo o blog-generator da Pelimotion.
É um CMS interno em Vanilla HTML/JS que gera artigos com IA (Gemini/Imagen).

PROBLEMAS IDENTIFICADOS (auditoria externa):
1. AUTH BROKEN: checkAuth() dispara DENIED ao carregar porque chama alert antes de input
   O PIN "0101" está hardcoded no JS — precisa ser substituído por Supabase Auth
2. DATABASE DESYNC: loadPosts() espera p.data.title mas Supabase retorna p.title
   O payload de savePost() está mal mapeado (nested vs flat)
3. SEM AUTO-SAVE: qualquer refresh perde o trabalho
4. PRESETS: existem na UI mas nunca são injetados nos prompts da IA
5. IMAGENS: prompts genéricos sem contexto do texto ao redor

TAREFA DESTA SESSÃO (fases, aprovação a cada passo):

FASE A — Mapeamento (não edite nada):
  1. Liste a estrutura de arquivos com find . -type f (sem node_modules)
  2. Liste os endpoints disponíveis em /api/blog/
  3. Me mostre as primeiras 30 linhas do handler GET de /api/blog/posts.js

FASE B — Diagnóstico (aguarde aprovação antes de editar):
  4. Com base no código real, confirme os 5 problemas acima
  5. Identifique outros problemas não listados
  6. Proponha a ordem de correção

FASE C — Implementação (uma correção por vez, confirmação antes de cada uma):
  7. Começar pela FASE 0 do roadmap:
     - Criar /shared/auth.js com requireAuth() usando Supabase
     - Criar /login/index.html
     - Corrigir o mapeamento em /api/blog/posts.js (GET e POST)

Regra: Confirme comigo antes de cada mudança. Prefira edições cirúrgicas
a reescrever arquivos inteiros. Documente o que foi feito ao final de cada fase.
```

---

## REFERÊNCIAS DE PLATAFORMAS ESTUDADAS

| Plataforma | O que copiar |
|---|---|
| **Contently** | Brand Voice scoring, editorial workflow por etapas |
| **HubSpot Content Hub** | Topic clusters, keyword pillar, content score |
| **Surfer SEO** | NLP analysis, LSI terms, real-time content grader |
| **Jasper** | Templates por ângulo de conteúdo, tone of voice configurável |
| **Copy.ai Workflows** | Pipeline de múltiplos agentes encadeados |
| **The Atlantic CMS** | Narrativa como critério de qualidade, não só keywords |
| **Buzzfeed POUND** | Distribuição multi-plataforma do mesmo conteúdo |

---

*Próxima ação: Fase 0 — Auth + Database. Tudo mais depende disso funcionar.*
