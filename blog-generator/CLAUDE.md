@../AI_AGENT_BRIEFING.md
@STATUS.md

# AGENTE: BLOG GENERATOR
**Última atualização:** 2026-05-17 | **Status:** EM DESENVOLVIMENTO ATIVO

---

## O Que Este Projeto Faz
CMS interno para geração de conteúdo assistida por IA.
- **Hoje:** artigos de blog com pipeline completo (Estratégia → Outline → Texto → Imagens → Publicação)
- **Roadmap:** social media, newsletter, vagas, eventos

---

## Stack
| Camada | Tecnologia |
|--------|-----------|
| Frontend CMS | Vanilla HTML/CSS/JS (`cms.html`) |
| Build Engine | Node.js (`index.js`) — gera HTML estático |
| IA | Vertex AI: Gemini 2.5 Pro/Flash + Imagen 3.0 |
| DB | Supabase: `blog_posts`, `blog_images`, `post_images`, `content_presets` |
| CDN | Bunny.net (`pelimotion-portfolio.b-cdn.net`) |
| API | Vercel Serverless Functions (`/api/blog/*`) |

---

## Arquivos Críticos (ler nesta ordem ao iniciar sessão)
1. `cms.html` — toda a UI e lógica do CMS (v6.0, ArticleSession Engine)
2. `index.js` — build engine que gera HTML estático publicado na Vercel
3. `api/blog/posts.js` — endpoint de salvamento/leitura de posts
4. `api/blog/generate-image.js` — geração de imagens via Imagen 3.0
5. `api/blog/guidelines.js` — presets de IA (Tom de Voz, Estrutura, Visual)

---

## Arquitetura de Dados (v6.0)
```
blog_posts          ← post principal (slug, title, content, status, meta_title, data jsonb)
  └── post_images   ← pivot relacional (post_id, image_id, role, position, placeholder_id)
        └── blog_images ← biblioteca de imagens (slug, url CDN, prompt, alt_text)
content_presets     ← diretrizes de IA (strategy, outline, writing, visual)
topic_library       ← inteligência de temas (hype_score, platforms, trend_data)
generation_queue    ← fila de geração automática
```

## Fluxo de Dados Principal
```
CMS → POST /api/blog/posts → Supabase → Vercel Build (index.js) → Static HTML → CDN
```

## Pipeline de Conteúdo no CMS
```
Stage 01: STRATEGY   — keyword + IA + trending angles
Stage 02: STRUCTURE  — outline H2/H3 + AI
Stage 03: CONTENT    — markdown editor + AI section-by-section
Stage 04: VISUAL     — slot manager (drag & drop, generate, library)
Stage 05: CONFIGS    — presets library
Stage 06: CHECKLIST  — verificação final antes de publicar
```

---

## Bugs Ativos
| ID | Severidade | Status | Descrição |
|----|-----------|--------|-----------|
| BUG-01 | CRÍTICO | ✅ RESOLVIDO | `savePost()` enviava estrutura aninhada errada para Supabase |
| BUG-03 | CRÍTICO | ✅ RESOLVIDO | Placeholders `[img-N]` não eram injetados no Markdown |
| BUG-04 | CRÍTICO | ✅ RESOLVIDO | Presets não conectados às chamadas de IA |
| BUG-RLS | P1 | ✅ RESOLVIDO | Migração de imagens legadas concluída com sucesso |

---

## O Que NÃO Tocar
- `/blog/**` — gerado pelo build engine, nunca editar manualmente
- `node_modules/`
- `.env`
- `_technical_audit/` — apenas referência histórica

---

## Comandos Úteis
```bash
# Gerar build local e testar
node index.js

# Rodar migração de imagens legadas (exige SUPABASE_SERVICE_ROLE_KEY no .env)
node ../scripts/database/migrate_images.js

# Deploy
git add . && git commit -m "feat: ..." && git push origin main
```

---

## STATUS — Histórico de Sessões

### 2026-05-16 — Reconstrução FASE 0 + FASE 1 (GENERATOR_REBUILD_PLAN.md)
**Arquivos criados:**
- `/api/blog/config.js` — endpoint que expõe SUPABASE_URL + SUPABASE_ANON_KEY para o frontend (sem hardcode)
- `/shared/auth.js` — módulo ES com `requireAuth()`, `signOut()`, `signIn()`, `getClient()` via Supabase Auth
- `/login/index.html` — página de login dark/editorial com email+senha (Supabase Auth)

**Arquivos modificados:**
- `cms.html` → v7.0: auth guard Supabase (sem PIN), mapeamento correto p.data.*, toast system, auto-save 30s, word count live, meta char count, Content Score, Stage 00 Research Engine, logout, indicador de save
- `api/blog/posts.js` → GET response agora inclui `id` no nível raiz
- `vercel.json` → rotas `/login` e `/blog-generator` adicionadas

**Bugs resolvidos nesta sessão:**
- PIN "0101" hardcoded removido completamente
- `loadPosts()` e `openPost()` corrigidos para usar `p.data.*` (era `p.*`)
- `p.id` agora existe no GET response (era ausente)
- `alert()` substituído por toast system não-bloqueante
- Auto-save agora chama Supabase (não apenas localStorage)

**Próxima sessão:** FASE 2 (Research Engine aprofundado — Gemini web search), FASE 3 (Prompt Compiler + Anti-IA Pass), FASE 4 (Visual Engine coeso), FASE 7 (Auto Mode Cron).

### 2026-05-16 — Governança e Estratégia de Ecossistema
- Implementada arquitetura de agentes federados (CLAUDE.md por subprojeto)
- Criado STANDARDS.md e design-tokens.json globais
- Migração de imagens legadas (JSONB → Relacional) concluída com service_role key
- Build Engine sincronizado com novos dados relacionais
