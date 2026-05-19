# wide-image-studio — agente local
**Versão:** 0.1 | **Status:** EM DESENVOLVIMENTO ATIVO

> Este arquivo é o briefing do agente Claude Code **quando trabalhando dentro de `/wide-image-studio/`**. Mantido <200 linhas (recomendação oficial Anthropic para CLAUDE.md).

---

## O que este subprojeto é
Feature interna do Pelimotion: gerador de imagens ultra-wide (display 10137×1320 e variantes) com pipeline tiled diffusion via Higgsfield. **Uso restrito a equipe interna** (role `wide_studio` no Supabase).

## Regra mais importante
**Zero-storage:** nenhum byte de mídia (refs de entrada ou outputs gerados) é hospedado nos nossos serviços. Cliente → Higgsfield → cliente, com Bunny Edge Script só fazendo passthrough em streaming. Se você (agente) propor qualquer código que persista imagem em Supabase Storage / Bunny Storage / disco local, **pare e pergunte primeiro**.

## Arquitetura em uma frase
Browser carrega refs via stream passthrough Bunny Edge → Higgsfield gera master + 5 tiles e avisa via webhook → Supabase Realtime push pro browser → browser baixa tiles direto do HF e faz stitch local com OpenCV.js WASM → download direto pra máquina do cliente.

## Onde mexer em quê
| Quero alterar... | Vou em... |
|---|---|
| Math do tiling | `edge-script/src/tiling-math.ts` |
| Endpoint do edge | `edge-script/src/{upload-ref,start,approve-master,webhook}.ts` |
| Form do brief | `public/index.html` + `public/js/app.js` |
| Stitcher (OpenCV.js) | `public/js/stitcher.worker.js` |
| Realtime subscribe | `public/js/supabase-client.js` |
| Schema do banco | `db/migrations/00X_*.sql` (nova migration, nunca editar a existente) |
| Presets de display | `presets/displays.json` |
| Presets de estilo | `presets/styles.json` |
| Variáveis de ambiente | `.env.example` (template) + painel Bunny (valores reais) |

## Stack local
- **Backend:** Bunny Edge Scripting (Deno modificado, 128MB RAM, 30s CPU, bundle ≤1MB)
- **Frontend:** Vanilla HTML/CSS/JS — `studio.pelimotion.art` (Pull Zone Bunny)
- **DB:** Supabase Postgres + Realtime + pgsodium (criptografa creds HF)
- **Geração:** Higgsfield REST API v2 (não SDK — REST direto via fetch)
- **Stitch:** OpenCV.js WASM no browser do cliente

## Modelos Higgsfield em uso
- **Master plate:** Seedream 5 Lite (~$0.04, deep-thinking, 14 refs)
- **Tiles:** Nano Banana Pro (~$0.50 × 5, 4K nativo, identity consistency)
- **Consistência:** Soul ID (criar 1× por marca, reutilizar)
- **Correção:** Soul I2I (strength 0.3 em região de costura, fallback)

## Endpoints do edge script
Todos sob `https://wide-api-ilgmz.bunny.run/` (DNS de pelimotion.art vai direto para Vercel — Edge Rule descartada):
- `POST /upload-ref` — proxy stream cliente → HF /v2/files
- `POST /start` — cria job, chama HF master plate
- `POST /approve-master` — crop master + dispatch 5 tiles em paralelo
- `POST /hf-webhook` — recebe notif HF, valida HMAC, update Supabase

## Comandos
- `./scripts/install-hf-skills.sh` — instala Higgsfield CLI + Skills oficiais (1× setup)
- `./scripts/verify-setup.sh` — valida CLI auth, créditos, Skills, deps
- `/verify-setup` (slash) — versão Claude Code do verify
- `/deploy-edge` (slash) — deploy do bundle do edge script para Bunny

## Skills disponíveis (DEV-time)
- **`higgsfield`** (oficial, instalada via `hf skills install`) — ensina como invocar `hf` CLI para criar Soul IDs, testar prompts, comparar modelos.
- **`wide-image`** (custom, neste repo) — orquestra o pipeline 4-fases, monta briefs, valida math do tiling.

## O que NUNCA fazer aqui
- Persistir imagens em qualquer storage nosso (Supabase Storage, Bunny Storage, disco). Zero-storage é lei.
- Subir API key/secret do Higgsfield para o git ou expor no frontend.
- Usar Higgsfield SDK Node v2 dentro do edge script (incompatível com Deno modificado do Bunny — usar `fetch` direto).
- Buffer arquivo inteiro em RAM no edge script. Usar streams (`req.body` direto com `duplex: "half"`).
- Editar migrations já mergeadas; sempre criar nova migration.
- Adicionar Vercel function. Estamos no limite. Tudo novo vai pro Bunny Edge.
- Rodar o pipeline pesado dentro do terminal embedded do Antigravity (risco de suspensão de conta Google). Use terminal standalone.

## Decisões já fechadas (não revisitar sem necessidade real)
- 5 tiles em 21:9 a 3072×1320 com 35% overlap → math em `presets/displays.json`
- Master plate = Seedream 5 Lite; tiles = Nano Banana Pro
- Auth = Supabase Auth com role `wide_studio` em `app_metadata`
- Frontend separado em `studio.pelimotion.art`
- Edge script em `wide-api-ilgmz.bunny.run` (URL direta Bunny — sem Edge Rule)

## Documentos relacionados
- `presets/displays.json` — schemas e math exata
- `db/README.md` — como aplicar migrations
- `../PR_INTAKE_GUIDE.md` (raiz da entrega) — ordem dos PRs
- Planos v1/v2/v3 ficam fora do repo, em pasta de docs.

## Quando duvidar
- "Pode armazenar isso?" → **Não.** Sem exceção.
- "Posso usar Vercel function pra isso?" → **Não.** Sempre Bunny Edge.
- "Posso fazer essa transformação no server?" → Se cabe em 128MB e 30s, sim. Senão, **vai pro browser do cliente via WASM**.
- "Pode dar bypass de auth pra esse endpoint?" → Não. Todo endpoint do edge valida JWT Supabase e checa role `wide_studio`.
