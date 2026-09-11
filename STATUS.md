# STATUS — PELIMOTION RAIZ (Landing Page + Admin)
**Fonte única de verdade. Atualizar ao final de cada sessão.**

---

## 📊 SNAPSHOT ATUAL

**Data:** 2026-09-11
**Projeto:** Landing page + Painel Admin Bunny.net
**Status:** ESTÁVEL — limpeza e auditoria concluídas
**Próxima Ação:** Upgrades e melhorias — definir scope na próxima sessão
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
| **Gigantera** (`/gigantera/`) | ✅ Implementado e em Produção | 2026-09-11 |

## 🚧 SUBPROJETO ATIVO

| Subprojeto | Status | Próxima Ação |
|-----------|--------|--------------|
| `/gigantera` | ✅ 4 Pilares implementados | Ajustes de catálogo ou curadoria conforme feedback do artista |

---

## 📝 HISTÓRICO DE SESSÕES

### 2026-09-11 — Implementação da Experiência Gigantera (`/gigantera/`)

**O que foi feito:**
- [x] Scaffold 100% autocontido em `/gigantera/` (Vite + React + TS) com zero risco ou alteração nas rotas do site principal
- [x] Pilar 1: Shader OGL de cáusticas com refração de Snell-Descartes e atenuação por profundidade
- [x] Pilar 2: Navegação cimática de Chladni com partículas reativas e sintetizador Tone.js acoplado
- [x] Pilar 3: Scroll hidrodinâmico com Lenis e correnteza horizontal entre peças do mesmo estrato
- [x] Pilar 4: Transições por erosão física de ruído procedural com eixos dinâmicos da tipografia Fraunces
- [x] **Fase 6 — Obras Reais do Artista:** Curadoria estratégica do acervo `Pipeline Gigantera` (Espinhaço, Zimbro e Notalgia) distribuídas nos 3 estratos oceânicos
- [x] Acessibilidade: Modo "Água Parada" (prefers-reduced-motion e toggle manual) e mapa semântico para leitores de tela
- [x] Testes no browser automatizados: navegação funcional e integridade absoluta do site raiz confirmada

**Arquivos criados:** `/gigantera/**` (código fonte, shaders, assets, obras reais, build)
**Arquivos modificados:** `STATUS.md`

---

### 2026-09-11 — Auditoria + Limpeza Organizacional

**O que foi feito:**
- [x] Auditoria completa da estrutura de pastas e estado do git
- [x] 7 arquivos `.md` de planejamento movidos da raiz → `.planning/docs/`
- [x] 3 arquivos `.sql` movidos da raiz → `scripts/database/`
- [x] `.gitignore` atualizado: `Site Antigo/`, `scratch/` adicionados; espaços indevidos corrigidos
- [x] `STATUS.md` atualizado
- [x] ⚠️ **PENDENTE:** `git add -A && git commit` para registrar deleções de `felipe-workspace/`, `wide-image-studio/`, `projetos-backup/` (confirmar antes)

**Arquivos modificados:** `.gitignore`, `STATUS.md`
**Arquivos movidos:** 7 docs → `.planning/docs/`, 3 SQLs → `scripts/database/`

---


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

