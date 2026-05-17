# STATUS — PROJETOS-APP (Gerenciador Interno)
**Fonte única de verdade. Atualizar ao final de cada sessão.**

---

## 📊 SNAPSHOT ATUAL

**Data:** 2026-05-17
**Projeto:** Gerenciador interno — React + Vite + Supabase
**Status:** BETA — funcional, em expansão
**Próxima Ação:** Ver seção PRÓXIMA SESSÃO abaixo
**Bloqueadores:** Nenhum
**Auth:** ✅ Supabase Auth (email+senha), roles via `profiles.role`

---

## 🗺️ PROGRESSO POR MÓDULO

| Módulo | Status | Última Sessão |
|--------|--------|--------------|
| Kanban de projetos | ✅ Funcional | 2026-05-16 |
| Detalhe de cenas | ✅ Funcional | 2026-05-16 |
| Daily log por cena | ✅ Funcional | 2026-05-16 |
| Dashboard financeiro | ❌ Não iniciado | — |
| Calendário editorial (integração blog-generator) | ❌ Não iniciado | — |
| Aprovação de conteúdo (vagas, editais) | ❌ Planejado | — |

---

## 📝 HISTÓRICO DE SESSÕES

### 2026-05-16 — Build e runtime errors corrigidos
**O que foi feito:**
- [x] JSX syntax errors em `UniversalEntityPage` corrigidos
- [x] ReferenceErrors de variáveis undefined resolvidos
- [x] Kanban e dashboard views funcionais

**Arquivos modificados:** componentes React (ver git log)

---

## 🎯 PRÓXIMA SESSÃO

```markdown
[AI_AGENT_BRIEFING.md carregado automaticamente]

---

# Context: projetos-app-agent

📋 STATUS ANTERIOR
Kanban funcional. Auth Supabase ativo. Dashboard view existe mas sem dados financeiros.
Runtime errors de JSX corrigidos na última sessão.

🎯 TAREFA DESTA SESSÃO
[DESCREVER AQUI — ex: implementar dashboard financeiro, integrar calendário editorial, etc.]

📦 ARQUIVOS RELEVANTES (ler apenas os necessários)
- `src/` — componentes React
- `src/components/` — UI components
- `src/pages/` — views principais
- Supabase schema: `projects`, `scenes`, `daily_log`, `profiles`

📦 COMANDOS
npm run dev    # porta 5173
npm run build  # gera dist/

⏸️  Prosseguir?
```

---

## 🚨 BLOQUEADORES ATIVOS

_Nenhum bloqueador no momento._

---

## 📚 DECISÕES ARQUITETURAIS

### Isolamento React
- Único projeto React do ecossistema — não importar lógica daqui para projetos Vanilla
- Auth via Supabase diretamente (não usa shared/auth.js do root — incompatível com módulos ES + React)
- Build output em `projetos-app/dist/`

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

**Última atualização:** 2026-05-17

---

## 🚀 DEPLOY LOG

| Data/Hora UTC | Operador | Projeto | Status |
|---|---|---|---|

