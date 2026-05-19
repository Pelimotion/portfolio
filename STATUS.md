# STATUS — PELIMOTION RAIZ (Landing Page + Admin)
**Fonte única de verdade. Atualizar ao final de cada sessão.**

---

## 📊 SNAPSHOT ATUAL

**Data:** 2026-05-19
**Projeto:** Landing page + Painel Admin Bunny.net
**Status:** ESTÁVEL — sem mudanças pendentes
**Próxima Ação:** Nenhuma na raiz. Subprojeto ativo: `wide-image-studio` (ver abaixo)
**Bloqueadores:** Nenhum
**Auth:** ✅ Unificado — Supabase Auth + `/shared/auth.js` + roles

---

## 🗺️ ESTADO DOS COMPONENTES

| Componente | Status | Última Sessão |
|-----------|--------|--------------|
| Landing page (`index.html`) | ✅ Estável | 2026-05-16 |
| Painel admin (`/admin/`) | ✅ Auth migrado para Supabase | 2026-05-16 |
| Login unificado (`/login/`) | ✅ Funcional | 2026-05-16 |
| Shared auth (`/shared/auth.js`) | ✅ Funcional | 2026-05-16 |
| Shared roles (`/shared/roles.js`) | ✅ Funcional | 2026-05-16 |
| `vercel.json` | ✅ Rotas corretas | 2026-05-16 |
| **Deploy Hub** (`admin-v4.js`) | ✅ Implementado | 2026-05-17 |
| **Media Scanner** (`api/bunny/scan.js`) | ✅ Implementado | 2026-05-17 |

## 🚧 SUBPROJETO ATIVO

| Subprojeto | Status | Próxima Ação |
|-----------|--------|--------------|
| `/wide-image-studio` | ⚙️ PRs 1–10 completos — aguardando teste | Aplicar migrations + configurar Bunny env vars + teste ponta-a-ponta |

> Trabalhar em wide-image-studio: abrir nova sessão Claude Code **dentro de `/wide-image-studio/`** e usar o prompt em `wide-image-studio/STATUS.md → PRÓXIMA SESSÃO`.

---

## 📝 HISTÓRICO DE SESSÕES

### 2026-05-17 — Deploy Hub + Media Scanner + Bug Fixes Admin

**O que foi feito:**
- [x] `admin/admin.js` — bug `download is not defined` corrigido (função `download()` adicionada)
- [x] `admin/admin.js` — CORS corrigido: headers `Cache-Control`/`Pragma` removidos do `getFileSha()`
- [x] `admin/admin.js` — Contact & Social movido de Portfolio Settings → Landing Page
- [x] `admin-v4.js` — Deploy Hub implementado (`showDeployHub()`, `loadDeployStatus()`)
- [x] `admin-v4.js` — Deploy por projeto (`deployProject()`) com update de STATUS.md via GitHub API
- [x] `admin-v4.js` — `softDeploy()` e `fullSync()` implementados (removida versão stub com alert)
- [x] `admin-v4.js` — Media Scanner Bunny.net (`openMediaScanner()`, `renderMediaGrid()`)
- [x] `api/bunny/scan.js` — endpoint serverless criado para listar mídias do storage zone
- [x] STATUS.md de todos os projetos — seção `🚀 DEPLOY LOG` adicionada

**Arquivos criados:** `api/bunny/scan.js`
**Arquivos modificados:** `admin/admin.js`, `admin/admin-v4.js`, `STATUS.md`, `blog/STATUS.md`, `blog-generator/STATUS.md`, `projetos-app/STATUS.md`

---

### 2026-05-16 — Auth Unificado + Roles (raiz)
**O que foi feito:**
- [x] `admin/admin.js` migrado de PIN SHA-256 → Supabase Auth + `profiles.role = 'admin'`
- [x] `admin/index.html` — overlay PIN removido, spinner + email + botão SAIR
- [x] `vercel.json` — rotas `/login`, `/blog-generator` adicionadas
- [x] `shared/auth.js` + `shared/roles.js` criados (usados por todos os subprojetos)
- [x] `login/index.html` — redirect pós-login por role

---

## 🎯 PRÓXIMA SESSÃO

> **Este arquivo é para a raiz (landing + admin). Se a sessão for sobre `wide-image-studio`, use o prompt em `wide-image-studio/STATUS.md`.**

```
[AI_AGENT_BRIEFING.md carregado automaticamente]

# Context: landing-page-agent

📋 STATUS ANTERIOR
Landing e admin estáveis. Auth unificado com Supabase (roles funcionando).
Não há bugs ativos. PIN removido do admin. Deploy Hub e Media Scanner implementados.
Subprojeto wide-image-studio em fase de teste (PRs 1–10 completos) — sessão separada.

🎯 TAREFA DESTA SESSÃO
[DESCREVER AQUI — ex: atualizar seção de portfólio, ajustar design tokens, etc.]

📦 ARQUIVOS RELEVANTES
- `index.html` — landing page principal
- `admin/index.html` + `admin/admin.js` — painel admin
- `admin/admin-v4.js` — Deploy Hub + Media Scanner
- `design-tokens.json` — tokens globais de design
- `vercel.json` — rotas e configuração de deploy
- `shared/auth.js` — auth unificado (cuidado: afeta todos os sistemas)

⏸️  Prosseguir?
```

---

## 🚨 BLOQUEADORES ATIVOS

_Nenhum bloqueador no momento._

---

## 📚 DECISÕES ARQUITETURAIS

### 2026-05-16: Auth unificado via Supabase
- Admin panel migrado de PIN SHA-256 para Supabase Auth
- `shared/auth.js` é o ponto de entrada para todos os sistemas
- Qualquer mudança aqui afeta admin, blog-generator e projetos-app

---

## 🔄 TEMPLATE DE ATUALIZAÇÃO

```markdown
### [DATA] — Sessão N: [TÍTULO]
**O que foi feito:**
- [x] Item completado

**Arquivos modificados:** [lista]
**Próximo passo:** [descrição]
```

---

**Última atualização:** 2026-05-19

---

## 🚀 DEPLOY LOG

| Data/Hora UTC | Operador | Projeto | Status |
|---|---|---|---|

