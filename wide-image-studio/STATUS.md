# STATUS — wide-image-studio
**Fonte única de verdade. Atualizar ao final de cada sessão.**

---

## 📊 SNAPSHOT ATUAL

**Data:** 2026-05-19
**Fase:** Edge Handlers (PRs 1–7 completos)
**Status:** EM DESENVOLVIMENTO ATIVO
**Próxima Ação:** PR 8 — `approve-master.ts`
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
| `edge-script/src/approve-master.ts` | ⏳ PR 8 | — |
| `public/` (frontend Studio) | ⏳ PR 9 | — |
| `public/js/stitcher.worker.js` | ⏳ PR 10 | — |

---

## 📝 HISTÓRICO DE SESSÕES

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

## 🎯 PRÓXIMA SESSÃO — PR 5

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
