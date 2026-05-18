# wide-image-studio
**Gerador de imagens ultra-wide via Higgsfield, zero-storage, para uso interno da equipe Pelimotion.**

## O que faz
Gera imagens muito largas (display 10137×1320 e variantes) a partir de um brief, mantendo consistência e detalhe ao longo da largura inteira. Estratégia: master plate baixo-res → 5 tiles 21:9 high-res com referências cruzadas → multi-band blending no browser do cliente.

## Stack
- **Frontend:** Vanilla HTML/CSS/JS, hospedado em `studio.pelimotion.com` (Pull Zone Bunny separada).
- **Backend:** Bunny Edge Scripting, respondendo em `pelimotion.com/wide-api/*` (Edge Rule de URL rewrite).
- **State:** Supabase Postgres + Realtime (table `wide_jobs`, RLS por role `wide_studio`).
- **Geração:** Higgsfield REST API (Soul, Nano Banana Pro, Seedream 5 Lite).
- **Stitch:** OpenCV.js WASM no browser do cliente (zero storage no Pelimotion).

## Zero-storage policy
Nenhum byte de mídia (referências do usuário ou outputs gerados) é hospedado nos serviços Pelimotion. O fluxo é:

- **Refs in:** browser → POST stream → Bunny Edge → passthrough → Higgsfield `/v2/files`.
- **Outputs out:** Higgsfield (URLs temporárias) → browser → OpenCV.js stitch local → `<a download>` na máquina do cliente.

## Acesso
Só usuários autenticados no Supabase com `app_metadata.role = 'wide_studio'`.

## Quickstart (após PR 1, 2 e 3 mergeados)

```bash
# 1. Setup do agente Claude Code (DEV-time)
cd wide-image-studio
./scripts/install-hf-skills.sh
hf login
./scripts/verify-setup.sh

# 2. Aplicar migrations no Supabase
cd db
supabase db push

# 3. Atribuir role à sua conta (SQL editor):
#    update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role": "wide_studio"}'::jsonb
#    where email = 'voce@pelimotion.com';
```

## Próximos passos
Implementação do edge script e frontend nos PRs 4-10. Ver `../PR_INTAKE_GUIDE.md` na raiz da entrega inicial.

## Documentos
- `CLAUDE.md` — agente do subprojeto (regras locais)
- `presets/displays.json` — definições de displays alvo
- `presets/styles.json` — presets de estilo visual
- `db/README.md` — instruções de schema
- `.env.example` — variáveis necessárias para o edge script

## Stack de planos (referência histórica)
Este subprojeto nasceu de 3 iterações de planejamento:
- **v1** — Plano original (CLI standalone). Substituído.
- **v2** — Addendum CLI + Skills (token economy). Parcialmente válido (Skills DEV-time).
- **v3** — Arquitetura web zero-storage. **Plano vigente.**
