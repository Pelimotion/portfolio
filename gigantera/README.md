# GIGANTERA — Galeria Digital Brutalista, Game 3D & Acervo Espacial
> **Pavilhão Tridimensional Contemporâneo de Exposição Curatorial** | Subprojeto de `www.pelimotion.art/gigantera`

---

## 🏛️ Visão Geral do Projeto

**Gigantera** é uma experiência imersiva de arte digital que reimagina a navegação de um portfólio como a exploração física em primeira pessoa de um **pavilhão arquitetural brutalista monumental**.

O visitante flutua ("nada") no espaço tridimensional entre vitrines flutuantes de vidro acrílico que guardam impressões em papel mate de algodão, experimentando iluminação realista com sombras suaves, vigas estruturais com claraboias de onde emanam feixes de luz volumétrica (*god rays*), uma estação de áudio tátil na entrada e controles em primeira pessoa inspirados na era clássica de jogos PS1/PS2.

```
       [ENTRADA Z: +20M] ── Estação do CD Jewel Case 3D (Álbum Autoral em POV)
       [SETOR 01 Z: +10M] ── STILL (Imagens & Esculturas em Papel Mate Suspenso)
       [SETOR 02 Z: -22M] ── VÍDEO (Cinética & Motion Textures em Loop Real)
       [SETOR 03 Z: -75M] ── MONUMENTO FINAL & ACERVO COMPLETO
```

---

## 🎮 Mecânicas de Game 3D & POV (Estética PS1 / PS2)

### 1. Mão 3D Low-Poly Facetada & CD Jewel Case em POV (Fiel à Referência)
- **Mão 3D Facetada em Primeira Pessoa:** Construída proceduralmente com sombreamento *flat* (`flatShading: true`), reproduzindo exatamente as facetas poligonais de gesso/cerâmica angular segurando a quina do estojo de acrílico.
- **Contracapa Dinâmica em Alta Resolução:** Tipografia pixel/mono em Canvas 1024x1024 contendo o título `BACK COVER`, lista das 17 faixas autorais numeradas com BPM, o selo Compact Disc e o **código de barras autêntico** no canto inferior direito.
- **Giro Físico de 180° (`[F]`):** Rotação suave do estojo no espaço 3D alternando entre a contracapa com as faixas e a capa frontal com arte impressa de Pelimotion.
- **Áudio Ultraleve:** Play instantâneo de previews leves de 10s ao trocar de faixa com upgrade transparente para a versão full de 48kHz após 4s de escuta contínua.
- **Balanço e Inércia Física:** *Idle breathing bob* e inércia do mouse acompanhando os movimentos do jogador.

### 2. Controles de Game FPS & Física Tátil
- **Teclas:** `W`, `A`, `S`, `D` e Setas direcionais para caminhar pelo salão, `Shift` para correr.
- **Mouse Look & Arraste:** Rotação horizontal e inclinação vertical suavemente amortecidas com limites de pitch para explorar as paredes de concreto e claraboias.
- **Head Bobbing & Passos:** Balanço de cabeça ao caminhar e som sutil de passos no concreto sintetizado proceduralmente via Web Audio API.
- **Interação Contextual (`[E]`):**
  - No pedestal de entrada: pega o CD na mão / guarda de volta.
  - Perto de uma vitrine: transpasse a barreira de vidro para o Modo Cinema.

### 3. Vitrines de Vidro Flutuantes & Transição para o Modo Cinema
- Vitrines translúcidas em `MeshPhysicalMaterial` com transmissão de 92%, suspensas sem cubos amarelos e sem pedestais pesados.
- Ao pressionar `[E]` ou avançar contra a vitrine, a câmera transpasse o vidro com efeito sonoro harmônico; a iluminação da galeria se apaga suavemente e um **holofote volumétrico focado** ilumina a obra de arte no Modo Cinema, com metadados essenciais e proteções *feathered* suaves.

### 4. Simulação Retro PS1 / PS2 (Tecla `[P]`)
- Efeito de pós-processamento opcional com matriz de dithering Bayer 4x4, scanlines sutis e vinheta CRT, transformando toda a galeria em uma experiência nostálgica dos anos 90/2000.

### 5. Dualidade de Temas
- **Obsidiana (Dark Noir):** Salão escuro brutalista com concreto grafite, basalto polido e iluminação dourada de claraboias.
- **Alabastro (White Cube):** Galeria branca brutalista contemporânea em giz e concreto claro, mantendo a profundidade e sombras realistas.

---

## 📂 Estrutura de Arquivos do Subprojeto

```
gigantera/
├── index.html                   ← HTML de produção servido pelo Vercel
├── index.source.html            ← Template fonte para o Vite
├── package.json                 ← Dependências e scripts de build
├── tsconfig.json                ← Configuração do TypeScript
├── vite.config.ts               ← Configuração do Vite com HMR e dev-rewrite
├── assets/                      ← Bundles compilados JS e CSS de produção
├── works/                       ← Acervo de mídias otimizadas
│   ├── audio/                   ← Previews 10s e faixas full das 17 músicas autorais
│   ├── video/                   ← Loops de vídeo otimizados (.mp4)
│   └── *.jpg                    ← Obras de arte em alta resolução
└── src/
    ├── App.tsx                  ← Orquestrador principal da cena e interfaces
    ├── main.tsx                 ← Ponto de entrada React
    ├── index.css                ← Design brutalista, proteções feathered e HUD
    ├── tokens.ts                ← Design tokens Dark & Light
    ├── types/
    │   └── art.ts               ← Tipagens de obras e faixas de áudio
    ├── data/
    │   └── artworks.ts          ← Catálogo oficial das obras e 17 faixas autorais
    ├── core/
    │   ├── store.ts             ← Estado global Zustand (física, câmera, CD, cinema)
    │   ├── playerController.ts  ← Motor de física FPS (WASD, mouse look, head bob)
    │   └── soundEngine.ts       ← Web Audio API (previews, upgrade full e SFX procedurais)
    ├── components/
    │   ├── canvas/
    │   │   ├── GalleryScene3D.tsx    ← Salão 3D, luzes, vitrines e animação a 60 FPS
    │   │   ├── CDViewmodel3D.ts      ← Viewmodel 3D em câmera com mão low-poly e CD
    │   │   └── AudioVisualizer.tsx   ← Espectrograma em tempo real
    │   ├── audio/
    │   │   └── CDJewelCasePOV.tsx    ← HUD tátil minimalista do álbum em POV
    │   ├── modal/
    │   │   ├── CinemaView.tsx        ← Modo cinema volumétrico focado
    │   │   └── ArtistBioModal.tsx    ← Declaração conceitual e contato direto
    │   ├── layout/
    │   │   ├── GalleryHeader.tsx     ← Top bar minimalista com tema e retro mode
    │   │   ├── MinimalBottomBar.tsx  ← Bottom dock feathered com Z e setores
    │   │   └── ArchiveIndex.tsx      ← Catálogo tradicional em grade
    │   └── ui/
    │       ├── IntroSequence.tsx     ← Intro com materialização em 4s
    │       └── RetroPSXOverlay.tsx   ← Simulação visual dithered PS1/PS2
```

---

## ⚡ Comandos Úteis

```bash
# Iniciar ambiente de desenvolvimento
npm run dev

# Compilar para produção (Vercel)
npm run build
```
