# STATUS — wide-image-studio
**Fonte única de verdade. Atualizar ao final de cada sessão.**

---

## 📊 SNAPSHOT ATUAL

**Data:** 2026-05-19
**Fase:** Pipeline completo (PRs 1–10 completos)
**Status:** PRONTO PARA TESTE INTEGRADO
**Próxima Ação:** Aplicar migrations Supabase + testar pipeline ponta-a-ponta
**Bloqueadores:** Nenhum

---

## 🗺️ ESTADO DOS COMPONENTES

| Componente | Status | Última sessão |
|---|---|---|
| Estrutura de pastas | ✅ Criada | 2026-05-18 |
| `presets/displays.json` | ✅ 3 presets (padrão, alta densidade, draft) | 2026-05-18 |
| `presets/styles.json` | ✅ 4 presets de estilo | 2026-05-18 |
| `CLAUDE.md` subprojeto | ✅ <200 linhas | 2026-05-18 |
| `.claude/skills/wide-image/SKILL.md` | ✅ Pipeline 4 fases documentado | 2026-05-18 |
| `scripts/install-hf-skills.sh` | ✅ Criado | 2026-05-18 |
| `scripts/verify-setup.sh` | ✅ Criado | 2026-05-18 |
| `db/migrations/001_wide_jobs.sql` | ✅ State machine 11 estados | 2026-05-18 |
| `db/policies/wide_jobs_rls.sql` | ✅ RLS por role wide_studio | 2026-05-18 |
| `db/seed/wide_studio_role.sql` | ✅ has_wide_studio_role() | 2026-05-18 |
| **Edge script** (`edge-script/src/index.ts`) | ✅ No ar — /health OK | 2026-05-19 |
| `edge-script/src/utils/auth.ts` | ✅ JWT + HMAC | 2026-05-19 |
| `edge-script/src/utils/response.ts` | ✅ json/err/cors | 2026-05-19 |
| `edge-script/build.mjs` | ✅ Deno + esbuild-deno-loader + guard 1MB | 2026-05-19 |
| `edge-script/src/tiling-math.ts` | ✅ loadPreset / computeTilePositions / buildOverlapMasks / estimateCost | 2026-05-19 |
| `edge-script/src/upload-ref.ts` | ✅ Proxy stream → HF /v2/files | 2026-05-19 |
| `edge-script/src/start.ts` | ✅ Valida brief, credit check, cria job, master plate | 2026-05-19 |
| `edge-script/src/utils/supabase.ts` | ✅ dbCreateJob / dbPatchJob / dbGetJobBy* | 2026-05-19 |
| `edge-script/src/hf-webhook.ts` | ✅ State machine: master_ready / tiles_partial / tiles_ready / failed | 2026-05-19 |
| `edge-script/src/approve-master.ts` | ✅ Valida master_ready, despacha N tiles paralelo | 2026-05-19 |
| `public/index.html` | ✅ Studio UI completo (form → master → tiles → download) | 2026-05-19 |
| `public/css/studio.css` | ✅ Dark theme funcional | 2026-05-19 |
| `public/js/config.js` | ✅ Presets + estilos embutidos, constantes públicas | 2026-05-19 |
| `public/js/supabase-client.js` | ✅ Auth + Realtime subscribe | 2026-05-19 |
| `public/js/app.js` | ✅ State machine completa (form→generate→approve→stitch) | 2026-05-19 |
| `public/js/stitcher.worker.js` | ✅ OpenCV.js MultiBandBlender + gradient masks + crop + PNG | 2026-05-19 |

---

## 📝 HISTÓRICO DE SESSÕES

### 2026-05-19 — PRs 8–10: approve-master + frontend + stitcher

**O que foi feito:**
- [x] `utils/supabase.ts` — `dbGetJobById` adicionado
- [x] `approve-master.ts` — valida master_ready, despacha N tiles paralelo com `seed+i`, prompts regionais, idempotency-key por tile
- [x] `public/index.html` — Studio UI: form → approve master → tile grid → stitch
- [x] `public/css/studio.css` — dark theme
- [x] `public/js/config.js` — 3 display presets + 4 estilos embutidos, Supabase URL/anon key, edge URL
- [x] `public/js/supabase-client.js` — getSession, requireWideStudioSession, subscribeToJob, signOut
- [x] `public/js/app.js` — state machine completa; upload refs, `/start`, `/approve-master`, stitcher worker
- [x] `public/js/stitcher.worker.js` — OpenCV.js MultiBandBlender 5 bandas, gradient masks por tile, resize tiles HF→stitch, crop_x_start, export PNG
- [x] Edge script build: 17KB / 1MB

**Arquivos criados:** `approve-master.ts`, `public/index.html`, `public/css/studio.css`, `public/js/{config,supabase-client,app,stitcher.worker}.js`
**Arquivos modificados:** `utils/supabase.ts`, `index.ts`, `STATUS.md`

---

### 2026-05-19 — PRs 6+7: handlers edge + webhook

**O que foi feito:**
- [x] `utils/supabase.ts` — dbCreateJob, dbPatchJob, dbGetJobByMasterHfId, dbGetJobByTileHfId
- [x] `upload-ref.ts` — stream proxy cliente → HF /v2/files (sem buffer RAM, `duplex: "half"`)
- [x] `start.ts` — valida brief, pre-flight credit check, cria job Supabase, despacha master plate HF com idempotency-key
- [x] `hf-webhook.ts` — state machine: master_ready, tiles_partial, tiles_ready, failed + idempotência + error_log append
- [x] `index.ts` atualizado — stubs de upload-ref, start, hf-webhook removidos; handlers reais importados
- [x] Build OK: 15KB / 1MB

**Arquivos criados:** `utils/supabase.ts`, `upload-ref.ts`, `start.ts`, `hf-webhook.ts`
**Arquivos modificados:** `index.ts`, `STATUS.md`

---

### 2026-05-19 — PR 5: tiling-math.ts

**O que foi feito:**
- [x] `edge-script/src/tiling-math.ts` criado com 4 funções puras
- [x] `loadPreset(key)` — valida chave, lança 400 se inválida
- [x] `computeTilePositions(preset)` — calcula `master_crop` por tile via escala master→canvas
- [x] `buildOverlapMasks(preset)` — regiões de gradiente (esquerda/direita) para o stitcher
- [x] `estimateCost(preset)` — retorna `estimated_cost_usd`
- [x] Presets embutidos no TS (sem I/O de filesystem, compatível com Bunny Edge)
- [x] Build OK: 7KB / 1MB

**Arquivos criados:** `edge-script/src/tiling-math.ts`
**Arquivos modificados:** `STATUS.md`

---

### 2026-05-19 — PRs 1–4 + Edge Script no ar

**O que foi feito:**
- [x] PR 1: scaffold de pastas + presets + CLAUDE.md raiz v1.2
- [x] PR 2: CLAUDE.md subprojeto + SKILL.md + slash commands + scripts
- [x] PR 3: schema Supabase (wide_jobs + RLS + Realtime + pgsodium)
- [x] PR 4: edge script scaffold — router, auth JWT, HMAC, CORS, build Deno
- [x] Fix: `addEventListener` → `BunnySDK.net.http.serve()` (padrão Bunny real)
- [x] Fix: URL `pelimotion.com` → `pelimotion.art` em todo o subprojeto
- [x] Fix: Edge Rule descartada — DNS de pelimotion.art vai direto para Vercel
- [x] Deploy verificado: `https://wide-api-ilgmz.bunny.run/health` → `{"ok":true}`

**Arquivos criados/modificados:** ver commits `de50c91` → `db8690e` no main

---

## 🎯 PRÓXIMA SESSÃO — Teste integrado ponta-a-ponta

> **Os pré-requisitos manuais (BLOCOS 1–4 abaixo) devem estar concluídos antes de iniciar.**
> Quando estiverem prontos, copie o prompt abaixo e cole no Claude Code **dentro da pasta `/wide-image-studio/`**.

```
[AI_AGENT_BRIEFING.md carregado automaticamente]

# Context: wide-image-studio-agent

📋 STATUS ANTERIOR
PRs 1–10 completos e commitados. Pipeline inteiro implementado:
- Edge script live em https://wide-api-ilgmz.bunny.run (Bunny Edge Script 75395, 17KB)
  - /health ✅ | /upload-ref ✅ | /start ✅ | /approve-master ✅ | /hf-webhook ✅
- Frontend Vanilla JS em public/ (index.html + app.js + supabase-client.js + config.js + studio.css)
- Stitcher: public/js/stitcher.worker.js (OpenCV.js MultiBandBlender 5 bandas)
- Pré-requisitos manuais concluídos: migrations Supabase aplicadas, env vars Bunny configuradas,
  usuário pelimotionart@gmail.com com role wide_studio criado.

🎯 TAREFA DESTA SESSÃO
Teste integrado ponta-a-ponta e correção dos bugs que aparecerem.

📦 ARQUIVOS QUE PROVAVELMENTE PRECISARÃO DE AJUSTE
- edge-script/src/start.ts — payload HF /v2/generations (field names podem diferir da spec)
- edge-script/src/hf-webhook.ts — status names do webhook HF ("completed"? "success"? outro?)
- public/js/stitcher.worker.js — API cv.detail_MultiBandBlender no OpenCV.js 4.8.0
- public/js/app.js — qualquer ajuste de UX descoberto durante o teste

📦 FLUXO DE TESTE (executar nesta ordem)
1. Abrir https://wide-api-ilgmz.bunny.run/health → deve retornar {"ok":true,"ts":...}
2. Abrir o Studio (URL do frontend) → deve carregar sem erros de auth
3. Fazer login com pelimotionart@gmail.com
4. Preencher form: preset Padrão, prompt simples, sem refs, sem soul_id
5. Clicar "Gerar master plate" → verificar no Supabase se wide_jobs row foi criada com status master_pending
6. Aguardar webhook → verificar se status muda para master_ready e master_url aparece
7. Aprovar master → verificar se N tiles são despachados (status tiles_pending, hf_tile_job_ids preenchidos)
8. Aguardar tiles → verificar status tiles_ready e tile_urls preenchidas
9. Clicar "Stitch & Download" → verificar se o PNG final é gerado e baixado

📦 ONDE OLHAR SE ALGO QUEBRAR
- Console do browser → erros JS no frontend
- Dashboard Bunny Edge Scripting → aba Logs do script 75395 → erros no edge
- Supabase → Table Editor → wide_jobs → inspecionar colunas status/error_log
- Supabase → Logs → API logs → ver requests com erro

📦 DECISÕES JÁ FECHADAS (não revisitar)
- Zero-storage: nenhum byte de mídia em nossos serviços
- Auth: Supabase JWT + role wide_studio em app_metadata
- Edge script URL: https://wide-api-ilgmz.bunny.run (DNS pelimotion.art vai para Vercel)
- Build: deno run -A build.mjs (esbuild-deno-loader, guard 1MB)
- Stitch: no browser (OpenCV.js WASM), não no edge

⏸️  Prosseguir com o teste?
```

---

## ⚙️ PRÉ-REQUISITOS MANUAIS (executar uma vez, nesta ordem)

### BLOCO 1 — Supabase: aplicar SQL (3 arquivos, nesta ordem)

**Onde:** https://supabase.com/dashboard → projeto `gfaqnkmmbozmhroicqyc` → SQL Editor → "New query"

**Passo 1 de 3 — função `has_wide_studio_role`**
Abrir o arquivo `db/seed/wide_studio_role.sql`, copiar todo o conteúdo e colar no SQL Editor. Clicar em **Run**. Deve aparecer "Success, no rows returned".

**Passo 2 de 3 — tabela `wide_jobs` e triggers**
Abrir `db/migrations/001_wide_jobs.sql`, copiar todo o conteúdo, colar e clicar em **Run**. Deve aparecer "Success, no rows returned".

> Para verificar: ir em Table Editor → deve aparecer a tabela `wide_jobs`.

**Passo 3 de 3 — políticas RLS**
Abrir `db/policies/wide_jobs_rls.sql`, copiar, colar e clicar em **Run**. "Success, no rows returned".

> Para verificar: ir em Authentication → Policies → tabela `wide_jobs` → devem aparecer 4 políticas (select, insert, update, delete).

---

### BLOCO 2 — Bunny Edge Script: configurar variáveis de ambiente

**Onde:** https://dash.bunny.net → Edge Scripting → script **75395** (wide-api-ilgmz) → aba **Environment Variables**

Adicionar cada variável abaixo (nome exato, sem espaços):

| Variável | Valor | Onde obter |
|---|---|---|
| `HF_API_KEY` | `fda5a6d6-1333-4821-9483-1d23ecdcc091` | Já em `.env.example` |
| `HF_SECRET` | `a0f8d6b042f35891688c7fd9cbb20d88c8c8703bb94be582cc1ae2eabb2c3c4e` | Já em `.env.example` |
| `WEBHOOK_SECRET` | `eb50a4d8c425da604496bbbd7a3693410dd6d72970e2d87e318f197f8422844f` | Já em `.env.example` |
| `SUPABASE_URL` | `https://gfaqnkmmbozmhroicqyc.supabase.co` | Já em `.env.example` |
| `SUPABASE_SERVICE_ROLE_KEY` | *(ver `.env.example` — linha `SUPABASE_SERVICE_ROLE_KEY=`)* | `.env.example` |
| `SUPABASE_ANON_KEY` | *(ver `.env.example` — linha `SUPABASE_ANON_KEY=`)* | `.env.example` |
| `ALLOWED_ORIGIN` | `https://studio.pelimotion.art` | fixo |
| `PUBLIC_EDGE_URL` | `https://wide-api-ilgmz.bunny.run` | fixo |
| `MAX_REFS_PER_JOB` | `5` | fixo |

Depois de salvar todas, clicar em **Deploy** para republicar o script com as novas variáveis.

> Verificar: `curl https://wide-api-ilgmz.bunny.run/health` deve retornar `{"ok":true,"ts":...}`

---

### BLOCO 3 — Supabase: criar usuário de teste com role `wide_studio`

**Onde:** https://supabase.com/dashboard → projeto `gfaqnkmmbozmhroicqyc` → SQL Editor → "New query"

**Passo 1** — Se o usuário `pelimotionart@gmail.com` ainda não existir em Authentication → Users, criar primeiro via painel (Authentication → Users → "Invite user" ou "Add user").

**Passo 2** — Rodar este SQL para atribuir a role (substituir o email se necessário):

```sql
update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
                           || '{"role": "wide_studio"}'::jsonb
 where email = 'pelimotionart@gmail.com';
```

**Passo 3** — Verificar que funcionou:

```sql
select email, raw_app_meta_data
  from auth.users
 where email = 'pelimotionart@gmail.com';
```

Deve aparecer `{"role": "wide_studio"}` na coluna `raw_app_meta_data`.

> **Atenção:** Depois de atualizar `app_metadata`, o usuário precisa fazer logout e login novamente para o token JWT refletir a mudança.

---

### BLOCO 4 — Teste rápido pós-setup (opcional, antes da sessão de IA)

1. Abrir `https://wide-api-ilgmz.bunny.run/health` no browser → deve retornar `{"ok":true}`
2. Fazer login em `/login` com `pelimotionart@gmail.com`
3. Acessar `https://studio.pelimotion.art` (ou o caminho local do frontend) → deve abrir o Studio sem redirecionar para /login
4. Abrir o console do browser — não deve ter erros JavaScript

Se tudo passar, a próxima sessão de IA pode iniciar o teste do pipeline completo.

---

## 🎯 PRÓXIMA SESSÃO (histórico) — PR 5

```markdown
[AI_AGENT_BRIEFING.md carregado automaticamente]

---

# Context: wide-image-studio-agent

📋 STATUS ANTERIOR
PRs 1–4 completos. Edge script no ar em https://wide-api-ilgmz.bunny.run.
/health retorna {"ok":true}. Todos os endpoints retornam 501 (stubs).
DNS de pelimotion.art vai direto para Vercel — frontend chama bunny.run diretamente.
DB schema Supabase: wide_jobs + RLS (ainda não aplicado no Supabase dashboard).

🎯 TAREFA DESTA SESSÃO
PR 5 — criar edge-script/src/tiling-math.ts

📦 ARQUIVOS RELEVANTES
- presets/displays.json — math exata dos 3 presets (fonte de verdade)
- .claude/skills/wide-image/SKILL.md — seção "Math do tiling"
- edge-script/src/index.ts — onde tiling-math será importado pelo /start e /approve-master

📦 O QUE CRIAR
- edge-script/src/tiling-math.ts — funções puras:
  - loadPreset(presetKey) → DisplayPreset
  - computeTilePositions(preset) → TilePosition[]
  - buildOverlapMasks(preset) → OverlapMask[]
  - estimateCost(preset) → number
  Sem dependências externas. Zero side effects. Testável isoladamente.

⏸️ Prosseguir?
```

---

## 🔑 DECISÕES ARQUITETURAIS

| Data | Decisão |
|---|---|
| 2026-05-19 | Edge Rule descartada — DNS de pelimotion.art aponta para Vercel. Frontend usa `wide-api-ilgmz.bunny.run` diretamente |
| 2026-05-19 | Build: `deno run -A build.mjs` com `esbuild-deno-loader` (resolve imports de URL esm.sh/jsr:) |
| 2026-05-19 | Bunny Edge usa `BunnySDK.net.http.serve()`, não `addEventListener("fetch")` |
| 2026-05-18 | 5 tiles 21:9 a 3072×1320, 35% overlap, master = Seedream 5 Lite, tiles = Nano Banana Pro |
| 2026-05-18 | Auth = Supabase role `wide_studio` em `app_metadata` |
| 2026-05-18 | Zero-storage: nenhum byte de mídia hospedado nos nossos serviços |

---

## 🚀 DEPLOY LOG

| Data/Hora UTC | Script ID | Bundle | Status | Endpoint |
|---|---|---|---|---|
| 2026-05-19T03:20 | 75395 | 7KB | ✅ Live | https://wide-api-ilgmz.bunny.run |

---

**Última atualização:** 2026-05-19
