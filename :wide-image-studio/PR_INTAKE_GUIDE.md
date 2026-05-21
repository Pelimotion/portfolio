# Guia de aplicação — PRs 1, 2 e 3
**wide-image-studio · scaffold inicial**

Três commits lógicos independentes. Cada um pode ser revisado e mergeado separadamente. Recomendado fazer em sequência no mesmo dia para o subprojeto sair pronto para PR 4 (edge script).

---

## PR 1 — Scaffold base do subprojeto

**Objetivo:** criar a estrutura de pastas, atualizar o CLAUDE.md raiz, definir presets e .env.example. Nenhuma dependência instalada ainda.

**Branch sugerida:** `feat/wide-image-studio-scaffold`

**Arquivos:**
- `CLAUDE.md` (raiz) — substituir pela versão atualizada (`CLAUDE_root_updated.md`)
- `wide-image-studio/README.md`
- `wide-image-studio/.gitignore`
- `wide-image-studio/.env.example`
- `wide-image-studio/presets/displays.json`
- `wide-image-studio/presets/styles.json`
- `wide-image-studio/public/.gitkeep`
- `wide-image-studio/edge-script/.gitkeep`

**Commit message sugerida:**
```
feat(wide-image-studio): scaffold subprojeto de geração ultra-wide

- Estrutura base de pastas (public, edge-script, db, presets)
- Presets de display (10137x1320 e variantes draft/high-detail)
- CLAUDE.md raiz: nova linha na tabela de subprojetos (v1.2)
- .env.example com variáveis do edge script
```

**Como aplicar:**
```bash
cd ~/repos/pelimotion
git checkout -b feat/wide-image-studio-scaffold
# Copiar arquivos desta entrega para o repo
cp /caminho/output/CLAUDE_root_updated.md ./CLAUDE.md
cp -r /caminho/output/wide-image-studio ./
git add CLAUDE.md wide-image-studio/
git commit -m "feat(wide-image-studio): scaffold subprojeto de geração ultra-wide"
git push -u origin feat/wide-image-studio-scaffold
```

---

## PR 2 — Agente Claude Code (CLAUDE.md + Skills DEV)

**Objetivo:** ensinar o Claude Code dentro deste subprojeto a operar nele. Instala Skill custom + define slash commands + scripts utilitários.

**Branch sugerida:** `feat/wide-image-studio-agent`

**Pré-requisito:** PR 1 mergeado.

**Arquivos:**
- `wide-image-studio/CLAUDE.md` (do subprojeto)
- `wide-image-studio/.claude/skills/wide-image/SKILL.md`
- `wide-image-studio/.claude/commands/verify-setup.md`
- `wide-image-studio/.claude/commands/deploy-edge.md` (stub)
- `wide-image-studio/scripts/install-hf-skills.sh`
- `wide-image-studio/scripts/verify-setup.sh`

**Após mergear, rodar uma vez:**
```bash
cd wide-image-studio
chmod +x scripts/*.sh
./scripts/install-hf-skills.sh   # instala Higgsfield CLI + Skills oficiais
hf login                          # OAuth Higgsfield
./scripts/verify-setup.sh        # valida tudo
```

**Commit message sugerida:**
```
feat(wide-image-studio): CLAUDE.md do subprojeto + Skills DEV

- CLAUDE.md específico (<200 linhas, regras locais)
- Skill custom "wide-image" para Claude Code DEV-time
- Slash command /verify-setup
- Scripts de instalação Higgsfield CLI + Skills oficiais
```

---

## PR 3 — Schema Supabase (wide_jobs + RLS + Realtime)

**Objetivo:** preparar o banco. Tabela com state machine, RLS por role `wide_studio`, Realtime habilitado, credenciais HF criptografadas via pgsodium.

**Branch sugerida:** `feat/wide-image-studio-db`

**Pré-requisito:** PR 1 mergeado (não depende do PR 2).

**Arquivos:**
- `wide-image-studio/db/migrations/001_wide_jobs.sql`
- `wide-image-studio/db/policies/wide_jobs_rls.sql`
- `wide-image-studio/db/seed/wide_studio_role.sql`
- `wide-image-studio/db/seed/hf_credentials_table.sql`
- `wide-image-studio/db/README.md`

**Como aplicar:**
```bash
# via Supabase CLI (recomendado)
cd wide-image-studio/db
supabase db push

# OU via SQL Editor do dashboard, na ordem:
# 1. seed/wide_studio_role.sql
# 2. migrations/001_wide_jobs.sql
# 3. policies/wide_jobs_rls.sql
# 4. seed/hf_credentials_table.sql
```

**Atribuir a role à sua conta de equipe:**
```sql
update auth.users
   set raw_app_meta_data = raw_app_meta_data || '{"role": "wide_studio"}'::jsonb
 where email in ('voce@pelimotion.com', 'colega@pelimotion.com');
```

**Commit message sugerida:**
```
feat(wide-image-studio): schema Supabase wide_jobs + RLS + Realtime

- Table wide_jobs com state machine completa
- Custom role "wide_studio" via app_metadata
- RLS: só usuários com role wide_studio veem
- Realtime habilitado para push de updates
- Tabela hf_credentials criptografada via pgsodium
```

---

## Próximos PRs (depois destes)

- **PR 4** — Bunny Edge Script scaffold + esbuild + Edge Rule URL rewrite
- **PR 5** — `tiling-math.ts` compartilhado entre edge e frontend
- **PR 6** — Endpoints `/upload-ref` + `/start`
- **PR 7** — Endpoint `/hf-webhook` (HMAC + Supabase update)
- **PR 8** — Endpoint `/approve-master` (crop master + dispatch tiles)
- **PR 9** — Frontend form do brief + upload UI + Realtime subscribe
- **PR 10** — Frontend stitcher.worker.js + OpenCV.js + download

Avisar quando 1-3 estiverem mergeados que eu sigo com 4-5 no próximo turno.
