# STATUS — PELIMOTION RAIZ (Landing Page + Admin + Gigantera)
**Fonte única de verdade. Atualizar ao final de cada sessão.**

---

## 📊 SNAPSHOT ATUAL

**Data:** 2026-09-13
**Projeto:** Pelimotion (Landing page + Admin + Ecossistema Gigantera)
**Status:** ESTÁVEL, BLINDADO & ONLINE — Produção com Bunny.net CDN Zero-Bandwidth
**Próxima Ação:** Manutenção contínua e ampliação curatorial
**Bloqueadores:** Nenhum (Cota da Vercel protegida com 100% da mídia na Bunny CDN)
**Auth:** ✅ Unificado — Supabase Auth + `/shared/auth.js` + roles

---

## 🗺️ ESTADO DOS COMPONENTES

| Componente | Status | Última Sessão |
|-----------|--------|--------------|
| Landing page (`index.html`) | ✅ Estável | 2026-09-12 |
| Painel admin (`/admin/`) | ✅ Auth Supabase + FFmpeg Bunny CDN | 2026-09-12 |
| Login unificado (`/login/`) | ✅ Funcional | 2026-05-16 |
| Shared auth (`/shared/auth.js`) | ✅ Funcional | 2026-05-16 |
| Shared roles (`/shared/roles.js`) | ✅ Funcional | 2026-05-16 |
| `vercel.json` | ✅ Roteamento otimizado sem loops | 2026-09-12 |
| `.vercelignore` & `.gitignore` | ✅ Blindagem Zero-Bandwidth ativa | 2026-09-12 |
| **Gigantera** (`/gigantera/`) | ✅ Em Produção (`pelimotion.art/gigantera`) | 2026-09-13 |
| **Documentação Master** (`README.md` & `ARCHITECTURE.md`) | ✅ Atualizada para Líderes Técnicos & Diretores | 2026-09-13 |

---

## 📝 HISTÓRICO DE SESSÕES

### 2026-09-13 — Documentação Master & Atualização de Graphify
**O que foi feito:**
- [x] **Criação do `README.md` e `ARCHITECTURE.md` na Raiz:** Documentação exaustiva com diagramas Mermaid, especificações de WebGL, topologia de áudio, regras da Bunny CDN e guia passo-a-passo para desenvolvedores sênior e diretores criativos.
- [x] **Atualização de Orquestração (`CLAUDE.md` e `STATUS.md`):** Matriz de subprojetos alinhada à produção atual.
- [x] **Atualização do Grafo de Conhecimento (`graphify`):** Reindexação completa de nós, arestas, AST e comunidades para onboarding autônomo de desenvolvedores.

---

### 2026-09-12 — Resolução Crítica de Cota Vercel & Migração Bunny.net CDN
**O que foi feito:**
- [x] **Diagnóstico da Cota de 9,23 GB / 10 GB:** Identificado consumo de Fast Origin Transfer causado por 17 faixas de áudio MP3 locais e 62 MB de arquivos WebAssembly (`ffmpeg-core.wasm`).
- [x] **Upload Completo na Bunny.net CDN:** Todas as 17 faixas full e 17 previews enviados com suporte a *HTTP Byte-Range Requests (206)* e CORS liberado.
- [x] **Redução de 88,6% do Repositório Git:** Remoção de 133 MB de binários pesados do Git (encolhendo de 149 MB para ~17 MB).
- [x] **Blindagem do `.vercelignore`:** Exclusão rigorosa de `.wasm`, `.mp3`, `.mp4` e pastas de desenvolvimento. Deploy do site agora transfere apenas ~17 MB.
- [x] **Mobile Spatial Experience & Modo Loupe:** Navegação adaptativa com giroscópio, *stepper glide* de visualização e prancheta multi-folha.
- [x] **Garantia de Roteamento Online (`vercel.json`):** Adicionado redirect e rewrites dedicados para `/gigantera` e `/gigantera/` apontando para `/gigantera/index.html` estático, garantindo resolução imediata e sem erro 404 em produção na Vercel (`www.pelimotion.art/gigantera`).
- [x] **Sincronização Online:** Build de produção validado (`tsc && vite build`) e enviado via GitHub para deploy automático na Vercel.

---

### 2026-09-11 — Identidade Visual Brutalista Artística Experimental (`/gigantera/`)

**O que foi feito:**
- [x] **Tipografia Brutalista Escultural:** Pareamento de alto impacto entre `Syne` (800 ultra-pesada experimental), `Fraunces` (com eixos dinâmicos de erosão) e `Space Mono` (telemetria e índices tabulares).
- [x] **Grafismos de Retículo (Viewport Framing):** Quatro cantoneiras heráldicas/técnicas nos cantos do viewport (`┌ ┐ └ ┘`) com coordenadas cartográficas, indicador de taxa de quadros (FPS) e índices de estrato.
- [x] **Régua Batimétrica Vertical Brutalista:** Eixo milimétrico na margem direita com marcas de escala (`0000M` a `4000M`), nós de salto táctil por estrato e agulha de profundidade em tempo real (`[⌖ 0421M]`).
- [x] **Painel de Contexto Brutalista (Ambient Specimen HUD):** Bloco estético de alta legibilidade com vidro fosco escuro, borda de ouro cáustico, índices bracketed (`[STRATUM // 01]`) e telemetria barométrica.
- [x] **Floating HUD Dock Brutalista:** Geometria retangular estrita com cantoneiras em cruz (`+`), medidor com zeros à esquerda (`0421 M`), botões segmentados com preenchimento invertido no hover.
- [x] **Dossier de Inspeção Brutalista (`ErosionModal`):** Dossier de arquivo de espécime com cantoneiras de corte, tabela de suporte/cronologia e botão de retorno escultural.
- [x] **Monólitos 3D Wireframe:** Adicionadas arestas wireframe arquiteturais de 0.38 de opacidade em ouro cáustico em volta de cada moldura monolítica 3D.
- [x] Verificado visualmente no navegador com subagente sem qualquer quebra e integridade 100% preservada no site raiz.

---

### 2026-09-11 — Implementação da Experiência Gigantera (`/gigantera/`)

**O que foi feito:**
- [x] Scaffold 100% autocontido em `/gigantera/` (Vite + React + TS) com zero risco ou alteração nas rotas do site principal
- [x] **Ambiente 3D Oceânico Espacial:** Navegação contínua em Three.js pelo oceano com luz volumétrica, teto cáustico, assoalho basáltico e 9 monólitos físicos reflexivos para as obras
- [x] **Física de Areia nos Cantos da Tela:** Simulação de 2.000 partículas granulares com acúmulo nas quinas e avalanches inerciais reativas à câmera e ao cursor
- [x] **Floating HUD Dock:** Barra flutuante de vidro fosco com profundímetro contínuo em metros e bar, salto de estrato suave e detecção de obras no hover
- [x] **Fase 6 — Obras Reais do Artista:** Curadoria estratégica do acervo `Pipeline Gigantera` (Espinhaço, Zimbro e Notalgia) distribuídas nos 3 estratos oceânicos
- [x] Pilar 4: Transições por erosão física de ruído procedural com eixos dinâmicos da tipografia Fraunces
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

