# STATUS — PELIMOTION GENERATOR
**Fonte única de verdade. Atualizar ao final de cada sessão.**

---

## 📊 SNAPSHOT ATUAL

**Data:** 2026-05-16 19:00
**Fase Ativa:** 2 — Research Engine
**Progresso da Fase:** 20% (endpoint existe, falta Gemini web search + UI refinada)
**Próxima Ação:** Aprofundar `/api/blog/fetch-trends.js` com structured output real
**Bloqueadores:** Nenhum
**Auth:** ✅ Unificado — Supabase Auth (email+senha), roles funcionando
**SQL rodado:** ✅ `roles_migration.sql` executado, `pelimotionart@gmail.com` = admin

---

## 🗺️ PROGRESSO POR FASE

| Fase | Nome | Status | Completude | Última Atualização |
|------|------|--------|------------|-------------------|
| 0 | Auth + Database Fix | ✅ Completo | 100% | 2026-05-16 |
| 0b | Auth Unificado + Roles | ✅ Completo | 100% | 2026-05-16 |
| 1 | Estado Central + Auto-save | ✅ Completo | 100% | 2026-05-16 |
| 2 | Research Engine | 🔴 Em andamento | 20% | 2026-05-16 |
| 3 | Prompt Compiler + Brand Voice | ⏸️ Aguardando 2 | 0% | — |
| 4 | Visual Engine | ⏸️ Aguardando 3 | 0% | — |
| 5 | Content Score + UI | ✅ Base completa | 60% | 2026-05-16 |
| 6 | Distribution Engine | 📋 Planejado | 0% | — |
| 7 | Auto Mode (Cron) | 📋 Planejado | 0% | — |

**Legenda:** ✅ Completo · 🔴 Em andamento · ⏸️ Aguardando · 📋 Planejado · ⚠️ Bloqueado

---

## 📝 HISTÓRICO DE SESSÕES

### 2026-05-16 — Sessão 1: Reconstrução CMS + Auth (Fases 0 + 1)
**Agente:** Claude Sonnet 4.6 (via Claude Code)
**Fase trabalhada:** 0 — Auth + Database Fix

**O que foi feito:**
- [x] Diagnóstico completo: PIN hardcoded, mapeamento DB errado, sem auto-save
- [x] `/api/blog/config.js` criado — expõe Supabase URL+Key via env vars
- [x] `/shared/auth.js` criado — `requireAuth()`, `signIn()`, `signOut()`
- [x] `/login/index.html` criado — dark/editorial, email+senha, Supabase Auth
- [x] `/api/blog/posts.js` corrigido — GET response inclui `id` no nível raiz
- [x] `vercel.json` atualizado — rotas `/login` e `/blog-generator` adicionadas
- [x] `blog-generator/cms.html` reescrito — v7.0:
  - Auth guard Supabase (PIN removido completamente)
  - `loadPosts()` e `openPost()` corrigidos para `p.data.*`
  - Toast system (substitui `alert()`)
  - Auto-save a cada 30s para Supabase
  - Word count live + meta char count
  - **Stage 00 Research Engine** adicionado
  - Content Score calculado localmente
  - Botão SAIR + email do usuário na UI

**Arquivos criados:**
- `/api/blog/config.js` — 7 linhas
- `/shared/auth.js` — versão inicial (depois atualizada)
- `/login/index.html` — 111 linhas
- `/blog-generator/cms.html` — 1171 linhas (reescrito)

**Arquivos modificados:**
- `/api/blog/posts.js` (linha 43: `id: p.id` adicionado ao GET)
- `/vercel.json` (linhas 9-10: rotas /login e /blog-generator)
- `/blog-generator/CLAUDE.md` (histórico atualizado)

---

### 2026-05-16 — Sessão 2: Auth Unificado + Roles (Fase 0b)
**Agente:** Claude Sonnet 4.6 (via Claude Code)
**Fase trabalhada:** 0b — Auth Unificado entre todos os sistemas

**O que foi feito:**
- [x] Auditoria de auth nos 3 sistemas: admin (PIN SHA-256), projetos-app (Supabase ✅), blog-generator (Supabase ✅ desta sessão)
- [x] `/shared/auth.js` aprimorado — `getUserProfile()`, `requireRole()`, `getUserRole()`, cache de perfil
- [x] `/shared/roles.js` criado — matriz de permissões `admin/editor/viewer` × sistema × ação
- [x] `/scripts/database/roles_migration.sql` criado — constraint, índice, `has_role()`, `current_user_role()`, RLS policies em blog_posts e content_presets
- [x] `admin/admin.js` — PIN SHA-256 (65 linhas) removido, `checkAdminAccess()` via Supabase + `profiles.role = 'admin'` implementado
- [x] `admin/index.html` — overlay PIN → spinner "Verificando acesso...", email + botão SAIR na sidebar
- [x] `login/index.html` — redirect pós-login por role (`DEFAULT_REDIRECT` do roles.js), mensagem de erro de autorização
- [x] SQL executado pelo usuário: `roles_migration.sql` rodado no Supabase Dashboard
- [x] `UPDATE profiles SET role = 'admin' WHERE email = 'pelimotionart@gmail.com'` executado

**Arquivos criados:**
- `/shared/roles.js` — 90 linhas (matriz de permissões)
- `/scripts/database/roles_migration.sql` — 110 linhas (já executado ✅)

**Arquivos modificados:**
- `/shared/auth.js` (reescrito: +getUserProfile, +requireRole, +getUserRole)
- `/admin/admin.js` (linhas 31-99: PIN removido → Supabase Auth; linhas 1140-1155: init async)
- `/admin/index.html` (overlay PIN → spinner; sidebar: email + SAIR)
- `/login/index.html` (redirect por role + mensagem unauthorized)
- `/AI_AGENT_BRIEFING.md` (v2.0: estrutura atual, fases atualizadas, auth docs)

**Problemas encontrados:**
- `window.onPinInput` e `window.checkPin` referenciados em Global Exports → removidos limpo

---

## 🎯 PRÓXIMA SESSÃO

```markdown
[COLAR AI_AGENT_BRIEFING.md AQUI]

---

# Agent: research-engine-v2

📋 STATUS ANTERIOR
Fases 0, 0b e 1 completas. Auth unificado (Supabase, roles funcionando).
cms.html v7.0 com Stage 00 Research básico — faz fetch para /api/blog/fetch-trends.
Usuário admin: pelimotionart@gmail.com.

🎯 TAREFA DESTA SESSÃO
Aprofundar o Research Engine: fetch-trends com Gemini web search real + structured output
+ fontes reais citáveis + ângulos automáticos com tipo.

📦 ARQUIVOS A LER (APENAS ESTES)
- api/blog/fetch-trends.js (estado atual do endpoint)
- api/blog/generate-text.js (como chamamos o Gemini — para reusar padrão)
- blog-generator/cms.html (linhas 390-450: função runResearch() e renderResearch())

📦 ARQUIVOS A MODIFICAR
- api/blog/fetch-trends.js (reescrever para Gemini structured output real)
- blog-generator/cms.html (runResearch e renderResearch — sem mudar estrutura geral)

📦 SPEC — O que o Research Engine deve retornar

Formato de resposta do /api/blog/fetch-trends (POST { topic, category }):
{
  "trends": [
    {
      "term": "brand kit gerado por IA",
      "hype": 85,
      "platform": "Instagram, YouTube",
      "angle": "Tutorial: Como criar brand kit com IA em 2026",
      "description": "Crescimento de 340% nas buscas nos últimos 3 meses"
    }
  ],
  "sources": [
    {
      "title": "Brand Identity 2026 Report",
      "url": "https://...",
      "keyInsight": "73% das marcas vão usar IA no processo de branding até 2027",
      "publishedApprox": "Mar 2026"
    }
  ],
  "angles": [
    { "angle": "Tutorial: Como criar brand kit com IA", "type": "tutorial" },
    { "angle": "5 startups que rebrandearam e cresceram", "type": "case" },
    { "angle": "O fim do brand genérico", "type": "opinion" }
  ]
}

📦 PLANO SUGERIDO
PASSO 1: Ler fetch-trends.js e generate-text.js para entender o padrão atual
PASSO 2: Reescrever fetch-trends.js com prompt Gemini que força JSON structured output
PASSO 3: Testar endpoint localmente (vercel dev)
PASSO 4: Ajustar renderResearch() no cms.html se o formato mudou
PASSO 5: Garantir que "USAR PESQUISA → STRATEGY" popula os campos corretamente

📦 REFERÊNCIA
GENERATOR_REBUILD_PLAN.md > PARTE 3 > 3.5 Research Engine
GENERATOR_REBUILD_PLAN.md > PARTE 4 > 4.3 Stage 01 Research UI

⏸️  Prosseguir?
```

---

## 🚨 BLOQUEADORES ATIVOS

_Nenhum bloqueador no momento._

---

## 📚 DECISÕES ARQUITETURAIS

### 2026-05-16: Auth unificado via Supabase (projeto único)
**Contexto:** Três sistemas com auth diferentes (PIN admin, Supabase projetos-app, PIN blog-generator)
**Decisão:** Todos usam o mesmo projeto Supabase `gfaqnkmmbozmhroicqyc`
**Razão:** Uma base de usuários, roles consistentes, sessão válida em todos os sistemas
**Impacto:** `/shared/auth.js` + `/login/index.html` são o ponto de entrada único. Admin panel e blog-generator migrados do PIN para Supabase Auth.

### 2026-05-16: Sistema de Roles extensível (profiles.role)
**Contexto:** Precisávamos de controle de acesso para múltiplos sistemas
**Decisão:** Usar `profiles.role` (já existia no projetos-app) com constraint `admin|editor|viewer`
**Razão:** Aproveitar schema existente, não criar tabela nova desnecessária
**Impacto:** `shared/roles.js` define a matriz de permissões em código. Para adicionar role novo: adicionar no CHECK do SQL + no roles.js + na migration.

### 2026-05-16: Config do Supabase via endpoint /api/blog/config
**Contexto:** Frontend precisa das credenciais Supabase (URL + anon key) sem hardcode
**Decisão:** Endpoint serverless que lê de env vars e retorna para o frontend
**Razão:** Anon key pode estar em frontend, mas via env var no Vercel (não commitada)
**Impacto:** Qualquer sistema Vanilla que precise do Supabase usa `/api/blog/config` primeiro.

### 2026-05-16: Stack Vanilla mantido (não migrar para framework)
**Contexto:** Planos anteriores sugeriam Next.js/Astro
**Decisão:** Manter Vanilla HTML/JS para blog-generator e admin
**Razão:** Stack adequada, mudança seria destrutiva sem ganho real
**Impacto:** Build engine permanece Node.js puro, CMS monolítico por ora.

---

## 🔧 CONFIGURAÇÕES ATUAIS

### Supabase
- **Projeto ID:** `gfaqnkmmbozmhroicqyc`
- **URL:** `https://gfaqnkmmbozmhroicqyc.supabase.co`
- **Auth:** Email/senha — usuário admin: `pelimotionart@gmail.com`
- **RLS:** Ativo (roles_migration.sql executado ✅)
- **Session Duration:** 7 dias (padrão Supabase)
- **Tabelas relevantes:** `blog_posts`, `profiles`, `content_presets`, `blog_images`, `post_images`

### Vercel
- **Deploy Branch:** `main`
- **Serverless Functions:** `/api/blog/*`
- **Build Command:** `node blog-generator/index.js` (gera HTML estático)
- **Output Directory:** `.` (raiz)
- **Env Vars necessárias:** `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `VERTEX_AI_KEY`

### Bunny.net
- **CDN:** `pelimotion-portfolio.b-cdn.net`
- **Pasta de imagens:** `/blog/assets/[slug]/`

---

## 📊 MÉTRICAS

### Commits (sessão de hoje)
- `feat: auth unificado Supabase + roles + cms v7.0` — a commitar

### Tempo Investido (estimativa)
- **Sessão 1 (Fases 0+1):** ~2h
- **Sessão 2 (Fase 0b):** ~1.5h
- **Total acumulado:** ~3.5h de desenvolvimento ativo

---

## 🔄 TEMPLATE DE ATUALIZAÇÃO (copiar ao final de cada sessão)

```markdown
### [DATA] — Sessão N: [TÍTULO]
**Agente:** [modelo]
**Fase trabalhada:** [número e nome]

**O que foi feito:**
- [x] Item completado
- [ ] Item iniciado mas não completado

**Arquivos criados:**
- `/caminho/arquivo.ext` — [descrição, N linhas]

**Arquivos modificados:**
- `/caminho/arquivo.ext` (linhas X-Y) — [o que mudou]

**Problemas encontrados:**
- Problema X → Solução Y

**Próximo passo:** [descrição específica]
```

---

**Última atualização:** 2026-05-16 19:00

---

## 🚀 DEPLOY LOG

| Data/Hora UTC | Operador | Projeto | Status |
|---|---|---|---|

---

*Mantenha este arquivo sempre atualizado. Ele é a única fonte de verdade sobre o estado do projeto.*
