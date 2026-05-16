# PELIMOTION — PLANO ESTRATÉGICO DO ECOSSISTEMA
**Baseado na arquitetura real. Não destrutivo. Orientado a agentes.**

---

## CONTEXTO REAL (ponto de partida honesto)

```
Portfolio/                      ← raiz / domínio principal
├── [landing page]              ← Vanilla HTML/CSS/JS
├── [admin panel]               ← Vanilla, portfólio integrado Bunny.net
├── projetos-app/               ← React — gerenciador de projetos (beta)
├── blog/                       ← Vanilla — blog atual (futuro portal)
└── blog-generator/             ← Vanilla — gerador ativo de conteúdo ← você está aqui
```

**Stack real:** Vanilla JS predominante + React isolado + Supabase + Bunny.net CDN + Vercel

**Problema real:** 4 projetos com contextos totalmente diferentes vivendo na mesma raiz, sem fronteiras de responsabilidade, sem documentação por agente, sem estratégia de sessão para a IA.

---

## PARTE 1 — DECISÕES ESTRATÉGICAS (pensadas em voz alta)

### Decisão 1: Monorepo real vs. monorepo "de fachada"

**O plano anterior sugeria monorepo com `packages/ui`.** Isso é correto para times que usam o mesmo framework em tudo. Mas você tem Vanilla + React. Forçar uma biblioteca de componentes compartilhada agora quebraria o fluxo de trabalho sem benefício imediato.

**Decisão tomada:** Arquitetura de **"Repositório Federado por Convenção"**.
- Os projetos continuam nas suas pastas atuais
- O que é compartilhado são **tokens de design** (um arquivo `design-tokens.json` na raiz) e **convenções documentadas** (um `STANDARDS.md` na raiz)
- Nenhum arquivo é movido agora — a organização vem pela documentação e pelos agentes
- Quando o ecossistema amadurecer e você tiver um framework único, a migração para monorepo real será cirúrgica

**Por que não quebrar agora:** O `blog-generator` está em desenvolvimento ativo. Refatorar a estrutura enquanto você conserta bugs seria como reformar a cozinha enquanto cozinha o jantar.

---

### Decisão 2: Não há "agente único para o projeto todo"

**O plano anterior sugeria um único CLAUDE.md na raiz.** Isso faz a IA ler contexto de todos os 4 projetos em toda sessão — o oposto de economizar tokens.

**Decisão tomada:** **Um agente por subprojeto.** Cada pasta tem seu próprio `CLAUDE.md` com contexto isolado. A raiz tem um `CLAUDE.md` leve que apenas define a visão geral e aponta para os subprojetos.

```
Portfolio/
├── CLAUDE.md              ← visão geral, 50 linhas max, aponta para subagentes
├── STANDARDS.md           ← convenções de código, naming, git
├── design-tokens.json     ← cores, tipografia, espaçamentos da marca
├── .claudeignore          ← o que NUNCA ler
│
├── projetos-app/
│   └── CLAUDE.md          ← agente do gerenciador de projetos
│
├── blog/
│   └── CLAUDE.md          ← agente do portal
│
└── blog-generator/
    └── CLAUDE.md          ← agente do gerador ← PRIORIDADE AGORA
```

---

### Decisão 3: Stack não muda, convenções mudam

O plano anterior sugeria migrar para Next.js/Astro. **Não faça isso agora.** O blog em Vanilla com build estático é uma decisão arquitetural excelente para SEO e performance — é o que grandes publishers fazem. O gerador em Vanilla é perfeitamente adequado para um CMS interno.

**O que muda:** A forma como você documenta, versiona e delega trabalho para a IA.

---

## PARTE 2 — ECONOMIA DE TOKENS: SISTEMA COMPLETO

### 2.1 O `.claudeignore` da raiz (criar agora)

```
# Portfolio/.claudeignore

# Dependências
node_modules/
.next/
.nuxt/
dist/
build/
.cache/

# Git
.git/

# Assets pesados (a IA não precisa "ver" imagens)
*.jpg
*.jpeg
*.png
*.gif
*.webp
*.mp4
*.mov
*.svg
public/assets/
public/images/
blog/assets/

# Logs e temporários
*.log
*.lock
.env
.env.*
npm-debug.log*

# Gerados pelo build
blog/*.html
blog/blog/*.html
blog/en/

# Bunny.net configs (irrelevantes para lógica)
bunny.json
```

### 2.2 Hierarquia de Contexto por Sessão

**Regra de ouro:** A IA só lê o que precisa para a tarefa atual.

```
NÍVEL 1 — Sessão de diagnóstico geral
  → cd Portfolio && claude
  → A IA lê o CLAUDE.md da raiz (visão geral)
  → Você faz perguntas de arquitetura

NÍVEL 2 — Sessão de trabalho em subprojeto
  → cd Portfolio/blog-generator && claude
  → A IA lê APENAS o CLAUDE.md do blog-generator
  → Zero contexto dos outros projetos
  → Máxima eficiência

NÍVEL 3 — Sessão cirúrgica em arquivo específico
  → cd Portfolio/blog-generator && claude
  → "Leia apenas api/generate-image.js e me ajude com o bug X"
  → A IA não percorre outras pastas
```

### 2.3 Protocolo de Sessão (disciplina diária)

```
INÍCIO DE SESSÃO
─────────────────
1. cd para a pasta DO subprojeto (não da raiz)
2. Primeira mensagem: "Leia o CLAUDE.md e me confirme o contexto atual"
3. Só então comece a trabalhar

DURANTE A SESSÃO
─────────────────
4. Se a sessão passar de 2h ou 30+ mensagens: /compact
5. Após /compact, confirme que o contexto essencial foi mantido
6. Nunca deixe a IA abrir arquivos desnecessários ("leia apenas X")

FIM DE SESSÃO
─────────────────
7. Peça: "Resuma o que foi feito e o próximo passo em 10 linhas"
8. Salve esse resumo no CLAUDE.md do subprojeto (seção STATUS)
9. /clear — nova sessão começa limpa
```

### 2.4 Estimativa de economia

| Prática | Tokens economizados por sessão |
|---------|-------------------------------|
| `.claudeignore` correto | ~40-60% (evita ler node_modules, assets) |
| Sessão no subprojeto, não na raiz | ~30-50% (contexto menor) |
| `/compact` a cada 2h | ~20-30% (histórico comprimido) |
| "Leia apenas X" em vez de browse livre | ~20-40% (leitura cirúrgica) |
| **Total combinado** | **até 80% menos tokens** |

---

## PARTE 3 — OS 5 AGENTES (CLAUDE.md de cada projeto)

### Agente 0: Raiz — Orquestrador Maestro

**Arquivo:** `Portfolio/CLAUDE.md`

```markdown
# PELIMOTION — Orquestrador Maestro

## Visão do Ecossistema
Pelimotion é um hub editorial e operacional focado em motion design, 
branding e design. Composto por 4 subprojetos ativos.

## Subprojetos e Agentes
| Pasta | Responsabilidade | Agente |
|-------|-----------------|--------|
| / (raiz) | Landing page + admin Bunny.net | Este arquivo |
| /blog | Portal público (blog → hub) | blog/CLAUDE.md |
| /blog-generator | CMS + gerador de conteúdo IA | blog-generator/CLAUDE.md |
| /projetos-app | Gerenciador interno (React) | projetos-app/CLAUDE.md |

## Regra de Ouro
Para trabalhar em qualquer subprojeto, navegue para sua pasta
e inicie uma nova sessão do Claude Code lá.
NÃO trabalhe no ecossistema inteiro em uma única sessão.

## Stack Global
- Frontend: Vanilla HTML/CSS/JS (blog, landing, admin, generator)
- Exceção: projetos-app usa React
- DB: Supabase (PostgreSQL)
- CDN/Storage: Bunny.net
- Deploy: Vercel (todos os subprojetos)
- Design Tokens: /design-tokens.json

## Convenções (ver STANDARDS.md para detalhes)
- Commits: conventional commits (feat:, fix:, refactor:, docs:)
- Nomes de arquivo: kebab-case
- Variáveis de ambiente: nunca no código, sempre em .env + Vercel dashboard
- Imagens: sempre via Bunny.net CDN, nunca commitadas no repositório
```

---

### Agente 1: blog-generator (PRIORIDADE ATUAL)

**Arquivo:** `Portfolio/blog-generator/CLAUDE.md`

```markdown
# AGENTE: BLOG GENERATOR
Última atualização: [data]
Status: EM DESENVOLVIMENTO ATIVO

## O Que Este Projeto Faz
CMS interno para geração de conteúdo assistida por IA.
Atual: artigos de blog.
Roadmap: social media, newsletter, editorial.

## Stack
- Frontend: Vanilla HTML/CSS/JS (cms_source.html — arquivo único por ora)
- Build Engine: Node.js (build_engine_source.js)
- IA: Vertex AI (Gemini 2.5 Pro + Flash, Imagen 3.0)
- DB: Supabase (tabela blog_posts + tabelas futuras)
- CDN: Bunny.net (imagens)
- Deploy: Vercel Serverless Functions (/api/blog/*)

## Bugs Conhecidos e Ativos (ver audit completo em docs/AUDIT.md)
- BUG-01: savePost() envia estrutura aninhada errada para Supabase [CRÍTICO]
- BUG-03: imagens não injetadas no artigo por falta de placeholders [CRÍTICO]
- BUG-04: presets não conectados às chamadas de IA [CRÍTICO]

## Fluxo de Dados Principal
CMS → /api/blog/posts → Supabase → Vercel Build → Static HTML → Bunny.net CDN

## Arquivos Críticos (ler estes, nesta ordem)
1. cms_source.html — toda a UI e lógica do CMS
2. build_engine_source.js — gerador de HTML estático
3. api/blog/*.js — endpoints serverless

## O Que NÃO Tocar
- /blog/** — gerado pelo build, nunca editar manualmente
- node_modules/
- .env

## Próxima Sessão: Tarefa Prioritária
[ATUALIZAR AQUI AO FIM DE CADA SESSÃO]

## Histórico de Sessões
### [data] — [o que foi feito em 2 linhas]
```

---

### Agente 2: blog (Portal)

**Arquivo:** `Portfolio/blog/CLAUDE.md`

```markdown
# AGENTE: BLOG / PORTAL PELIMOTION
Status: ESTÁVEL — não alterar sem sessão dedicada

## O Que Este Projeto Faz
Frontend público do Pelimotion. Hoje: blog de artigos.
Futuro: portal com vagas, eventos, notícias, recursos.

## Arquitetura
- Todo conteúdo vem do build do blog-generator (arquivos HTML estáticos)
- Imagens servidas pelo Bunny.net CDN
- Zero banco de dados em runtime (100% estático)

## Seções Planejadas (roadmap)
- /blog — artigos [ATIVO]
- /vagas — oportunidades e editais [PLANEJADO]
- /eventos — agenda motion/design [PLANEJADO]
- /noticias — news feed curado [PLANEJADO]
- /recursos — ferramentas e links [PLANEJADO]

## Schema Universal de Conteúdo
Todas as seções usarão o mesmo modelo base:
{
  type: 'article' | 'job' | 'event' | 'news' | 'resource',
  slug, title, meta_description, category, status,
  content (Markdown), data: { images, date, [campos extras por type] }
}
Campos extras por tipo:
- job: company, salary_range, location, deadline
- event: event_date, event_end, location, registration_url
- news: source_url, source_name
- resource: resource_url, tool_type

## Regra Crítica
Os arquivos HTML desta pasta são GERADOS. Nunca edite diretamente.
Para mudar o template visual, edite o build engine no blog-generator.
```

---

### Agente 3: projetos-app

**Arquivo:** `Portfolio/projetos-app/CLAUDE.md`

```markdown
# AGENTE: PROJETOS-APP (Gerenciador Interno)
Status: BETA / TESTES

## O Que Este Projeto Faz
Gerenciador de projetos interno da Pelimotion. Futuro: hub operacional
e administrativo completo (ERP leve).

## Stack
- Framework: React (único projeto React do ecossistema)
- Build: [Vite/CRA — especificar]
- DB: Supabase (schema separado do blog)

## Diferença para os outros projetos
Este é o único projeto em React. Não importar lógica daqui
para os projetos Vanilla. Manter isolado.

## Módulos Planejados
- [x] Gerenciamento básico de projetos
- [ ] Dashboard financeiro / faturamento
- [ ] Integração com calendário editorial do blog-generator
- [ ] Aprovação de conteúdo (vagas, editais)

## Comandos
npm run dev     — desenvolvimento local
npm run build   — build de produção
npm run test    — testes
```

---

## PARTE 4 — O PROMPT DA "GRANDE ARRUMAÇÃO" (versão correta)

Este prompt é para rodar **dentro da pasta `blog-generator`**, não na raiz.
É o primeiro a rodar porque é onde você está trabalhando.

```
Olá. Sou o desenvolvedor do Pelimotion — um hub editorial de motion design e branding.

CONTEXTO DO PROJETO ATUAL (blog-generator):
- CMS interno feito em Vanilla HTML/JS para geração de conteúdo com IA
- Build Engine em Node.js que gera HTML estático publicado na Vercel
- IA: Vertex AI (Gemini + Imagen) via endpoints serverless
- DB: Supabase | CDN: Bunny.net
- Bugs críticos documentados em docs/AUDIT.md (que ainda não existe)

TAREFA 1 — MAPEAMENTO (sem abrir arquivos):
Use `find . -type f -not -path '*/node_modules/*' -not -path '*/.git/*'`
para listar todos os arquivos. Me mostre a árvore.

TAREFA 2 — LEITURA CIRÚRGICA:
Leia APENAS estes arquivos, nesta ordem:
1. cms_source.html
2. build_engine_source.js  
3. api/ (liste os arquivos, leia apenas os nomes por ora)

TAREFA 3 — DIAGNÓSTICO:
Com base apenas nos arquivos lidos, identifique:
a) Estrutura de pastas que precisa ser criada (ex: /docs, /api separado)
b) Arquivos que podem ser divididos (o cms_source.html provavelmente tem CSS+JS+HTML junto)
c) Lógica duplicada entre arquivos

TAREFA 4 — PROPOSTA:
Me proponha uma estrutura de pastas para o blog-generator que:
- Separe a lógica (JS) do template (HTML)
- Crie uma pasta /docs para AUDIT.md e CLAUDE.md
- Organize as API routes
- Seja não-destrutiva (nada é deletado, apenas organizado)

REGRA ABSOLUTA: Não mova, não apague, não edite nenhum arquivo nesta sessão.
Apenas mapeie e proponha. Aguarde minha aprovação antes de qualquer ação.
```

---

## PARTE 5 — ROADMAP DO ECOSSISTEMA

### AGORA (próximas 2 semanas)
**Foco: blog-generator funcional e sem bugs**
- Criar os `CLAUDE.md` de cada subprojeto (30 min, feito uma vez)
- Criar `.claudeignore` na raiz
- Rodar o prompt de mapeamento acima
- Corrigir os 3 bugs críticos (BUG-01, BUG-03, BUG-04 do audit anterior)
- Implementar o sistema de imagens com slots

### CURTO PRAZO (1-2 meses)
**Foco: portal público tomando forma**
- Schema universal de conteúdo no Supabase (serve blog + vagas + eventos)
- Seção `/vagas` no portal (mesma engine do blog)
- Seção `/eventos` no portal
- Blog-generator expandido para gerar vagas e eventos (não só artigos)

### MÉDIO PRAZO (3-6 meses)
**Foco: automação e crescimento**
- Pipeline de geração automática (cron jobs)
- Trend intelligence (pesquisa de temas)
- Social media e newsletter saindo do generator
- projetos-app integrado com calendário editorial

### LONGO PRAZO (6-12 meses)
**Foco: ecossistema completo**
- Hub administrativo completo no projetos-app (ERP leve)
- Comunidade (usuários podem submeter vagas e eventos)
- Hospedagem própria se necessário (migrar de Vercel para VPS com Coolify)
- Monetização (vagas premium, eventos patrocinados)

---

## PARTE 6 — MODELO MENTAL DE TRABALHO DIÁRIO

```
PERGUNTA ANTES DE ABRIR O CLAUDE CODE:
"Qual subprojeto vou trabalhar hoje?"
          │
          ▼
     cd Portfolio/[subprojeto]
          │
          ▼
     claude (inicia na pasta certa)
          │
          ▼
     "Leia o CLAUDE.md e confirme o contexto"
          │
          ▼
     trabalha com foco total naquele contexto
          │
          ▼
     ao terminar: "Resuma o que foi feito em 5 linhas"
          │
          ▼
     cola o resumo no CLAUDE.md (seção STATUS)
          │
          ▼
     /clear → fecha terminal
```

**A raiz (`Portfolio/`) só é aberta para:**
- Decisões que afetam múltiplos subprojetos
- Mudanças nos design tokens
- Discussões de arquitetura geral

**Cada subprojeto é um contexto selado.**

---

## O QUE ESTAVA ERRADO NO PLANO ANTERIOR

| Problema no plano anterior | Correção aplicada aqui |
|---------------------------|----------------------|
| Sugeria Next.js/Astro sem conhecer a stack | Stack Vanilla mantida — é a decisão certa |
| CLAUDE.md único na raiz | Um CLAUDE.md por subprojeto |
| Monorepo com packages/ui | Federação por convenção (tokens JSON) |
| Prompt genérico de "analise o projeto" | Prompt cirúrgico específico para blog-generator |
| Não mencionou a estrutura real de 4 pastas | Arquitetura baseada nas 4 pastas reais |
| "Antigravity + Claude Code" como workflow | Agentes por subprojeto como workflow |
| Fases abstratas sem critério de conclusão | Cada fase tem entregável concreto |

---

*Documento vivo — atualizar a seção de STATUS de cada agente ao fim de cada sessão.*
