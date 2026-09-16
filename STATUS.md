# STATUS — PELIMOTION RAIZ (Landing Page + Admin + Gigantera)
**Fonte única de verdade. Atualizar ao final de cada sessão.**

---

## 📊 SNAPSHOT ATUAL

**Data:** 2026-09-16 (manhã)
**Projeto:** Pelimotion (Landing page + Admin + Ecossistema Gigantera)
**Status:** ESTÁVEL, BLINDADO & ONLINE — Experiência Mobile Totalmente Reformulada (FOV Adaptativo, Thumb Dock 2.0, Raycasting Touch, Pinch-to-zoom e CD POV Tátil) | Build e Deploy Vercel em Produção Validados
**Próxima Ação:** Teste de usabilidade pelo usuário em dispositivos móveis online
**Bloqueadores:** Nenhum (Zero-Bandwidth CDN ativa e build de produção sem erros)
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
| **Gigantera** (`/gigantera/`) | ✅ Versão Mobile de Alta Fidelidade + FOV Adaptativo + Dock 2.0 + Pinch Zoom | 2026-09-16 |
| **Documentação Master** (`README.md` & `ARCHITECTURE.md`) | ✅ Atualizada para Líderes Técnicos & Diretores | 2026-09-13 |

---

## 📝 HISTÓRICO DE SESSÕES

### 2026-09-16 (manhã) — Reformulação Master da Versão Mobile do Gigantera & Deploy em Produção
**O que foi feito:**
- [x] **FOV Vertical Adaptativo Dinâmico:** Câmera Three.js ajusta o campo de visão dinamicamente de 55° até 74° em telas retrato (`aspect < 1.0`), preservando a magnitude arquitetural, skylights e reflexos no piso em celulares sem distorção.
- [x] **Mobile Bottom Dock 2.0 (Thumb Zone):** Interface inferior ergonômica com strip de setores no topo (`1 · SOM`, `2 · VÍDEOS`, `3 · STILLS`), stepper central com botão `VER [⌕]`, botões rápidos de utilitários (`GIRO`, `CD`, `ACERVO`, `GUIA`) e gaveta tátil (*bottom sheet*) com carrossel snap de obras e tracklist das 17 faixas de áudio com reprodução direta.
- [x] **Interação Tátil 3D Direta (Raycasting Touch):** Toques na tela (`onTouchTap`) projetam coordenadas NDC diretamente para vitrines suspensas, chão, estação de escuta e faixas do CD Jewel Case sem depender do mouse.
- [x] **Pinch-to-Zoom e Gestos Táteis no CinemaView:** Implementado zoom por pinça com dois dedos de 0.85x a 3.5x, toque duplo para lupa analítica 300% e swipe lateral para pranchetas de still.
- [x] **Ergonomia e Eliminação de Resquícios Desktop:** Tela inicial de entrada, modal de guia e POV do CD 3D substituíram atalhos de teclado (WASD, E, TAB, R, mouse) por convenções táteis nativas e botões de toque dedicados. Bloqueio definitivo de `requestPointerLock` em mobile.
- [x] **Validação, Build e Deploy Online:** Build limpo com zero erros TypeScript (`npm run build`), atualização dos scripts de empacotamento estático e deploy sincronizado na Vercel em produção (`https://www.pelimotion.art/gigantera`).

---

### 2026-09-16 (madrugada) — Setores Frontais, HUD TV (Médio/Alto), Tutorial Dark, Sobre/Contato e Raycasting Contínuo
**O que foi feito:**
- [x] **Navegação Frontal nos Setores (1, 2 e 3):** Corrigido o ângulo de visão e coordenadas do `warpToSector` para que o visitante caia exatamente de frente para a obra/vitrine correspondente ao invés de vê-la de perfil ou de lado.
- [x] **HUD de Qualidade Gráfica com Ícone de TV:** Simplificado o controle de gráficos para 2 opções objetivas (**Médio** e **Alto**), removido o contador de FPS e adicionado o ícone minimalista de TV (`Tv` do lucide-react), com background escuro idêntico aos demais elementos do menu superior.
- [x] **Remoção de Callouts de Mira e Elementos Verdes:** Eliminada a mensagem intrusiva de clique para ativar a mira e removido qualquer traço, borda ou stroke verde, mantendo a paleta sofisticada em tons neutros, titânio e âmbar.
- [x] **Tutorial Inicial Redesenhado:** O modal de guia de controles foi totalmente redesenhado no padrão de design system do site (vidro fosco fumê escuro, bordas finas translúcidas, tipografia Manrope e Space Mono, keycaps táteis de alta fidelidade), substituindo os tons bege/cinza.
- [x] **Menu "Sobre / Contato" Transformado em Dossiê do Projeto:** O antigo menu de contato foi expandido para um dossiê conceitual completo com a descrição institucional e curatorial do Gigantera, detalhes de sua gênese transmídia, ficha técnica, localização física na Toca.hub (Florianópolis) e botão direto de contato via WhatsApp.
- [x] **Raycaster Contínuo Durante Movimento:** O sistema de detecção de intersecção das obras agora é avaliado a cada quadro de animação, permitindo que a obra sob a mira do jogador seja realçada ao caminhar (WASD) mesmo se o usuário não mover fisicamente o cursor do mouse.
- [x] **Prevenção de Clipping das Obras com o Piso:** Ajustada a elevação Y de todas as vitrines no pavilhão tridimensional, garantindo espaçamento limpo entre a base das artes e as placas de identificação no piso.
- [x] **Reflexos Realistas de Piso de Concreto:** O refletor do piso foi aprimorado com máscara procedural de imperfeições, granulação mineral e reflexo atenuado, reproduzindo a estética de piso de museu em concreto queimado polido.
- [x] **Validação e Build:** Compilação bem-sucedida (`npm run build`), zero erros no TypeScript e geração dos bundles de produção em `gigantera/assets/`.

---

### 2026-09-15 (noite) — Iluminação Raytracing, Móvel CD Texturizado, Trajeto Serpentino, Atalhos Frontais, Top Bar e Callout de Mira
**O que foi feito:**
- [x] **Iluminação Suave Raytracing (Sem Brancos Estourados):** Corrigido o acúmulo aditivo dos feixes de luz volumétrica (limitado a 3 claraboias selecionadas com opacidades 0.012/0.025 e tom âmbar aquecido). `visitorLight` ajustado para 0.28-0.38 (evitando lavar a cena). `sunLight` ajustado para 0.85-1.05. `floorReflector` calibrado para 0.18-0.22, revelando a textura aveludada do piso de concreto polido.
- [x] **Móvel do CD Texturizado com Luz e Sombra:** Criada a função `createPedestalFurnitureTexture(isLight)` para ripado arquitetural vertical de carvalho ebanizado/concreto grafite com micro-granulação e ambient occlusion. Tampo em bronze champanhe escovado. Adicionado `cdSpotLight` dedicado sobre a estação de CD com sombras físicas suaves.
- [x] **Trajeto Serpentino Intercalado:** Espaçamento longitudinal expandido para 10.0m entre obras e 14.0m no portal de transição. As obras alternam estritamente esquerda e direita (sem emparelhamento), inclinadas a 0.20-0.22 radianos para receber o visitante em um fluxo orgânico em S.
- [x] **Atalhos Frontais por Seção:** `warpToSector(sectorId)` atualizado para planar e orientar a câmera diretamente de frente para a peça primária de cada setor (Setor 1 na Estação de CD; Setor 2 na 1ª obra de vídeo; Setor 3 na 1ª obra still).
- [x] **Top Bar de Alta Legibilidade:** `.header-quality-control` com fundo escuro fosco reforçado (`rgba(10, 14, 12, 0.88)`), contador de FPS em 11.5px bold `#ffffff` com dot esmeralda vibrante, botões com 10.5px bold e suporte completo a tema claro.
- [x] **Callout de Mira e Controle (Hero → Docked) com Auto-Dismiss:** Callout com ícone reticular `[+]` e mouse com clique animado. Inicia em destaque central inferior (`bottom: 110px`), desce suavemente para o dock (`bottom: 82px`) ao ser clicado, e se auto-destrói após 20 segundos para manter a visão desimpedida.
- [x] **Validação:** `tsc --noEmit` com 0 erros, build em 363ms.

---

### 2026-09-15 (tarde) — 4 Melhorias de UX: Keycaps, Cursor, Single-Click, Tutorial
**O que foi feito:**
- [x] **Keycaps Hiper-Realistas (T1):** Redesenho completo da classe `.keycap` com morfologia de tecla mecânica real — gradiente vertical côncavo, bevel de luz, borda inferior sólida (`border-bottom: 2px solid`) e efeito `:active` que afunda a tecla 2px simulando o clique tátil. Variantes `.keycap-sm` e `.keycap-xs` atualizadas para herdar a morfologia sem overrides de `!important`.
- [x] **Cursor Grab Inteligente no CinemaView (T2):** Estado local `cursorStyle: 'grab' | 'grabbing' | 'default'` adicionado ao `CinemaView.tsx`. Cursor muda para `grabbing` ao pressionar o botão do mouse na área da obra e retorna para `grab` ao soltar. Ao hover sobre botões e elementos de UI do cinema, o cursor muda para `default`/`pointer`. CSS garante que `button`, `a`, `kbd` dentro do viewport sempre usem `cursor: pointer !important`.
- [x] **Mira com Single-Click (T3):** Corrigido o `playerController.ts` — `prevMouseX/Y` inicializado como `-1` (estado "nunca inicializado") em vez de `0`. Adicionada flag `hasClickedCanvas` que marca intenção do usuário. Após o primeiro clique no canvas, o delta do mouse é rastreado continuamente (sem exigir segurar o botão). Ao receber Pointer Lock, `prevMouseX/Y` é resetado para `-1` para evitar salto inicial de câmera.
- [x] **Tutorial Integrado com Saída de 2s (T4):** `IntroSequence.tsx` agora contém bloco de controles inline (WASD 2x2, mouse look, `E` interagir, `TAB` acérvo) usando as novas keycaps mecânicas. Delay de dismiss atualizado para 2000ms. CSS `.intro-spatial-overlay` atualizado para `transition: 2s cubic-bezier(0.16,1,0.3,1)` com `translateY(40vh)` no estado `.is-gliding-down`.
- [x] **Validação e Build:** `npx tsc --noEmit` (0 erros) + `npm run build` (368ms, limpo) + commit + push → deploy automático no Vercel.

**Commit:** `b14ca52` feat(gigantera): hyper-realistic keycaps, grab cursor in cinema, single-click mouse look, integrated tutorial with 2s exit

---

### 2026-09-15 — Aceràvo 3D In-Scene, Matriz 4x2 com Reflexos e Otimizações de UX
**O que foi feito:**
- [x] **Acervo 3D In-Scene no Mesmo Ambiente (TAB):** O modo Acervo agora ocorre 100% dentro do pavilhão tridimensional, eliminando escurecimento de fundo e desfoque. A câmera desliza suavemente para a posição frontal panorâmica `(0, 0.6, 9.5)`.
- [x] **Coreografia Espacial das Vitrines em Matriz 4x2:** As vitrines do pavilhão se movem do corredor e se organizam em uma grade frontal suspensa em `z = 0` com reflexos espelhados no chão de vidro (`floorReflector`), reproduzindo com fidelidade a simulação curatorial.
- [x] **Desativação de Mira e Liberação do Cursor do Mouse:** O Pointer Lock é liberado e o retículo central é ocultado no Acervo. O visitante navega livremente com o cursor do mouse sem precisar andar nem mirar.
- [x] **Raycasting 3D com Elevação Tátil:** Passar o mouse sobre as vitrines da grade eleva a peça no eixo Z (`z += 0.35m`), escala (`1.03x`), toca som de tick procedimental e um clique direto abre o modo `CinemaView`.
- [x] **Interface de Portfólio Artístico Completo:** Adicionada barra de filtros brutalistas (`TODAS AS OBRAS [26]`, `STILL [6]`, `VÍDEO [3]`, `SOM [17]`), gaveta de áudio com as 17 faixas autorais e botões de portfólio (`[BIO / ARTISTA]`, `[MEDIA KIT]`, `[SALA 3D (TAB)]`).
- [x] **Correções Críticas de UX no CinemaView e Pavilhão:**
  - Corrigido o botão de fechar do `CinemaView` para impedir que abra a tela de contato acidentalmente.
  - Eliminada a linha/corte na moldura preta das obras via ajustes de renderOrder, z-offset e gradiente radial.
  - Teclas numéricas `[1]`, `[2]`, `[3]` ativadas para navegação direta entre setores.
  - Removido minitutorial duplicado do canto direito.
- [x] **Validação e Build:** `npm run build` e `npx tsc --noEmit` executados e validados com 100% de sucesso.

**Próxima Sessão (Demandas Registradas pelo Usuário):**
1. **Cursor Criativo/Inteligente no CinemaView:** Visual de mão de arrasto para orbitar perspectiva da obra com chaveamento inteligente para ponteiro comum sobre botões e menus.
2. **Correção do Clique para Mira (Single-Click):** Ativação imediata do modo de olhar livre com o movimento do mouse a partir de um único clique (sem exigir clique-e-arraste).
3. **Tutorial Inicial Integrado com Saída Elegante:** Aumentar tempo de tela segundo boas práticas, integrar o minitutorial central inferior no card inicial e animar a transição com saída de 2s e deslocamento do badge para o rodapé.
4. **Keycaps Físicas Hiper-Realistas:** Redesenhar visualmente todos os atalhos de teclado (`[TAB]`, `[E]`, `[1]`, `[2]`, `[3]`, `[WASD]`, `[ESPAÇO]`, `[ESC]`) com estética mecânica tátil realista.

---

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

