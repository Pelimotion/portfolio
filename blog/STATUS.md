# STATUS — BLOG / PORTAL PELIMOTION
**Fonte única de verdade. Atualizar ao final de cada sessão.**

---

## 📊 SNAPSHOT ATUAL

**Data:** 2026-05-17
**Projeto:** Frontend público estático — HTML gerado por `blog-generator/index.js`
**Status:** ESTÁVEL — expandindo para portal completo
**Próxima Ação:** Ver seção PRÓXIMA SESSÃO abaixo
**Bloqueadores:** Nenhum

> ⚠️ REGRA CRÍTICA: Os arquivos `.html` desta pasta são GERADOS automaticamente.
> Para mudar conteúdo ou templates, edite `blog-generator/index.js` (build engine).
> NUNCA edite arquivos gerados diretamente.

---

## 🗺️ PROGRESSO POR SEÇÃO DO PORTAL

| Rota | Status | Última Sessão |
|------|--------|--------------|
| `/blog` (artigos) | ✅ ATIVO | 2026-05-16 |
| `/blog/vagas` | ❌ Placeholder | — |
| `/blog/eventos` | ❌ Planejado | — |
| `/blog/noticias` | ❌ Planejado | — |
| `/blog/recursos` | ❌ Planejado | — |
| SEO (OG, Schema.org, Sitemap) | ✅ v6.0 completo | 2026-05-16 |

---

## 📝 HISTÓRICO DE SESSÕES

### 2026-05-16 — SEO v6.0
**O que foi feito:**
- [x] Open Graph, Twitter Cards, Canonical, Schema.org JSON-LD em todos os posts
- [x] Sitemap.xml gerado automaticamente pelo build engine

**Arquivos modificados:**
- `blog-generator/index.js` (build engine — não os HTMLs gerados)

---

## 🎯 PRÓXIMA SESSÃO

```markdown
[AI_AGENT_BRIEFING.md carregado automaticamente]

---

# Context: blog-portal-agent

📋 STATUS ANTERIOR
Blog estático com SEO completo (OG, Schema.org, sitemap). Artigos publicados via
blog-generator. Seções /vagas, /eventos, /noticias ainda não implementadas.

🎯 TAREFA DESTA SESSÃO
[DESCREVER AQUI — ex: implementar seção /vagas, criar template de eventos, etc.]

📦 ARQUIVOS RELEVANTES
- `blog-generator/index.js` — build engine (editar templates aqui)
- `blog/index.html` — lista de artigos (GERADO — não editar)
- `vercel.json` — rotas do portal

📦 COMANDO DE BUILD
node blog-generator/index.js

⏸️  Prosseguir?
```

---

## 🚨 BLOQUEADORES ATIVOS

_Nenhum bloqueador no momento._

---

## 📚 DECISÕES ARQUITETURAIS

### Blog 100% estático
- Zero banco de dados em runtime — tudo gerado em build time
- Conteúdo vem do Supabase `blog_posts` → HTML estático via `blog-generator/index.js`
- Imagens servidas pelo Bunny.net CDN (não commitadas no repo)

### Expansão para portal
- Novas seções (vagas, eventos) usarão o mesmo `blog-generator/index.js`
- Schema universal: mesmo modelo base para todos os tipos de conteúdo

---

## 🔄 TEMPLATE DE ATUALIZAÇÃO

```markdown
### [DATA] — Sessão N: [TÍTULO]
**O que foi feito:**
- [x] Item completado

**Arquivos modificados:** [lista — build engine, não os gerados]
**Próximo passo:** [descrição]
```

---

**Última atualização:** 2026-05-17

---

## 🚀 DEPLOY LOG

| Data/Hora UTC | Operador | Projeto | Status |
|---|---|---|---|

