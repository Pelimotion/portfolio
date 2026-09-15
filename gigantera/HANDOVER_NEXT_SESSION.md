# BRIEFING ESTRATÉGICO DE TRANSIÇÃO — GIGANTERA (PRÓXIMA SESSÃO)
> **Documento mestre de handoff para continuidade autônoma imediata no próximo chat.**
> **Data:** 2026-09-15 | **Branch:** `main` | **Status do Build:** 100% Validado & Deploy Realizado

---

## 🎯 RESUMO EXECUTIVO DA SESSÃO ANTERIOR
Na sessão de 2026-09-15, implementamos com sucesso a arquitetura completa do **Acervo 3D In-Scene** no pavilhão de arte contemporânea digital de Gigantera (`pelimotion.art/gigantera`):
1. **Acervo no Próprio Ambiente 3D**: O modo Acervo (`TAB` ou botão do menu) não sai mais da cena 3D nem aplica desfoque ou escurecimento. A câmera do jogador desliza suavemente para o ponto de vista frontal panorâmico `(0, 0.6, 9.5)`.
2. **Matriz 4x2 com Reflexos de Piso**: As 8 vitrines do pavilhão interpolam do corredor para uma matriz frontal flutuante em `z = 0` com reflexos espelhados ativos no chão de vidro (`floorReflector`), idêntico à simulação enviada pelo usuário.
3. **Desativação de Mira e Cursor Livre**: Retículo central e pointer lock são desativados no acervo. O cursor padrão do mouse fica livre para interagir com o site e as obras.
4. **Raycasting 3D com Elevação Tátil**: Hover sobre as vitrines provoca elevação no eixo Z (`z += 0.35m`), escala dinâmica (`1.03x`), som de tick procedimental e clique direto abre a obra no `CinemaView`.
5. **Portfólio Artístico Completo**: Filtros brutalistas (`TODAS AS OBRAS [26]`, `STILL [6]`, `VÍDEO [3]`, `SOM [17]`), gaveta sonora com as 17 faixas autorais para audição direta e botões institucionais (`[BIO / ARTISTA]`, `[MEDIA KIT]`, `[SALA 3D (TAB)]`).
6. **Correções de UX Prévias**: Fechamento do `CinemaView` blindado (sem redirecionar para contato), corte da moldura preta eliminado, atalhos `[1]`, `[2]`, `[3]` para salto entre setores e remoção de redundâncias de tutoriais.

---

## 🚀 AS 4 TAREFAS ESTRATÉGICAS PRIORIZADAS PARA A PRÓXIMA SESSÃO

O usuário solicitou explicitamente para a próxima sessão as seguintes 4 melhorias:

### 1. Cursor Inteligente e Criativo na Inspeção de Obra (`CinemaView.tsx`)
- **Objetivo**: Ao inspecionar uma obra no modal/cinema, o cursor do mouse deve ser visualmente criativo e expressivo, parecendo uma mão de arrasto (*grab hand*), permitindo orbitar e rotacionar a perspectiva da obra com fluidez, mas também navegar de forma inteligente para os botões da interface.
- **Diretrizes Técnicas**:
  - **Estilização Visual**: Criar cursor temático personalizado (SVG inline de mão brutalista/minimalista estilizada ou cursor CSS tático `grab`/`grabbing`).
  - **Detecção Contextual Inteligente**: Quando o cursor passar sobre a área da obra ou do canvas 3D de inspeção, exibe a mão de arrasto (`cursor: grab`, e ao clicar/arrastar `cursor: grabbing`).
  - **Chaveamento para UI**: Ao aproximar o mouse de elementos interativos (botão `[ESC / FECHAR]`, botão `[MODO LUPA]`, barra de ferramentas superior e dock inferior de pranchetas), o cursor deve transitar suavemente para o ponteiro convencional (`pointer` / `default`), evitando confusão ou sensação de travamento na navegação dos botões.
- **Arquivos-Chave**:
  - `gigantera/src/components/modal/CinemaView.tsx`
  - `gigantera/src/components/canvas/GalleryScene3D.tsx`
  - `gigantera/src/index.css`

---

### 2. Correção da Mira Livre por Clique Simples (Single-Click Mouse Look)
- **Problema Reportado**: Atualmente o usuário relata que precisa clicar e arrastar com o mouse para ativar a movimentação da mira/câmera, em vez de simplesmente dar um único clique no salão e o olhar acompanhar livremente a movimentação contínua do cursor.
- **Diretrizes Técnicas**:
  - Inspecionar `playerController.ts` e o listener `onMouseDown`/`onClick` em `GalleryScene3D.tsx`.
  - Garantir que um clique (`pointerdown` ou `click`) no canvas 3D engaje o `Pointer Lock API` instantaneamente (`document.body.requestPointerLock()`).
  - Quando o Pointer Lock for concedido, `movementX` e `movementY` do evento `pointermove` devem imediatamente rotacionar o `yaw` e `pitch` da câmera em tempo real sem exigir que o botão do mouse permaneça pressionado.
  - Para casos sem pointer lock ou dispositivos com restrição, implementar modo contínuo de tracking com sensibilidade suave e sem necessidade de segurar o botão.
- **Arquivos-Chave**:
  - `gigantera/src/core/playerController.ts`
  - `gigantera/src/components/canvas/GalleryScene3D.tsx`

---

### 3. Tutorial Inicial Avançado & Fusão Elegante com o Minitutorial
- **Problema & Necessidade**: O tutorial inicial precisa de tempo adequado de leitura, e o minitutorial central inferior precisa ser harmonizado com ele para não gerar poluição visual inicial.
- **Diretrizes Técnicas**:
  - **Tempo de Tela & UX**: Em experiências 3D/WebGL de alto nível, tutoriais de entrada devem respeitar o tempo cognitivo do usuário: permanecer na tela por pelo menos 7 a 8 segundos ou até que o usuário execute intencionalmente a primeira ação (teclas WASD ou clique para andar).
  - **Integração do Minitutorial**: O card introdutório inicial (`IntroSequence.tsx`) deve conter internamente as instruções completas de movimentação e teclas que atualmente estão divididas no minitutorial central inferior.
  - **Transição Cinematográfica de 2s**: Quando o tutorial inicial for dispensado:
    1. O card inicial faz uma transição elegante de fade out de **2 segundos** (`transition: opacity 2s cubic-bezier(0.16, 1, 0.3, 1), transform 2s`).
    2. O minitutorial de controles desliza suavemente em direção ao rodapé central da tela (*slide down and dock*), fixando-se como o indicador tático discreto da galeria.
- **Arquivos-Chave**:
  - `gigantera/src/components/ui/IntroSequence.tsx`
  - `gigantera/src/components/canvas/GalleryScene3D.tsx`
  - `gigantera/src/index.css`

---

### 4. Keycaps Físicas Hiper-Realistas para Todos os Atalhos de Teclado
- **Objetivo**: Transformar todos os badges de teclas de atalho da aplicação (`[TAB]`, `[E]`, `[1]`, `[2]`, `[3]`, `[W][A][S][D]`, `[ESPAÇO]`, `[ESC]`, `[F]`, `[R]`) para que pareçam **verdadeiras teclas físicas de teclado mecânico**.
- **Diretrizes de Design**:
  - **Morfologia & Profundidade 3D**:
    - Borda chanfrada (*bevel*) em relevo com luz vinda de cima (`box-shadow: 0 1px 0 rgba(255,255,255,0.25) inset, 0 -2px 0 rgba(0,0,0,0.55) inset, 0 3px 6px rgba(0,0,0,0.4)`).
    - Corpo plástico/resina industrial com cantos arredondados suaves (`border-radius: 4px`).
    - Superfície interna com gradiente vertical tátil sutil simulando a concavidade da keycap.
  - **Tipografia**: Fonte monoespaçada de alta legibilidade (`Space Mono`), perfeitamente centralizada.
  - **Microinteração Fisiológica**: Efeito `:active` ou quando pressionada pelo usuário que afunda fisicamente a tecla (`transform: translateY(2px)` e redução da sombra inferior), simulando o clique tátil mecânico.
- **Arquivos-Chave**:
  - `gigantera/src/index.css` (classe `.keyboard-keycap`, `.tactile-key`, `.keycap-badge`)
  - `gigantera/src/components/ui/IntroSequence.tsx`
  - `gigantera/src/components/layout/MinimalBottomBar.tsx`
  - `gigantera/src/components/canvas/GalleryScene3D.tsx`
  - `gigantera/src/components/layout/ArchiveIndex.tsx`
  - `gigantera/src/components/modal/CinemaView.tsx`

---

## 🛠️ COMANDOS DE VERIFICAÇÃO RÁPIDA

```bash
# Navegar até a pasta do Gigantera
cd "/Volumes/PLM_SSD_01/Google Drive/Pelimotion/Pipeline SSD 01/Pelimotion/Site/gigantera"

# Executar verificação estrita de TypeScript
npx tsc --noEmit

# Rodar build de produção
npm run build

# Iniciar servidor de desenvolvimento local
npm run dev
```

---

## 🔒 BLINDAGEM DE COTA & REGRAS ABSOLUTAS
- **Zero-Bandwidth Git:** NUNCA adicione arquivos `.mp3`, `.mp4`, `.wasm` ou `.wav` ao Git. Todos os arquivos de mídia pesada residem na Bunny CDN (`https://pelimotion-portfolio.b-cdn.net/`).
- **Deploy:** O deploy no Vercel é acionado automaticamente a cada `git push origin main`.
- **Integridade do Site Principal:** Todas as alterações devem permanecer estritamente contidas em `/gigantera/`, sem afetar o site comercial na raiz.
