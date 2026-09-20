# BRIEFING ESTRATÉGICO DE TRANSIÇÃO — GIGANTERA (EXPOGRAFIA EM U, ILUMINAÇÃO PENUMBRA & SHADERS VANGUARDA)
> **Documento mestre de handoff para continuidade autônoma imediata no próximo chat.**
> **Data:** 2026-09-20 | **Branch:** `main` | **Status do Build:** 100% Validado (0 erros TypeScript, build ultra-rápido, 0 erros de console)

---

## 🎯 RESUMO EXECUTIVO DA SESSÃO: EXPOGRAFIA EM MEIA-LUA, PENUMBRA CENOGRÁFICA & SHADERS DO ESPINHAÇO

Nesta sessão foi realizada uma transformação artística, arquitetural e de engenharia no **Pavilhão Digital Gigantera**, focando na macro e micro narrativa visual, expografia orgânica, atmosfera de penumbra intimista e polimento visual de vanguarda:

### 1. Expografia Polar em "U" (Layout Meia-Lua / Semicircular)
- **Ruptura com o Corredor Tradicional**: O layout do pavilhão (`modularGallery.ts`) foi reconfigurado de um corredor reto estreito para uma disposição semicircular orgânica em ferradura ("U").
- **Centralidade Monumental do Espinhaço**: A escultura interativa do Espinhaço permanece na posição central de ancoragem (`Z = 14.0`), enquanto as vitrines de vídeos e imagens orbitam ao seu redor através de coordenadas polares trigonométricas (`sin`/`cos`).
- **Narrativa Visual Dinâmica**: O visitante tem visão perimétrica e contemplativa da escultura a partir de múltiplos ângulos enquanto transita entre as vitrines de acervo.

### 2. Iluminação de Penumbra & Oclusão Cenográfica no Espinhaço
- **Atmosfera de Penumbra Dramática**: Na cena 3D principal (`GalleryScene3D.tsx`), a iluminação ao redor do Espinhaço foi atenuada e calibrada com sombras suaves e máscara de oclusão cenográfica (`penumbraBlocker`).
- **Contraste de Alto Impacto**: O ambiente circundante é mantido quase escuro, fazendo com que o brilho bioluminescente e as partículas da escultura se destaquem de forma sutil, discreta e misteriosa.

### 3. Redesign Fullscreen Cinemático de Sobre/Contato (`ArtistBioModal.tsx`)
- **Imersão Contínua**: O modal pop-up flutuante que quebrava o ritmo visual do site foi substituído por uma tela cheia cinematográfica estilizada.
- **Narrativa do Artista & Pelimotion**: Declaração curatorial autêntica, tipografia brutalista refinada, ficha técnica, links diretos de contato (Email, Instagram, WhatsApp, GitHub, LinkedIn).
- **Desconflito de Atalhos**: Atalho de Sobre/Contato atualizado para `[C]` em `GalleryHeader.tsx`, liberando a tecla `[B]` exclusivamente para a troca de Biomas cromáticos sem qualquer sobreposição.

### 4. Espinhaço Interactive: Unificação HUD, Shaders & Deformação WASD
- **Unificação da HUD Lateral**: O `FloatingMiniPlayer` e o seletor de Fidelidade Gráfica (`LEVE`, `MÉD`, `ALTO`) foram realocados para dentro do painel lateral retrátil (`aside`). O topo da tela agora fica 100% limpo e sem distrações visuais.
- **Reenquadramento de Câmera (Pan Offset)**: Ao abrir ou fechar o menu lateral de dicas (`[H]`), a câmera Three.js desloca suavemente seu eixo X (`targetCamX = 0.45`), mantendo o modelo 3D perfeitamente centralizado na área livre restante.
- **Keycaps Táteis com Relevo Físico**: Os botões de seleção de visualização (`[1] MATÉRIA`, `[2] CORPÚSCULOS`, `[3] RAIO-X`) agora utilizam o estilo físico mecânico `.keycap` sem sobreposições planas.
- **Shader Raio-X Holográfico com Glitch**: O modo Raio-X foi reconstruído via `ShaderMaterial` GLSL customizado com scanlines verticais móveis e jitter/glitch de vértices de alta frequência, integrando a cor do bioma selecionado.
- **Deformação Axial Acentuada (`onBeforeCompile`)**: Injetamos lógica de torção e flexão vertebral diretamente no shader do material PBR (`MeshStandardMaterial`). As teclas `W`, `A`, `S`, `D` e setas produzem deformações sinuosas e elásticas visivelmente intensas na coluna vertebral.

---

## 🎮 MAPA COMPLETO DE CONTROLES & ATALHOS

| Tecla / Gesto | Contexto | Ação Realizada |
| :--- | :--- | :--- |
| `W`, `A`, `S`, `D` / Setas | Galeria 3D | Caminhar pelo pavilhão |
| `Shift` | Galeria 3D | Correr / Acelerar locomoção |
| `Mouse Drag` | Galeria 3D | Rotação orbital / Olhar ao redor |
| `E` ou `Enter` | Galeria 3D | Interagir / Inspecionar obra ou CD |
| `Esc` | Modais / Cinema | Retornar à galeria principal |
| `W`, `A`, `S`, `D` | Espinhaço 3D | Flexão anteroposterior e torção axial da coluna |
| `Espaço` | Espinhaço 3D | Pulso cinético sísmico (onda de choque) |
| `1`, `2`, `3` | Espinhaço 3D | Modos de Visão: MATÉRIA (PBR), CORPÚSCULOS (50k pontos), RAIO-X (Glitch Shader) |
| `B` | Espinhaço 3D | Alternar Biomas: Titânio, Abissal, Magma, Espectral |
| `H` | Espinhaço 3D | Exibir / Recolher painel lateral (com auto pan de câmera) |
| `I` | Espinhaço 3D | Reabrir Splash Screen com ficha técnica |
| `[` e `]` ou `O` e `P` | Global | Modular Filtro DJ (Passa-Baixa / Passa-Alta) |
| `0` | Global | Resetar Filtro DJ para neutro |
| `G` | Global | Alternar fidelidade gráfica (Leve / Médio / Alto) |
| `C` | Global | Abrir painel Fullscreen de Sobre & Contato |
| `M` | Global | Mudo global (silenciar / desilenciar áudios) |
| `TAB` | Galeria 3D | Acervo frontal 4x2 |

---

## 🛠️ ESTADO TÉCNICO & INTEGRIDADE DO CÓDIGO

- **Branch Atual:** `main`
- **Validação TypeScript:** `npx tsc --noEmit` aprovado com **0 erros**.
- **Build de Produção:** `npm run build` executado com sucesso em ~470ms.
- **Bundle Distribuível:** Assets sincronizados em `/assets`, `./index.html` e `./ar`.
- **Knowledge Graph:** Mantido via `graphify`.

---

## ⚡ COMANDOS RÁPIDOS DE DESENVOLVIMENTO

```bash
# Entrar na pasta do projeto
cd "/Volumes/PLM_SSD_01/Google Drive/Pelimotion/Pipeline SSD 01/Pelimotion/Site/gigantera"

# Executar dev server local
npm run dev

# Checagem de tipagem TypeScript
npx tsc --noEmit

# Compilar build de produção local
npm run build
```

---

## 🔒 DIRETRIZES E REGRAS PERMANENTES
1. **Modelos 3D e Binários Autênticos:** O modelo do Espinhaço (`espinhaco.glb` e `espinhaco_points.bin`) deve sempre manter suas proporções originais calibradas.
2. **Zero-Bandwidth Git para Mídias Pesadas:** Vídeos, giclées e áudios continuam hospedados na Bunny CDN. Apenas o GLB e binário calibrados de 12MB residem no bundle local.
3. **Deploy Blindado:** Toda alteração deve passar sem erros no `npx tsc --noEmit` e `npm run build`.
4. **Deploy Vercel:** Acionado automaticamente via push no repositório GitHub (`main`).
