# BRIEFING ESTRATÉGICO DE TRANSIÇÃO — GIGANTERA (EXPOGRAFIA MINIMALISTA, SANTUÁRIO TÁTIL & CD SOUND CHAMBER)
> **Documento mestre de handoff para continuidade autônoma imediata e manutenção contínua.**
> **Data:** 2026-09-20 | **Branch:** `main` | **Status do Build:** 100% Validado (0 erros TypeScript, build ultra-rápido ~450ms, 0 erros de console, Vercel Ready)

---

## 🎯 RESUMO EXECUTIVO: ARQUITETURA, EXPOGRAFIA & REVOLUÇÃO DO CD SOUND CHAMBER

Nesta sessão foi realizada uma profunda reestruturação cenográfica e técnica no **Pavilhão Digital Gigantera**, elevando o nível de imersão artística e sanando atritos críticos de interação:

### 1. Cenografia do Santuário da Obra Interativa (`Espinhaço`, Z ≈ -76.5m)
- **Piso e Paredes em Degradê Mineral Táctil Procedural**:
  - `createSanctuaryFloorTexture(isLight)`: Gera via canvas procedural uma transição arquitetônica cobrindo de `Z = -52m` até `Z = -94m`. Possui textura de ardósia/basalto escovado, granulação mineral realista e suave fade longitudinal.
  - `createSanctuaryWallTexture(isLight)`: Reveste as paredes laterais e de fundo com acabamento em gesso acústico cinza-grafite escuro com agregados minerais e ranhuras táteis de espátula, eliminando o "preto plano" e conferindo peso e reverberação visual.
- **Redesenho da Iluminação Museológica**:
  - **Spot Sculptural Zenital**: Luz de topo quente com penumbra suave (0.85) e `castShadow = false`, eliminando o overhead de projeção de sombra em 50.000 partículas que causava engasgos.
  - **Backlight & Rim Light Cianita**: Ponto turquesa/ciano posicionado atrás da escultura para recortar seu contorno (rim lighting) contra a penumbra mineral.
  - **Wall Washers**: Iluminação rasante que valoriza as texturas táteis das paredes.

### 2. Desduplicação da Obra Interativa, Turntable 360° e Otimização Extrema
- **Apenas Partículas no Totem**: Removido o loader que carregava a malha sólida `.glb` em duplicata na galeria. A obra agora é renderizada puramente em nuvem viva de 50.000 partículas (`espinhaco_points.bin`) com material customizado aditivo.
- **Rotação Contínua 360°**: Animação contínua em modo turntable (`rotation.y += delta * 0.45`), aliada à respiração vertical senoidal e deformação áudio-reativa que ondula suavemente conforme o visitante se aproxima.
- **Performance Garantida a 60 FPS**: Sem shadow pass pesado e com reutilização de buffers GPU `Float32Array` sem recriação de geometrias no garbage collector.

### 3. Tela de Interação com o CD: Eliminação do Flash e Reestruturação Split-Screen
- **Resolução de Conflitos e Flash Rápido**:
  - Removido o listener global `window.addEventListener('click', onWheelOrClick, { capture: true })` em `CDJewelCasePOV.tsx`, que interceptava cliques e forçava inversão de capa.
  - Centralizados os atalhos de navegação de faixas e giro de capa no `playerController.ts`, eliminando a dupla execução que gerava o efeito estroboscópico/flash ao pressionar `F`.
  - Corrigido o raycasting do CD em `GalleryScene3D.tsx`: clicar no estojo alterna entre capa e contracapa; clicar em faixas toca a música; cliques fora não guardam mais o CD de surpresa.
- **Layout Split-Screen Bounded**:
  - **Lado Esquerdo (`.cd-visualizer-pane`, 48%)**: Visualizador de ondas sonoras `CDVisualizerField` contido estritamente na metade esquerda com fade lateral suave. Header editorial com metadados da faixa e **Live FFT Bars** áudio-reativas animadas em tempo real.
  - **Lado Direito (`.cd-jewel-pane`, 52%)**: CD Jewel Case 3D posicionado opticamente à direita (`x = +0.18`), permitindo visualizar a arte de capa e escolher as 17 faixas na contracapa com total clareza e sem sobreposições.
  - **Mobile**: Transição fluida para empilhamento vertical responsivo (38% visualizador / 62% CD 3D).

### 4. Mão POV Holográfica em Wireframe Arredondado (Pele 100% Invisível)
- **Estrutura Cibernética**: Malha de pele humana totalmente invisível (`visible = false`).
- **Esqueleto Tubular de Alta Densidade**: Cilindros anatômicos com 16 a 20 segmentos radiais (suaves, não lowpoly) contornando cada falange, palma, pulso e antebraço.
- **Juntas Nodais Luminescentes**: Esferas ciano/neon (`#4deeea` / `#00ffff`) posicionadas nas articulações dos dedos e punho, criando um exoesqueleto holográfico fluido que sustenta o estojo de acrílico.

### 5. Desduplicação de Menus e Narrativa Visual Minimalista
- Eliminados o popup de mini-tutorial flutuante que poluía o canto da tela e a faixa de aviso estéreo redundante.
- **Dock Inferior Único e Consolidado (`.cd-viewmodel-hud-dock`)**:
  - Botão estético de virar: `[F] VER CAPA / VER CONTRACAPA`
  - Guia de navegação de faixas: `[↑ / ↓] NAVEGAR`
  - Knob DJ Tátil (Low-cut / High-cut) integrado
  - Seletor de qualidade gráfica: `LEVE | MÉD | ALTO [G]`
  - Botão de saída: `[ESC / E] GUARDAR` (com indicador sutil de que a música continua tocando no salão)

---

## 🎮 MAPA ATUALIZADO DE CONTROLES & ATALHOS

| Tecla / Gesto | Contexto | Ação Realizada |
| :--- | :--- | :--- |
| `W`, `A`, `S`, `D` / Setas | Galeria 3D | Caminhar pelo pavilhão |
| `Shift` | Galeria 3D | Correr / Acelerar locomoção |
| `Mouse Click` | Galeria 3D | Capturar mouse com Pointer Lock FPS |
| `Esc` | Galeria 3D | Liberar ponteiro do mouse (câmera para imediatamente) |
| `E` ou `Enter` | Galeria 3D | Interagir / Pegar CD ou Inspecionar obra |
| `1`, `2`, `3`, `4` | Galeria 3D | Navegação rápida de Setores (Som → Vídeos → Stills → Espinhaço) |
| `F` ou Clique no CD | Tela do CD | Alternar entre Capa Frontal e Contracapa (17 faixas) |
| `↑` / `↓` | Tela do CD | Navegar sequencialmente pelas faixas do CD |
| Clique na Faixa | Tela do CD | Reproduzir faixa selecionada com áudio espacial |
| `[` e `]` ou `O` e `P` | Global / CD | Modular Filtro DJ (Passa-Baixa / Passa-Alta) |
| `0` | Global / CD | Resetar Filtro DJ para neutro |
| `G` | Global / CD | Alternar fidelidade gráfica (Leve / Médio / Alto) |
| `ESC`, `E` ou `Q` | Tela do CD | Guardar CD e retornar à galeria (o som continua tocando) |
| `C` | Global | Abrir painel Fullscreen de Sobre & Contato |
| `M` | Global | Mudo global (silenciar / desilenciar áudios) |
| `TAB` | Galeria 3D | Acervo frontal 4x2 |

---

## 🕸️ KNOWLEDGE GRAPH (GRAPHIFY)

O grafo de conhecimento do projeto em `graphify-out` foi atualizado:
- **Estatísticas:** 1.514 nós, 4.432 arestas, 67 comunidades detectadas.
- **Arquivos Gerados:** `graphify-out/graph.json`, `graphify-out/graph.html`, `graphify-out/GRAPH_REPORT.md`.
- **Comando para Atualização Rápida:** `graphify update` (execução local incremental sem custo de tokens).

---

## 🛠️ ESTADO TÉCNICO & DEPLOY

- **Repositório Git:** `https://github.com/Pelimotion/portfolio.git` (`main`)
- **Validação TypeScript:** `npx tsc --noEmit` aprovado com **0 erros**.
- **Build de Produção:** `npm run build` executado em ~450ms.
- **Deploy:** Vercel acionado automaticamente via push no GitHub branch `main`.
- **Assets Sincronizados:** `./index.html`, `/assets/*`, `./ar/*`, `./models/*`.

---

## ⚡ COMANDOS DE MANUTENÇÃO E OPERAÇÃO

```bash
# Entrar no diretório do projeto
cd "/Volumes/PLM_SSD_01/Google Drive/Pelimotion/Pipeline SSD 01/Pelimotion/Site/gigantera"

# Executar dev server local
npm run dev

# Checagem de tipagem TypeScript
npx tsc --noEmit

# Compilar e sincronizar build estático de produção
npm run build

# Atualizar base de conhecimento do Graphify
graphify update

# Commit e Deploy
git add .
git commit -m "feat(expografia): santuario tátil, cd split-screen e mao holografica"
git push origin main
```

