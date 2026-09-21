# BRIEFING ESTRATÉGICO DE TRANSIÇÃO — GIGANTERA (EXPOGRAFIA MINIMALISTA, SANTUÁRIO TÁTIL & CD SOUND CHAMBER)
> **Documento mestre de handoff para continuidade autônoma imediata e manutenção contínua.**
> **Data:** 2026-09-20 | **Branch:** `main` | **Status do Build:** 100% Validado (0 erros TypeScript, build ultra-rápido ~450ms, 0 erros de console, Vercel Ready)

---

## 🎯 RESUMO EXECUTIVO: ARQUITETURA, EXPOGRAFIA & REVOLUÇÃO DO CD SOUND CHAMBER

Nesta sessão foi realizada uma profunda reestruturação cenográfica e técnica no **Pavilhão Digital Gigantera**, elevando o nível de imersão artística e sanando atritos críticos de interação:

### 1. Cenografia do Santuário da Obra Interativa (`Espinhaço`, Z ≈ -76.5m)
- **Degradê Arquitetural Mineral Táctil Procedural**:
  - `createSanctuaryFloorTexture(isLight)`: Transição de piso suave do tom claro/original do microcimento da galeria na entrada ($Z = -52\text{m}$) até a ardósia/basalto mineral escuro no fundo ($Z = -94\text{m}$). O piso escuro possui textura tátil rica com microcristais de quartzo, fissuras e veios de pedra e juntas de dilatação sutis, nunca sendo preto puro chapado.
  - `createSanctuaryWallTexture(isLight)`: Ambas as paredes laterais (esquerda e direita) foram orientadas via UVs para acompanhar o degradê do piso, iniciando no tom claro da galeria em $Z = -52\text{m}$ e aprofundando em gesso acústico mineral escuro até o fundo $Z = -94\text{m}$.
- **Remoção de Obstáculos & Purismo Espacial**:
  - O banco monolítico que aparecia no chão da zona do santuário foi filtrado (`bz > -50m` em `modularGallery.ts` e `GalleryScene3D.tsx`), deixando o chão do santuário totalmente desimpedido e monumental.
- **Placa de Identificação no Umbral de Transição ($Z \approx -52.2\text{m}$)**:
  - Ao invés de ficar debaixo da escultura a $Z = -76.5\text{m}$, a plaquinha física 3D do Espinhaço foi posicionada exatamente na linha de transição entre o piso claro e o piso escuro ($Z = -52.2\text{m}$, voltada de frente para o visitante). Ao chegar ao umbral, o visitante lê a ficha técnica e contempla a escultura colossal erguendo-se ao fundo.

### 2. Escala Monumental 3x da Obra Interativa no Pavilhão & Turntable Contínuo
- **Escala 3x de Destaque Absoluto**:
  - A nuvem viva de 50.000 partículas (`espinhaco_points.bin`) foi ampliada de `1.9` para `5.7` (3x a escala anterior), gerando uma colossal coluna vertebral escultural de aproximadamente 8,2 metros de altura vertical que se estende do piso até próximo às vigas de teto.
  - Diâmetro das partículas ajustado para `0.038 - 0.044` para preservar a densidade volumétrica e o brilho aditivo.
  - Luzes pontuais internas e de preenchimento ampliadas para 16m–18m de alcance, e volume de colisão de clique/hover ampliado para raio 2.8m e altura 8.8m.
  - Rotação contínua turntable 360° fluida (`rotation.y += delta * 0.45`), levitação senoidal viva e ondulação áudio-reativa mantidas com 60 FPS garantidos.

### 3. Reenquadramento Óptico em `EspinhacoInteractive.tsx` (Compensação do Menu)
- **Centralização Óptica Precisa**:
  - Quando o menu lateral esquerdo de controles está ativo (`tutorialState === 'minimized'`, ocupando ~360px), a câmera agora aplica `targetCamX = -0.72` em desktop.
  - Esse deslocamento para a esquerda da câmera translada o modelo 3D para a direita, posicionando-o exatamente no centro geométrico do espaço livre restante da tela (entre a borda do menu e a margem direita da janela). Ao recolher o menu (`[H]`), a câmera interpola suavemente de volta para o centro global (`targetCamX = 0.0`).

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

