---
name: wide-image
description: |
  Use this skill when working on the wide-image-studio subproject to orchestrate
  ultra-wide image generation pipelines via Higgsfield. Trigger when the user mentions
  "wide image", "imagem ultra-wide", "display 10137", "panorâmica", "tiled generation",
  "master plate", "stitch tiles", or asks to design/edit briefs, regional prompts,
  tiling math, or the multi-band blending logic. Loads the 4-phase pipeline knowledge
  (brief → master plate → tiles with cross-references → client-side stitch) plus the
  zero-storage policy and Higgsfield REST API patterns specific to this project.
---

# wide-image — orquestrador do pipeline ultra-wide

## Quando usar esta skill
- Editar briefs (`brief.json`), validar contra schema.
- Calcular ou ajustar tiling math (`tiling-math.ts`) para um novo display preset.
- Construir prompts regionais para os 5 tiles a partir do master_prompt.
- Implementar / debugar endpoints do edge script (upload-ref, start, approve-master, webhook).
- Implementar / debugar stitcher client-side (OpenCV.js WASM).
- Criar Soul IDs e gerenciar consistência visual.
- Estimar custo de um job antes de disparar.

## Pipeline em 4 fases

### Fase 0 — Brief
Input canônico em `brief.json`. Campos críticos:
- `display.preset` → chave em `presets/displays.json`
- `scene.master_prompt` → descrição global da cena inteira
- `consistency.seed` → semente para reproducibilidade
- `consistency.soul_id` → opcional, trava identidade visual
- `regions[]` → 1 entrada por tile, com `focus` regional
- `quality` → master_model, tile_model, overlap_pct (override do preset)

Validação: `node edge-script/src/validate-brief.ts <path>`. Falha-fast se schema inválido.

### Fase 1 — Master plate
Uma imagem 21:9 baixa-res que serve de blueprint global. Cada tile depois recebe um **crop dessa imagem** como reference image principal — é o que dá coerência cross-tile.

Modelo: **Seedream 5 Lite** (~$0.04, 14 refs, deep-thinking).
Resolução: matching da proporção dos tiles (21:9 → 3072×1320 ou 2048×880 para draft).

**Checkpoint humano OBRIGATÓRIO:** depois do master pronto, parar e mostrar pro usuário. Se ele rejeita, regerar com novo seed (+1) — gastou $0.04 em vez de $3.00.

### Fase 2 — Tiles
5 tiles em paralelo (dispatch sem await, webhook traz resultado).

Cada tile recebe **três contextos** (anti-drift):
1. **Crop do master plate** correspondente à região (reference image #1)
2. **Soul ID** (se houver) — trava identidade visual
3. **Refs do usuário** — append em `reference_images`

Prompt: `master_prompt + ", " + regions[i].focus + ", maintain continuity with reference image"`.

Seed: `base_seed + i` (vizinhas, não iguais — variação dentro de continuidade).

Modelo: **Nano Banana Pro** @ 4K (~$0.50 × 5).

### Fase 3 — Stitch (no browser, NÃO no edge)
Browser baixa tiles direto das URLs Higgsfield (CORS OK normalmente; fallback proxy se não).

OpenCV.js WASM em Web Worker:
- `cv.detail_MultiBandBlender(false, 5)` — 5 bandas é o sweet spot
- Máscara por tile: ramp linear nas overlap zones (gradient 0→255)
- `feed(tile, mask, point)` para cada
- `blend(dst, dstMask)` no fim
- Crop final pelo `crop_x_start` do preset
- `canvas.toBlob('image/png')` → `<a download>`

## Math do tiling (referência rápida)
Para 10137×1320 com preset padrão:
- 5 tiles em 21:9 a 3072×1320
- Overlap: 1075 px (35%)
- Canvas total: 11.060 px → crop nos 461 px laterais cada lado
- Math completa em `presets/displays.json`

## Higgsfield REST API — endpoints usados
- `POST /v2/files` — upload de arquivo (refs ou crops). Body: stream binário com `content-type` correto.
- `POST /v2/generations` — dispara job. Aceita `webhook.url` e `webhook.secret`. **Sempre usar `idempotency-key`** para evitar dupla cobrança em retry.
- Auth header: `Authorization: Key {API_KEY}:{SECRET}`.

## Anti-patterns (não fazer)
- ❌ Persistir tile em qualquer storage nosso. Zero-storage é regra.
- ❌ Buffer o arquivo inteiro no edge antes de fazer upload pra HF. Usar `body: req.body, duplex: "half"`.
- ❌ Gerar todos os tiles direto sem master plate primeiro. Perde a coerência global.
- ❌ Pular o checkpoint humano após master plate. Vai queimar $3 em jobs que iam dar errado.
- ❌ Usar seeds iguais para todos os tiles. Resultado: 5 tiles idênticos. Use `seed + i`.
- ❌ Tentar stitch no edge script. 128MB não dão.
- ❌ Confundir tile_generation_resolution (4096×1755, gerado pelo HF) com tile_width/height (3072×1320, depois do resize antes do stitch).

## Otimizações
- **Cache de Soul IDs** por hash dos refs. Se já existir, reusa (zero custo).
- **Cache de master plate** por hash do (prompt + seed). Pode gerar 3 variações de tiles com mesmo master.
- **Tiles aprovados taggeados** em `wide_jobs.tile_urls`. Permite re-mix entre jobs (pegar tiles 1,2,4 de job antigo + gerar só 3,5 novos).
- **Pre-flight credit check** via `GET /v2/account/credits` antes do start. Falha-fast se saldo < custo estimado × 1.5.

## Comandos úteis (CLI Higgsfield em DEV)
```bash
hf credits                                    # saldo atual
hf models                                     # lista modelos do plano
hf generate --model seedream-5-lite \
  --prompt "test" --aspect 21:9 --dry-run     # preview de custo sem gastar
hf soul create --name "pelimotion-editorial" \
  --refs ./refs/*.jpg                         # criar Soul ID
hf soul list                                  # lista Soul IDs salvos
```

## Documentos relacionados
- `../CLAUDE.md` — regras gerais do subprojeto
- `../presets/displays.json` — math exata
- `../db/README.md` — schema
- `../.env.example` — variáveis necessárias

## Quando NÃO usar esta skill
- Edição de blog ou geração de artigos → use a Skill do `/blog-generator`
- Tasks de design/branding fora do contexto wide-image
- Setup geral de MCP/Skills (use a Skill `higgsfield` oficial)
